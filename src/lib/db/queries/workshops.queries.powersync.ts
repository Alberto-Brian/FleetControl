// ========================================
// FILE: src/lib/db/queries/workshops.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.9 — Workshops.
// Mesmo padrão de Routes: CRUD legado já completo, corte mecânico. Sem
// dependências cruzadas — org-only, nome/colunas idênticos entre local e
// PowerSync (confirmado contra schema.ts). `workshops.queries.ts`
// (Drizzle/app.db) não tocado, fica como backup.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateWorkshop, IUpdateWorkshop, IWorkshop } from '@/lib/types/workshop';

interface WorkshopRow {
  id: string; name: string; phone: string | null; email: string | null; address: string | null;
  city: string | null; state: string | null; specialties: string | null; notes: string | null;
  is_active: number; created_at: string;
}

function mapRow(row: WorkshopRow): IWorkshop {
  return {
    id: row.id, name: row.name, phone: row.phone ?? undefined, email: row.email ?? undefined,
    address: row.address ?? undefined, city: row.city ?? undefined, state: row.state ?? undefined,
    specialties: row.specialties ?? undefined, notes: row.notes ?? undefined,
    is_active: !!row.is_active, created_at: row.created_at,
  };
}

const WORKSHOP_COLUMNS = `id, name, phone, email, address, city, state, specialties, notes, is_active, created_at`;

export async function createWorkshop(workshopData: ICreateWorkshop): Promise<IWorkshop> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO workshops (
      id, organization_id, name, phone, email, address, city, state, specialties, notes, is_active,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, workshopData.name, workshopData.phone ?? null, workshopData.email ?? null,
      workshopData.address ?? null, workshopData.city ?? null, workshopData.state ?? null,
      workshopData.specialties ?? null, workshopData.notes ?? null, 1, now, now,
    ],
  );

  return { id, ...workshopData, is_active: true, created_at: now };
}

export async function getAllWorkshops(): Promise<IWorkshop[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<WorkshopRow>(`SELECT ${WORKSHOP_COLUMNS} FROM workshops WHERE deleted_at IS NULL`);
  return rows.map(mapRow);
}

export async function getWorkshopById(workshopId: string): Promise<IWorkshop | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<WorkshopRow>(
    `SELECT ${WORKSHOP_COLUMNS} FROM workshops WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [workshopId],
  );
  return row ? mapRow(row) : null;
}

export async function findWorkshopByName(name: string): Promise<IWorkshop | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<WorkshopRow>(
    `SELECT ${WORKSHOP_COLUMNS} FROM workshops WHERE name = ? LIMIT 1`, [name],
  );
  return row ? mapRow(row) : null;
}

export async function updateWorkshop(workshopId: string, workshopData: IUpdateWorkshop): Promise<IWorkshop | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...workshopData };
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE workshops SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), workshopId],
    );
  }
  return getWorkshopById(workshopId);
}

export async function deleteWorkshop(workshopId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(`UPDATE workshops SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), workshopId]);
  return workshopId;
}
