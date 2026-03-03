// ========================================
// FILE: src/helpers/ipc/db/system_settings/system-settings-context.ts
// ========================================
import {
  SYSTEM_SETTINGS_GET,
  SYSTEM_SETTINGS_UPDATE,
  SYSTEM_SETTINGS_RESET,
} from './system-settings-channels';

export function exposeSystemSettingsContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_system_settings', {
    get:    ()           => ipcRenderer.invoke(SYSTEM_SETTINGS_GET),
    update: (data: any)  => ipcRenderer.invoke(SYSTEM_SETTINGS_UPDATE, data),
    reset:  ()           => ipcRenderer.invoke(SYSTEM_SETTINGS_RESET),
  });
}