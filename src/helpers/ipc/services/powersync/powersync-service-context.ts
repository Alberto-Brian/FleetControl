//src/helpers/ipc/services/powersync/powersync-service-context.ts
// Fase 12, Prompt 22.8
import {
  POWERSYNC_CONNECT,
  POWERSYNC_DISCONNECT_AND_CLEAR,
  POWERSYNC_GET_STATUS,
  POWERSYNC_GET_SNAPSHOT,
  POWERSYNC_STATUS_PUSH,
  POWERSYNC_DATA_CHANGED_PUSH,
} from './powersync-service-channels';

export function exposeServicePowerSyncContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');
  contextBridge.exposeInMainWorld('_service_powersync', {
    connect: () => ipcRenderer.invoke(POWERSYNC_CONNECT),
    disconnectAndClear: () => ipcRenderer.invoke(POWERSYNC_DISCONNECT_AND_CLEAR),
    // Prompt 22.10 — ecrã de diagnóstico "Estado do PowerSync"
    getStatus: () => ipcRenderer.invoke(POWERSYNC_GET_STATUS),
    getSnapshot: () => ipcRenderer.invoke(POWERSYNC_GET_SNAPSHOT),
    // Achado 2026-09-0X — pushes em tempo real do processo principal (nunca
    // pedidos pelo renderer). Devolvem uma função de remoção, ao contrário
    // do padrão mais antigo em backup-context.ts (que não devolve nada).
    onStatusChanged: (callback: (status: unknown) => void) => {
      const listener = (_event: unknown, data: unknown) => callback(data);
      ipcRenderer.on(POWERSYNC_STATUS_PUSH, listener);
      return () => ipcRenderer.removeListener(POWERSYNC_STATUS_PUSH, listener);
    },
    onDataChanged: (callback: (tables: string[]) => void) => {
      const listener = (_event: unknown, data: string[]) => callback(data);
      ipcRenderer.on(POWERSYNC_DATA_CHANGED_PUSH, listener);
      return () => ipcRenderer.removeListener(POWERSYNC_DATA_CHANGED_PUSH, listener);
    },
  });
}
