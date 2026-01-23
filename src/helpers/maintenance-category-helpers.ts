// src/helpers/maintenance-categories-helpers.ts
import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory, IMaintenanceCategory } from "@/lib/types/maintenance_category";

export async function createMaintenanceCategory(data: ICreateMaintenanceCategory): Promise<IMaintenanceCategory> {
    try {
        const result = await window._maintenance_categories.create(data);
        return result;
    } catch (error) {
        console.error("Error creating maintenance category:", error);
        throw error;
    }
}

export async function getAllMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    try {
        const result = await window._maintenance_categories.getAll();
        return result;
    } catch (error) {
        console.error("Error getting maintenance categories:", error);
        throw error;
    }
}

export async function getMaintenanceCategoryById(id: string): Promise<IMaintenanceCategory | null> {
    try {
        const result = await window._maintenance_categories.getById(id);
        return result;
    } catch (error) {
        console.error("Error getting maintenance category:", error);
        throw error;
    }
}

export async function updateMaintenanceCategory(id: string, data: IUpdateMaintenanceCategory): Promise<IMaintenanceCategory> {
    try {
        const result = await window._maintenance_categories.update(id, data);
        return result;
    } catch (error) {
        console.error("Error updating maintenance category:", error);
        throw error;
    }
}

export async function deleteMaintenanceCategory(id: string): Promise<string> {
    try {
        const result = await window._maintenance_categories.delete(id);
        return result;
    } catch (error) {
        console.error("Error deleting maintenance category:", error);
        throw error;
    }
}

export async function getActiveMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    try {
        const result = await window._maintenance_categories.getActive();
        return result;
    } catch (error) {
        console.error("Error getting active maintenance categories:", error);
        throw error;
    }
}