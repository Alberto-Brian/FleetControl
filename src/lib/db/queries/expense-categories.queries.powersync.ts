// ========================================
// FILE: src/lib/db/queries/expense-categories.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.4. Espelha
// `expense-categories.queries.ts` (Drizzle/app.db, não tocado, fica como
// backup) — mesma reconciliação de modelo documentada em
// vehicle_categories.queries.powersync.ts: escreve/lê sempre `type='expense'`
// na tabela unificada `categories`.
//
// Diferença deliberada: o `type` LOCAL de expense_categories
// ('operational'|'administrative'|'extraordinary', ver
// src/lib/db/schemas/expense_categories.ts) é uma SUB-classificação da
// despesa, semanticamente diferente do `type` da tabela `categories`
// (que aqui é sempre 'expense', o discriminador de domínio). Não há coluna
// equivalente na tabela unificada para essa sub-classificação — confirmado
// por grep que nenhuma página/componente a lê hoje (campo já morto na UI),
// mesma conclusão a que se chegou ao migrar os dados reais do cliente para
// a API (Fase 4, migrate-data.ts). Aceite como perda de dados sem impacto
// — nunca persistida aqui; `ICreateExpenseCategory.type`/
// `IUpdateExpenseCategory.type` continuam a ser aceites (para não obrigar
// a mexer no tipo nem nos chamadores) mas são sempre ignorados, e
// `IExpenseCategory.type` devolvido é sempre o placeholder 'operational'
// (nunca lido por ninguém).
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateExpenseCategory, IUpdateExpenseCategory, IExpenseCategory } from '@/lib/types/expense-category';
import { expenseCategoryType } from '@/lib/db/schemas/expense_categories';

const TYPE = 'expense';

interface CategoryRow {
  id: string; name: string; description: string | null; color: string;
  is_active: number; created_at: string;
}

function mapRow(row: CategoryRow): IExpenseCategory {
  return {
    id: row.id, name: row.name, description: row.description ?? undefined, color: row.color,
    is_active: !!row.is_active, created_at: row.created_at,
    type: expenseCategoryType.OPERATIONAL, // ver nota no topo — nunca persistido/lido
  };
}

export async function createExpenseCategory(categoryData: ICreateExpenseCategory): Promise<IExpenseCategory> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();
  const color = categoryData.color || '#EF4444';

  await db.execute(
    `INSERT INTO categories (id, organization_id, name, description, type, color, icon, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, categoryData.name, categoryData.description ?? null, TYPE, color, null, 1, now, now],
  );

  return {
    id, name: categoryData.name, description: categoryData.description, color, is_active: true, created_at: now,
    type: expenseCategoryType.OPERATIONAL,
  };
}

export async function getAllExpenseCategories(): Promise<IExpenseCategory[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at FROM categories WHERE type = ? AND deleted_at IS NULL`,
    [TYPE],
  );
  return rows.map(mapRow);
}

export async function getExpenseCategoryById(categoryId: string): Promise<IExpenseCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at FROM categories WHERE type = ? AND id = ? AND deleted_at IS NULL LIMIT 1`,
    [TYPE, categoryId],
  );
  return row ? mapRow(row) : null;
}

export async function updateExpenseCategory(categoryId: string, categoryData: IUpdateExpenseCategory): Promise<IExpenseCategory | null> {
  const db = await getPowerSyncDb();
  // `type` nunca é persistido — ver nota no topo do ficheiro.
  const { type: _ignored, ...rest } = categoryData;
  const updateData: Record<string, unknown> = { ...rest };
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE categories SET ${setClause}, updated_at = ? WHERE type = ? AND id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), TYPE, categoryId],
    );
  }
  return getExpenseCategoryById(categoryId);
}

export async function deleteExpenseCategory(categoryId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(
    `UPDATE categories SET deleted_at = ? WHERE type = ? AND id = ?`,
    [new Date().toISOString(), TYPE, categoryId],
  );
  return categoryId;
}

export async function findExpenseCategoryByName(name: string): Promise<IExpenseCategory | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<CategoryRow>(
    `SELECT id, name, description, color, is_active, created_at FROM categories WHERE type = ? AND name = ? LIMIT 1`,
    [TYPE, name],
  );
  return row ? mapRow(row) : null;
}
