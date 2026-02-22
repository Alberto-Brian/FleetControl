// src/helpers/refueling-helpers.ts
import { ICreateRefueling, IRefueling } from '@/lib/types/refueling';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';

export async function getAllRefuelings(params?: IPaginationParams): Promise<IPaginatedResult<IRefueling>> {
    try {
        const result =  await window._refuelings.getAll(params);
        return result;
    } catch (error) {
        throw error; // ✨ Propaga para useErrorHandler
    }
}

export async function createRefueling(data: ICreateRefueling): Promise<IRefueling> {
    try {
        const result = await window._refuelings.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getRefuelingsByVehicle(id: string): Promise<IRefueling[]> {
    try {
        const result = await window._refuelings.getByVehicle(id);
        return result;
    } catch (error) {
        throw error;
    }
}