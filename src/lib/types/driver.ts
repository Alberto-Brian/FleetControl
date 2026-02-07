// ========================================
// FILE: src/lib/types/driver.ts

import { DriverStatus, DriverAvailability } from "../db/schemas/drivers";

// ========================================
export interface IDriver {
    id: string;
    name: string;
    tax_id: string | null;
    id_number: string | null;
    birth_date: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    hire_date: string | null;
    status: DriverStatus;
    availability: DriverAvailability;
    photo: string | null;
    notes: string | null;
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
    hire_date?: string;
    license_number?: string;
    license_category?: string;
    license_expiry_date?: string;
    status?: DriverStatus;
    availability?: DriverAvailability;
    photo?: string;
    notes?: string;
}