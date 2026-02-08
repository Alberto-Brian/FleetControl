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
    
    // Vehicle
    vehicle_license: string | null;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    
    // Driver
    driver_name: string | null;
    
    // Fuel Station
    station_name: string | null;
    station_brand: string | null;
    station_city: string | null;
    
    // Trip
    trip_code: string | null;
    trip_destination: string | null;
    trip_origin: string | null;
    trip_start_date: string | null;
    trip_status: string | null;
    trip_driver_id: string | null;
    
    // Route
    route_name: string | null;
    route_origin: string | null;
    route_destination: string | null;
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