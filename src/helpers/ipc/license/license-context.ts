// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/license/license-context.ts
// ========================================

import {
  LICENSE_CHECK_CHANNEL,
  LICENSE_GET_RAW_CHANNEL,
  LICENSE_REMOVE_CHANNEL,
  LICENSE_VALIDATE_CHANNEL,
} from './license-channels';

export function exposeLicenseContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('license', {
    validateLicense:      (key: string) => ipcRenderer.invoke(LICENSE_VALIDATE_CHANNEL, key),
    checkExistingLicense: ()            => ipcRenderer.invoke(LICENSE_CHECK_CHANNEL),
    getRawLicense:        ()            => ipcRenderer.invoke(LICENSE_GET_RAW_CHANNEL),
    removeLicense:        ()            => ipcRenderer.invoke(LICENSE_REMOVE_CHANNEL),
  });
}
