// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/services/auth/token-store.ts
// ========================================

// Token em memória — preenchido pelo auth service após activate
let _apiToken: string | null = null;

// No momento estou a setar a partir do license helpers que é onde está o método de activação da Api
export function setStoredApiToken(token: string | null) {
  _apiToken = token;
}

export function getStoredApiToken(): string | null {
  return _apiToken;
}

// Fase 6 (migração Standalone -> Connected-first), Prompt 6.1 — os módulos
// de query PowerSync-backed (processo principal) precisam do organizationId
// da sessão actual para escrever nas suas linhas locais (o backend nunca
// confia nesse valor vindo do cliente — DrizzlePowerSyncRepository.
// applyOperation já o reescreve sempre a partir do Principal autenticado no
// upload — isto é só para as linhas locais ficarem correctas antes desse
// round-trip). Decodificação sem verificar assinatura, mesma técnica já
// usada em license-helpers.ts (decodeJwtExpiry) — nunca uma decisão de
// autorização, só leitura de conveniência.
export function getSessionOrganizationId(): string | null {
  if (!_apiToken) return null;
  try {
    const payload = _apiToken.split('.')[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(payload.length + (4 - (payload.length % 4)) % 4, '=');
    const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return typeof json.organizationId === 'string' ? json.organizationId : null;
  } catch {
    return null;
  }
}