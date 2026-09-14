// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/powersync/rejected-operation.ts
// ========================================
//
// 2026-09-13 — forma de um item devolvido por POST /api/powersync/sync/upload
// com {success:false} (Fase 12, Prompt 22.4 da API — nunca 4xx/5xx por uma
// negação de autorização/validação de uma operação individual, sempre 2xx
// com este formato por item). Partilhado entre connector.ts (processo
// principal, onde é produzido) e powersync-service-context.ts/SyncNotifier.tsx
// (renderer, onde é consumido) — único sítio para não duplicar a forma.
export interface IRejectedSyncOperation {
  id:      string;
  table:   string;
  op:      'PUT' | 'PATCH' | 'DELETE';
  success: false;
  error?:  string;
}
