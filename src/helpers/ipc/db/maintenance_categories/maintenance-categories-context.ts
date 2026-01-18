// src/helpers/ipc/db/maintenance-categories/maintenance-categories-context.ts
import { GET_ALL_MAINTENANCE_CATEGORIES } from "./maintenance-categories-channels";

export function exposeMaintenanceCategoriesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_maintenance_categories", {
        getAll: () => ipcRenderer.invoke(GET_ALL_MAINTENANCE_CATEGORIES),
    });
}