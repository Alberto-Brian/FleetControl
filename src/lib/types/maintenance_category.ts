// src/lib/types/maintenance_category.ts
import { MaintenanceType } from "../db/schemas/maintenance_categories";

export interface IMaintenanceCategory {
    id: string;
    name: string;
    type: MaintenanceType;
    description: string | null;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateMaintenanceCategory {
    name: string;
    type: MaintenanceType;
    description?: string;
    color?: string;
}

export interface IUpdateMaintenanceCategory {
    name: string;
    type: MaintenanceType;
    description?: string;
    color?: string;
    is_active?: boolean;
}