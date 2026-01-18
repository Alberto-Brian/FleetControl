// src/helpers/ipc/db/fuel-stations/fuel-stations-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_FUEL_STATION,
    GET_ALL_FUEL_STATIONS,
    GET_FUEL_STATION_BY_ID,
    UPDATE_FUEL_STATION,
    DELETE_FUEL_STATION,
} from "./fuel-stations-channels";

import {
    createFuelStation,
    getAllFuelStations,
    getFuelStationById,
    updateFuelStation,
    deleteFuelStation,
} from "@/lib/db/queries/fuel_stations.queries";

import { ICreateFuelStation, IUpdateFuelStation } from "@/lib/types/fuel-station";

export function addFuelStationsEventListeners() {
    ipcMain.handle(CREATE_FUEL_STATION, async (_, data: ICreateFuelStation) => await createFuelStation(data));
    ipcMain.handle(GET_ALL_FUEL_STATIONS, async (_) => await getAllFuelStations());
    ipcMain.handle(GET_FUEL_STATION_BY_ID, async (_, id: string) => await getFuelStationById(id));
    ipcMain.handle(UPDATE_FUEL_STATION, async (_, id: string, data: IUpdateFuelStation) => await updateFuelStation(id, data));
    ipcMain.handle(DELETE_FUEL_STATION, async (_, id: string) => await deleteFuelStation(id));
}