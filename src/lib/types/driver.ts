// ========================================
// FILE: src/lib/types/driver.ts

import { DriverStatus } from "../db/schemas/drivers";

// ========================================
export interface IDriver {
    id: string;
    name: string;
    tax_id?: string;
    id_number?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    hire_date?: string;
    status: string;
    availability: string;
    photo?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ICreateDriver {
    name: string;
    tax_id?: string;
    id_number?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    hire_date?: string;
    photo?: string;
    notes?: string;
}

export interface IUpdateDriver {
    name?: string;
    tax_id?: string;
    id_number?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    license_number?: string;
    license_category?: string;
    license_expiry_date?: string;
    status?: DriverStatus;
    photo?: string;
    notes?: string;
}