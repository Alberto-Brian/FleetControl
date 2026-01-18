// src/helpers/workshops-helpers.ts
import { ICreateWorkshop, IUpdateWorkshop, IWorkshop } from "@/lib/types/workshop";

export async function createWorkshop(data: ICreateWorkshop): Promise<IWorkshop> {
    try {
        const result = await window._workshops.create(data);
        return result;
    } catch (error) {
        console.error("Error creating workshop:", error);
        throw error;
    }
}

export async function getAllWorkshops(): Promise<IWorkshop[]> {
    try {
        const result = await window._workshops.getAll();
        return result;
    } catch (error) {
        console.error("Error getting workshops:", error);
        throw error;
    }
}

export async function getWorkshopById(id: string): Promise<IWorkshop | null> {
    try {
        const result = await window._workshops.getById(id);
        return result;
    } catch (error) {
        console.error("Error getting workshop:", error);
        throw error;
    }
}

export async function updateWorkshop(id: string, data: IUpdateWorkshop): Promise<IWorkshop> {
    try {
        const result = await window._workshops.update(id, data);
        return result;
    } catch (error) {
        console.error("Error updating workshop:", error);
        throw error;
    }
}

export async function deleteWorkshop(id: string): Promise<string> {
    try {
        const result = await window._workshops.delete(id);
        return result;
    } catch (error) {
        console.error("Error deleting workshop:", error);
        throw error;
    }
}