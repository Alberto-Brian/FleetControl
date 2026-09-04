// ========================================
// FILE: src/lib/db/queries/vehicle_categories.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.4 — Categories
// cortado para PowerSync. `vehicle_categories.queries.ts` (Drizzle/app.db)
// não tocado, fica como referência/backup.
//
// Reconciliação de modelo (a mesma já aplicada no backend na Fase 4,
// migrate-data.ts): o Desktop local sempre teve 3 tabelas separadas
// (vehicle_categories/expense_categories/maintenance_categories); o
// PowerSync (espelhando o schema da API) só tem DUAS: uma tabela unificada
// `categories` com discriminador `type` ('vehicle'|'expense', entre
// outros) + `icon`, e uma tabela `maintenance_categories` dedicada (não
// unificada — ver maintenance_categories.queries.powersync.ts). Este
// ficheiro escreve sempre `type='vehicle'` e filtra sempre por esse type —
// nunca lê/escreve uma linha de outro domínio partilhando a mesma tabela.
// `icon` não tem equivalente local — fica sempre null.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateVehicleCategory, IUpdateVehicleCategory, IVehicleCategory } from '@/lib/types/vehicle-category';

const TYPE = 'vehicle';

interface CategoryRow {
  id: string; name: string; description: string | null; color: string;
  is_active: number; created_at: string; updated_at: string;
}

function mapRow(row: CategoryRow): IVehicleCategory {
  return {
    id: row.id, name: row.name, description: row.description, color: row.color,
    is_active: !!row.is_active, created_at: row.created_at, updated_at: row.updated_at,
  };
}

export async function createVehicleCategory(categoryData: ICreateVehicleCategory): Promise<IVehicleCategory> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();
  const color = categoryData.color || '#3B82F6';

  await db.execute(
    `INSERT INTO categories (id, organization_id, name, description, type, color, icon, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, categoryData.name, categoryData.description ?? null, TYPE, color, null, 1, now, now],
  );

  return { id, name: categoryData.name, description: categoryData.description ?? null, color, is_active: true, created_at: now, updated_at: now };
}

export async function findVehicleCategoryByName(name: string): Promise<IVehicleCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at, updated_at FROM categories WHERE type = ? AND name = ? LIMIT 1`,
    [TYPE, name],
  );
  return row ? mapRow(row) : null;
}

export async function findVehicleCategoryById(category_id: string): Promise<IVehicleCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at, updated_at FROM categories WHERE type = ? AND id = ? LIMIT 1`,
    [TYPE, category_id],
  );
  return row ? mapRow(row) : null;
}

export async function getAllVehicleCategories(): Promise<IVehicleCategory[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at, updated_at
     FROM categories WHERE type = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
    [TYPE],
  );
  return rows.map(mapRow);
}

export async function updateVehicleCategory(categoryId: string, categoryData: IUpdateVehicleCategory): Promise<IVehicleCategory | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...categoryData };
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE categories SET ${setClause}, updated_at = ? WHERE type = ? AND id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), TYPE, categoryId],
    );
  }
  return findVehicleCategoryById(categoryId);
}

export async function deleteVehicleCategory(categoryId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(
    `UPDATE categories SET deleted_at = ?, is_active = 0 WHERE type = ? AND id = ?`,
    [new Date().toISOString(), TYPE, categoryId],
  );
  return categoryId;
}
