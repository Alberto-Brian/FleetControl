// ========================================
// FILE: src/helpers/ipc/db/drivers/drivers-context.ts
// ========================================
import {
    GET_ALL_DRIVERS,
    GET_DRIVER_BY_ID,
    CREATE_DRIVER,
    UPDATE_DRIVER,
    DELETE_DRIVER,
    GET_ACTIVE_DRIVERS,
    GET_EXPIRING_LICENSES,
} from "./drivers-channels";

import { ICreateDriver, IUpdateDriver } from '@/lib/types/driver';

export function exposeDriversContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_drivers", {
        getAll: () => ipcRenderer.invoke(GET_ALL_DRIVERS),
        getById: (id: string) => ipcRenderer.invoke(GET_DRIVER_BY_ID, id),
        create: (data: ICreateDriver) => ipcRenderer.invoke(CREATE_DRIVER, data),
        update: (id: string, data: IUpdateDriver) => ipcRenderer.invoke(UPDATE_DRIVER, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_DRIVER, id),
        getActive: () => ipcRenderer.invoke(GET_ACTIVE_DRIVERS),
        getExpiringLicenses: (days: number) => ipcRenderer.invoke(GET_EXPIRING_LICENSES, days),
    });
}