//// src/helpers/vehicles-helpers.ts
import { ICreateVehicle, IUpdateVehicle, IVehicle } from '@/lib/types/vehicle';

export async function getAllVehicles(): Promise<IVehicle[]> {
    try {
        const result = await window._vehicles.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getVehicleById(vehicleId: string): Promise<IVehicle | null> {
    try {
        const result = await window._vehicles.getById(vehicleId);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createVehicle(vehicleData: ICreateVehicle): Promise<IVehicle | null> {
    try {
        const result = await window._vehicles.create(vehicleData);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateVehicle(vehicleId: string, vehicleData: IUpdateVehicle): Promise<IVehicle | null> {
    try {
        const result = await window._vehicles.update(vehicleId, vehicleData);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteVehicle(vehicleId: string): Promise<string | null> {
    try {
        const result = await window._vehicles.delete(vehicleId);
        return result as string;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getAvailableVehicles(): Promise<IVehicle[]> {
    try {
        const result = await window._vehicles.getAvailable();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function updateVehicleStatus(vehicleId: string, status: string): Promise<IVehicle | null> {
    try {
        const result = await window._vehicles.updateStatus(vehicleId, status);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateVehicleMileage(vehicleId: string, mileage: number): Promise<IVehicle | null> {
    try {
        const result = await window._vehicles.updateMileage(vehicleId, mileage);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}