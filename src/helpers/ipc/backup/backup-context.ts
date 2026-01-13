import { 
    BACKUP_EXPORT_CHANNEL, 
    BACKUP_RESTORE_CHANNEL, 
    BACKUP_GET_CONFIG_CHANNEL, 
    BACKUP_UPDATE_CONFIG_CHANNEL
 } from "./backup-channels";

export function exposeBackupContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("backup", {
        export: () => ipcRenderer.invoke(BACKUP_EXPORT_CHANNEL),
        restore: () => ipcRenderer.invoke(BACKUP_RESTORE_CHANNEL),
        getConfig: () => ipcRenderer.invoke(BACKUP_GET_CONFIG_CHANNEL),
        updateConfig: (config: any) => ipcRenderer.invoke(BACKUP_UPDATE_CONFIG_CHANNEL, config),
    });
}
