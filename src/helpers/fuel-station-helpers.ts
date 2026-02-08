// src/helpers/fuel-station-helpers.ts
import { ICreateFuelStation, IUpdateFuelStation, IFuelStation } from "@/lib/types/fuel-station";

export async function getAllFuelStations(): Promise<IFuelStation[]> {
    try {
        const result = await window._fuel_stations.getAll();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function createFuelStation(data: ICreateFuelStation): Promise<IFuelStation> {
    try {
        const result = await window._fuel_stations.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateFuelStation(id: string, data: IUpdateFuelStation): Promise<IFuelStation> {
    try {
        const result = await window._fuel_stations.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteFuelStation(id: string): Promise<string> {
    try {
        const result = await window._fuel_stations.delete(id);
        return result;
    } catch (error) {
        throw error;
    }
}