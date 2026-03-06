// ========================================
// FILE: src/lib/db/queries/scheduled_trips.queries.ts
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { scheduled_trips, scheduledTripStatus } from '../schemas/scheduled_trips';
import { drivers, driverStatus, driverAvailability } from '../schemas/drivers';
import { vehicles, vehicleStatus } from '../schemas/vehicles';
import { trips, tripStatus } from '../schemas/trips';
import { routes } from '../schemas/routes';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, lte, like, count, SQL, or, ne } from 'drizzle-orm';
import {
  IScheduledTrip,
  ICreateScheduledTrip,
  IUpdateScheduledTrip,
  ICancelScheduledTrip,
  IScheduledTripsPaginationParams,
} from '@/lib/types/scheduled-trip';
import { IPaginatedResult } from '@/lib/types/pagination';

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function generateTripCode(): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const dd  = String(now.getDate()).padStart(2, '0');
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return `VG-${yy}${mm}${dd}-${rnd}`;
}

// ─────────────────────────────────────────────
// SELECT helper — campos comuns com JOINs
// ─────────────────────────────────────────────

const scheduledTripSelect = {
  id:               scheduled_trips.id,
  driver_id:        scheduled_trips.driver_id,
  driver_name:      drivers.name,
  vehicle_id:       scheduled_trips.vehicle_id,
  vehicle_plate:    vehicles.license_plate,
  vehicle_brand:    vehicles.brand,
  vehicle_model:    vehicles.model,
  route_id:         scheduled_trips.route_id,
  scheduled_date:   scheduled_trips.scheduled_date,
  origin:           scheduled_trips.origin,
  destination:      scheduled_trips.destination,
  purpose:          scheduled_trips.purpose,
  notes:            scheduled_trips.notes,
  status:           scheduled_trips.status,
  trip_id:          scheduled_trips.trip_id,
  launched_at:      scheduled_trips.launched_at,
  cancelled_at:     scheduled_trips.cancelled_at,
  cancelled_reason: scheduled_trips.cancelled_reason,
  created_at:       scheduled_trips.created_at,
  updated_at:       scheduled_trips.updated_at,
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createScheduledTrip(data: ICreateScheduledTrip): Promise<IScheduledTrip> {
  const { db } = useDb();
  const id = generateUuid();

  await db.insert(scheduled_trips).values({
    id,
    driver_id:      data.driver_id,
    vehicle_id:     data.vehicle_id,
    route_id:       data.route_id       ?? null,
    scheduled_date: data.scheduled_date,
    origin:         data.origin         ?? null,
    destination:    data.destination    ?? null,
    purpose:        data.purpose        ?? null,
    notes:          data.notes          ?? null,
    status:         scheduledTripStatus.SCHEDULED,
  });

  return getScheduledTripById(id) as Promise<IScheduledTrip>;
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

export async function getAllScheduledTrips(
  params: IScheduledTripsPaginationParams = {}
): Promise<IPaginatedResult<IScheduledTrip>> {
  const { db } = useDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [isNull(scheduled_trips.deleted_at)];

  if (params.driver_id && params.driver_id !== 'all') {
    conditions.push(eq(scheduled_trips.driver_id, params.driver_id));
  }
  if (params.vehicle_id && params.vehicle_id !== 'all') {
    conditions.push(eq(scheduled_trips.vehicle_id, params.vehicle_id));
  }
  if (params.status && params.status !== 'all') {
    conditions.push(eq(scheduled_trips.status, params.status as any));
  }
  if (params.from_date) {
    conditions.push(lte(scheduled_trips.scheduled_date, params.from_date));
  }
  if (params.to_date) {
    conditions.push(lte(scheduled_trips.scheduled_date, params.to_date));
  }
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    conditions.push(
      or(like(drivers.name, s), like(vehicles.license_plate, s)) as SQL
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [{ total }] = await db
    .select({ total: count() })
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(whereClause);

  const data = await db
    .select(scheduledTripSelect)
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(whereClause)
    .orderBy(desc(scheduled_trips.scheduled_date))
    .limit(limit)
    .offset(offset);

  // Counts por status
  const countsRaw = await db
    .select({ status: scheduled_trips.status, count: count() })
    .from(scheduled_trips)
    .where(isNull(scheduled_trips.deleted_at))
    .groupBy(scheduled_trips.status);

  const statusCounts: Record<string, number> = {
    scheduled: 0, pending_leave: 0, launched: 0, cancelled: 0,
  };
  for (const row of countsRaw) statusCounts[row.status] = row.count;

  return {
    data: data as IScheduledTrip[],
    pagination: {
      total, page, limit,
      totalPages:  Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts,
  };
}

export async function getScheduledTripById(id: string): Promise<IScheduledTrip | null> {
  const { db } = useDb();

  const result = await db
    .select(scheduledTripSelect)
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(eq(scheduled_trips.id, id))
    .limit(1);

  return (result[0] as IScheduledTrip) ?? null;
}

export async function getScheduledTripsByDriver(driverId: string): Promise<IScheduledTrip[]> {
  const { db } = useDb();

  const result = await db
    .select(scheduledTripSelect)
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(
      and(
        eq(scheduled_trips.driver_id, driverId),
        isNull(scheduled_trips.deleted_at)
      )
    )
    .orderBy(desc(scheduled_trips.scheduled_date));

  return result as IScheduledTrip[];
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateScheduledTrip(
  id:   string,
  data: IUpdateScheduledTrip
): Promise<IScheduledTrip | null> {
  const { db } = useDb();

  await db
    .update(scheduled_trips)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(
      and(
        eq(scheduled_trips.id, id),
        eq(scheduled_trips.status, scheduledTripStatus.SCHEDULED)
      )
    );

  return getScheduledTripById(id);
}

// ─────────────────────────────────────────────
// CANCEL
// ─────────────────────────────────────────────

export async function cancelScheduledTrip(
  id:   string,
  data: ICancelScheduledTrip = {}
): Promise<IScheduledTrip | null> {
  const { db } = useDb();

  const trip = await getScheduledTripById(id);
  if (!trip) return null;

  if (trip.status === scheduledTripStatus.LAUNCHED ||
      trip.status === scheduledTripStatus.CANCELLED) {
    throw new Error('Viagem não pode ser cancelada no estado actual.');
  }

  await db
    .update(scheduled_trips)
    .set({
      status:           scheduledTripStatus.CANCELLED,
      cancelled_at:     new Date().toISOString(),
      cancelled_reason: data.cancelled_reason ?? null,
      updated_at:       new Date().toISOString(),
    })
    .where(eq(scheduled_trips.id, id));

  return getScheduledTripById(id);
}

// ─────────────────────────────────────────────
// SCHEDULER — chamado pelo trip-scheduler
// ─────────────────────────────────────────────

/**
 * Processa viagens agendadas cuja data chegou.
 *
 * Lógica espelhada do leave-scheduler:
 *  scheduled + scheduled_date <= hoje
 *    → driver on_leave  → pending_leave (aguarda regresso)
 *    → driver available → lança trip real (status = launched)
 *
 *  pending_leave + driver já não está on_leave
 *    → lança trip real
 */
export async function processScheduledTrips(): Promise<{
  launched:      string[];
  pendingLeave:  string[];
  autoCancelled: string[];
}> {
  const { db } = useDb();
  const today  = todayStr();

  const launched:      string[] = [];
  const pendingLeave:  string[] = [];
  const autoCancelled: string[] = [];

  // ── 1. Viagens scheduled cuja data chegou ─────────────────────────
  const dueTodayOrBefore = await db
    .select({
      st:     scheduled_trips,
      driver: drivers,
      vehicle: vehicles,
    })
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(
      and(
        eq(scheduled_trips.status, scheduledTripStatus.SCHEDULED),
        lte(scheduled_trips.scheduled_date, today),
        isNull(scheduled_trips.deleted_at)
      )
    );

  for (const { st, driver, vehicle } of dueTodayOrBefore) {
    if (!driver || !vehicle) continue;

    // Veículo inactivo → cancelar automaticamente
    if (!vehicle.is_active || vehicle.status === vehicleStatus.INACTIVE) {
      await db.update(scheduled_trips).set({
        status: scheduledTripStatus.CANCELLED,
        cancelled_at: new Date().toISOString(),
        cancelled_reason: 'Veículo inactivo',
        updated_at: new Date().toISOString(),
      }).where(eq(scheduled_trips.id, st.id));
      autoCancelled.push(st.id);
      continue;
    }

    // Driver de licença → pending_leave
    if (driver.status === driverStatus.ON_LEAVE) {
      await db.update(scheduled_trips).set({
        status:     scheduledTripStatus.PENDING_LEAVE,
        updated_at: new Date().toISOString(),
      }).where(eq(scheduled_trips.id, st.id));
      pendingLeave.push(st.id);
      continue;
    }

    // Driver terminado → cancelar
    if (driver.status === driverStatus.TERMINATED) {
      await db.update(scheduled_trips).set({
        status: scheduledTripStatus.CANCELLED,
        cancelled_at: new Date().toISOString(),
        cancelled_reason: 'Motorista terminado',
        updated_at: new Date().toISOString(),
      }).where(eq(scheduled_trips.id, st.id));
      autoCancelled.push(st.id);
      continue;
    }

    // Lançar viagem real
    const tripId = await _launchTrip(db, st, driver);
    launched.push(st.id);
  }

  // ── 2. Viagens pending_leave cujo driver já regressou ─────────────
  const pendingLeaveRows = await db
    .select({
      st:     scheduled_trips,
      driver: drivers,
      vehicle: vehicles,
    })
    .from(scheduled_trips)
    .leftJoin(drivers,  eq(scheduled_trips.driver_id,  drivers.id))
    .leftJoin(vehicles, eq(scheduled_trips.vehicle_id, vehicles.id))
    .where(
      and(
        eq(scheduled_trips.status, scheduledTripStatus.PENDING_LEAVE),
        isNull(scheduled_trips.deleted_at)
      )
    );

  for (const { st, driver, vehicle } of pendingLeaveRows) {
    if (!driver || !vehicle) continue;

    // Driver ainda de licença → aguardar
    if (driver.status === driverStatus.ON_LEAVE) continue;

    // Driver terminado → cancelar
    if (driver.status === driverStatus.TERMINATED) {
      await db.update(scheduled_trips).set({
        status: scheduledTripStatus.CANCELLED,
        cancelled_at: new Date().toISOString(),
        cancelled_reason: 'Motorista terminado',
        updated_at: new Date().toISOString(),
      }).where(eq(scheduled_trips.id, st.id));
      autoCancelled.push(st.id);
      continue;
    }

    // Lançar
    await _launchTrip(db, st, driver);
    launched.push(st.id);
  }

  return { launched, pendingLeave, autoCancelled };
}

// ─────────────────────────────────────────────
// Helper privado — cria trip real e actualiza scheduled
// ─────────────────────────────────────────────

async function _launchTrip(db: any, st: any, driver: any): Promise<string> {
  const tripId   = generateUuid();
  const tripCode = generateTripCode();
  const now      = new Date().toISOString();

  // Criar trip real
  await db.insert(trips).values({
    id:            tripId,
    vehicle_id:    st.vehicle_id,
    driver_id:     st.driver_id,
    route_id:      st.route_id    ?? null,
    trip_code:     tripCode,
    start_date:    now,
    start_mileage: 0,    // será actualizado pelo utilizador ao iniciar fisicamente
    origin:        st.origin      ?? null,
    destination:   st.destination ?? null,
    purpose:       st.purpose     ?? null,
    notes:         st.notes       ?? null,
    status:        tripStatus.IN_PROGRESS,
  });

  // Marcar veículo como in_use
  await db.update(vehicles)
    .set({ status: vehicleStatus.IN_USE, updated_at: now })
    .where(eq(vehicles.id, st.vehicle_id));

  // Marcar driver como on_trip
  await db.update(drivers)
    .set({ availability: driverAvailability.ON_TRIP, updated_at: now })
    .where(eq(drivers.id, st.driver_id));

  // Marcar scheduled_trip como launched
  await db.update(scheduled_trips).set({
    status:      scheduledTripStatus.LAUNCHED,
    trip_id:     tripId,
    launched_at: now,
    updated_at:  now,
  }).where(eq(scheduled_trips.id, st.id));

  return tripId;
}

// ─────────────────────────────────────────────
// CONFLICT CHECK
// Verifica se há viagem agendada para o mesmo driver ou veículo no mesmo dia
// ─────────────────────────────────────────────

/**
 * @param driverId  — se passado, verifica conflito por motorista
 * @param date      — data a verificar (YYYY-MM-DD)
 * @param vehicleId — se passado, verifica conflito por veículo
 * @param excludeId — exclui este ID (para edição)
 */
export async function hasConflictingScheduledTrip(
  driverId?:  string,
  date?:      string,
  vehicleId?: string,
  excludeId?: string
): Promise<boolean> {
  const { db } = useDb();
  if (!date) return false;

  const conditions: SQL[] = [
    isNull(scheduled_trips.deleted_at),
    ne(scheduled_trips.status, scheduledTripStatus.CANCELLED),
    eq(scheduled_trips.scheduled_date, date),
  ];

  if (driverId)  conditions.push(eq(scheduled_trips.driver_id,  driverId));
  if (vehicleId) conditions.push(eq(scheduled_trips.vehicle_id, vehicleId));
  if (excludeId) conditions.push(ne(scheduled_trips.id, excludeId));

  const result = await db
    .select({ id: scheduled_trips.id })
    .from(scheduled_trips)
    .where(and(...conditions))
    .limit(1);

  return result.length > 0;
}