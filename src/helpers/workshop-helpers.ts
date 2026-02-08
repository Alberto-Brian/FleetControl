// src/helpers/workshop-helpers.ts (ATUALIZAR)
import { ICreateWorkshop, IUpdateWorkshop, IWorkshop } from "@/lib/types/workshop";

export async function createWorkshop(data: ICreateWorkshop): Promise<IWorkshop> {
    try {
        const result = await window._workshops.create(data);
        return result;
    } catch (error) {
        throw error; // ✨ Propaga para useErrorHandler
    }
}

export async function getAllWorkshops(): Promise<IWorkshop[]> {
    try {
        const result = await window._workshops.getAll();
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateWorkshop(id: string, data: IUpdateWorkshop): Promise<IWorkshop> {
    try {
        const result = await window._workshops.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteWorkshop(id: string): Promise<string> {
    try {
        const result = await window._workshops.delete(id);
        return result;
    } catch (error) {
        throw error;
    }
}