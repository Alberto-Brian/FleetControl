// ========================================
// FILE: src/lib/db/queries/maintenance_categories.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.4. Espelha
// `maintenance_categories.queries.ts` (Drizzle/app.db, não tocado, fica
// como backup). Ao contrário de vehicle_categories/expense_categories,
// este domínio NÃO se funde na tabela unificada `categories` — o PowerSync
// já tem uma tabela `maintenance_categories` dedicada (schema.ts, espelha
// o schema Drizzle da API), mapeamento quase 1:1 (falta só `icon`, sem
// equivalente local, mesmo tratamento dos outros dois).
//
// `getMaintenancesByCategory` (guarda de eliminação) FICA no ficheiro
// antigo, importado directamente de lá pelo listener — consulta
// `maintenances`, que só corta para PowerSync no Prompt 6.7. Mesmo seam
// temporário já usado em drivers.queries.powersync.ts para `trips`.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory, IMaintenanceCategory } from '@/lib/types/maintenance_category';

interface CategoryRow {
  id: string; name: string; type: string; description: string | null; color: string;
  is_active: number; created_at: string;
}

function mapRow(row: CategoryRow): IMaintenanceCategory {
  return {
    id: row.id, name: row.name, type: row.type as IMaintenanceCategory['type'],
    description: row.description, color: row.color, is_active: !!row.is_active, created_at: row.created_at,
  };
}

export async function findMaintenanceCategoryByName(name: string): Promise<IMaintenanceCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, type, description, color, is_active, created_at FROM maintenance_categories WHERE name = ? LIMIT 1`,
    [name],
  );
  return row ? mapRow(row) : null;
}

export async function createMaintenanceCategory(categoryData: ICreateMaintenanceCategory): Promise<IMaintenanceCategory> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();
  const color = categoryData.color || '#F59E0B';

  await db.execute(
    `INSERT INTO maintenance_categories (id, organization_id, name, type, description, color, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, categoryData.name, categoryData.type, categoryData.description ?? null, color, 1, now, now],
  );

  return {
    id, name: categoryData.name, type: categoryData.type,
    description: categoryData.description ?? null, color, is_active: true, created_at: now,
  };
}

export async function getAllMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<CategoryRow>(
    `SELECT id, name, type, description, color, is_active, created_at
     FROM maintenance_categories WHERE deleted_at IS NULL`,
  );
  return rows.map(mapRow);
}

export async function getMaintenanceCategoryById(categoryId: string): Promise<IMaintenanceCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, type, description, color, is_active, created_at
     FROM maintenance_categories WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
    [categoryId],
  );
  return row ? mapRow(row) : null;
}

export async function updateMaintenanceCategory(categoryId: string, categoryData: IUpdateMaintenanceCategory): Promise<IMaintenanceCategory | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...categoryData };
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE maintenance_categories SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), categoryId],
    );
  }
  return getMaintenanceCategoryById(categoryId);
}

export async function deleteMaintenanceCategory(categoryId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(
    `UPDATE maintenance_categories SET deleted_at = ? WHERE id = ?`,
    [new Date().toISOString(), categoryId],
  );
  return categoryId;
}

export async function getActiveMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<CategoryRow>(
    `SELECT id, name, type, description, color, is_active, created_at
     FROM maintenance_categories WHERE is_active = 1 AND deleted_at IS NULL`,
  );
  return rows.map(mapRow);
}
