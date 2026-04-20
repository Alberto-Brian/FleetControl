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