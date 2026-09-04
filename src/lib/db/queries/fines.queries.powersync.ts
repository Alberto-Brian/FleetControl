// ========================================
// FILE: src/lib/db/queries/fines.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.9 — Fines,
// último dos 4 domínios mecânicos desta ronda. `fines.queries.ts`
// (Drizzle/app.db) não tocado, fica como backup. vehicle (6.3) e driver
// (6.2) já vivem em powersync.db — JOINs normais, sem seam nenhum.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateFine, IUpdateFine, PayFineData, IFine } from '@/lib/types/fine';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';
import { fineStatus } from '@/lib/db/schemas/fines';

interface FineRow {
  id: string; vehicle_id: string; driver_id: string | null; fine_number: string; fine_date: string;
  infraction_type: string; description: string; location: string | null; fine_amount: number;
  due_date: string | null; payment_date: string | null; status: string; points: number | null;
  authority: string | null; notes: string | null; responsible_party: string | null; created_at: string;
  vehicle_license: string | null; vehicle_brand: string | null; vehicle_model: string | null; driver_name: string | null;
}

const FINE_SELECT = `
  f.id, f.vehicle_id, f.driver_id, f.fine_number, f.fine_date, f.infraction_type, f.description,
  f.location, f.fine_amount, f.due_date, f.payment_date, f.status, f.points, f.authority, f.notes,
  f.responsible_party, f.created_at,
  v.license_plate as vehicle_license, v.brand as vehicle_brand, v.model as vehicle_model, d.name as driver_name
`;
const FINE_FROM_JOIN = `
  FROM fines f
  LEFT JOIN vehicles v ON v.id = f.vehicle_id
  LEFT JOIN drivers d ON d.id = f.driver_id
`;

function mapRow(r: FineRow): IFine {
  return {
    id: r.id, vehicle_id: r.vehicle_id, driver_id: r.driver_id, fine_number: r.fine_number, fine_date: r.fine_date,
    infraction_type: r.infraction_type, description: r.description, location: r.location, fine_amount: r.fine_amount,
    due_date: r.due_date, payment_date: r.payment_date, status: r.status as IFine['status'], points: r.points,
    authority: r.authority, notes: r.notes, responsible_party: r.responsible_party as IFine['responsible_party'],
    created_at: r.created_at,
    // Campos extra, mais ricos que IFine declara — mesma situação já
    // documentada em trips/refuelings/maintenances.
    ...({ vehicle_license: r.vehicle_license ?? undefined, vehicle_brand: r.vehicle_brand ?? undefined,
      vehicle_model: r.vehicle_model ?? undefined, driver_name: r.driver_name ?? undefined } as Record<string, unknown>),
  } as IFine;
}

export async function createFine(fineData: ICreateFine): Promise<IFine | null> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO fines (
      id, organization_id, vehicle_id, driver_id, fine_number, fine_date, infraction_type, description,
      location, fine_amount, due_date, status, points, authority, notes, responsible_party,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, fineData.vehicle_id, fineData.driver_id ?? null, fineData.fine_number, fineData.fine_date,
      fineData.infraction_type, fineData.description, fineData.location ?? null, fineData.fine_amount,
      fineData.due_date ?? null, fineStatus.PENDING, fineData.points ?? null, fineData.authority ?? null,
      fineData.notes ?? null, fineData.responsible_party ?? null, now, now,
    ],
  );

  return getFineById(id);
}

export async function getAllFines(params: IPaginationParams = {}): Promise<IPaginatedResult<IFine>> {
  const db = await getPowerSyncDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const filters: string[] = ['f.deleted_at IS NULL'];
  const filterParams: unknown[] = [];

  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    filters.push(`(LOWER(f.fine_number) LIKE ? OR LOWER(v.license_plate) LIKE ? OR LOWER(f.infraction_type) LIKE ? OR LOWER(d.name) LIKE ?)`);
    filterParams.push(s, s, s, s);
  }
  if (params.status && params.status !== 'all') { filters.push('f.status = ?'); filterParams.push(params.status); }

  const where = filters.join(' AND ');

  const totalRow = await db.get<{ total: number }>(`SELECT COUNT(*) as total ${FINE_FROM_JOIN} WHERE ${where}`, filterParams);
  const total = totalRow.total;

  const rows = await db.getAll<FineRow>(
    `SELECT ${FINE_SELECT} ${FINE_FROM_JOIN} WHERE ${where} ORDER BY f.fine_date DESC LIMIT ? OFFSET ?`,
    [...filterParams, limit, offset],
  );

  const baseFilters: string[] = ['f.deleted_at IS NULL'];
  const baseParams: unknown[] = [];
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    baseFilters.push(`(LOWER(f.fine_number) LIKE ? OR LOWER(v.license_plate) LIKE ? OR LOWER(f.infraction_type) LIKE ? OR LOWER(d.name) LIKE ?)`);
    baseParams.push(s, s, s, s);
  }
  const baseWhere = baseFilters.join(' AND ');

  const countsRaw = await db.getAll<{ status: string; count: number }>(
    `SELECT f.status as status, COUNT(*) as count ${FINE_FROM_JOIN} WHERE ${baseWhere} GROUP BY f.status`, baseParams,
  );
  const totalsRow = await db.get<{ totalAmount: number; pendingAmount: number }>(
    `SELECT COALESCE(SUM(f.fine_amount),0) as totalAmount,
            COALESCE(SUM(CASE WHEN f.status = 'pending' THEN f.fine_amount ELSE 0 END),0) as pendingAmount
     ${FINE_FROM_JOIN} WHERE ${baseWhere}`, baseParams,
  );

  const statusCounts: Record<string, number> = { pending: 0, paid: 0, contested: 0, cancelled: 0 };
  for (const row of countsRaw) statusCounts[row.status] = row.count;

  return {
    data: rows.map(mapRow),
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts: { ...statusCounts, totalAmount: totalsRow.totalAmount, pendingAmount: totalsRow.pendingAmount },
  };
}

export async function getFineById(fineId: string): Promise<IFine | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<FineRow>(
    `SELECT ${FINE_SELECT} ${FINE_FROM_JOIN} WHERE f.id = ? AND f.deleted_at IS NULL LIMIT 1`, [fineId],
  );
  return row ? mapRow(row) : null;
}

export async function updateFine(fineId: string, fineData: IUpdateFine): Promise<IFine | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...fineData };
  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE fines SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), fineId],
    );
  }
  return getFineById(fineId);
}

export async function markFineAsPaid(fineId: string, paymentData: PayFineData): Promise<IFine | null> {
  const db = await getPowerSyncDb();
  await db.execute(
    `UPDATE fines SET payment_date = ?, status = ?, updated_at = ? WHERE id = ?`,
    [paymentData.payment_date, fineStatus.PAID, new Date().toISOString(), fineId],
  );
  return getFineById(fineId);
}

export async function deleteFine(fineId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(`UPDATE fines SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), fineId]);
  return fineId;
}

export async function getPendingFines(): Promise<IFine[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<FineRow>(
    `SELECT ${FINE_SELECT} ${FINE_FROM_JOIN} WHERE f.status = ? AND f.deleted_at IS NULL ORDER BY f.fine_date DESC`,
    [fineStatus.PENDING],
  );
  return rows.map(mapRow);
}
