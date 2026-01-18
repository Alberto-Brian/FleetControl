// ========================================
// FILE: src/lib/types/trip.ts
// ========================================
export interface ITrip {
    id: string;
    vehicle_id: string;
    driver_id: string;
    route_id?: string;
    trip_code: string;
    start_date: string;
    end_date?: string;
    start_mileage: number;
    end_mileage?: number;
    origin: string;
    destination: string;
    purpose?: string;
    status: string;
    notes?: string;
    created_at: string;
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