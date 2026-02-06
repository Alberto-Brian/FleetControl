// ========================================
// FILE: src/lib/types/vehicle-category.ts

import { IBase } from "./base";

// ========================================
export interface IVehicleCategory extends IBase {
    id: string;
    name: string;
    description: string | null;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateVehicleCategory {
    name: string;
    description?: string;
    color?: string;
}

export interface IUpdateVehicleCategory {
    name?: string;
    description?: string;
    color?: string;
}