// ========================================
// FILE: src/lib/db/queries/trips.queries.ts (CORRIGIDO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { trips, vehicles, drivers, routes } from '@/lib/db/schemas';
import { vehicleStatus } from '../schemas/vehicles';
import { driverAvailability, driverStatus } from '../schemas/drivers';
import { tripStatus } from '../schemas/trips';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, isNotNull, desc, sql, or, like, count, SQL } from 'drizzle-orm';
import { ICreateTrip, ICompleteTrip, ITrip } from '@/lib/types/trip';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';

// ─── selector reutilizável ────────────────────────────────────────────────────
const tripSelector = {
    id:                    trips.id,
    trip_code:             trips.trip_code,
    vehicle_id:            trips.vehicle_id,
    driver_id:             trips.driver_id,
    route_id:              trips.route_id,
    route_name:            routes.name,
    vehicle_license:       vehicles.license_plate,
    vehicle_brand:         vehicles.brand,
    vehicle_model:         vehicles.model,
    driver_name:           drivers.name,
    driver_license_number: drivers.license_number,
    driver_email:          drivers.email,
    start_date:            trips.start_date,
    end_date:              trips.end_date,
    start_mileage:         trips.start_mileage,
    end_mileage:           trips.end_mileage,
    origin:                trips.origin,
    destination:           trips.destination,
    purpose:               trips.purpose,
    status:                trips.status,
    notes:                 trips.notes,
    created_at:            trips.created_at,
    updated_at:            trips.updated_at,
} as const;

function withTripJoins(query: any) {
    return query
        .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
        .leftJoin(drivers,  eq(trips.driver_id,  drivers.id))
        .leftJoin(routes,   eq(trips.route_id,   routes.id));
}

// ─── getTripById ──────────────────────────────────────────────────────────────

export async function getTripById(tripId: string): Promise<ITrip | null> {
    const { db } = useDb();
    const result = await withTripJoins(
        db.select(tripSelector).from(trips)
    ).where(and(eq(trips.id, tripId), isNull(trips.deleted_at))).limit(1);
    return result[0] || null;
}

// ─── disponibilidade ──────────────────────────────────────────────────────────

export async function isVehicleAvailable(vehicleId: string): Promise<boolean> {
    const { db } = useDb();
    const result = await db
        .select({ status: vehicles.status })
        .from(vehicles)
        .where(eq(vehicles.id, vehicleId))
        .limit(1);
    return result[0]?.status === vehicleStatus.AVAILABLE;
}

export async function isDriverAvailable(driverId: string): Promise<boolean> {
    const { db } = useDb();
    const result = await db
        .select({ availability: drivers.availability })
        .from(drivers)
        .where(eq(drivers.id, driverId))
        .limit(1);
    return result[0]?.availability === driverAvailability.AVAILABLE;
}

// ─── createTrip ───────────────────────────────────────────────────────────────

export async function createTrip(tripData: ICreateTrip): Promise<ITrip> {
    const { db } = useDb();

    return await db.transaction(async (tx) => {

    const id = generateUuid();
    const tripCode = `VIA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    let origin      = tripData.origin;
    let destination = tripData.destination;

    if (tripData.route_id) {
        const route = await db.select().from(routes).where(eq(routes.id, tripData.route_id)).limit(1);
        if (!route[0]) throw new Error('trips:errors.routeNotFound');
        origin      = route[0].origin;
        destination = route[0].destination;
    }

    if (!origin || !destination) throw new Error('trips:errors.originDestinationRequired');

    await tx.insert(trips).values({
        id,
        trip_code:    tripCode,
        start_date:   new Date().toISOString(),
        status:       tripStatus.IN_PROGRESS,
        vehicle_id:   tripData.vehicle_id,
        driver_id:    tripData.driver_id,
        route_id:     tripData.route_id     || null,
        start_mileage: tripData.start_mileage,
        origin,
        destination,
        purpose:      tripData.purpose      || null,
        notes:        tripData.notes        || null,
    });

    await tx.update(vehicles)
        .set({ status: vehicleStatus.IN_USE, updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, tripData.vehicle_id));

    await tx.update(drivers)
        .set({ availability: driverAvailability.ON_TRIP, updated_at: new Date().toISOString() })
        .where(eq(drivers.id, tripData.driver_id));

    return await getTripById(id) as ITrip;

    });
}

// ─── getAllTrips ───────────────────────────────────────────────────────────────

export async function getAllTrips(params: IPaginationParams = {}): Promise<IPaginatedResult<ITrip>> {
    const { db } = useDb();

    const page   = params.page  || 1;
    const limit  = params.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [isNull(trips.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        conditions.push(or(
            like(trips.trip_code,        s),
            like(vehicles.license_plate, s),
            like(drivers.name,           s),
            like(trips.origin,           s),
            like(trips.destination,      s),
        )!);
    }
    if (params.status && params.status !== 'all') {
        conditions.push(eq(trips.status, params.status));
    }
    if (params.vehicle_id) {
        conditions.push(eq(trips.vehicle_id, params.vehicle_id));
    }
    if (params.driver_id) {
        conditions.push(eq(trips.driver_id, params.driver_id));
    }
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [{ total }] = await withTripJoins(
        db.select({ total: count() }).from(trips)
    ).where(whereClause);

    const data = await withTripJoins(
        db.select(tripSelector).from(trips)
    ).where(whereClause).orderBy(desc(trips.created_at)).limit(limit).offset(offset);

    const baseConditions: SQL[] = [isNull(trips.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        baseConditions.push(or(
            like(trips.trip_code,        s),
            like(vehicles.license_plate, s),
            like(drivers.name,           s),
            like(trips.origin,           s),
            like(trips.destination,      s),
        )!);
    }
    const baseWhere = baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    const countsRaw = await withTripJoins(
        db.select({ status: trips.status, count: count() }).from(trips)
    ).where(baseWhere).groupBy(trips.status);

    const statusCounts: Record<string, number> = { in_progress: 0, completed: 0, cancelled: 0 };
    for (const row of countsRaw) statusCounts[row.status] = row.count;

    const [distRow] = await db.select({
        total: sql<number>`COALESCE(SUM(${trips.end_mileage} - ${trips.start_mileage}), 0)`
    }).from(trips).where(and(isNull(trips.deleted_at), eq(trips.status, 'completed')));

    return {
        data: data as ITrip[],
        pagination: {
            total, page, limit,
            totalPages:  Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
        statusCounts: { ...statusCounts, totalDistance: distRow?.total ?? 0 },
    };
}

// ─── getActiveTrips ───────────────────────────────────────────────────────────

export async function getActiveTrips(): Promise<ITrip[]> {
    const { db } = useDb();
    const result = await withTripJoins(
        db.select(tripSelector).from(trips)
    ).where(and(eq(trips.status, tripStatus.IN_PROGRESS), isNull(trips.deleted_at)))
     .orderBy(desc(trips.start_date));
    return result;
}

// ─── completeTrip ─────────────────────────────────────────────────────────────

export async function completeTrip(tripId: string, completeData: ICompleteTrip): Promise<ITrip | null> {
    const { db } = useDb();

    const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
    if (!trip[0]) throw new Error('trips:errors.tripNotFound');
    if (completeData.end_mileage <= trip[0].start_mileage) throw new Error('trips:errors.endMileageLowerThanStart');

    await db.update(trips).set({
        end_mileage: completeData.end_mileage,
        end_date:    new Date().toISOString(),
        status:      tripStatus.COMPLETED,
        notes:       completeData.notes || trip[0].notes,
        updated_at:  new Date().toISOString(),
    }).where(eq(trips.id, tripId));

    await db.update(vehicles).set({
        current_mileage: completeData.end_mileage,
        status:          vehicleStatus.AVAILABLE,
        updated_at:      new Date().toISOString(),
    }).where(eq(vehicles.id, trip[0].vehicle_id));

    await db.update(drivers).set({
        availability: driverAvailability.AVAILABLE,
        updated_at:   new Date().toISOString(),
    }).where(eq(drivers.id, trip[0].driver_id));

    return await getTripById(tripId);
}

// ─── cancelTrip ───────────────────────────────────────────────────────────────

export async function cancelTrip(tripId: string): Promise<string> {
    const { db } = useDb();

    const trip = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
    if (!trip[0]) throw new Error('trips:errors.tripNotFound');

    await db.update(trips).set({
        status:     tripStatus.CANCELLED,
        updated_at: new Date().toISOString(),
    }).where(eq(trips.id, tripId));

    await db.update(vehicles).set({
        status:     vehicleStatus.AVAILABLE,
        updated_at: new Date().toISOString(),
    }).where(eq(vehicles.id, trip[0].vehicle_id));

    await db.update(drivers).set({
        availability: driverAvailability.AVAILABLE,
        updated_at:   new Date().toISOString(),
    }).where(eq(drivers.id, trip[0].driver_id));

    return tripId;
}

// ─── deleteTrip ── BUG CORRIGIDO ─────────────────────────────────────────────
/**
 * Soft-delete de uma viagem.
 *
 * CORRECÇÃO: se a viagem estiver IN_PROGRESS, restaura o veículo e o motorista
 * para AVAILABLE antes de apagar. Sem isto, ambos ficam presos em IN_USE/ON_TRIP
 * indefinidamente — era a causa confirmada do problema em produção.
 */
export async function deleteTrip(tripId: string): Promise<string> {
    const { db } = useDb();

    const trip = await db.select().from(trips).where(
        and(eq(trips.id, tripId), isNull(trips.deleted_at))
    ).limit(1);

    if (!trip[0]) throw new Error('trips:errors.tripNotFound');

    // ── CORRECÇÃO CRÍTICA ─────────────────────────────────────────────────────
    // Se a viagem estava in_progress, libertar veículo e motorista.
    // Sem este bloco, ambos ficavam presos em IN_USE/ON_TRIP para sempre.
    if (trip[0].status === tripStatus.IN_PROGRESS) {
        await db.update(vehicles).set({
            status:     vehicleStatus.AVAILABLE,
            updated_at: new Date().toISOString(),
        }).where(eq(vehicles.id, trip[0].vehicle_id));

        await db.update(drivers).set({
            availability: driverAvailability.AVAILABLE,
            updated_at:   new Date().toISOString(),
        }).where(eq(drivers.id, trip[0].driver_id));
    }
    // ─────────────────────────────────────────────────────────────────────────

    await db.update(trips).set({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }).where(eq(trips.id, tripId));

    return tripId;
}

// ─── reconcileOrphanedStates ─────────────────────────────────────────────────
/**
 * Ferramenta de manutenção: corrige veículos/motoristas presos em
 * IN_USE / ON_TRIP sem viagem activa correspondente.
 *
 * Pode ser chamada manualmente, ou no arranque da app como salvaguarda.
 * Regista o que foi corrigido para auditoria.
 */
export async function reconcileOrphanedStates(): Promise<{
    vehiclesFixed: string[];
    driversFixed:  string[];
}> {
    const { db } = useDb();
    const now = new Date().toISOString();

    // IDs de veículos com viagem real IN_PROGRESS (não deleted)
    const activeVehicleIds = (await db
        .select({ vehicle_id: trips.vehicle_id })
        .from(trips)
        .where(and(eq(trips.status, tripStatus.IN_PROGRESS), isNull(trips.deleted_at)))
    ).map(r => r.vehicle_id);

    // IDs de motoristas com viagem real IN_PROGRESS (não deleted)
    const activeDriverIds = (await db
        .select({ driver_id: trips.driver_id })
        .from(trips)
        .where(and(eq(trips.status, tripStatus.IN_PROGRESS), isNull(trips.deleted_at)))
    ).map(r => r.driver_id);

    // Veículos IN_USE sem viagem activa
    const orphanedVehicles = await db
        .select({ id: vehicles.id, license_plate: vehicles.license_plate })
        .from(vehicles)
        .where(and(eq(vehicles.status, vehicleStatus.IN_USE), isNull(vehicles.deleted_at)));

    const vehiclesFixed: string[] = [];
    for (const v of orphanedVehicles) {
        if (!activeVehicleIds.includes(v.id)) {
            await db.update(vehicles).set({ status: vehicleStatus.AVAILABLE, updated_at: now })
                .where(eq(vehicles.id, v.id));
            vehiclesFixed.push(v.license_plate ?? v.id);
        }
    }

    // Motoristas ON_TRIP sem viagem activa
    const orphanedDrivers = await db
        .select({ id: drivers.id, name: drivers.name })
        .from(drivers)
        .where(and(eq(drivers.availability, driverAvailability.ON_TRIP), isNull(drivers.deleted_at)));

    const driversFixed: string[] = [];
    for (const d of orphanedDrivers) {
        if (!activeDriverIds.includes(d.id)) {
            await db.update(drivers).set({
                availability: driverAvailability.AVAILABLE,
                updated_at:   now,
            }).where(eq(drivers.id, d.id));
            driversFixed.push(d.name ?? d.id);
        }
    }

    if (vehiclesFixed.length || driversFixed.length) {
        console.warn('[reconcileOrphanedStates] Estado corrigido:', { vehiclesFixed, driversFixed });
    }

    return { vehiclesFixed, driversFixed };
}