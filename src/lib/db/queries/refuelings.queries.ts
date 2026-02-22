// ========================================
// FILE: src/lib/db/queries/refuelings.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { refuelings, vehicles, drivers, fuel_stations, trips, routes } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, count, like, SQL, or, sql } from 'drizzle-orm';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';
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

export async function getAllRefuelings(params: IPaginationParams = {}): Promise<IPaginatedResult<IRefueling>> {
    const { db } = useDb();

    const page   = params.page  || 1;
    const limit  = params.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [isNull(refuelings.deleted_at)];

    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        conditions.push(or(
            like(vehicles.license_plate, s),
            like(fuel_stations.name,     s),
            like(drivers.name,           s),
        )!);
    }
    if (params.status && params.status !== 'all') {
        conditions.push(eq(refuelings.fuel_type, params.status));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const [{ total }] = await db
        .select({ total: count() })
        .from(refuelings)
        .leftJoin(vehicles,      eq(refuelings.vehicle_id, vehicles.id))
        .leftJoin(fuel_stations, eq(refuelings.station_id, fuel_stations.id))
        .leftJoin(drivers,       eq(refuelings.driver_id,  drivers.id))
        .where(whereClause);

    const data = await db
        .select({
            id:               refuelings.id,
            vehicle_id:       refuelings.vehicle_id,
            driver_id:        refuelings.driver_id,
            station_id:       refuelings.station_id,
            trip_id:          refuelings.trip_id,
            refueling_date:   refuelings.refueling_date,
            fuel_type:        refuelings.fuel_type,
            liters:           refuelings.liters,
            price_per_liter:  refuelings.price_per_liter,
            total_cost:       refuelings.total_cost,
            current_mileage:  refuelings.current_mileage,
            is_full_tank:     refuelings.is_full_tank,
            invoice_number:   refuelings.invoice_number,
            notes:            refuelings.notes,
            created_at:       refuelings.created_at,
            vehicle_license:  vehicles.license_plate,
            vehicle_brand:    vehicles.brand,
            vehicle_model:    vehicles.model,
            driver_name:      drivers.name,
            station_name:     fuel_stations.name,
            station_brand:    fuel_stations.brand,
            station_city:     fuel_stations.city,
            trip_code:        trips.trip_code,
            trip_destination: trips.destination,
            trip_origin:      trips.origin,
            trip_start_date:  trips.start_date,
            trip_status:      trips.status,
            trip_driver_id:   trips.driver_id,
            route_name:       routes.name,
            route_origin:     routes.origin,
            route_destination: routes.destination,
        })
        .from(refuelings)
        .leftJoin(vehicles,      eq(refuelings.vehicle_id, vehicles.id))
        .leftJoin(drivers,       eq(refuelings.driver_id,  drivers.id))
        .leftJoin(fuel_stations, eq(refuelings.station_id, fuel_stations.id))
        .leftJoin(trips,         eq(refuelings.trip_id,    trips.id))
        .leftJoin(routes,        eq(trips.route_id,        routes.id))
        .where(whereClause)
        .orderBy(desc(refuelings.refueling_date))
        .limit(limit)
        .offset(offset);

    // Counts sem filtro de status (totais reais)
    const baseConditions: SQL[] = [isNull(refuelings.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        baseConditions.push(or(
            like(vehicles.license_plate, s),
            like(fuel_stations.name,     s),
            like(drivers.name,           s),
        )!);
    }
    const baseWhere = baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    const [totals] = await db
        .select({
            totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
            totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
            avgPrice:    sql<number>`COALESCE(AVG(${refuelings.price_per_liter}), 0)`,
            totalCount:  count(),
        })
        .from(refuelings)
        .leftJoin(vehicles,      eq(refuelings.vehicle_id, vehicles.id))
        .leftJoin(fuel_stations, eq(refuelings.station_id, fuel_stations.id))
        .leftJoin(drivers,       eq(refuelings.driver_id,  drivers.id))
        .where(baseWhere);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages:  Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
        statusCounts: {
            totalCost:   totals?.totalCost   ?? 0,
            totalLiters: totals?.totalLiters ?? 0,
            avgPrice:    totals?.avgPrice    ?? 0,
            totalCount:  totals?.totalCount  ?? 0,
        },
    };
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
