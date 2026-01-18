// src/helpers/fuel-stations-helpers.ts
import { ICreateFuelStation, IUpdateFuelStation, IFuelStation } from "@/lib/types/fuel-station";

export async function createFuelStation(data: ICreateFuelStation): Promise<IFuelStation> {
    try {
        const result = await window._fuel_stations.create(data);
        return result;
    } catch (error) {
        console.error("Error creating fuel station:", error);
        throw error;
    }
}

export async function getAllFuelStations(): Promise<IFuelStation[]> {
    try {
        const result = await window._fuel_stations.getAll();
        return result;
    } catch (error) {
        console.error("Error getting fuel stations:", error);
        throw error;
    }
}

export async function getFuelStationById(id: string): Promise<IFuelStation | null> {
    try {
        const result = await window._fuel_stations.getById(id);
        return result;
    } catch (error) {
        console.error("Error getting fuel station:", error);
        throw error;
    }
}

export async function updateFuelStation(id: string, data: IUpdateFuelStation): Promise<IFuelStation> {
    try {
        const result = await window._fuel_stations.update(id, data);
        return result;
    } catch (error) {
        console.error("Error updating fuel station:", error);
        throw error;
    }
}

export async function deleteFuelStation(id: string): Promise<string> {
    try {
        const result = await window._fuel_stations.delete(id);
        return result;
    } catch (error) {
        console.error("Error deleting fuel station:", error);
        throw error;
    }
}