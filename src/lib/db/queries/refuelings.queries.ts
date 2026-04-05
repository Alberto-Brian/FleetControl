// ========================================
// FILE: src/lib/db/queries/refuelings.queries.ts
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { refuelings, vehicles, drivers, fuel_stations, trips, routes } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import {
  eq, and, isNull, isNotNull, desc, count, like, SQL, or, sql, gte, lte,
} from 'drizzle-orm';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';
import {
  IRefueling,
  ICreateRefueling,
  IUpdateRefueling,
  IRefuelingsPaginationParams,
  IRefuelingStats,
} from '@/lib/types/refueling';

// ─────────────────────────────────────────────────────────────────────────────
// Selector reutilizável — todos os campos + joins
// ─────────────────────────────────────────────────────────────────────────────

const refuelingSelector = {
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
  updated_at:       refuelings.updated_at,
  deleted_at:       refuelings.deleted_at,
  // Vehicle
  vehicle_license:  vehicles.license_plate,
  vehicle_brand:    vehicles.brand,
  vehicle_model:    vehicles.model,
  // Driver
  driver_name:      drivers.name,
  // Station
  station_name:     fuel_stations.name,
  station_brand:    fuel_stations.brand,
  station_city:     fuel_stations.city,
  // Trip
  trip_code:        trips.trip_code,
  trip_destination: trips.destination,
  trip_origin:      trips.origin,
  trip_start_date:  trips.start_date,
  trip_status:      trips.status,
  trip_driver_id:   trips.driver_id,
  // Route
  route_name:        routes.name,
  route_origin:      routes.origin,
  route_destination: routes.destination,
} as const;

/** Aplica os left-joins padrão a qualquer query base */
function withJoins(query: any) {
  return query
    .leftJoin(vehicles,      eq(refuelings.vehicle_id, vehicles.id))
    .leftJoin(drivers,       eq(refuelings.driver_id,  drivers.id))
    .leftJoin(fuel_stations, eq(refuelings.station_id, fuel_stations.id))
    .leftJoin(trips,         eq(refuelings.trip_id,    trips.id))
    .leftJoin(routes,        eq(trips.route_id,        routes.id));
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createRefueling(data: ICreateRefueling): Promise<IRefueling> {
  const { db } = useDb();
  const id = generateUuid();

  const totalCost = Math.round(data.liters * data.price_per_liter * 100) / 100;

  await db.insert(refuelings).values({
    id,
    vehicle_id:      data.vehicle_id,
    driver_id:       data.driver_id       ?? null,
    trip_id:         data.trip_id         ?? null,
    station_id:      data.station_id      ?? null,
    fuel_type:       data.fuel_type,
    liters:          data.liters,
    price_per_liter: data.price_per_liter,
    total_cost:      totalCost,
    current_mileage: data.current_mileage,
    is_full_tank:    data.is_full_tank,
    invoice_number:  data.invoice_number  ?? null,
    notes:           data.notes           ?? null,
    refueling_date:  data.refueling_date  ?? new Date().toISOString(),
  });

  const created = await getRefuelingById(id);
  if (!created) throw new Error('Refueling created but could not be retrieved');
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getById
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingById(id: string): Promise<IRefueling | null> {
  const { db } = useDb();

  const result = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(and(eq(refuelings.id, id), isNull(refuelings.deleted_at)))
    .limit(1);

  return (result[0] as IRefueling) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getAll (com paginação, filtros e stats agregadas)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllRefuelings(
  params: IRefuelingsPaginationParams = {}
): Promise<IPaginatedResult<IRefueling>> {
  const { db } = useDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  // ── Condições filtráveis ──────────────────────────────────────────────────
  const conditions: SQL[] = [isNull(refuelings.deleted_at)];

  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    conditions.push(or(
      like(vehicles.license_plate, s),
      like(fuel_stations.name,     s),
      like(drivers.name,           s),
      like(refuelings.invoice_number, s),
    )!);
  }
  if (params.fuel_type && params.fuel_type !== 'all') {
    conditions.push(eq(refuelings.fuel_type, params.fuel_type));
  }
  if (params.vehicle_id && params.vehicle_id !== 'all') {
    conditions.push(eq(refuelings.vehicle_id, params.vehicle_id));
  }
  if (params.driver_id && params.driver_id !== 'all') {
    conditions.push(eq(refuelings.driver_id, params.driver_id));
  }
  if (params.station_id && params.station_id !== 'all') {
    conditions.push(eq(refuelings.station_id, params.station_id));
  }
  if (params.full_tank_only) {
    conditions.push(eq(refuelings.is_full_tank, true));
  }
  if (params.from_date) {
    conditions.push(gte(refuelings.refueling_date, params.from_date));
  }
  if (params.to_date) {
    conditions.push(lte(refuelings.refueling_date, params.to_date + 'T23:59:59'));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  // ── Contagem total paginada ────────────────────────────────────────────────
  const [{ total }] = await withJoins(
    db.select({ total: count() }).from(refuelings)
  ).where(whereClause);

  // ── Dados paginados ───────────────────────────────────────────────────────
  const data = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(whereClause)
    .orderBy(desc(refuelings.refueling_date))
    .limit(limit)
    .offset(offset);

  // ── Totais agregados (sem paginação, mas com os mesmos filtros) ───────────
  const [totals] = await withJoins(
    db.select({
      totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
      totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      avgPrice:    sql<number>`COALESCE(AVG(${refuelings.price_per_liter}), 0)`,
      totalCount:  count(),
    }).from(refuelings)
  ).where(whereClause);

  return {
    data: data as IRefueling[],
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

// ─────────────────────────────────────────────────────────────────────────────
// READ — por veículo
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingsByVehicle(vehicleId: string): Promise<IRefueling[]> {
  const { db } = useDb();

  const result = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(and(eq(refuelings.vehicle_id, vehicleId), isNull(refuelings.deleted_at)))
    .orderBy(desc(refuelings.refueling_date));

  return result as IRefueling[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — por motorista
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingsByDriver(driverId: string): Promise<IRefueling[]> {
  const { db } = useDb();

  const result = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(and(eq(refuelings.driver_id, driverId), isNull(refuelings.deleted_at)))
    .orderBy(desc(refuelings.refueling_date));

  return result as IRefueling[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — por viagem
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingsByTrip(tripId: string): Promise<IRefueling[]> {
  const { db } = useDb();

  const result = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(and(eq(refuelings.trip_id, tripId), isNull(refuelings.deleted_at)))
    .orderBy(desc(refuelings.refueling_date));

  return result as IRefueling[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — por posto
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingsByStation(stationId: string): Promise<IRefueling[]> {
  const { db } = useDb();

  const result = await withJoins(
    db.select(refuelingSelector).from(refuelings)
  )
    .where(and(eq(refuelings.station_id, stationId), isNull(refuelings.deleted_at)))
    .orderBy(desc(refuelings.refueling_date));

  return result as IRefueling[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — estatísticas agregadas
// Usado pelo FuelReportPDF e por dashboards de combustível
// ─────────────────────────────────────────────────────────────────────────────

export async function getRefuelingStats(params: {
  from_date?: string;
  to_date?: string;
  vehicle_id?: string;
} = {}): Promise<IRefuelingStats> {
  const { db } = useDb();

  const conditions: SQL[] = [isNull(refuelings.deleted_at)];
  if (params.vehicle_id) conditions.push(eq(refuelings.vehicle_id, params.vehicle_id));
  if (params.from_date)  conditions.push(gte(refuelings.refueling_date, params.from_date));
  if (params.to_date)    conditions.push(lte(refuelings.refueling_date, params.to_date + 'T23:59:59'));
  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  // ── Totais globais ────────────────────────────────────────────────────────
  const [totals] = await withJoins(
    db.select({
      totalCount:  count(),
      totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
      avgPrice:    sql<number>`COALESCE(AVG(${refuelings.price_per_liter}), 0)`,
    }).from(refuelings)
  ).where(where);

  // ── Top veículos por litros ───────────────────────────────────────────────
  const topVehiclesRaw = await withJoins(
    db.select({
      vehicle_id:      refuelings.vehicle_id,
      vehicle_license: vehicles.license_plate,
      totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
    }).from(refuelings)
  )
    .where(where)
    .groupBy(refuelings.vehicle_id, vehicles.license_plate)
    .orderBy(desc(sql`SUM(${refuelings.liters})`))
    .limit(10);

  // ── Top postos por litros ────────────────────────────────────────────────
  const topStationsRaw = await withJoins(
    db.select({
      station_id:   refuelings.station_id,
      station_name: fuel_stations.name,
      totalLiters:  sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      totalCost:    sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
    }).from(refuelings)
  )
    .where(and(where, isNotNull(refuelings.station_id)))
    .groupBy(refuelings.station_id, fuel_stations.name)
    .orderBy(desc(sql`SUM(${refuelings.liters})`))
    .limit(10);

  // ── Por tipo de combustível ───────────────────────────────────────────────
  const byFuelTypeRaw = await withJoins(
    db.select({
      fuel_type:   refuelings.fuel_type,
      totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
      count:       count(),
    }).from(refuelings)
  )
    .where(where)
    .groupBy(refuelings.fuel_type)
    .orderBy(desc(sql`SUM(${refuelings.liters})`));

  // ── Evolução mensal ───────────────────────────────────────────────────────
  const byMonthRaw = await withJoins(
    db.select({
      month:       sql<string>`strftime('%Y-%m', ${refuelings.refueling_date})`,
      totalLiters: sql<number>`COALESCE(SUM(${refuelings.liters}), 0)`,
      totalCost:   sql<number>`COALESCE(SUM(${refuelings.total_cost}), 0)`,
      count:       count(),
    }).from(refuelings)
  )
    .where(where)
    .groupBy(sql`strftime('%Y-%m', ${refuelings.refueling_date})`)
    .orderBy(sql`strftime('%Y-%m', ${refuelings.refueling_date})`)
    .limit(12);

  const tc = totals?.totalCount  ?? 0;
  const tl = totals?.totalLiters ?? 0;

  return {
    totalCount:             tc,
    totalLiters:            tl,
    totalCost:              totals?.totalCost ?? 0,
    avgPricePerLiter:       totals?.avgPrice  ?? 0,
    avgLitersPerRefueling:  tc > 0 ? tl / tc : 0,
    topVehicles: topVehiclesRaw.map(r => ({
      vehicle_id:      r.vehicle_id,
      vehicle_license: r.vehicle_license ?? '—',
      totalLiters:     r.totalLiters,
      totalCost:       r.totalCost,
    })),
    topStations: topStationsRaw.map(r => ({
      station_id:   r.station_id ?? '',
      station_name: r.station_name ?? '—',
      totalLiters:  r.totalLiters,
      totalCost:    r.totalCost,
    })),
    byFuelType: byFuelTypeRaw.map(r => ({
      fuel_type:   r.fuel_type,
      totalLiters: r.totalLiters,
      totalCost:   r.totalCost,
      count:       r.count,
    })),
    byMonth: byMonthRaw.map(r => ({
      month:       r.month,
      totalLiters: r.totalLiters,
      totalCost:   r.totalCost,
      count:       r.count,
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateRefueling(
  id: string,
  data: IUpdateRefueling
): Promise<IRefueling | null> {
  const { db } = useDb();

  const existing = await getRefuelingById(id);
  if (!existing) return null;

  // Recalcular total_cost se liters ou price_per_liter mudaram
  const newLiters   = data.liters          ?? existing.liters;
  const newPrice    = data.price_per_liter ?? existing.price_per_liter;
  const newTotal    = Math.round(newLiters * newPrice * 100) / 100;

  await db
    .update(refuelings)
    .set({
      ...(data.driver_id       !== undefined && { driver_id:       data.driver_id       ?? null }),
      ...(data.trip_id         !== undefined && { trip_id:         data.trip_id         ?? null }),
      ...(data.station_id      !== undefined && { station_id:      data.station_id      ?? null }),
      ...(data.fuel_type       !== undefined && { fuel_type:       data.fuel_type }),
      ...(data.liters          !== undefined && { liters:          data.liters }),
      ...(data.price_per_liter !== undefined && { price_per_liter: data.price_per_liter }),
      ...(data.current_mileage !== undefined && { current_mileage: data.current_mileage }),
      ...(data.is_full_tank    !== undefined && { is_full_tank:    data.is_full_tank }),
      ...(data.invoice_number  !== undefined && { invoice_number:  data.invoice_number  ?? null }),
      ...(data.notes           !== undefined && { notes:           data.notes           ?? null }),
      ...(data.refueling_date  !== undefined && { refueling_date:  data.refueling_date }),
      total_cost: newTotal,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(refuelings.id, id), isNull(refuelings.deleted_at)));

  return getRefuelingById(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// ─────────────────────────────────────────────────────────────────────────────

export async function softDeleteRefueling(id: string): Promise<boolean> {
  const { db } = useDb();

  const result = await db
    .update(refuelings)
    .set({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .where(and(eq(refuelings.id, id), isNull(refuelings.deleted_at)))
    .returning({ id: refuelings.id });

  return result.length > 0;
}