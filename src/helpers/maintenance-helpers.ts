// ========================================
// FILE: src/helpers/maintenance-helpers.ts (ATUALIZADO)
// ========================================
import { ICreateMaintenance, IUpdateMaintenance, IMaintenance } from '@/lib/types/maintenance';

export async function getAllMaintenances(): Promise<IMaintenance[]> {
    try {
        const result = await window._maintenances.getAll();
        return result;
    } catch (error) {
        throw error; // ✅ Propaga para useErrorHandler
    }
}

export async function getMaintenanceById(id: string): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.getMaintenanceById(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function createMaintenance(data: ICreateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateMaintenance(id: string, data: IUpdateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function completeMaintenance(id: string, data: IUpdateMaintenance): Promise<IMaintenance | null> {
    try {
        const result = await window._maintenances.complete(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteMaintenance(id: string): Promise<string | null> {
    try {
        const result = await window._maintenances.delete(id);
        return result as string;
    } catch (error) {
        throw error;
    }
}

export async function getActiveMaintenances(): Promise<IMaintenance[]> {
    try {
        const result = await window._maintenances.getActiveMaintenances();
        return result;
    } catch (error) {
        throw error;
    }
}