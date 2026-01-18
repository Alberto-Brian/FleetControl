// ========================================
// FILE: src/helpers/ipc/db/refuelings/refuelings-context.ts
// ========================================
import {
    GET_ALL_REFUELINGS,
    CREATE_REFUELING,
    GET_REFUELINGS_BY_VEHICLES,
} from "./refuelings-channels";

import { ICreateRefueling } from '@/lib/types/refueling';

export function exposeRefuelingsContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_refuelings", {
        getAll: () => ipcRenderer.invoke(GET_ALL_REFUELINGS),
        create: (data: ICreateRefueling) => ipcRenderer.invoke(CREATE_REFUELING, data),
        getByVehicles: (id: string) => ipcRenderer.invoke(GET_REFUELINGS_BY_VEHICLES, id),
    });
}