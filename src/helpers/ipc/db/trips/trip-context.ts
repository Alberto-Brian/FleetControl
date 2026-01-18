// ========================================
// FILE: src/helpers/ipc/db/trips/trips-context.ts
// ========================================
import {
    GET_ALL_TRIPS,
    GET_TRIP_BY_ID,
    CREATE_TRIP,
    CANCEL_TRIP,
    GET_ACTIVE_TRIPS,
    COMPLETE_TRIP,
} from "./trips-channels";

import { ICreateTrip, ICompleteTrip } from '@/lib/types/trip';

export function exposeTripsContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_trips", {
        getAll: () => ipcRenderer.invoke(GET_ALL_TRIPS),
        getById: (id: string) => ipcRenderer.invoke(GET_TRIP_BY_ID, id),
        create: (data: ICreateTrip) => ipcRenderer.invoke(CREATE_TRIP, data),
        cancel: (id: string) => ipcRenderer.invoke(CANCEL_TRIP, id),
        getActive: () => ipcRenderer.invoke(GET_ACTIVE_TRIPS),
        complete: (id: string, data: ICompleteTrip) => ipcRenderer.invoke(COMPLETE_TRIP, id, data),
    });
}