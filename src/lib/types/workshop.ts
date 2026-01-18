// ========================================
// FILE: src/lib/types/workshop.ts
// ========================================
export interface IWorkshop {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    specialties?: string;
    notes?: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateWorkshop {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    specialties?: string;
    notes?: string;
}

export interface IUpdateWorkshop {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    specialties?: string;
    notes?: string;
    is_active?: boolean;
}