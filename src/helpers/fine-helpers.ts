// src/helpers/fines-helpers.ts
import { ICreateFine, IUpdateFine, IFine, PayFineData } from "@/lib/types/fine";

export async function createFine(data: ICreateFine): Promise<IFine> {
    try {
        const result = await window._fines.create(data);
        return result;
    } catch (error) {
        console.error("Error creating fine:", error);
        throw error;
    }
}

export async function getAllFines(): Promise<any[]> {
    try {
        const result = await window._fines.getAll();
        return result;
    } catch (error) {
        console.error("Error getting fines:", error);
        throw error;
    }
}

export async function getFineById(id: string): Promise<IFine | null> {
    try {
        const result = await window._fines.getById(id);
        return result;
    } catch (error) {
        console.error("Error getting fine:", error);
        throw error;
    }
}

export async function updateFine(id: string, data: IUpdateFine): Promise<IFine> {
    try {
        const result = await window._fines.update(id, data);
        return result;
    } catch (error) {
        console.error("Error updating fine:", error);
        throw error;
    }
}

export async function markFineAsPaid(id: string, data: PayFineData): Promise<IFine> {
    try {
        const result = await window._fines.markAsPaid(id, data);
        return result;
    } catch (error) {
        console.error("Error marking fine as paid:", error);
        throw error;
    }
}

export async function deleteFine(id: string): Promise<string> {
    try {
        const result = await window._fines.delete(id);
        return result;
    } catch (error) {
        console.error("Error deleting fine:", error);
        throw error;
    }
}

export async function getPendingFines(): Promise<any[]> {
    try {
        const result = await window._fines.getPending();
        return result;
    } catch (error) {
        console.error("Error getting pending fines:", error);
        throw error;
    }
}