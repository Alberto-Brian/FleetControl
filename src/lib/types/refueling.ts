// ========================================
// FILE: src/lib/types/refueling.ts

import { FuelType } from "../db/schemas/refuelings";

// ========================================
export interface IRefueling {
    id: string;
    vehicle_id: string;
    driver_id?: string;
    trip_id?: string;
    station_id?: string;
    refueling_date: string;
    fuel_type: string;
    liters: number;
    price_per_liter: number;
    total_cost: number;
    current_mileage: number;
    is_full_tank: boolean;
    invoice_number?: string;
    notes?: string;
    created_at: string;
}

export interface ICreateRefueling {
    vehicle_id: string;
    driver_id?: string;
    trip_id?: string;
    station_id?: string;
    fuel_type: FuelType;
    liters: number;
    price_per_liter: number;
    current_mileage: number;
    is_full_tank: boolean;
    invoice_number?: string;
    notes?: string;
}