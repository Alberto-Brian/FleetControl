import { GET_SYSTEM_VERSION, GET_DB_VERSION } from "./system-channels";

export function exposeSystemContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("system", {
        getSystemVersion: () => ipcRenderer.invoke(GET_SYSTEM_VERSION),
        getSchemaVersion: () => ipcRenderer.invoke(GET_DB_VERSION),
    });
}
