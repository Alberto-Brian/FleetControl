// ========================================
// FILE: src/lib/types/fuel-station.ts

import { FuelType } from "../db/schemas/refuelings";

// ========================================
export interface IFuelStation {
    id: string;
    name: string;
    brand?: string;
    phone?: string;
    address?: string;
    city?: string;
    fuel_types?: string;
    has_convenience_store: string;
    has_car_wash: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateFuelStation {
    name: string;
    brand?: string;
    phone?: string;
    address?: string;
    city?: string;
    fuel_types?: FuelType;
    has_convenience_store?: string;
    has_car_wash?: string;
    notes?: string;
}

export interface IUpdateFuelStation {
    name: string;
    brand?: string;
    phone?: string;
    address?: string;
    city?: string;
    fuel_types?: FuelType;
    has_convenience_store?: string;
    has_car_wash?: string;
    notes?: string;
    is_active?: boolean;
}