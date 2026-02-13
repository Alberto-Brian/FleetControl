// ========================================
// FILE: src/lib/types/fine.ts
// ========================================
import { FineStatus } from "../db/schemas/fines";

export interface IFine {
    id: string;
    vehicle_id: string;
    driver_id?: string;
    fine_number: string;
    fine_date: string;
    infraction_type: string;
    description: string;
    location?: string;
    fine_amount: number;
    due_date?: string;
    payment_date?: string;
    status: FineStatus;
    points?: number;
    authority?: string;
    notes?: string;
    created_at: string;
}

export interface ICreateFine {
    vehicle_id: string;
    driver_id?: string;
    fine_number: string;
    fine_date: string;
    infraction_type: string;
    description: string;
    location?: string;
    fine_amount: number;
    due_date?: string;
    points?: number;
    authority?: string;
    notes?: string;
}

export interface IUpdateFine {
    vehicle_id?: string;
    driver_id?: string;
    fine_number?: string;
    fine_date?: string;
    infraction_type?: string;
    description?: string;
    location?: string;
    fine_amount?: number;
    due_date?: string;
    payment_date?: string;
    status?: FineStatus;
    points?: number;
    authority?: string;
    notes?: string;
}

export interface PayFineData {
    payment_date: string;
}