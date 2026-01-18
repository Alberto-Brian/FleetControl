// src/helpers/ipc/db/vehicles/vehicles-listeners.ts
import { ipcMain } from "electron";
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

import {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    updateVehicleStatus,
    updateVehicleMileage,
    getVehiclesByCategory,
    countVehiclesByStatus,
} from '@/lib/db/queries/vehicles.queries';

import { ICreateVehicle, IUpdateVehicle } from '@/lib/types/vehicle';
import { VehicleStatus } from "@/lib/db/schemas/vehicles";

export function addVehiclesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLES, async (_) => await getAllVehiclesEvent());
    ipcMain.handle(GET_VEHICLE_BY_ID, async (_, vehicleId: string) => await getVehicleByIdEvent(vehicleId));
    ipcMain.handle(CREATE_VEHICLE, async (_, vehicleData: ICreateVehicle) => await createVehicleEvent(vehicleData));
    ipcMain.handle(UPDATE_VEHICLE, async (_, vehicleId: string, vehicleData: IUpdateVehicle) => await updateVehicleEvent(vehicleId, vehicleData));
    ipcMain.handle(DELETE_VEHICLE, async (_, vehicleId: string) => await deleteVehicleEvent(vehicleId));
    ipcMain.handle(GET_AVAILABLE_VEHICLES, async (_) => await getAvailableVehiclesEvent());
    ipcMain.handle(UPDATE_VEHICLE_STATUS, async (_, vehicleId: string, status: VehicleStatus) => await updateVehicleStatusEvent(vehicleId, status));
    ipcMain.handle(UPDATE_VEHICLE_MILEAGE, async (_, vehicleId: string, mileage: number) => await updateVehicleMileageEvent(vehicleId, mileage));
    ipcMain.handle(GET_VEHICLES_BY_CATEGORY, async (_, categoryId: string) => await getVehiclesByCategoryEvent(categoryId));
    ipcMain.handle(COUNT_VEHICLES_BY_STATUS, async (_) => await countVehiclesByStatusEvent());
}

async function getAllVehiclesEvent() {
    return await getAllVehicles();
}

async function getVehicleByIdEvent(vehicleId: string) {
    return await getVehicleById(vehicleId);
}

async function createVehicleEvent(vehicleData: ICreateVehicle) {
    return await createVehicle(vehicleData);
}

async function updateVehicleEvent(vehicleId: string, vehicleData: IUpdateVehicle) {
    return await updateVehicle(vehicleId, vehicleData);
}

async function deleteVehicleEvent(vehicleId: string) {
    return await deleteVehicle(vehicleId);
}

async function getAvailableVehiclesEvent() {
    return await getAvailableVehicles();
}

async function updateVehicleStatusEvent(vehicleId: string, status: VehicleStatus) {
    return await updateVehicleStatus(vehicleId, status);
}

async function updateVehicleMileageEvent(vehicleId: string, mileage: number) {
    return await updateVehicleMileage(vehicleId, mileage);
}

async function getVehiclesByCategoryEvent(categoryId: string) {
    return await getVehiclesByCategory(categoryId);
}

async function countVehiclesByStatusEvent() {
    return await countVehiclesByStatus();
}