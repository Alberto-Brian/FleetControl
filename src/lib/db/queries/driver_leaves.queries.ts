// ========================================
// FILE: src/lib/db/queries/driver_leaves.queries.ts
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { driver_leaves, leaveStatus, LeaveStatus } from '@/lib/db/schemas/driver_leaves';
import { drivers, driverStatus, driverAvailability } from '@/lib/db/schemas/drivers';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, or, like, count, lte, gte, ne, SQL } from 'drizzle-orm';
import {
  IDriverLeave,
  ICreateDriverLeave,
  IUpdateDriverLeave,
  ICancelDriverLeave,
  IDriverLeavesPaginationParams,
} from '@/lib/types/driver-leave';
import { IPaginatedResult } from '@/lib/types/pagination';

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Cria um novo registo de férias.
 * Não altera o estado do driver — isso é feito pelo scheduler ou imediatamente
 * pelo listener quando start_date === hoje.
 */
export async function createDriverLeave(data: ICreateDriverLeave): Promise<IDriverLeave> {
  const { db } = useDb();
  const id = generateUuid();

  const result = await db
    .insert(driver_leaves)
    .values({
      id,
      driver_id:  data.driver_id,
      start_date: data.start_date,
      end_date:   data.end_date,
      reason:     data.reason   ?? null,
      notes:      data.notes    ?? null,
      status:     leaveStatus.SCHEDULED,
    })
    .returning();

  return result[0] as IDriverLeave;
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Busca todas as férias com paginação + filtros.
 */
export async function getAllDriverLeaves(
  params: IDriverLeavesPaginationParams = {}
): Promise<IPaginatedResult<IDriverLeave>> {
  const { db } = useDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [isNull(driver_leaves.deleted_at)];

  if (params.driver_id && params.driver_id !== 'all') {
    conditions.push(eq(driver_leaves.driver_id, params.driver_id));
  }
  if (params.status && params.status !== 'all') {
    conditions.push(eq(driver_leaves.status, params.status as LeaveStatus));
  }
  if (params.from_date) {
    conditions.push(gte(driver_leaves.end_date, params.from_date));
  }
  if (params.to_date) {
    conditions.push(lte(driver_leaves.start_date, params.to_date));
  }
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    conditions.push(like(drivers.name, s));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [{ total }] = await db
    .select({ total: count() })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(whereClause);

  const data = await db
    .select({
      id:               driver_leaves.id,
      driver_id:        driver_leaves.driver_id,
      driver_name:      drivers.name,
      start_date:       driver_leaves.start_date,
      end_date:         driver_leaves.end_date,
      reason:           driver_leaves.reason,
      notes:            driver_leaves.notes,
      status:           driver_leaves.status,
      cancelled_at:     driver_leaves.cancelled_at,
      cancelled_reason: driver_leaves.cancelled_reason,
      created_at:       driver_leaves.created_at,
      updated_at:       driver_leaves.updated_at,
      deleted_at:       driver_leaves.deleted_at,
    })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(whereClause)
    .orderBy(desc(driver_leaves.start_date))
    .limit(limit)
    .offset(offset);

  // Counts por status
  const countsRaw = await db
    .select({ status: driver_leaves.status, count: count() })
    .from(driver_leaves)
    .where(isNull(driver_leaves.deleted_at))
    .groupBy(driver_leaves.status);

  const statusCounts: Record<string, number> = {
    scheduled:    0,
    pending_trip: 0,
    active:       0,
    completed:    0,
    cancelled:    0,
  };
  for (const row of countsRaw) {
    statusCounts[row.status] = row.count;
  }

  return {
    data: data as IDriverLeave[],
    pagination: {
      total,
      page,
      limit,
      totalPages:  Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts,
  };
}

/**
 * Busca as férias de um driver específico (sem paginação, para uso em dialogs).
 */
export async function getLeavesByDriver(driverId: string): Promise<IDriverLeave[]> {
  const { db } = useDb();

  const result = await db
    .select({
      id:               driver_leaves.id,
      driver_id:        driver_leaves.driver_id,
      driver_name:      drivers.name,
      start_date:       driver_leaves.start_date,
      end_date:         driver_leaves.end_date,
      reason:           driver_leaves.reason,
      notes:            driver_leaves.notes,
      status:           driver_leaves.status,
      cancelled_at:     driver_leaves.cancelled_at,
      cancelled_reason: driver_leaves.cancelled_reason,
      created_at:       driver_leaves.created_at,
      updated_at:       driver_leaves.updated_at,
      deleted_at:       driver_leaves.deleted_at,
    })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(
      and(
        eq(driver_leaves.driver_id, driverId),
        isNull(driver_leaves.deleted_at)
      )
    )
    .orderBy(desc(driver_leaves.start_date));

  return result as IDriverLeave[];
}

/**
 * Busca uma férias por ID.
 */
export async function getDriverLeaveById(leaveId: string): Promise<IDriverLeave | null> {
  const { db } = useDb();

  const result = await db
    .select({
      id:               driver_leaves.id,
      driver_id:        driver_leaves.driver_id,
      driver_name:      drivers.name,
      start_date:       driver_leaves.start_date,
      end_date:         driver_leaves.end_date,
      reason:           driver_leaves.reason,
      notes:            driver_leaves.notes,
      status:           driver_leaves.status,
      cancelled_at:     driver_leaves.cancelled_at,
      cancelled_reason: driver_leaves.cancelled_reason,
      created_at:       driver_leaves.created_at,
      updated_at:       driver_leaves.updated_at,
      deleted_at:       driver_leaves.deleted_at,
    })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(eq(driver_leaves.id, leaveId))
    .limit(1);

  return (result[0] as IDriverLeave) ?? null;
}

/**
 * Verifica se um driver tem férias sobrepostas com o intervalo dado.
 * Exclui opcionalmente um leaveId (para edição).
 */
export async function hasOverlappingLeave(
  driverId:  string,
  startDate: string,
  endDate:   string,
  excludeId?: string
): Promise<boolean> {
  const { db } = useDb();

  const conditions: SQL[] = [
    eq(driver_leaves.driver_id, driverId),
    isNull(driver_leaves.deleted_at),
    ne(driver_leaves.status, leaveStatus.CANCELLED),
    // Sobreposição: start_date <= endDate E end_date >= startDate
    lte(driver_leaves.start_date, endDate),
    gte(driver_leaves.end_date, startDate),
  ];

  if (excludeId) {
    conditions.push(ne(driver_leaves.id, excludeId));
  }

  const result = await db
    .select({ id: driver_leaves.id })
    .from(driver_leaves)
    .where(and(...conditions))
    .limit(1);

  return result.length > 0;
}

// ─────────────────────────────────────────────
// UPDATE / CANCEL
// ─────────────────────────────────────────────

/**
 * Edita datas/motivo de férias ainda agendadas (status = scheduled).
 */
export async function updateDriverLeave(
  leaveId: string,
  data:    IUpdateDriverLeave
): Promise<IDriverLeave | null> {
  const { db } = useDb();

  await db
    .update(driver_leaves)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(
      and(
        eq(driver_leaves.id, leaveId),
        eq(driver_leaves.status, leaveStatus.SCHEDULED)
      )
    );

  return getDriverLeaveById(leaveId);
}

/**
 * Cancela férias (scheduled, pending_trip ou active).
 * Se estiver active, restaura o driver para available.
 */
export async function cancelDriverLeave(
  leaveId: string,
  data:    ICancelDriverLeave = {}
): Promise<IDriverLeave | null> {
  const { db } = useDb();

  const leave = await getDriverLeaveById(leaveId);
  if (!leave) return null;

  // Só pode cancelar se não estiver já completed ou cancelled
  if (
    leave.status === leaveStatus.COMPLETED ||
    leave.status === leaveStatus.CANCELLED
  ) {
    throw new Error('Leave cannot be cancelled in its current state');
  }

  // Cancela a férias
  await db
    .update(driver_leaves)
    .set({
      status:           leaveStatus.CANCELLED,
      cancelled_at:     new Date().toISOString(),
      cancelled_reason: data.cancelled_reason ?? null,
      updated_at:       new Date().toISOString(),
    })
    .where(eq(driver_leaves.id, leaveId));

  // Se estava activa, restaura o driver para available
  if (leave.status === leaveStatus.ACTIVE) {
    await db
      .update(drivers)
      .set({
        status:       driverStatus.ACTIVE,
        availability: driverAvailability.AVAILABLE,
        updated_at:   new Date().toISOString(),
      })
      .where(eq(drivers.id, leave.driver_id));
  }

  return getDriverLeaveById(leaveId);
}

// ─────────────────────────────────────────────
// SCHEDULER FUNCTIONS
// Chamadas pelo leave-scheduler a cada 5 minutos
// ─────────────────────────────────────────────

/**
 * Processa férias agendadas que devem começar hoje ou antes.
 *
 * Lógica:
 *  - scheduled + start_date <= hoje
 *      → driver available/offline  → active + on_leave
 *      → driver on_trip            → pending_trip (aguarda viagem)
 *      → driver terminated         → cancelled automático
 *
 *  - pending_trip + driver já não está on_trip
 *      → active + on_leave
 */
export async function processScheduledLeaves(): Promise<{
  activated:   string[];
  pendingTrip: string[];
  autoCancelled: string[];
}> {
  const { db } = useDb();
  const today = todayStr();

  const activated:     string[] = [];
  const pendingTrip:   string[] = [];
  const autoCancelled: string[] = [];

  // ── 1. Férias scheduled cuja data já chegou ──────────────────────
  const scheduledDue = await db
    .select({
      leave:  driver_leaves,
      driver: drivers,
    })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(
      and(
        eq(driver_leaves.status, leaveStatus.SCHEDULED),
        lte(driver_leaves.start_date, today),
        isNull(driver_leaves.deleted_at)
      )
    );

  for (const { leave, driver } of scheduledDue) {
    if (!driver) continue;

    // Driver terminated → cancelar automaticamente
    if (driver.status === driverStatus.TERMINATED) {
      await db
        .update(driver_leaves)
        .set({
          status:           leaveStatus.CANCELLED,
          cancelled_at:     new Date().toISOString(),
          cancelled_reason: 'Driver terminated',
          updated_at:       new Date().toISOString(),
        })
        .where(eq(driver_leaves.id, leave.id));
      autoCancelled.push(leave.id);
      continue;
    }

    // Driver on_trip → pending_trip
    if (driver.availability === driverAvailability.ON_TRIP) {
      await db
        .update(driver_leaves)
        .set({
          status:     leaveStatus.PENDING_TRIP,
          updated_at: new Date().toISOString(),
        })
        .where(eq(driver_leaves.id, leave.id));
      pendingTrip.push(leave.id);
      continue;
    }

    // Driver available ou offline → activar férias
    await _activateLeave(db, leave.id, driver.id);
    activated.push(leave.id);
  }

  // ── 2. Férias pending_trip onde o driver já não está on_trip ─────
  const pendingLeaves = await db
    .select({
      leave:  driver_leaves,
      driver: drivers,
    })
    .from(driver_leaves)
    .leftJoin(drivers, eq(driver_leaves.driver_id, drivers.id))
    .where(
      and(
        eq(driver_leaves.status, leaveStatus.PENDING_TRIP),
        isNull(driver_leaves.deleted_at)
      )
    );

  for (const { leave, driver } of pendingLeaves) {
    if (!driver) continue;

    // Terminated enquanto aguardava → cancelar
    if (driver.status === driverStatus.TERMINATED) {
      await db
        .update(driver_leaves)
        .set({
          status:           leaveStatus.CANCELLED,
          cancelled_at:     new Date().toISOString(),
          cancelled_reason: 'Driver terminated',
          updated_at:       new Date().toISOString(),
        })
        .where(eq(driver_leaves.id, leave.id));
      autoCancelled.push(leave.id);
      continue;
    }

    // Viagem terminou → activar
    if (driver.availability !== driverAvailability.ON_TRIP) {
      await _activateLeave(db, leave.id, driver.id);
      activated.push(leave.id);
    }
  }

  return { activated, pendingTrip, autoCancelled };
}

/**
 * Processa férias activas que já terminaram (end_date < hoje).
 * Restaura o driver para available.
 */

export async function processCompletedLeaves(): Promise<string[]> {
    const { db } = useDb();
    const today = todayStr();
    const completed: string[] = [];
 
    const expiredLeaves = await db
        .select({ leave: driver_leaves })
        .from(driver_leaves)
        .where(
            and(
                eq(driver_leaves.status, leaveStatus.ACTIVE),
                lte(driver_leaves.end_date, today),
                isNull(driver_leaves.deleted_at)
            )
        );
 
    // end_date é inclusivo — só completa quando today > end_date
    const trulyExpired = expiredLeaves.filter(({ leave }) => leave.end_date < today);
 
    for (const { leave } of trulyExpired) {
        await db.update(driver_leaves).set({
            status:     leaveStatus.COMPLETED,
            updated_at: new Date().toISOString(),
        }).where(eq(driver_leaves.id, leave.id));
 
        const [driver] = await db
            .select({ status: drivers.status, availability: drivers.availability })
            .from(drivers)
            .where(eq(drivers.id, leave.driver_id))
            .limit(1);
 
        if (!driver || driver.status === driverStatus.TERMINATED) {
            // Driver eliminado ou terminado — não restaurar
            completed.push(leave.id);
            continue;
        }
 
        // CORRECÇÃO: se o driver está on_trip, não restaurar — a trip trata disso
        if (driver.availability === driverAvailability.ON_TRIP) {
            completed.push(leave.id);
            continue;
        }
 
        await db.update(drivers).set({
            status:       driverStatus.ACTIVE,
            availability: driverAvailability.AVAILABLE,
            updated_at:   new Date().toISOString(),
        }).where(eq(drivers.id, leave.driver_id));
 
        completed.push(leave.id);
    }
 
    return completed;
}

// ─────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────

async function _activateLeave(db: any, leaveId: string, driverId: string) {
  return await db.transaction(async (tx: any) => {
  await tx
    .update(driver_leaves)
    .set({
      status:     leaveStatus.ACTIVE,
      updated_at: new Date().toISOString(),
    })
    .where(eq(driver_leaves.id, leaveId));

  await tx
    .update(drivers)
    .set({
      status:       driverStatus.ON_LEAVE,
      availability: driverAvailability.OFFLINE,
      updated_at:   new Date().toISOString(),
    })
    .where(eq(drivers.id, driverId));

  })
}