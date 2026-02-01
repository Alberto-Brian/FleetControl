// ========================================
// FILE: src/helpers/drivers-helpers.ts
// ========================================
import { ICreateDriver, IUpdateDriver, IDriver } from '@/lib/types/driver';

export async function getAllDrivers(): Promise<IDriver[]> {
    try {
        const result = await window._drivers.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getDriverById(id: string): Promise<IDriver | null> {
    try {
        const result = await window._drivers.getById(id);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createDriver(data: ICreateDriver): Promise<IDriver | null> {
    try {
        const result = await window._drivers.create(data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateDriver(id: string, data: IUpdateDriver): Promise<IDriver | null> {
    try {
        const result = await window._drivers.update(id, data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteDriver(id: string): Promise<string | null> {
    try {
        const result = await window._drivers.delete(id);
        return result as string;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getActiveDrivers(): Promise<IDriver[]> {
    try {
        const result = await window._drivers.getActive();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getAvailableDrivers(): Promise<IDriver[]> {
    try {
        const result = await window._drivers.getAvailable();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getExpiringLicenses(days: number = 30): Promise<IDriver[]> {
    try {
        const result = await window._drivers.getExpiringLicenses(days);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}