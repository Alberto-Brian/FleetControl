//src/helpers/ipc/services/powersync/powersync-service-context.ts
// Fase 12, Prompt 22.8
import {
  POWERSYNC_CONNECT,
  POWERSYNC_DISCONNECT_AND_CLEAR,
  POWERSYNC_GET_STATUS,
  POWERSYNC_GET_SNAPSHOT,
} from './powersync-service-channels';

export function exposeServicePowerSyncContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');
  contextBridge.exposeInMainWorld('_service_powersync', {
    connect: () => ipcRenderer.invoke(POWERSYNC_CONNECT),
    disconnectAndClear: () => ipcRenderer.invoke(POWERSYNC_DISCONNECT_AND_CLEAR),
    // Prompt 22.10 — ecrã de diagnóstico "Estado do PowerSync"
    getStatus: () => ipcRenderer.invoke(POWERSYNC_GET_STATUS),
    getSnapshot: () => ipcRenderer.invoke(POWERSYNC_GET_SNAPSHOT),
  });
}
