import { GET_SYSTEM_VERSION, GET_DB_VERSION, FORCE_DB_ROTATION, GET_SERVER_URL, SET_SERVER_URL, SHOW_NOTIFICATION, LIST_DATABASES, GET_DATABASE_STATS, SET_HISTORICAL_DB, GET_HISTORICAL_DB } from "./system-channels";

export function exposeSystemContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("system", {
        getSystemVersion:   () => ipcRenderer.invoke(GET_SYSTEM_VERSION),
        getSchemaVersion:   () => ipcRenderer.invoke(GET_DB_VERSION),
        forceDbRotation:    () => ipcRenderer.send(FORCE_DB_ROTATION),
        getServerUrl:       () => ipcRenderer.invoke(GET_SERVER_URL),
        setServerUrl:       (url: string) => ipcRenderer.invoke(SET_SERVER_URL, url),
        showNotification:   (title: string, body: string) => ipcRenderer.send(SHOW_NOTIFICATION, title, body),
        listDatabases:      () => ipcRenderer.invoke(LIST_DATABASES),
        getDatabaseStats:   (filepath: string) => ipcRenderer.invoke(GET_DATABASE_STATS, filepath),
        setHistoricalDb:    (filepath: string | null) => ipcRenderer.invoke(SET_HISTORICAL_DB, filepath),
        getHistoricalDb:    () => ipcRenderer.invoke(GET_HISTORICAL_DB),
    });
}
