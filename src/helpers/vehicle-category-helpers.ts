// ========================================
// FILE: src/helpers/vehicle-category-helpers.ts
// ========================================
import { ICreateVehicleCategory, IUpdateVehicleCategory, IVehicleCategory } from '@/lib/types/vehicle-category';
import { extractAppError } from '@/helpers/error-helpers';

export async function getAllVehicleCategories(): Promise<IVehicleCategory[]> {
    try {
        const result = await window._vehicle_categories.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function createVehicleCategory(data: ICreateVehicleCategory): Promise<IVehicleCategory | null> {
    try {
        const result = await window._vehicle_categories.create(data);
        return result;
    } catch (error: any) {
        throw error
    }
}

export async function updateVehicleCategory(id: string, data: IUpdateVehicleCategory): Promise<IVehicleCategory | null> {
    try {
        const result = await window._vehicle_categories.update(id, data);
        return result;
    } catch (error) {
        throw error
    }
}

export async function deleteVehicleCategory(id: string): Promise<string | null> {
    try {
        const result = await window._vehicle_categories.delete(id);
        return result as string;
    } catch (error) {
        throw error
    }
}