import {
    BACKUP_EXPORT_CHANNEL,
    BACKUP_PROGRESS_CHANNEL,
    BACKUP_RESTORE_CHANNEL,
    BACKUP_RESTORE_PROGRESS_CHANNEL,
    BACKUP_GET_CONFIG_CHANNEL,
    BACKUP_UPDATE_CONFIG_CHANNEL,
    BACKUP_LIST_CHANNEL,
    BACKUP_RESTORE_FROM_DIR_CHANNEL
 } from "./backup-channels";

export function exposeBackupContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("backup", {
        export: () => ipcRenderer.invoke(BACKUP_EXPORT_CHANNEL),
        restore: () => ipcRenderer.invoke(BACKUP_RESTORE_CHANNEL),
        restoreFromDir: (folderPath: string) => ipcRenderer.invoke(BACKUP_RESTORE_FROM_DIR_CHANNEL, folderPath),
        getConfig: () => ipcRenderer.invoke(BACKUP_GET_CONFIG_CHANNEL),
        updateConfig: (config: any) => ipcRenderer.invoke(BACKUP_UPDATE_CONFIG_CHANNEL, config),
        listBackups: () => ipcRenderer.invoke(BACKUP_LIST_CHANNEL),
        onProgress: (callback: (progress: any) => void) => ipcRenderer.on(BACKUP_PROGRESS_CHANNEL, (_event, data) => callback(data)),
        onRestoreProgress: (callback: (progress: any) => void) => ipcRenderer.on(BACKUP_RESTORE_PROGRESS_CHANNEL, (_event, data) => callback(data)),
        removeProgressListener: () => ipcRenderer.removeAllListeners(BACKUP_PROGRESS_CHANNEL),
        removeRestoreProgressListener: () => ipcRenderer.removeAllListeners(BACKUP_RESTORE_PROGRESS_CHANNEL),
    });
}
