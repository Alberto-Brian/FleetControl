// ========================================
// FILE: src/lib/db/queries/refuelings.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { refuelings, vehicles, drivers, fuel_stations, trips, routes } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateRefueling } from '@/lib/types/refueling';

export async function createRefueling(refuelingData: ICreateRefueling) {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const totalCost = refuelingData.liters * refuelingData.price_per_liter;

    const result = await db
        .insert(refuelings)
        .values({
            id,
            refueling_date: new Date().toISOString(),
            total_cost: totalCost,
            ...refuelingData,
        })
        .returning();

    return result[0];
}

export async function getRefuelingsByStation(stationId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(refuelings)
        .where(and(
            eq(refuelings.station_id, stationId),
            isNull(refuelings.deleted_at)
        ));
    return result;
}

export async function getAllRefuelings() {
    const { db } = useDb();
    
    const result = await db
        .select({
            // Refueling
            id: refuelings.id,
            vehicle_id: refuelings.vehicle_id,
            driver_id: refuelings.driver_id,
            station_id: refuelings.station_id,
            trip_id: refuelings.trip_id,
            refueling_date: refuelings.refueling_date,
            fuel_type: refuelings.fuel_type,
            liters: refuelings.liters,
            price_per_liter: refuelings.price_per_liter,
            total_cost: refuelings.total_cost,
            current_mileage: refuelings.current_mileage,
            is_full_tank: refuelings.is_full_tank,
            invoice_number: refuelings.invoice_number,
            notes: refuelings.notes,
            created_at: refuelings.created_at,
            
            // Vehicle
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            
            // Driver
            driver_name: drivers.name,
            
            // Fuel Station
            station_name: fuel_stations.name,
            station_brand: fuel_stations.brand,
            station_city: fuel_stations.city,
            
            // Trip (NOVO)
            trip_code: trips.trip_code,
            trip_destination: trips.destination,
            trip_origin: trips.origin,
            trip_start_date: trips.start_date,
            trip_status: trips.status,
            trip_driver_id: trips.driver_id,
            
            // Route (via Trip)
            route_name: routes.name,
            route_origin: routes.origin,
            route_destination: routes.destination,
        })
        .from(refuelings)
        .leftJoin(vehicles, eq(refuelings.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(refuelings.driver_id, drivers.id))
        // CORREÇÃO: Join correto pelo station_id
        .leftJoin(fuel_stations, eq(refuelings.station_id, fuel_stations.id))
        // CORREÇÃO: Join correto pelo trip_id
        .leftJoin(trips, eq(refuelings.trip_id, trips.id))
        // Join opcional com routes para pegar o nome da rota
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(isNull(refuelings.deleted_at))
        .orderBy(desc(refuelings.refueling_date));

    return result;
}

export async function getRefuelingsByVehicle(vehicleId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(refuelings)
        .where(
            and(
                eq(refuelings.vehicle_id, vehicleId),
                isNull(refuelings.deleted_at)
            )
        )
        .orderBy(desc(refuelings.refueling_date));

    return result;
}
