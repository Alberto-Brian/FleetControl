// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/license-helper.ts
// ========================================

import axios, { AxiosError } from 'axios';
import type { ValidatedLicense } from '@/lib/types/licence';
import { setStoredApiToken } from './ipc/services/auth/token-store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Tokens em memória (não persistidos em disco) ──────────────
let _accessToken:  string | null = null;
let _refreshToken: string | null = null;
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

// Apenas LK- (connected) podem ser validadas via API com chave curta.
// ST- (standalone) são RSA-only — o utilizador precisa de colar a FULL key.
// Apenas LK- (connected) podem ser validadas via API com chave curta.
// ST- (standalone) são RSA-only — o utilizador precisa de colar a FULL key.
const DISPLAY_KEY_RE = /^LK-[A-F0-9]{5}(-[A-F0-9]{5}){4}$/i;

// ID único desta instalação — gerado uma vez e guardado no localStorage.
// Serve para identificar a instância de desktop na verificação de seats.
function getMachineId(): string {
  const KEY = '_fc_machine_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ── Validação e activação ─────────────────────────────────────

/**
 * Valida a licença localmente (via IPC → main process → RSA)
 * e se for connected, activa na API para obter JWT de sessão.
 * Se for uma display_key (LK-/ST- curta), vai à API primeiro para
 * obter a full_license, depois valida localmente.
 */
export async function validateLicense(licenseKey: string): Promise<ValidatedLicense> {
  const key = licenseKey.trim();

  // Display key — fluxo diferente: API primeiro, depois validação local
  if (DISPLAY_KEY_RE.test(key)) {
    return validateDisplayKey(key);
  }

  // Full license key — validação local via contextBridge (RSA)
  const localResult: ValidatedLicense = await window.license.validateLicense(key);
  if (!localResult.isValid) return localResult;

  // Standalone — não precisa de API
  if (localResult.mode === 'standalone') return localResult;

  // Connected — activa na API
  await activateOnApi(key);
  return localResult;
}

/**
 * Verifica a licença guardada em disco.
 * Chamado no arranque da aplicação.
 */
export async function checkExistingLicense(): Promise<ValidatedLicense> {
  const result: ValidatedLicense = await window.license.checkExistingLicense();
  if (!result.isValid) return result;

  if (result.mode === 'connected') {
    // Tenta renovar o JWT silenciosamente
    await tryRefreshOrReactivate();
  }

  return result;
}

export async function removeLicense(): Promise<void> {
  _accessToken  = null;
  _refreshToken = null;
  await window._service_auth.setToken(null);
  if (_refreshTimer) clearTimeout(_refreshTimer);
  await window.license.removeLicense();
}

// ── Lógica interna ────────────────────────────────────────────

async function validateDisplayKey(displayKey: string): Promise<ValidatedLicense> {
  try {
    const { data } = await apiClient.post('/api/auth/activate', {
      license_key: displayKey,
      machine_id:  getMachineId(),
    });

    if (!data.success) {
      return { isValid: false, error: data.message || 'Chave inválida' };
    }

    // API devolveu a full_license — valida e guarda localmente
    if (data.full_license) {
      const localResult: ValidatedLicense = await window.license.validateLicense(data.full_license);
      if (!localResult.isValid) return localResult;
    }

    if (data.mode === 'connected') {
      _accessToken  = data.data.access_token;
      _refreshToken = data.data.refresh_token;
      await window._service_auth.setToken(data.data.access_token);
      scheduleRefresh(data.data.expires_in);

      return {
        isValid:     true,
        mode:        'connected',
        clientName:  data.data.license?.clientName ?? data.data.user?.name,
        expiryDate:  data.data.license?.expiryDate ? new Date(data.data.license.expiryDate) : undefined,
        maxUsers:    data.data.license?.maxUsers,
        features:    data.data.license?.features,
        licenseType: data.data.license?.licenseType,
      };
    }

    // Standalone
    return {
      isValid:     true,
      mode:        'standalone',
      clientName:  data.data?.clientName,
      expiryDate:  data.data?.expiryDate ? new Date(data.data.expiryDate) : undefined,
      maxUsers:    data.data?.maxUsers,
      features:    data.data?.features,
      licenseType: data.data?.licenseType,
    };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>;
    const code    = axiosErr.response?.data?.code;
    const message = axiosErr.response?.data?.message;

    if (!axiosErr.response) {
      return { isValid: false, error: 'API inacessível. Verifica a ligação à internet e tenta novamente.' };
    }

    if (code === 'DISPLAY_KEY_NOT_REGISTERED') {
      return { isValid: false, error: 'Chave não encontrada no servidor. Contacta o suporte técnico.' };
    }

    if (code === 'REVOKED') {
      return { isValid: false, error: 'Esta licença foi revogada.' };
    }

    return { isValid: false, error: message || 'Erro ao validar a chave com o servidor.' };
  }
}

async function activateOnApi(licenseKey: string): Promise<void> {
  try {
    const { data } = await apiClient.post('/api/auth/activate', {
      license_key: licenseKey,
      machine_id:  getMachineId(),
    });
    // console.log("O token: ", data.data.access_token)

    if (data.success && data.mode === 'connected') {
      _accessToken  = data.data.access_token;
      _refreshToken = data.data.refresh_token;
      await window._service_auth.setToken(data.data.access_token);
      scheduleRefresh(data.data.expires_in);
    }
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>;
    const code     = axiosErr.response?.data?.code;
    const message  = axiosErr.response?.data?.message;

    // Chave curta não registada — não é erro crítico
    if (code === 'DISPLAY_KEY_NOT_REGISTERED') {
      console.warn('[License] Chave curta não registada na API — usa a chave FULL');
      return;
    }

    // Sem internet — modo offline
    if (!axiosErr.response) {
      console.warn('[License] API inacessível — modo offline');
      return;
    }

    console.error('[License] Activação falhou:', message);
  }
}

async function tryRefreshOrReactivate(): Promise<void> {
  // Tenta refresh primeiro (mais rápido, não envolve a licença)
  if (_refreshToken) {
    try {
      const { data } = await apiClient.post('/api/auth/refresh', {
        refresh_token: _refreshToken,
      });
      if (data.success) {
        _accessToken = data.data.access_token;
        await window._service_auth.setToken(data.data.access_token);
        scheduleRefresh(data.data.expires_in);
        return;
      }
    } catch (err) {
      const code = (err as AxiosError<{ code?: string }>).response?.data?.code;
      if (code !== 'REFRESH_EXPIRED') {
        // Erro inesperado — tenta reactivação
        console.warn('[License] Refresh falhou:', code);
      }
    }
  }

  // Refresh não disponível ou expirado — reactiva com a licença
  const rawKey: string | null = await window.license.getRawLicense();
  if (rawKey) await activateOnApi(rawKey);
}

function scheduleRefresh(expiresInSeconds: number): void {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  // Renova 5 minutos antes de expirar, mínimo 1 minuto
  const ms = Math.max((expiresInSeconds - 300) * 1000, 60_000);
  _refreshTimer = setTimeout(tryRefreshOrReactivate, ms);
}
