// ========================================
// FILE: src/helpers/trip-helpers.ts (ATUALIZADO)
// ========================================
import { ICreateTrip, ICompleteTrip, ITrip } from '@/lib/types/trip';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';

export async function getAllTrips(params?: IPaginationParams): Promise<IPaginatedResult<ITrip>> {
    try {
        const result = await window._trips.getAll(params);
        return result;
    } catch (error) {
        throw error; // ✅ Propaga para useErrorHandler
    }
}

export async function getTripById(id: string): Promise<ITrip | null> {
    try {
        const result = await window._trips.getById(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function createTrip(data: ICreateTrip): Promise<ITrip | null> {
    try {
        const result = await window._trips.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function completeTrip(id: string, data: ICompleteTrip): Promise<ITrip | null> {
    try {
        const result = await window._trips.complete(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function cancelTrip(id: string): Promise<string | null> {
    try {
        const result = await window._trips.cancel(id);
        return result as string;
    } catch (error) {
        throw error;
    }
}

export async function getActiveTrips(): Promise<ITrip[]> {
    try {
        const result = await window._trips.getActive();
        return result;
    } catch (error) {
        throw error;
    }
}