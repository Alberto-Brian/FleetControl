// ========================================
// FILE: src/lib/types/vehicle-category.ts
// ========================================
export interface IVehicleCategory {
    id: string;
    name: string;
    description?: string;
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