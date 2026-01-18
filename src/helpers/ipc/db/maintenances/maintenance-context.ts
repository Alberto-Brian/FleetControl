// ========================================
// FILE: src/helpers/ipc/db/maintenances/maintenances-context.ts
// ========================================
import {
    GET_ALL_MAINTENANCES,
    GET_MAINTENANCE_BY_ID,
    CREATE_MAINTENANCE,
    UPDATE_MAINTENANCE,
    COMPLETE_MAINTENANCE,
    DELETE_MAINTENANCE,
    GET_ACTIVE_MAINTENANCES,
    GET_MAINTENANCE_CATEGORIES,
    GET_WORKSHOPS,
} from "./maintenances-channels";

import { ICreateMaintenance, IUpdateMaintenance } from '@/lib/types/maintenance';

export function exposeMaintenancesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_maintenances", {
        getAll: () => ipcRenderer.invoke(GET_ALL_MAINTENANCES),
        getById: (id: string) => ipcRenderer.invoke(GET_MAINTENANCE_BY_ID, id),
        create: (data: ICreateMaintenance) => ipcRenderer.invoke(CREATE_MAINTENANCE, data),
        update: (id: string, data: IUpdateMaintenance) => ipcRenderer.invoke(UPDATE_MAINTENANCE, id, data),
        complete: (id: string, data: IUpdateMaintenance) => ipcRenderer.invoke(COMPLETE_MAINTENANCE, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_MAINTENANCE, id),
        getActive: () => ipcRenderer.invoke(GET_ACTIVE_MAINTENANCES),
        getCategories: () => ipcRenderer.invoke(GET_MAINTENANCE_CATEGORIES),
        getWorkshops: () => ipcRenderer.invoke(GET_WORKSHOPS),
    });
}