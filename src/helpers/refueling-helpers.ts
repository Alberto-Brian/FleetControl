// ========================================
// FILE: src/helpers/refuelings-helpers.ts
// ========================================
import { ICreateRefueling, IRefueling } from '@/lib/types/refueling';

export async function getAllRefuelings(): Promise<IRefueling[]> {
    try {
        const result = await window._refuelings.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}


export async function createRefueling(data: ICreateRefueling): Promise<IRefueling | null> {
    try {
        const result = await window._refuelings.create(data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getRefuelingsByVehicle(id: string): Promise<IRefueling[]> {
    try {
        const result = await window._refuelings.getByVehicle(id);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
