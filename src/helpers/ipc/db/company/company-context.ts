// ========================================
// FILE: src/helpers/ipc/db/company/company-context.ts
// ========================================
import {
  COMPANY_GET,
  COMPANY_UPDATE,
  COMPANY_IS_CONFIGURED,
  COMPANY_UPLOAD_LOGO,
  COMPANY_REMOVE_LOGO,
  COMPANY_GET_LOGO_B64,
} from './company-channels';

export function exposeCompanyContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_company', {
    get:           ()                    => ipcRenderer.invoke(COMPANY_GET),
    isConfigured:  ()                    => ipcRenderer.invoke(COMPANY_IS_CONFIGURED),
    update:        (data: any)           => ipcRenderer.invoke(COMPANY_UPDATE, data),
    uploadLogo:    (base64: string)      => ipcRenderer.invoke(COMPANY_UPLOAD_LOGO, base64),
    removeLogo:    ()                    => ipcRenderer.invoke(COMPANY_REMOVE_LOGO),
    getLogoBase64: ()                    => ipcRenderer.invoke(COMPANY_GET_LOGO_B64),
  });
}