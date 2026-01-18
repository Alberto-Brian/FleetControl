// ========================================
// FILE: src/helpers/ipc/db/vehicle_categories/vehicle-categories-context.ts
// ========================================
import {
    GET_ALL_VEHICLE_CATEGORIES,
    CREATE_VEHICLE_CATEGORY,
    UPDATE_VEHICLE_CATEGORY,
    DELETE_VEHICLE_CATEGORY,
} from "./vehicle-categories-channels";

import { ICreateVehicleCategory, IUpdateVehicleCategory } from '@/lib/types/vehicle-category';

export function exposeVehicleCategoriesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_vehicle_categories", {
        getAll: () => ipcRenderer.invoke(GET_ALL_VEHICLE_CATEGORIES),
        create: (data: ICreateVehicleCategory) => ipcRenderer.invoke(CREATE_VEHICLE_CATEGORY, data),
        update: (id: string, data: IUpdateVehicleCategory) => ipcRenderer.invoke(UPDATE_VEHICLE_CATEGORY, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_VEHICLE_CATEGORY, id),
    });
}