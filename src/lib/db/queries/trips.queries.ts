// ========================================
// FILE: src/lib/db/queries/trips.queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { trips, vehicles, drivers, routes } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateTrip, ICompleteTrip } from '@/lib/types/trip';

export async function createTrip(tripData: ICreateTrip) {
    const id = generateUuid();
    const tripCode = `VIA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    if (dbManager.shouldRotate()) {
        dbManager.rotate();
    }

    // Se route_id foi informado, buscar origem/destino da rota
    let origin = tripData.origin;
    let destination = tripData.destination;

    if (tripData.route_id) {
        const route = await db
            .select()
            .from(routes)
            .where(eq(routes.id, tripData.route_id))
            .limit(1);

        if (!route[0]) {
            throw new Error('Rota não encontrada');
        }

        origin = route[0].origin;
        destination = route[0].destination;
    }

    // Validação: origem e destino são obrigatórios (vindos da rota ou manual)
    if (!origin || !destination) {
        throw new Error('Origem e destino são obrigatórios');
    }

    const result = await db
        .insert(trips)
        .values({
            id,
            trip_code: tripCode,
            start_date: new Date().toISOString(),
            status: 'in_progress',
            vehicle_id: tripData.vehicle_id,
            driver_id: tripData.driver_id,
            route_id: tripData.route_id || null,
            start_mileage: tripData.start_mileage,
            origin,
            destination,
            purpose: tripData.purpose || null,
            notes: tripData.notes || null,
        })
        .returning();

    // Atualizar status do veículo
    await db
        .update(vehicles)
        .set({ status: 'in_use', updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, tripData.vehicle_id));

    return result[0];
}

export async function getAllTrips() {
    const result = await db
        .select({
            id: trips.id,
            trip_code: trips.trip_code,
            vehicle_id: trips.vehicle_id,
            driver_id: trips.driver_id,
            route_id: trips.route_id,
            route_name: routes.name,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            driver_name: drivers.name,
            start_date: trips.start_date,
            end_date: trips.end_date,
            start_mileage: trips.start_mileage,
            end_mileage: trips.end_mileage,
            origin: trips.origin,
            destination: trips.destination,
            purpose: trips.purpose,
            status: trips.status,
            notes: trips.notes,
            created_at: trips.created_at,
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(trips.driver_id, drivers.id))
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(isNull(trips.deleted_at))
        .orderBy(desc(trips.created_at));

    return result;
}

export async function getActiveTrips() {
    const result = await db
        .select({
            id: trips.id,
            trip_code: trips.trip_code,
            vehicle_license: vehicles.license_plate,
            driver_name: drivers.name,
            route_name: routes.name,
            origin: trips.origin,
            destination: trips.destination,
            start_date: trips.start_date,
            start_mileage: trips.start_mileage,
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(trips.driver_id, drivers.id))
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(
            and(
                eq(trips.status, 'in_progress'),
                isNull(trips.deleted_at)
            )
        );

    return result;
}

export async function completeTrip(tripId: string, completeData: ICompleteTrip) {
    const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);

    if (!trip[0]) throw new Error('Viagem não encontrada');

    if (completeData.end_mileage <= trip[0].start_mileage) {
        throw new Error('A quilometragem final deve ser maior que a inicial');
    }

    const result = await db
        .update(trips)
        .set({
            end_mileage: completeData.end_mileage,
            end_date: new Date().toISOString(),
            status: 'completed',
            notes: completeData.notes || trip[0].notes,
            updated_at: new Date().toISOString(),
        })
        .where(eq(trips.id, tripId))
        .returning();

    // Atualizar quilometragem e status do veículo
    await db
        .update(vehicles)
        .set({
            current_mileage: completeData.end_mileage,
            status: 'available',
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, trip[0].vehicle_id));

    return result[0];
}

export async function cancelTrip(tripId: string) {
    const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);

    if (!trip[0]) throw new Error('Viagem não encontrada');

    await db
        .update(trips)
        .set({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
        })
        .where(eq(trips.id, tripId));

    // Retornar veículo para disponível
    await db
        .update(vehicles)
        .set({ status: 'available', updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, trip[0].vehicle_id));

    return tripId;
}