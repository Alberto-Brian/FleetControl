// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/license-helpers.ts
// ========================================

import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ValidatedLicense } from '@/lib/types/licence';

// ── URL dinâmica — resolvida via IPC ─────────────────────────────────────────
let _resolvedApiUrl: string | null = null;

async function resolveApiUrl(): Promise<string> {
  if (_resolvedApiUrl) return _resolvedApiUrl;
  try {
    const saved: string | undefined = await (window as any).system?.getServerUrl?.();
    _resolvedApiUrl = (saved && saved.trim()) ? saved.trim() : 'http://localhost:3001';
  } catch {
    _resolvedApiUrl = 'http://localhost:3001';
  }
  return _resolvedApiUrl!;
}

export function resetApiUrl(): void {
  _resolvedApiUrl = null;
}

const apiClient = axios.create({
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = await resolveApiUrl();
  return config;
});

// ── Tokens em memória ─────────────────────────────────────────────────────────
let _accessToken:  string | null = null;
let _refreshToken: string | null = null;
let _refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function getAccessToken(): string | null { return _accessToken; }

// ── Machine ID ───────────────────────────────────────────────────────────────
export function getMachineId(): string {
  const KEY = '_fc_machine_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const DISPLAY_KEY_RE = /^LK-[A-F0-9]{5}(-[A-F0-9]{5}){4}$/i;

function authHeaders() {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {};
}

// ── Activações de desktop ─────────────────────────────────────────────────────

export interface DesktopActivation {
  id:             string;
  machine_id:     string;
  activated_at:   string;
  last_active_at: string;
}

export async function getActivations(): Promise<DesktopActivation[]> {
  const { data } = await apiClient.get('/api/activations', { headers: authHeaders() });
  return data.data as DesktopActivation[];
}

export async function revokeActivation(machineId: string, password: string): Promise<void> {
  await apiClient.delete(`/api/activations/${machineId}`, {
    headers: authHeaders(),
    data: { password },
  });
}

// ── Validação e activação ─────────────────────────────────────────────────────

export async function validateLicense(licenseKey: string): Promise<ValidatedLicense> {
  const key = licenseKey.trim();

  if (DISPLAY_KEY_RE.test(key)) {
    return validateDisplayKey(key);
  }

  const localResult: ValidatedLicense = await window.license.validateLicense(key);
  if (!localResult.isValid) return localResult;
  if (localResult.mode === 'standalone') return localResult;

  await activateOnApi(key);
  return localResult;
}

export async function checkExistingLicense(): Promise<ValidatedLicense> {
  const result: ValidatedLicense = await window.license.checkExistingLicense();
  if (!result.isValid) return result;

  if (result.mode === 'connected') {
    await tryRefreshOrReactivate();
  }

  return result;
}

export async function removeLicense(): Promise<void> {
  // Tenta libertar o seat no servidor antes de remover localmente
  if (_accessToken) {
    try {
      await apiClient.delete('/api/activations/me', {
        headers: authHeaders(),
        data: { machine_id: getMachineId() },
      });
    } catch {
      // Falha silenciosa — o seat pode já ter sido revogado ou a API estar offline
    }
  }

  _accessToken  = null;
  _refreshToken = null;
  await window._service_auth.setToken(null);
  if (_refreshTimer) clearTimeout(_refreshTimer);
  await window.license.removeLicense();
}

// ── Lógica interna ────────────────────────────────────────────────────────────

async function validateDisplayKey(displayKey: string): Promise<ValidatedLicense> {
  try {
    const { data } = await apiClient.post('/api/auth/activate', {
      license_key: displayKey,
      machine_id:  getMachineId(),
    });

    if (!data.success) {
      return { isValid: false, error: data.message || 'Chave inválida' };
    }

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
    const code     = axiosErr.response?.data?.code;
    const message  = axiosErr.response?.data?.message;

    if (!axiosErr.response) {
      return { isValid: false, error: 'API inacessível. Verifica a ligação e tenta novamente.' };
    }
    if (code === 'DISPLAY_KEY_NOT_REGISTERED') {
      return { isValid: false, error: 'Chave não encontrada no servidor. Contacta o suporte técnico.' };
    }
    if (code === 'REVOKED') {
      return { isValid: false, error: 'Esta licença foi revogada.' };
    }
    if (code === 'SEATS_FULL') {
      toast.error('Limite de desktops atingido', {
        description: message || 'Revoga uma activação existente em Definições → Licença.',
        duration: 8000,
      });
      return { isValid: false, error: message || 'Limite de desktops atingido.' };
    }
    if (code === 'EXPIRED') {
      toast.error('Licença expirada', {
        description: 'Renova a tua licença contactando o suporte técnico.',
        duration: 8000,
      });
      return { isValid: false, error: message || 'Licença expirada.' };
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

    if (code === 'SEATS_FULL') {
      toast.error('Limite de desktops atingido', {
        description: message || 'Revoga uma activação existente em Definições → Licença.',
        duration: 8000,
      });
      return;
    }
    if (code === 'DISPLAY_KEY_NOT_REGISTERED') {
      console.warn('[License] Chave curta não registada na API — usa a chave FULL');
      return;
    }
    if (!axiosErr.response) {
      console.warn('[License] API inacessível — modo offline');
      return;
    }
    console.error('[License] Activação falhou:', message);
  }
}

async function tryRefreshOrReactivate(): Promise<void> {
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
      if (code === 'REFRESH_EXPIRED') {
        toast.error('Sessão expirada', {
          description: 'A tua sessão expirou. Reativa a licença em Definições → Licença.',
          duration: 10000,
        });
        return;
      }
      console.warn('[License] Refresh falhou:', code);
    }
  }

  const rawKey: string | null = await window.license.getRawLicense();
  if (rawKey) await activateOnApi(rawKey);
}

function scheduleRefresh(expiresInSeconds: number): void {
  if (_refreshTimer) clearTimeout(_refreshTimer);
  const ms = Math.max((expiresInSeconds - 300) * 1000, 60_000);
  _refreshTimer = setTimeout(tryRefreshOrReactivate, ms);
}
