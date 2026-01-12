import { 
    LICENSE_CHECK_CHANNEL, 
    LICENSE_GET_MACHINE_ID_CHANNEL, 
    LICENSE_REMOVE_CHANNEL, 
    LICENSE_VALIDATE_CHANNEL
 } from "./license-channels";

export function exposeLicenseContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("license", {
        getMachineId: () => ipcRenderer.invoke(LICENSE_GET_MACHINE_ID_CHANNEL),
        checkExistingLicense: () => ipcRenderer.invoke(LICENSE_CHECK_CHANNEL),
        validateLicense: (licence: string) => ipcRenderer.invoke(LICENSE_VALIDATE_CHANNEL, licence),
        removeLicense: () => ipcRenderer.invoke(LICENSE_REMOVE_CHANNEL),
        notifyActivated: () => ipcRenderer.send('license:activated'),
    });
}
