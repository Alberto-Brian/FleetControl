// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/local-users-helpers.ts
// ========================================
//
// 2026-09-20 — gestão dos "cadeados" locais (tabela `users`, ver Fase
// 11B.10 — nunca decide identidade/autorização, só desbloqueia a sessão
// API já cacheada) nesta máquina específica. Distinto de "Sessões
// activas" (LicenseTab, GET /api/licenses/seats) — esse é o servidor a
// mostrar utilizadores concorrentes em toda a Organization; isto é só o
// que já ficou gravado NESTA instalação, mesmo offline.

export interface ILocalUnlockRecord {
  id: string;
  name: string;
  email: string;
  last_access_at: string | null;
}

export async function listLocalUnlockRecords(): Promise<ILocalUnlockRecord[]> {
  return window._service_auth.listLocalUnlockRecords();
}

export async function removeLocalUnlockRecord(userId: string): Promise<void> {
  return window._service_auth.deleteLocalUnlockRecord(userId);
}

// Chamado só por wipeLocalDataForIdentitySwitch() (license-helpers.ts) —
// nunca directamente por uma acção de utilizador isolada.
export async function wipeAllLocalUnlockRecords(): Promise<void> {
  return window._service_auth.wipeLocalUnlockRecords();
}
