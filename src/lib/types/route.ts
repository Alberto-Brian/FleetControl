// ========================================
// FILE: src/lib/types/route.ts
// ========================================
export interface IRoute {
    id: string;
    name: string;
    origin: string;
    destination: string;
    distance_km: number;
    estimated_duration_hours?: number;
    route_type: string;
    description?: string;
    waypoints?: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateRoute {
    name: string;
    origin: string;
    destination: string;
    distance_km: number;
    estimated_duration_hours?: number;
    route_type?: string;
    description?: string;
    waypoints?: string;
}

export interface IUpdateRoute {
    name: string;
    origin: string;
    destination: string;
    distance_km: number;
    estimated_duration_hours?: number;
    route_type?: string;
    description?: string;
    waypoints?: string;
    is_active?: boolean;
}