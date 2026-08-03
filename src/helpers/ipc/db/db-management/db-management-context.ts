import {
    DB_MGMT_GET_CONFIG_CHANNEL,
    DB_MGMT_SAVE_CONFIG_CHANNEL,
    DB_MGMT_FORCE_ROTATE_CHANNEL,
    DB_MGMT_GET_STATUS_CHANNEL,
    DB_MGMT_APPLY_RETENTION_CHANNEL,
} from './db-management-channels';

export function exposeDbManagementContext() {
    const { contextBridge, ipcRenderer } = window.require('electron');
    contextBridge.exposeInMainWorld('dbManagement', {
        getConfig:      ()             => ipcRenderer.invoke(DB_MGMT_GET_CONFIG_CHANNEL),
        saveConfig:     (config: any)  => ipcRenderer.invoke(DB_MGMT_SAVE_CONFIG_CHANNEL, config),
        forceRotate:    ()             => ipcRenderer.invoke(DB_MGMT_FORCE_ROTATE_CHANNEL),
        getStatus:      ()             => ipcRenderer.invoke(DB_MGMT_GET_STATUS_CHANNEL),
        applyRetention: (tables: any[]) => ipcRenderer.invoke(DB_MGMT_APPLY_RETENTION_CHANNEL, tables),
    });
}
