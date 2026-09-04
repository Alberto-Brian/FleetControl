// ========================================
// FILE: src/lib/db/queries/expenses.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.8 — Expenses,
// o último dos 7 domínios prioritários. `expenses.queries.ts` (Drizzle/
// app.db) não tocado, fica como backup/referência.
//
// Primeiro domínio SEM nenhum seam temporário: category (via `categories`
// unificada, type='expense', cortado no Prompt 6.4), vehicle (6.3), trip
// (6.5) e driver (6.2) já vivem TODOS em powersync.db — JOINs normais em
// todos os quatro, nenhum enriquecimento cruzado com app.db necessário.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';
import { ICreateExpense, IUpdateExpense, PaymentData, IExpense } from '@/lib/types/expense';
import { expenseStatus } from '@/lib/db/schemas/expenses';

interface ExpenseRow {
  id: string; category_id: string; vehicle_id: string | null; trip_id: string | null; driver_id: string | null;
  description: string; amount: number; expense_date: string; due_date: string | null; payment_date: string | null;
  payment_method: string | null; status: string; document_number: string | null; supplier: string | null;
  notes: string | null; created_at: string;
  category_name: string | null; category_color: string | null; vehicle_license: string | null;
}

const EXPENSE_SELECT = `
  e.id, e.category_id, e.vehicle_id, e.trip_id, e.driver_id, e.description, e.amount, e.expense_date,
  e.due_date, e.payment_date, e.payment_method, e.status, e.document_number, e.supplier, e.notes, e.created_at,
  c.name as category_name, c.color as category_color, v.license_plate as vehicle_license
`;
const EXPENSE_FROM_JOIN = `
  FROM expenses e
  LEFT JOIN categories c ON c.id = e.category_id AND c.type = 'expense'
  LEFT JOIN vehicles v ON v.id = e.vehicle_id
`;

function mapRow(row: ExpenseRow): IExpense {
  return {
    id: row.id, category_id: row.category_id, vehicle_id: row.vehicle_id ?? undefined,
    trip_id: row.trip_id ?? undefined, driver_id: row.driver_id ?? undefined,
    description: row.description, amount: row.amount, expense_date: row.expense_date,
    due_date: row.due_date, payment_date: row.payment_date,
    payment_method: row.payment_method as IExpense['payment_method'], status: row.status as IExpense['status'],
    document_number: row.document_number, supplier: row.supplier, notes: row.notes, created_at: row.created_at,
    // Campos extra, mais ricos que IExpense declara — mesma situação já
    // documentada em trips/refuelings/maintenances.
    ...({ category_name: row.category_name ?? undefined, category_color: row.category_color ?? undefined,
      vehicle_license: row.vehicle_license ?? undefined } as Record<string, unknown>),
  } as IExpense;
}

export async function createExpense(expenseData: ICreateExpense): Promise<IExpense> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO expenses (
      id, organization_id, category_id, vehicle_id, trip_id, driver_id, description, amount,
      expense_date, due_date, payment_method, document_number, supplier, notes, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, expenseData.category_id, expenseData.vehicle_id ?? null, expenseData.trip_id ?? null,
      expenseData.driver_id ?? null, expenseData.description, expenseData.amount, expenseData.expense_date,
      expenseData.due_date ?? null, expenseData.payment_method ?? null, expenseData.document_number ?? null,
      expenseData.supplier ?? null, expenseData.notes ?? null, expenseStatus.PENDING, now, now,
    ],
  );

  return (await getExpenseById(id)) as IExpense;
}

export async function getAllExpenses(params: IPaginationParams = {}): Promise<IPaginatedResult<IExpense>> {
  const db = await getPowerSyncDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const filters: string[] = ['e.deleted_at IS NULL'];
  const filterParams: unknown[] = [];

  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    filters.push(`(LOWER(e.description) LIKE ? OR LOWER(e.supplier) LIKE ?)`);
    filterParams.push(s, s);
  }
  if (params.status && params.status !== 'all') { filters.push('e.status = ?'); filterParams.push(params.status); }
  if (params.category_id) { filters.push('e.category_id = ?'); filterParams.push(params.category_id); }

  const where = filters.join(' AND ');

  const totalRow = await db.get<{ total: number }>(`SELECT COUNT(*) as total ${EXPENSE_FROM_JOIN} WHERE ${where}`, filterParams);
  const total = totalRow.total;

  const rows = await db.getAll<ExpenseRow>(
    `SELECT ${EXPENSE_SELECT} ${EXPENSE_FROM_JOIN} WHERE ${where} ORDER BY e.expense_date DESC LIMIT ? OFFSET ?`,
    [...filterParams, limit, offset],
  );

  const baseFilters: string[] = ['e.deleted_at IS NULL'];
  const baseParams: unknown[] = [];
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    baseFilters.push(`(LOWER(e.description) LIKE ? OR LOWER(e.supplier) LIKE ?)`);
    baseParams.push(s, s);
  }
  const baseWhere = baseFilters.join(' AND ');

  const countsRaw = await db.getAll<{ status: string; count: number }>(
    `SELECT status, COUNT(*) as count FROM expenses e WHERE ${baseWhere} GROUP BY status`, baseParams,
  );
  const totalsRow = await db.get<{ totalAmount: number; paidAmount: number; pendingAmount: number }>(
    `SELECT COALESCE(SUM(amount),0) as totalAmount,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END),0) as paidAmount,
            COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END),0) as pendingAmount
     FROM expenses e WHERE ${baseWhere}`, baseParams,
  );

  const statusCounts: Record<string, number> = { pending: 0, paid: 0, cancelled: 0 };
  for (const row of countsRaw) statusCounts[row.status] = row.count;

  return {
    data: rows.map(mapRow),
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts: { ...statusCounts, totalAmount: totalsRow.totalAmount, paidAmount: totalsRow.paidAmount, pendingAmount: totalsRow.pendingAmount },
  };
}

export async function getExpenseById(expenseId: string): Promise<IExpense | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<ExpenseRow>(
    `SELECT ${EXPENSE_SELECT} ${EXPENSE_FROM_JOIN} WHERE e.id = ? AND e.deleted_at IS NULL LIMIT 1`,
    [expenseId],
  );
  return row ? mapRow(row) : null;
}

export async function updateExpense(expenseId: string, expenseData: IUpdateExpense): Promise<IExpense | null> {
  const db = await getPowerSyncDb();

  const updateData: Record<string, unknown> = {
    category_id: expenseData.category_id, vehicle_id: expenseData.vehicle_id ?? null,
    trip_id: expenseData.trip_id ?? null, driver_id: expenseData.driver_id ?? null,
    description: expenseData.description, amount: expenseData.amount, expense_date: expenseData.expense_date,
    due_date: expenseData.due_date ?? null, payment_method: expenseData.payment_method ?? null,
    document_number: expenseData.document_number ?? null, supplier: expenseData.supplier ?? null,
    notes: expenseData.notes ?? null,
  };

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  await db.execute(
    `UPDATE expenses SET ${setClause}, updated_at = ? WHERE id = ?`,
    [...fields.map(f => updateData[f]), new Date().toISOString(), expenseId],
  );

  return getExpenseById(expenseId);
}

export async function markAsPaid(expenseId: string, paymentData: PaymentData): Promise<IExpense | null> {
  const db = await getPowerSyncDb();
  await db.execute(
    `UPDATE expenses SET payment_date = ?, payment_method = ?, status = ?, updated_at = ? WHERE id = ?`,
    [paymentData.payment_date, paymentData.payment_method, expenseStatus.PAID, new Date().toISOString(), expenseId],
  );
  return getExpenseById(expenseId);
}

export async function deleteExpense(expenseId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(`UPDATE expenses SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), expenseId]);
  return expenseId;
}

export async function getExpensesByPeriod(startDate: string, endDate: string): Promise<IExpense[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<ExpenseRow>(
    `SELECT ${EXPENSE_SELECT} ${EXPENSE_FROM_JOIN} WHERE e.expense_date >= ? AND e.expense_date <= ? AND e.deleted_at IS NULL`,
    [startDate, endDate],
  );
  return rows.map(mapRow);
}
