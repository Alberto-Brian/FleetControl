//src/helpers/ipc/services/powersync/powersync-service-channels.ts
// Fase 12, Prompt 22.8
export const POWERSYNC_CONNECT = 'service-powersync:connect';
export const POWERSYNC_DISCONNECT_AND_CLEAR = 'service-powersync:disconnect-and-clear';

// Prompt 22.10 — ecrã de diagnóstico "Estado do PowerSync"
export const POWERSYNC_GET_STATUS = 'service-powersync:get-status';
export const POWERSYNC_GET_SNAPSHOT = 'service-powersync:get-snapshot';

// Achado 2026-09-0X — pushes do processo principal (nunca pedidos pelo
// renderer, disparados pelo próprio SDK): estado de upload/download em
// tempo real (indicador na barra de título) e aviso de que alguma tabela
// sincronizada mudou (para a UI voltar a consultar powersync.db sozinha).
export const POWERSYNC_STATUS_PUSH = 'service-powersync:status-push';
export const POWERSYNC_DATA_CHANGED_PUSH = 'service-powersync:data-changed-push';
