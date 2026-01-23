// src/lib/types/maintenance.ts
import { MaintenanceType } from "../db/schemas/maintenance_categories";
import { MaintenancePriority, MaintenanceStatus } from "../db/schemas/maintenances";

export interface IMaintenance {
    id: string;
    vehicle_id: string;
    category_id: string;
    workshop_id?: string;
    type: MaintenanceType;
    entry_date: string;
    exit_date?: string;
    vehicle_mileage: number;
    description: string;
    diagnosis?: string;
    solution?: string;
    parts_cost: number;
    labor_cost: number;
    total_cost: number;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    work_order_number?: string;
    notes?: string;
    created_at: string;
}

export interface ICreateMaintenance {
    vehicle_id: string;
    category_id: string;
    workshop_id?: string;
    type: MaintenanceType;
    vehicle_mileage: number;
    description: string;
    priority?: MaintenancePriority;
    notes?: string;
    // Campos adicionais que podem ser fornecidos na criação
    parts_cost?: number;
    labor_cost?: number;
    work_order_number?: string;
    status?: MaintenanceStatus; // Permitir definir status na criação
}

export interface IUpdateMaintenance {
    category_id?: string;
    workshop_id?: string;
    exit_date?: string;
    diagnosis?: string;
    solution?: string;
    parts_cost?: number;
    labor_cost?: number;
    total_cost?: number;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    notes?: string;
    work_order_number?: string;
}

export interface IMaintenanceCategory {
    id: string;
    name: string;
    type: MaintenanceType;
    description?: string;
    color: string;
}

export interface IWorkshop {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}