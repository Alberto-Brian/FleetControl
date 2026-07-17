// ========================================
// FILE: // src/lib/db/types/vehicles.ts
// ========================================
import { IBase } from "./base";
import { VehicleStatus } from "../db/schemas/vehicles";
export interface IVehicle extends IBase {
    category_id: string;
    category_name?: string;  // Não vem da tabela de veículos então em vez de null ficam com o undefined
    category_color?: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color: string | null;
    chassis_number: string | null;
    engine_number: string | null;
    fuel_tank_capacity: number | null;
    tire_size: string | null;
    current_mileage: number;
    acquisition_date: string | null;
    acquisition_value: number | null;
    status: VehicleStatus;
    photo: string | null;
    notes: string | null;
    is_active: boolean;
    tracking_enabled: boolean;
    traccar_unique_id: string | null;
    api_vehicle_id: string | null;
    api_synced_at:  string | null;
    deleted_at: string | null;
}

export interface ICreateVehicle {
    category_id: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color?: string;
    chassis_number?: string;
    engine_number?: string;
    fuel_tank_capacity?: number;
    tire_size?: string;
    current_mileage?: number;
    acquisition_date?: string;
    acquisition_value?: number;
    photo?: string;
    notes?: string;
    // IMEI do GPS — se preenchido, a API cria automaticamente o device Traccar
    traccar_unique_id?: string;
}

export interface IUpdateVehicle {
    category_id?: string;
    license_plate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    chassis_number?: string;
    engine_number?: string;
    fuel_tank_capacity?: number;
    tire_size?: string;
    current_mileage?: number;
    acquisition_date?: string;
    acquisition_value?: number;
    status?: VehicleStatus;
    photo?: string;
    notes?: string;
    traccar_unique_id?: string | null;
}

export interface IUpdateStatus{
    status: VehicleStatus;
    notes?: string;
}
