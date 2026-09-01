// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/license-helpers.ts
// ========================================

import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
// i18next's own default export IS the shared singleton instance that
// localization/i18n.ts configures as a side effect on app boot — importing
// it directly here avoids needing an export this plain module doesn't have.
import i18n from 'i18next';
import type { ValidatedLicense } from '@/lib/types/licence';

// Fase 11B.11 — disparado quando o servidor recusa explicitamente a sessão
// actual (revogada por um admin, ou expirada) enquanto online. AuthContext
// escuta este evento para devolver a app ao ecrã de login — uma sessão
// morta não deve deixar a pessoa "presa" dentro da app com a API partida.
export const SESSION_REVOKED_EVENT = 'fc:session-revoked';

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

// Lê (sem verificar assinatura — impossível offline, sem o segredo do
// servidor) só o payload de um JWT, para consultar o seu próprio `exp`. Não
// é uma decisão de autorização — é só um pré-filtro para saber se vale a
// pena tentar reutilizar um token cacheado; o servidor continua a validar
// assinatura + sessão em cada pedido real quando a ligação volta.
function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const json = JSON.parse(atob(b64));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
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

// ── Login por utilizador (Fase 11B.8) ──────────────────────────────────────
// Substitui, para efeitos de identidade em chamadas API/Traccar, o token do
// admin sintético (emitido só por /activate) por um token do utilizador real
// que fez login no Desktop — reaproveita o mesmo apiClient/tokens em memória/
// scheduleRefresh já usados pelo fluxo de activação, para nunca haver duas
// fontes de token concorrentes.
export interface ApiLoginResult {
  success: boolean;
  code?: string;
  message?: string;
  // Fase 11B.10 — presente só em sucesso; quem chama usa isto para
  // sincronizar o "cadeado" local (nunca para decidir role/scope/
  // permissions, que o Desktop nunca lê localmente).
  user?: { name: string; email: string };
}

export async function loginOnApi(email: string, password: string): Promise<ApiLoginResult> {
  try {
    const { data } = await apiClient.post('/api/auth/login', {
      email,
      password,
      // client_identifier — mesmo machine_id da activação, metadado puro
      // (a API nunca usa isto para decidir seats/autorização, Fase 11B.2).
      client_identifier: getMachineId(),
    });

    _accessToken  = data.access_token;
    _refreshToken = data.refresh_token;
    await window._service_auth.setToken(data.access_token);
    scheduleRefresh(data.expires_in);

    // Fase 11B.9 — cacheia esta sessão (cifrada, safeStorage) para poder
    // ser reutilizada num próximo arranque/login sem ligação à API.
    await window._service_auth.saveCachedSession({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      user: { id: data.user.id, email: data.user.email, name: data.user.name },
      cached_at: Date.now(),
    });

    return { success: true, user: { name: data.user.name, email: data.user.email } };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>;

    if (!axiosErr.response) {
      // API inacessível — não é uma recusa de credenciais, é falta de
      // ligação; quem chama decide cair para o login local apenas.
      return { success: false, code: 'OFFLINE', message: 'API inacessível.' };
    }

    return {
      success: false,
      code:    axiosErr.response.data?.code,
      message: axiosErr.response.data?.message || 'Credenciais inválidas.',
    };
  }
}

// Fase 11B.9 — reutiliza, enquanto offline, uma sessão API previamente
// autenticada com sucesso e cacheada localmente (safeStorage). Nunca cria
// uma identidade nova por si só: só adopta uma sessão já emitida pelo
// servidor, e só quando pertence à MESMA pessoa que está a autenticar-se
// agora (email cacheado === email fornecido) — essencial num Desktop
// partilhado, para o login offline de uma pessoa nunca herdar a sessão
// cacheada de outra. Validade decidida pelo próprio `exp` do refresh_token
// (a política de 30 dias já definida no backend, signRefreshToken) — nunca
// uma duração inventada aqui.
// Nunca lança — uma falha aqui (ex. IPC indisponível num arranque muito
// cedo) nunca deve poder derrubar o login local já bem-sucedido de quem
// chamou; devolve simplesmente "não foi possível reaproveitar", o mesmo
// resultado de não haver cache nenhuma.
export async function tryRestoreCachedSession(expectedEmail: string): Promise<boolean> {
  try {
    const cached = await window._service_auth.getCachedSession();
    if (!cached) return false;
    if (cached.user.email.toLowerCase() !== expectedEmail.trim().toLowerCase()) return false;

    const expiresAt = decodeJwtExpiry(cached.refresh_token);
    if (!expiresAt || expiresAt <= Date.now()) {
      // Sessão cacheada expirada segundo a própria política do backend —
      // não reutilizável; quem chamou cai para o comportamento sem sessão API.
      return false;
    }

    _accessToken  = cached.access_token;
    _refreshToken = cached.refresh_token;
    await window._service_auth.setToken(cached.access_token);

    // Se afinal houver ligação (ex.: falso negativo no momento do login, ou
    // é um arranque a frio e a conectividade ainda não foi testada), tenta
    // logo obter um access_token fresco — falha silenciosamente se continuar
    // offline, mantendo os tokens cacheados tal como estavam.
    void tryRefreshOrReactivate();

    return true;
  } catch (err) {
    console.warn('[License] Falha ao reaproveitar sessão cacheada:', err);
    return false;
  }
}

// Limpa a sessão API do utilizador que acabou de terminar sessão no Desktop,
// SEM tocar na activação da licença em si (isso é removeLicense() — logout
// de um utilizador nunca deve desactivar a licença da máquina). Essencial
// num Desktop partilhado por vários utilizadores: sem isto, o próximo login
// herdaria o token/refresh do utilizador anterior até ao próximo refresh
// agendado.
export async function clearApiSession(): Promise<void> {
  _accessToken  = null;
  _refreshToken = null;
  await window._service_auth.setToken(null);
  await window._service_auth.clearCachedSession();
  if (_refreshTimer) clearTimeout(_refreshTimer);
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
  await window._service_auth.clearCachedSession();
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
      // Fase 11B.12 — activar a licença já não autentica ninguém nem emite
      // tokens (licença = direito da Organization, não sessão humana). A
      // identidade real vem sempre de /api/auth/login (Fase 11B.8) — nada
      // a fazer aqui além de confirmar a licença e mostrar os metadados.
      return {
        isValid:     true,
        mode:        'connected',
        clientName:  data.data.organization,
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

// Fase 11B.12 — só confirma que a licença ainda é válida no servidor (e
// mantém desktop_activations actualizado como metadado). Já não estabelece
// nenhuma sessão — connected activation deixou de emitir tokens; a única
// forma de obter uma sessão real é /api/auth/login (Fase 11B.8). Chamado
// pelo fluxo de validação da chave e pelo fallback de tryRefreshOrReactivate()
// quando não há refresh_token nenhum para tentar renovar.
async function activateOnApi(licenseKey: string): Promise<void> {
  try {
    await apiClient.post('/api/auth/activate', {
      license_key: licenseKey,
      machine_id:  getMachineId(),
    });
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>;
    const code     = axiosErr.response?.data?.code;
    const message  = axiosErr.response?.data?.message;

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
      const axiosErr = err as AxiosError<{ code?: string }>;

      if (axiosErr.response) {
        // Fase 11B.11 (estado 6 — "sessão revogada remotamente") — o
        // servidor RESPONDEU e recusou explicitamente esta sessão; não é
        // falta de ligação. Nunca cair para activateOnApi() aqui: isso
        // reactivaria como o admin sintético da licença, mascarando a
        // recusa real com uma identidade diferente — exactamente o
        // problema que as Fases 11B.8-11B.10 eliminaram. Limpa tudo (tokens
        // + cache) e força um login explícito.
        const code = axiosErr.response.data?.code;
        await clearApiSession();

        if (code === 'REFRESH_EXPIRED') {
          toast.error(i18n.t('auth:session.toast.expiredTitle'), {
            description: i18n.t('auth:session.toast.expiredDescription'),
            duration: 10000,
          });
        } else if (code === 'SESSION_REVOKED') {
          toast.error(i18n.t('auth:session.toast.revokedTitle'), {
            description: i18n.t('auth:session.toast.revokedDescription'),
            duration: 10000,
          });
        } else {
          toast.error(i18n.t('auth:session.toast.invalidTitle'), {
            description: i18n.t('auth:session.toast.invalidDescription'),
            duration: 10000,
          });
        }

        window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
        return;
      }

      // Sem resposta — genuinamente sem ligação, não uma recusa. Mantém os
      // tokens/cache actuais (continuam válidos localmente) e tenta a
      // reactivação por licença como último recurso — falha silenciosamente
      // se também não houver ligação (activateOnApi já trata isso).
      console.warn('[License] Refresh falhou (sem ligação):', err);
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

// Fase 11B.11 — "quando voltar a estar online: validar/renovar sessão".
// Sem isto, uma reconexão só era detectada no próximo tick agendado de
// scheduleRefresh (até ~7h55 de distância) ou na próxima acção explícita do
// utilizador. Seguro chamar sempre: sem _refreshToken e sem licença guardada,
// tryRefreshOrReactivate() já é um no-op.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void tryRefreshOrReactivate();
  });
}

// ── Estado combinado online/offline × sessão (Fase 11B.11) ──────────────────
// Classifica em qual dos estados 1-5/8 o Desktop está agora, para a UI poder
// ser honesta sobre o que está realmente a acontecer — nunca dar a entender
// que uma Role/Scope foi validada localmente quando só existe um cache. O
// estado 6 (sessão revogada) é um EVENTO (SESSION_REVOKED_EVENT acima), não
// um estado persistente aqui — depois de tratado, a app volta ao ecrã de
// login. O estado 7 (licença expirada) já é tratado pelo LicenseGuard
// existente (gate anterior a este, substitui a app inteira pelo diálogo de
// activação) — não é reclassificado aqui.
export type DesktopSessionState =
  | 'online-valid'
  | 'online-expired'
  | 'offline-cache-valid'
  | 'offline-cache-expired'
  | 'offline-no-cache'
  | 'no-session';

export interface DesktopSessionInfo {
  state:    DesktopSessionState;
  isOnline: boolean;
}

export async function getDesktopSessionState(): Promise<DesktopSessionInfo> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const accessExpiresAt = _accessToken ? decodeJwtExpiry(_accessToken) : null;
  const hasLiveAccessToken = !!accessExpiresAt && accessExpiresAt > Date.now();

  if (isOnline) {
    if (hasLiveAccessToken) return { state: 'online-valid', isOnline };
    if (_accessToken) return { state: 'online-expired', isOnline };
    // Licença válida (LicenseGuard já garantiu isto antes de renderizar
    // quem consome este estado), mas nenhuma sessão de utilizador
    // estabelecida ainda — estado 8 do prompt.
    return { state: 'no-session', isOnline };
  }

  if (hasLiveAccessToken) return { state: 'offline-cache-valid', isOnline };

  try {
    const cached = await window._service_auth.getCachedSession();
    if (!cached) return { state: 'offline-no-cache', isOnline };

    const cacheExpiresAt = decodeJwtExpiry(cached.refresh_token);
    if (cacheExpiresAt && cacheExpiresAt > Date.now()) {
      return { state: 'offline-cache-valid', isOnline };
    }
    return { state: 'offline-cache-expired', isOnline };
  } catch {
    return { state: 'offline-no-cache', isOnline };
  }
}
