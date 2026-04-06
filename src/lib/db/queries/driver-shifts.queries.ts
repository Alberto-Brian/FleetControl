// ========================================
// FILE: src/lib/db/queries/driver-shifts.queries.ts (CORRIGIDO COM TRANSAÇÕES)
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { driver_shifts, shiftStatus, ShiftStatus } from '../schemas/driver_shifts';
import { driver_shift_members } from '../schemas/driver_shift_members';
import { drivers } from '../schemas/drivers';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, or, like, count, sql, SQL } from 'drizzle-orm';
import {
  IDriverShift,
  IDriverShiftSummary,
  IShiftMember,
  ICreateDriverShift,
  IUpdateDriverShift,
  IAddShiftMember,
  IUpdateShiftMember,
  IDriverShiftsPaginationParams,
  IDriverShiftBadge,
} from '@/lib/types/driver-shift';
import { IPaginatedResult } from '@/lib/types/pagination';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers privados
// ─────────────────────────────────────────────────────────────────────────────

/** Carrega os membros de um turno (com nome do motorista via JOIN) */
async function loadShiftMembers(db: any, shiftId: string): Promise<IShiftMember[]> {
  const rows = await db
    .select({
      id:          driver_shift_members.id,
      shift_id:    driver_shift_members.shift_id,
      driver_id:   driver_shift_members.driver_id,
      driver_name: drivers.name,
      is_leader:   driver_shift_members.is_leader,
      notes:       driver_shift_members.notes,
      created_at:  driver_shift_members.created_at,
      updated_at:  driver_shift_members.updated_at,
    })
    .from(driver_shift_members)
    .leftJoin(drivers, eq(driver_shift_members.driver_id, drivers.id))
    .where(eq(driver_shift_members.shift_id, shiftId))
    .orderBy(desc(driver_shift_members.is_leader), drivers.name);

  return rows.map((r: any) => ({
    ...r,
    is_leader:   !!r.is_leader,
    driver_name: r.driver_name ?? '—',
  })) as IShiftMember[];
}

/** Reconstrói um IDriverShift completo a partir do id */
async function getShiftWithMembers(db: any, shiftId: string): Promise<IDriverShift | null> {
  const row = await db
    .select()
    .from(driver_shifts)
    .where(and(eq(driver_shifts.id, shiftId), isNull(driver_shifts.deleted_at)))
    .limit(1);

  if (!row[0]) return null;

  const members = await loadShiftMembers(db, shiftId);
  const leader  = members.find(m => m.is_leader);

  return {
    ...row[0],
    members,
    member_count: members.length,
    leader_name:  leader?.driver_name ?? null,
  } as IDriverShift;
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createDriverShift(data: ICreateDriverShift): Promise<IDriverShift> {
  const { db } = useDb();
  const id = generateUuid();

  // CORREÇÃO: Sem await na transaction, função síncrona interna
  await db.transaction((tx: any) => {
    tx.insert(driver_shifts).values({
      id,
      name:        data.name,
      description: data.description ?? null,
      start_date:  data.start_date,
      end_date:    data.end_date,
      start_time:  data.start_time,
      end_time:    data.end_time,
      status:      data.status ?? shiftStatus.DRAFT,
      notes:       data.notes ?? null,
    }).run(); // .run() para better-sqlite3

    // Inserir membros iniciais se fornecidos
    if (data.members && data.members.length > 0) {
      const leaderCount = data.members.filter(m => m.is_leader).length;
      if (leaderCount > 1) throw new Error('shifts:errors.onlyOneLeader');

      for (const member of data.members) {
        tx.insert(driver_shift_members).values({
          id:        generateUuid(),
          shift_id:  id,
          driver_id: member.driver_id,
          is_leader: member.is_leader ? 1 : 0,
          notes:     member.notes ?? null,
        }).run(); // .run() para better-sqlite3
      }
    }
  });

  return (await getShiftWithMembers(db, id)) as IDriverShift;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getAll (listagem paginada com contagem de membros)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllDriverShifts(
  params: IDriverShiftsPaginationParams = {}
): Promise<IPaginatedResult<IDriverShiftSummary>> {
  const { db } = useDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [isNull(driver_shifts.deleted_at)];
  if (params.status && params.status !== 'all') {
    conditions.push(eq(driver_shifts.status, params.status as ShiftStatus));
  }
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    conditions.push(or(like(driver_shifts.name, s), like(driver_shifts.description, s)) as SQL);
  }
  if (params.from_date) conditions.push(sql`${driver_shifts.end_date}   >= ${params.from_date}`);
  if (params.to_date)   conditions.push(sql`${driver_shifts.start_date} <= ${params.to_date}`);

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [{ total }] = await db
    .select({ total: count() })
    .from(driver_shifts)
    .where(whereClause);

  // Subquery: contagem de membros por turno
  const memberCounts = await db
    .select({
      shift_id: driver_shift_members.shift_id,
      cnt:      count(),
    })
    .from(driver_shift_members)
    .groupBy(driver_shift_members.shift_id);

  const memberCountMap: Record<string, number> = {};
  for (const r of memberCounts) memberCountMap[r.shift_id] = r.cnt;

  // Subquery: nome do líder por turno
  const leaders = await db
    .select({
      shift_id:    driver_shift_members.shift_id,
      driver_name: drivers.name,
    })
    .from(driver_shift_members)
    .leftJoin(drivers, eq(driver_shift_members.driver_id, drivers.id))
    .where(eq(driver_shift_members.is_leader, true));

  const leaderMap: Record<string, string> = {};
  for (const r of leaders) leaderMap[r.shift_id] = r.driver_name ?? '—';

  const data = await db
    .select()
    .from(driver_shifts)
    .where(whereClause)
    .orderBy(desc(driver_shifts.start_date))
    .limit(limit)
    .offset(offset);

  // Counts por status
  const countsRaw = await db
    .select({ status: driver_shifts.status, count: count() })
    .from(driver_shifts)
    .where(isNull(driver_shifts.deleted_at))
    .groupBy(driver_shifts.status);

  const statusCounts: Record<string, number> = { draft: 0, active: 0, archived: 0 };
  for (const r of countsRaw) statusCounts[r.status] = r.count;

  const mapped: IDriverShiftSummary[] = data.map((row: any) => ({
    ...row,
    member_count: memberCountMap[row.id] ?? 0,
    leader_name:  leaderMap[row.id]      ?? null,
  }));

  return {
    data: mapped,
    pagination: {
      total, page, limit,
      totalPages:  Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getById (com membros completos)
// ─────────────────────────────────────────────────────────────────────────────

export async function getDriverShiftById(id: string): Promise<IDriverShift | null> {
  const { db } = useDb();
  return getShiftWithMembers(db, id);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getShiftsForDriver
// ─────────────────────────────────────────────────────────────────────────────

export async function getShiftsForDriver(driverId: string): Promise<IDriverShiftBadge[]> {
  const { db } = useDb();

  const rows = await db
    .select({
      shift_id:   driver_shift_members.shift_id,
      shift_name: driver_shifts.name,
      is_leader:  driver_shift_members.is_leader,
      start_time: driver_shifts.start_time,
      end_time:   driver_shifts.end_time,
    })
    .from(driver_shift_members)
    .leftJoin(driver_shifts, eq(driver_shift_members.shift_id, driver_shifts.id))
    .where(and(
      eq(driver_shift_members.driver_id, driverId),
      eq(driver_shifts.status, shiftStatus.ACTIVE),
      isNull(driver_shifts.deleted_at)
    ))
    .orderBy(driver_shifts.start_time);

  return rows.map((r: any) => ({
    shift_id:   r.shift_id,
    shift_name: r.shift_name ?? '—',
    is_leader:  !!r.is_leader,
    start_time: r.start_time ?? '',
    end_time:   r.end_time   ?? '',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — getShiftsForAllDrivers
// ─────────────────────────────────────────────────────────────────────────────

export async function getShiftsForAllDrivers(): Promise<Record<string, IDriverShiftBadge[]>> {
  const { db } = useDb();

  const rows = await db
    .select({
      driver_id:  driver_shift_members.driver_id,
      shift_id:   driver_shift_members.shift_id,
      shift_name: driver_shifts.name,
      is_leader:  driver_shift_members.is_leader,
      start_time: driver_shifts.start_time,
      end_time:   driver_shifts.end_time,
    })
    .from(driver_shift_members)
    .leftJoin(driver_shifts, eq(driver_shift_members.shift_id, driver_shifts.id))
    .where(and(
      eq(driver_shifts.status, shiftStatus.ACTIVE),
      isNull(driver_shifts.deleted_at)
    ));

  const map: Record<string, IDriverShiftBadge[]> = {};
  for (const r of rows) {
    if (!map[r.driver_id]) map[r.driver_id] = [];
    map[r.driver_id].push({
      shift_id:   r.shift_id,
      shift_name: r.shift_name ?? '—',
      is_leader:  !!r.is_leader,
      start_time: r.start_time ?? '',
      end_time:   r.end_time   ?? '',
    });
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — turno
// ─────────────────────────────────────────────────────────────────────────────

export async function updateDriverShift(
  id:   string,
  data: IUpdateDriverShift
): Promise<IDriverShift | null> {
  const { db } = useDb();

  await db
    .update(driver_shifts)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(and(eq(driver_shifts.id, id), isNull(driver_shifts.deleted_at)));

  return getShiftWithMembers(db, id);
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — status do turno
// ─────────────────────────────────────────────────────────────────────────────

export async function updateDriverShiftStatus(
  id:     string,
  status: ShiftStatus
): Promise<IDriverShift | null> {
  const { db } = useDb();

  await db
    .update(driver_shifts)
    .set({ status, updated_at: new Date().toISOString() })
    .where(and(eq(driver_shifts.id, id), isNull(driver_shifts.deleted_at)));

  return getShiftWithMembers(db, id);
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — soft delete
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteDriverShift(id: string): Promise<boolean> {
  const { db } = useDb();

  const result = await db
    .update(driver_shifts)
    .set({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .where(and(eq(driver_shifts.id, id), isNull(driver_shifts.deleted_at)))
    .returning({ id: driver_shifts.id });

  return result.length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS — adicionar motorista ao turno (COM TRANSAÇÃO)
// ─────────────────────────────────────────────────────────────────────────────

export async function addShiftMember(
  shiftId: string,
  data:    IAddShiftMember
): Promise<IDriverShift | null> {
  const { db } = useDb();

  // CORREÇÃO: Sem await na transaction, função síncrona interna
  await db.transaction((tx: any) => {
    // Se vai ser líder, remover liderança do actual líder
    if (data.is_leader) {
      tx.update(driver_shift_members)
        .set({ is_leader: false, updated_at: new Date().toISOString() })
        .where(and(
          eq(driver_shift_members.shift_id, shiftId),
          eq(driver_shift_members.is_leader, true)
        )).run();
    }

    tx.insert(driver_shift_members).values({
      id:        generateUuid(),
      shift_id:  shiftId,
      driver_id: data.driver_id,
      is_leader: data.is_leader ? 1 : 0,
      notes:     data.notes ?? null,
    }).run();
  });

  return getShiftWithMembers(db, shiftId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS — remover motorista do turno
// ─────────────────────────────────────────────────────────────────────────────

export async function removeShiftMember(
  shiftId:  string,
  memberId: string
): Promise<IDriverShift | null> {
  const { db } = useDb();

  await db
    .delete(driver_shift_members)
    .where(and(
      eq(driver_shift_members.id,       memberId),
      eq(driver_shift_members.shift_id, shiftId)
    ));

  return getShiftWithMembers(db, shiftId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS — promover/despromover líder (COM TRANSAÇÃO)
// ─────────────────────────────────────────────────────────────────────────────

export async function setShiftLeader(
  shiftId:  string,
  memberId: string
): Promise<IDriverShift | null> {
  const { db } = useDb();

  // CORREÇÃO: Sem await na transaction, função síncrona interna
  await db.transaction((tx: any) => {
    // Retirar liderança de todos
    tx.update(driver_shift_members)
      .set({ is_leader: false, updated_at: new Date().toISOString() })
      .where(eq(driver_shift_members.shift_id, shiftId))
      .run();

    // Definir o novo líder
    if (memberId) {
      tx.update(driver_shift_members)
        .set({ is_leader: true, updated_at: new Date().toISOString() })
        .where(and(
          eq(driver_shift_members.id,       memberId),
          eq(driver_shift_members.shift_id, shiftId)
        ))
        .run();
    }
  });

  return getShiftWithMembers(db, shiftId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS — actualizar membro (COM TRANSAÇÃO)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateShiftMember(
  shiftId:  string,
  memberId: string,
  data:     IUpdateShiftMember
): Promise<IDriverShift | null> {
  const { db } = useDb();

  // CORREÇÃO: Sem await na transaction, função síncrona interna
  await db.transaction((tx: any) => {
    if (data.is_leader === true) {
      // Remover liderança anterior
      tx.update(driver_shift_members)
        .set({ is_leader: false, updated_at: new Date().toISOString() })
        .where(eq(driver_shift_members.shift_id, shiftId))
        .run();
    }

    tx.update(driver_shift_members)
      .set({
        ...(data.is_leader !== undefined && { is_leader: data.is_leader }),
        ...(data.notes     !== undefined && { notes:     data.notes     }),
        updated_at: new Date().toISOString(),
      })
      .where(and(
        eq(driver_shift_members.id,       memberId),
        eq(driver_shift_members.shift_id, shiftId)
      ))
      .run();
  });

  return getShiftWithMembers(db, shiftId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS — substituição total de membros (COM TRANSAÇÃO)
// ─────────────────────────────────────────────────────────────────────────────

export async function replaceShiftMembers(
  shiftId: string,
  members: { driver_id: string; is_leader: boolean; notes?: string }[]
): Promise<IDriverShift | null> {
  const { db } = useDb();

  const leaderCount = members.filter(m => m.is_leader).length;
  if (leaderCount > 1) throw new Error('shifts:errors.onlyOneLeader');

  // CORREÇÃO: Sem await na transaction, função síncrona interna
  await db.transaction((tx: any) => {
    // Apagar todos os membros actuais
    tx.delete(driver_shift_members)
      .where(eq(driver_shift_members.shift_id, shiftId))
      .run();

    // Inserir os novos
    for (const m of members) {
      tx.insert(driver_shift_members).values({
        id:        generateUuid(),
        shift_id:  shiftId,
        driver_id: m.driver_id,
        is_leader: m.is_leader ? 1 : 0,
        notes:     m.notes ?? null,
      }).run();
    }
  });

  return getShiftWithMembers(db, shiftId);
}