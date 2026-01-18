// ========================================
// FILE: src/helpers/maintenances-helpers.ts
// ========================================
import { ICreateMaintenance, IUpdateMaintenance, IMaintenance, IMaintenanceCategory, IWorkshop } from '@/lib/types/maintenance';

export async function getAllMaintenances(): Promise<IMaintenance[]> {
    try {
        const result = await window._maintenances.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function createMaintenance(data: ICreateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.create(data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateMaintenance(id: string, data: IUpdateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.update(id, data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function completeMaintenance(id: string, data: IUpdateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.complete(id, data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteMaintenance(id: string): Promise<string | null> {
    try {
        const result = await window._maintenances.delete(id);
        return result as string;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    try {
        const result = await window._maintenances.getCategories();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getWorkshops(): Promise<IWorkshop[]> {
    try {
        const result = await window._maintenances.getWorkshops();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}