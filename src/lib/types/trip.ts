// ========================================
// FILE: src/lib/types/trip.ts
// ========================================

import { TripStatus } from "../db/schemas/trips";

export interface ITrip {
    id: string;
    vehicle_id: string;
    driver_id: string;
    route_id: string | null;
    trip_code: string;
    start_date: string;
    end_date: string | null;
    start_mileage: number;
    end_mileage: number | null;
    origin: string | null;
    destination: string | null;
    purpose: string | null;
    status: TripStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// Tipo para criação de viagem com rota OU origem/destino manual
export interface ICreateTrip {
    vehicle_id: string;
    driver_id: string;
    route_id?: string; // Opcional: se informado, usa origem/destino da rota
    start_mileage: number;
    origin?: string; // Opcional: só obrigatório se route_id não for informado
    destination?: string; // Opcional: só obrigatório se route_id não for informado
    purpose?: string;
    notes?: string;
}

export interface ICompleteTrip {
    end_mileage: number;
    notes?: string;
}