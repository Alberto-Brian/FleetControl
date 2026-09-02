//src/helpers/ipc/services/powersync/powersync-service-context.ts
// Fase 12, Prompt 22.8
import { POWERSYNC_CONNECT, POWERSYNC_DISCONNECT_AND_CLEAR } from './powersync-service-channels';

export function exposeServicePowerSyncContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');
  contextBridge.exposeInMainWorld('_service_powersync', {
    connect: () => ipcRenderer.invoke(POWERSYNC_CONNECT),
    disconnectAndClear: () => ipcRenderer.invoke(POWERSYNC_DISCONNECT_AND_CLEAR),
  });
}
