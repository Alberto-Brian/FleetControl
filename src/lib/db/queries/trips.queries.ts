// ========================================
// FILE: src/lib/db/queries/trips.queries.ts (COMPLETO COM VALIDAÇÕES)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { trips, vehicles, drivers, routes } from '@/lib/db/schemas';
import { vehicleStatus } from '../schemas/vehicles';
import { driverAvailability } from '../schemas/drivers';
import { tripStatus } from '../schemas/trips';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateTrip, ICompleteTrip, ITrip } from '@/lib/types/trip';

/**
 * ✅ Busca viagem por ID completo (com joins)
 */
export async function getTripById(tripId: string): Promise<ITrip | null> {
    const { db } = useDb();
    
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
            driver_license_number: drivers.license_number,
            driver_email: drivers.email,
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
            updated_at: trips.updated_at,
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(trips.driver_id, drivers.id))
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(
            and(
                eq(trips.id, tripId),
                isNull(trips.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

/**
 * ✅ Verifica se veículo está disponível
 */
export async function isVehicleAvailable(vehicleId: string): Promise<boolean> {
    const { db } = useDb();
    const result = await db
        .select({ status: vehicles.status })
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);
    
    return result[0]?.status === vehicleStatus.AVAILABLE;
}

/**
 * ✅ Verifica se motorista está disponível
 */
export async function isDriverAvailable(driverId: string): Promise<boolean> {
    const { db } = useDb();
    const result = await db
        .select({ availability: drivers.availability })
        .from(drivers)
        .where(eq(drivers.id, driverId))
        .limit(1);
    
    return result[0]?.availability === driverAvailability.AVAILABLE;
}

/**
 * Cria nova viagem
 */
export async function createTrip(tripData: ICreateTrip): Promise<ITrip> {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();
    const tripCode = `VIA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

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
            throw new Error('trips:errors.routeNotFound');
        }

        origin = route[0].origin;
        destination = route[0].destination;
    }

    // Validação: origem e destino são obrigatórios
    if (!origin || !destination) {
        throw new Error('trips:errors.originDestinationRequired');
    }

    const result = await db
        .insert(trips)
        .values({
            id,
            trip_code: tripCode,
            start_date: new Date().toISOString(),
            status: tripStatus.IN_PROGRESS,
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
        .set({ 
            status: vehicleStatus.IN_USE, 
            updated_at: new Date().toISOString() 
        })
        .where(eq(vehicles.id, tripData.vehicle_id));

    // Atualizar disponibilidade do motorista
    await db
        .update(drivers)
        .set({ 
            availability: driverAvailability.ON_TRIP, 
            updated_at: new Date().toISOString() 
        })
        .where(eq(drivers.id, tripData.driver_id));
    
    // ✅ Retornar viagem completa
    return await getTripById(id) as ITrip;
}

/**
 * Obtém todas as viagens
 */
export async function getAllTrips(): Promise<ITrip[]> {
    const { db } = useDb();
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
            driver_license_number: drivers.license_number,
            driver_email: drivers.email,
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
            updated_at: trips.updated_at,
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(trips.driver_id, drivers.id))
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(isNull(trips.deleted_at))
        .orderBy(desc(trips.created_at));

    return result;
}

/**
 * Obtém viagens activas
 */
export async function getActiveTrips(): Promise<ITrip[]> {
    const { db } = useDb();
    const result = await db
        .select({
            id: trips.id,
            trip_code: trips.trip_code,
            vehicle_id: trips.vehicle_id,
            driver_id: trips.driver_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            driver_name: drivers.name,
            route_name: routes.name,
            origin: trips.origin,
            destination: trips.destination,
            start_date: trips.start_date,
            start_mileage: trips.start_mileage,
            status: trips.status,
            purpose: trips.purpose,
            notes: trips.notes,
            route_id: trips.route_id,
            end_date: trips.end_date,
            end_mileage: trips.end_mileage,
            created_at: trips.created_at,
            updated_at: trips.updated_at
        })
        .from(trips)
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(trips.driver_id, drivers.id))
        .leftJoin(routes, eq(trips.route_id, routes.id))
        .where(
            and(
                eq(trips.status, tripStatus.IN_PROGRESS),
                isNull(trips.deleted_at)
            )
        )
        .orderBy(desc(trips.start_date));

    return result;
}

/**
 * Finaliza uma viagem
 */
export async function completeTrip(tripId: string, completeData: ICompleteTrip): Promise<ITrip | null> {
    const { db } = useDb();
    const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);

    if (!trip[0]) {
        throw new Error('trips:errors.tripNotFound');
    }

    if (completeData.end_mileage <= trip[0].start_mileage) {
        throw new Error('trips:errors.endMileageLowerThanStart');
    }

    await db
        .update(trips)
        .set({
            end_mileage: completeData.end_mileage,
            end_date: new Date().toISOString(),
            status: tripStatus.COMPLETED,
            notes: completeData.notes || trip[0].notes,
            updated_at: new Date().toISOString(),
        })
        .where(eq(trips.id, tripId));

    // Atualizar quilometragem e status do veículo
    await db
        .update(vehicles)
        .set({
            current_mileage: completeData.end_mileage,
            status: vehicleStatus.AVAILABLE,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, trip[0].vehicle_id));

    // Atualizar disponibilidade do motorista
    await db
        .update(drivers)
        .set({ 
            availability: driverAvailability.AVAILABLE, 
            updated_at: new Date().toISOString() 
        })
        .where(eq(drivers.id, trip[0].driver_id));

    // ✅ Retornar viagem completa
    return await getTripById(tripId);
}

/**
 * Cancela uma viagem
 */
export async function cancelTrip(tripId: string): Promise<string> {
    const { db } = useDb();
    const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);

    if (!trip[0]) {
        throw new Error('trips:errors.tripNotFound');
    }

    await db
        .update(trips)
        .set({
            status: tripStatus.CANCELLED,
            updated_at: new Date().toISOString(),
        })
        .where(eq(trips.id, tripId));

    // Retornar veículo para disponível
    await db
        .update(vehicles)
        .set({ 
            status: vehicleStatus.AVAILABLE, 
            updated_at: new Date().toISOString() 
        })
        .where(eq(vehicles.id, trip[0].vehicle_id));

    // Retornar motorista para disponível
    await db
        .update(drivers)
        .set({ 
            availability: driverAvailability.AVAILABLE, 
            updated_at: new Date().toISOString() 
        })
        .where(eq(drivers.id, trip[0].driver_id));

    return tripId;
}

/**
 * Deleta (soft delete) uma viagem
 */
export async function deleteTrip(tripId: string): Promise<string> {
    const { db } = useDb();
    
    await db
        .update(trips)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(trips.id, tripId));

    return tripId;
}