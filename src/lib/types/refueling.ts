// ========================================
// FILE: src/lib/types/refueling.ts

import { FuelType } from "../db/schemas/refuelings";

// ========================================
export interface IRefueling {
    id: string;
    vehicle_id: string;
    driver_id: string | null;
    trip_id: string | null;
    station_id: string | null;
    refueling_date: string;
    fuel_type: string;
    liters: number;
    price_per_liter: number;
    total_cost: number;
    current_mileage: number;
    is_full_tank: boolean;
    invoice_number: string | null;
    notes: string | null;
    created_at: string;
    
    // Vehicle
    vehicle_license?: string;
    vehicle_brand?: string;
    vehicle_model?: string;
    
    // Driver
    driver_name?: string;
    
    // Fuel Station
    station_name?: string;
    station_brand?: string;
    station_city?: string;
    
    // Trip
    trip_code?: string;
    trip_destination?: string;
    trip_origin?: string;
    trip_start_date?: string;
    trip_status?: string;
    trip_driver_id?: string;
    
    // Route
    route_name?: string;
    route_origin?: string;
    route_destination?: string;
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