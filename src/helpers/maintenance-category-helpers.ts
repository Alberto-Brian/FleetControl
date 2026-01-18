// src/helpers/maintenance-categories-helpers.ts
import { IMaintenanceCategory } from "@/lib/types/maintenance";

export async function getAllMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    try {
        const result = await window._maintenance_categories.getAll();
        return result;
    } catch (error) {
        console.error("Error getting maintenance categories:", error);
        throw error;
    }
}