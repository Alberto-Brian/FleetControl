// src/helpers/ipc/db/maintenance-categories/maintenance-categories-context.ts
import {
    CREATE_MAINTENANCE_CATEGORY,
    GET_ALL_MAINTENANCE_CATEGORIES,
    GET_MAINTENANCE_CATEGORY_BY_ID,
    UPDATE_MAINTENANCE_CATEGORY,
    DELETE_MAINTENANCE_CATEGORY,
    GET_ACTIVE_MAINTENANCE_CATEGORIES,
} from "./maintenance-categories-channels";

import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory } from '@/lib/types/maintenance_category';

export function exposeMaintenanceCategoriesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_maintenance_categories", {
        create: (data: ICreateMaintenanceCategory) => ipcRenderer.invoke(CREATE_MAINTENANCE_CATEGORY, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_MAINTENANCE_CATEGORIES),
        getById: (id: string) => ipcRenderer.invoke(GET_MAINTENANCE_CATEGORY_BY_ID, id),
        update: (id: string, data: IUpdateMaintenanceCategory) => ipcRenderer.invoke(UPDATE_MAINTENANCE_CATEGORY, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_MAINTENANCE_CATEGORY, id),
        getActive: () => ipcRenderer.invoke(GET_ACTIVE_MAINTENANCE_CATEGORIES),
    });
}