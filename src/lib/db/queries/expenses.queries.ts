// ========================================
// FILE: src/lib/db/queries/expenses_queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { expenses, expense_categories, vehicles } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, gte, lte } from 'drizzle-orm';
import { ICreateExpense, IUpdateExpense, PaymentData } from '@/lib/types/expense';

export async function createExpense(expenseData: ICreateExpense) {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(expenses)
        .values({
            id,
            status: 'pending',
            ...expenseData,
        })
        .returning();

    return result[0];
}

export async function getAllExpenses() {
    const { db } = useDb();
    const result = await db
        .select({
            id: expenses.id,
            category_id: expenses.category_id,
            category_name: expense_categories.name,
            category_color: expense_categories.color,
            vehicle_license: vehicles.license_plate,
            description: expenses.description,
            amount: expenses.amount,
            expense_date: expenses.expense_date,
            due_date: expenses.due_date,
            payment_date: expenses.payment_date,
            payment_method: expenses.payment_method,
            status: expenses.status,
            supplier: expenses.supplier,
            created_at: expenses.created_at,
        })
        .from(expenses)
        .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
        .leftJoin(vehicles, eq(expenses.vehicle_id, vehicles.id))
        .where(isNull(expenses.deleted_at))
        .orderBy(desc(expenses.expense_date));

    return result;
};

export async function getExpenseById(expenseId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(expenses)
        .where(
            and(
                eq(expenses.id, expenseId),
                isNull(expenses.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateExpense(expenseId: string, expenseData: IUpdateExpense) {
    const { db } = useDb();
    const result = await db
        .update(expenses)
        .set({
            ...expenseData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(expenses.id, expenseId))
        .returning();

    return result[0];
}

export async function markAsPaid(expenseId: string, paymentData: PaymentData) {
    const { db } = useDb();
    const result = await db
        .update(expenses)
        .set({
            payment_date: paymentData.payment_date,
            payment_method: paymentData.payment_method,
            status: 'paid',
            updated_at: new Date().toISOString(),
        })
        .where(eq(expenses.id, expenseId))
        .returning();

    return result[0];
}

export async function deleteExpense(expenseId: string) {
    const { db } = useDb();
    await db
        .update(expenses)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(expenses.id, expenseId));

    return expenseId;
}

export async function getExpensesByPeriod(startDate: string, endDate: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(expenses)
        .where(
            and(
                gte(expenses.expense_date, startDate),
                lte(expenses.expense_date, endDate),
                isNull(expenses.deleted_at)
            )
        );

    return result;
}

export async function getAllExpenseCategories() {
    const { db } = useDb();
    const result = await db
        .select({
            id: expense_categories.id,
            name: expense_categories.name,
            type: expense_categories.type,
            color: expense_categories.color,
        })
        .from(expense_categories)
        .where(isNull(expense_categories.deleted_at));

    return result;
}
