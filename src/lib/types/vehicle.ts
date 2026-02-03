import { IBase } from "./base";
import { VehicleStatus } from "../db/schemas/vehicles";
export interface IVehicle extends IBase {
    category_id: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color: string | null;
    chassis_number: string | null;
    engine_number: string | null;
    fuel_tank_capacity: number | null;
    current_mileage: number;
    acquisition_date: string | null;
    acquisition_value: number | null;
    status: string;
    photo: string | null;
    notes: string | null;
    is_active: boolean;
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
    current_mileage?: number;
    acquisition_date?: string;
    acquisition_value?: number;
    photo?: string;
    notes?: string;
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
    current_mileage?: number;
    acquisition_date?: string;
    acquisition_value?: number;
    status?: VehicleStatus;
    photo?: string;
    notes?: string;
}