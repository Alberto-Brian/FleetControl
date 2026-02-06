// src/helpers/ipc/db/vehicles/vehicles-context.ts
import {
    GET_ALL_VEHICLES,
    GET_VEHICLE_BY_ID,
    CREATE_VEHICLE,
    UPDATE_VEHICLE,
    DELETE_VEHICLE,
    GET_AVAILABLE_VEHICLES,
    UPDATE_VEHICLE_STATUS,
    UPDATE_VEHICLE_MILEAGE,
    GET_VEHICLES_BY_CATEGORY,
    COUNT_VEHICLES_BY_STATUS,
} from "./vehicles-channels";

import { ICreateVehicle, IUpdateStatus, IUpdateVehicle } from '@/lib/types/vehicle';

export function exposeVehiclesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_vehicles", {
        getAll: () => ipcRenderer.invoke(GET_ALL_VEHICLES),
        getById: (vehicleId: string) => ipcRenderer.invoke(GET_VEHICLE_BY_ID, vehicleId),
        create: (vehicleData: ICreateVehicle) => ipcRenderer.invoke(CREATE_VEHICLE, vehicleData),
        update: (vehicleId: string, vehicleData: IUpdateVehicle) => ipcRenderer.invoke(UPDATE_VEHICLE, vehicleId, vehicleData),
        delete: (vehicleId: string) => ipcRenderer.invoke(DELETE_VEHICLE, vehicleId),
        getAvailable: () => ipcRenderer.invoke(GET_AVAILABLE_VEHICLES),
        updateStatus: (vehicleId: string, data: IUpdateStatus) => ipcRenderer.invoke(UPDATE_VEHICLE_STATUS, vehicleId, data),
        updateMileage: (vehicleId: string, mileage: number) => ipcRenderer.invoke(UPDATE_VEHICLE_MILEAGE, vehicleId, mileage),
        getByCategory: (categoryId: string) => ipcRenderer.invoke(GET_VEHICLES_BY_CATEGORY, categoryId),
        countByStatus: () => ipcRenderer.invoke(COUNT_VEHICLES_BY_STATUS),
    });
}