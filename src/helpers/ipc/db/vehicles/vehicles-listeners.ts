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
    findVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles,
    updateVehicleStatus,
    updateVehicleMileage,
    getVehiclesByCategory,
    countVehiclesByStatus,
    findVehicleByLicensePlate
} from '@/lib/db/queries/vehicles.queries';

import {
    findVehicleCategoryById
} from '@/lib/db/queries/vehicle_categories.queries'

import { ICreateVehicle, IUpdateStatus, IUpdateVehicle } from '@/lib/types/vehicle';
import { VehicleStatus } from "@/lib/db/schemas/vehicles";
import { ConflictError, NotFoundError, ValidationError, WarningError } from "@/lib/errors/AppError";

export function addVehiclesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLES, async (_) => await getAllVehiclesEvent());
    ipcMain.handle(GET_VEHICLE_BY_ID, async (_, vehicleId: string) => await getVehicleByIdEvent(vehicleId));
    ipcMain.handle(CREATE_VEHICLE, async (_, vehicleData: ICreateVehicle) => await createVehicleEvent(vehicleData));
    ipcMain.handle(UPDATE_VEHICLE, async (_, vehicleId: string, vehicleData: IUpdateVehicle) => await updateVehicleEvent(vehicleId, vehicleData));
    ipcMain.handle(DELETE_VEHICLE, async (_, vehicleId: string) => await deleteVehicleEvent(vehicleId));
    ipcMain.handle(GET_AVAILABLE_VEHICLES, async (_) => await getAvailableVehiclesEvent());
    ipcMain.handle(UPDATE_VEHICLE_STATUS, async (_, vehicleId: string, data: IUpdateStatus) => await updateVehicleStatusEvent(vehicleId, data));
    ipcMain.handle(UPDATE_VEHICLE_MILEAGE, async (_, vehicleId: string, mileage: number) => await updateVehicleMileageEvent(vehicleId, mileage));
    ipcMain.handle(GET_VEHICLES_BY_CATEGORY, async (_, categoryId: string) => await getVehiclesByCategoryEvent(categoryId));
    ipcMain.handle(COUNT_VEHICLES_BY_STATUS, async (_) => await countVehiclesByStatusEvent());
}

async function getAllVehiclesEvent() {
    return await getAllVehicles();
}

async function getVehicleByIdEvent(vehicleId: string) {
    const result = await findVehicleById(vehicleId);
    if(!result) {
        throw new Error(
            new NotFoundError('vehicle').toIpcString()
        )
    }

    return result;
}

async function createVehicleEvent(vehicleData: ICreateVehicle) {
    if(!vehicleData.category_id){
       throw new Error(
         new WarningError('common:warnigns.categoryRequired').toIpcString()
       ) 
    }

    const categoryVehicleExists = await findVehicleCategoryById(vehicleData.category_id);
    if(!categoryVehicleExists){
        new NotFoundError('vehicleCategory').toIpcString()
    }

    const vehicleExists = await findVehicleByLicensePlate(vehicleData.license_plate);
    if(vehicleExists) {
        throw new Error(
            new ConflictError('vehicles:errors.vehicleWithTheSameLicensePlateAlreadyExists').toIpcString()
        );
    }

    if(!vehicleData.license_plate){
       throw new Error(
         new WarningError('common:warnigns.licensePlateRequired').toIpcString()
       ) 
    }

    return await createVehicle(vehicleData);
}

async function updateVehicleEvent(vehicleId: string, vehicleData: IUpdateVehicle) {
    const vehicleExists = await findVehicleById(vehicleId);
    if (!vehicleExists) {
        throw new Error(
            new NotFoundError('vehicle').toIpcString()
        );
    }

     if(!vehicleData.category_id){
       throw new Error(
         new WarningError('common:warnigns.categoryRequired').toIpcString()
       ) 
    }

    const categoryVehicleExists = await findVehicleCategoryById(vehicleData.category_id);
    if(!categoryVehicleExists){
        new NotFoundError('vehicleCategory').toIpcString()
    }

    if (vehicleData.license_plate) {
        const other = await findVehicleByLicensePlate(vehicleData.license_plate);
        if (other && other.id !== vehicleId) {
            throw new Error(
                new ConflictError('vehicles:errors.vehicleWithTheSameLicensePlateAlreadyExists',{
                    i18n: { plate: vehicleData.license_plate },
                    duration: 10000,
                    licensePlate: vehicleData.license_plate
                }).toIpcString()
            );
        }
    }
    return await updateVehicle(vehicleId, vehicleData);
}

async function deleteVehicleEvent(vehicleId: string) {
    const vehicleExists = await findVehicleById(vehicleId);
    if (!vehicleExists) {
        throw new Error(
            new NotFoundError('vehicle').toIpcString()
        );
    }
    return await deleteVehicle(vehicleId);
}

async function getAvailableVehiclesEvent() {
    const result = await getAvailableVehicles();
    if(result.length === 0) {
        throw new Error(
            new WarningError('vehicles:warnings.notAvailableVehicles').toIpcString()
        )
    }
    return result;
}

async function updateVehicleStatusEvent(vehicleId: string, data: IUpdateStatus) {
    const vehicleExists = await findVehicleById(vehicleId);
    if (!vehicleExists) {
        throw new Error(
            new NotFoundError('vehicle').toIpcString()
        );
    }
    return await updateVehicleStatus(vehicleId, data);
}

async function updateVehicleMileageEvent(vehicleId: string, mileage: number) {
    const vehicleExists = await findVehicleById(vehicleId);
    if (!vehicleExists) {
        throw new Error(
            new NotFoundError('vehicle').toIpcString()
        );
    }
    return await updateVehicleMileage(vehicleId, mileage);
}

async function getVehiclesByCategoryEvent(categoryId: string) {
    // const result = await getVehiclesByCategory(categoryId);
    // if(result.length === 0) {
    //     throw new Error(
    //         new WarningError('vehicles:warnings.notAvailableVehicles').toIpcString()
    //     )
    // }
    return await getVehiclesByCategory(categoryId);
}

async function countVehiclesByStatusEvent() {
    return await countVehiclesByStatus();
}
