// src/helpers/ipc/db/fuel-stations/fuel-stations-context.ts
import {
    CREATE_FUEL_STATION,
    GET_ALL_FUEL_STATIONS,
    GET_FUEL_STATION_BY_ID,
    UPDATE_FUEL_STATION,
    DELETE_FUEL_STATION,
} from "./fuel-stations-channels";

import { ICreateFuelStation, IUpdateFuelStation } from '@/lib/types/fuel-station';

export function exposeFuelStationsContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_fuel_stations", {
        create: (data: ICreateFuelStation) => ipcRenderer.invoke(CREATE_FUEL_STATION, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_FUEL_STATIONS),
        getById: (id: string) => ipcRenderer.invoke(GET_FUEL_STATION_BY_ID, id),
        update: (id: string, data: IUpdateFuelStation) => ipcRenderer.invoke(UPDATE_FUEL_STATION, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_FUEL_STATION, id),
    });
}