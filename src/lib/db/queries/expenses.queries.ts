// ========================================
// FILE: src/lib/db/queries/expenses_queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { expenses, expense_categories, vehicles } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, gte, lte, or, sql, count, SQL, like } from 'drizzle-orm';
import { ICreateExpense, IUpdateExpense, PaymentData } from '@/lib/types/expense';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';

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

export async function getAllExpenses(params: IPaginationParams = {}): Promise<IPaginatedResult<IExpense>> {
    const { db } = useDb();

    const page   = params.page  || 1;
    const limit  = params.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [isNull(expenses.deleted_at)];

    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        conditions.push(or(
            like(expenses.description, s),
            like(expenses.supplier,    s),
        )!);
    }
    if (params.status && params.status !== 'all') {
        conditions.push(eq(expenses.status, params.status));
    }
    // Filtro por categoria via params.filter
    if (params.category_id) {
        conditions.push(eq(expenses.category_id, params.category_id));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const selectFields = {
        id:             expenses.id,
        category_id:    expenses.category_id,
        category_name:  expense_categories.name,
        category_color: expense_categories.color,
        vehicle_license: vehicles.license_plate,
        description:    expenses.description,
        amount:         expenses.amount,
        expense_date:   expenses.expense_date,
        due_date:       expenses.due_date,
        payment_date:   expenses.payment_date,
        payment_method: expenses.payment_method,
        status:         expenses.status,
        supplier:       expenses.supplier,
        created_at:     expenses.created_at,
    };

    const [{ total }] = await db
        .select({ total: count() })
        .from(expenses)
        .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
        .leftJoin(vehicles,           eq(expenses.vehicle_id,  vehicles.id))
        .where(whereClause);

    const data = await db
        .select(selectFields)
        .from(expenses)
        .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
        .leftJoin(vehicles,           eq(expenses.vehicle_id,  vehicles.id))
        .where(whereClause)
        .orderBy(desc(expenses.expense_date))
        .limit(limit)
        .offset(offset);

    // Counts por status (base sem filtro de status/categoria)
    const baseConditions: SQL[] = [isNull(expenses.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        baseConditions.push(or(
            like(expenses.description, s),
            like(expenses.supplier,    s),
        )!);
    }
    const baseWhere = baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    const countsRaw = await db
        .select({ status: expenses.status, count: count() })
        .from(expenses)
        .where(baseWhere)
        .groupBy(expenses.status);

    const [totals] = await db
        .select({
            totalAmount:  sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
            paidAmount:   sql<number>`COALESCE(SUM(CASE WHEN ${expenses.status} = 'paid'    THEN ${expenses.amount} ELSE 0 END), 0)`,
            pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN ${expenses.status} = 'pending' THEN ${expenses.amount} ELSE 0 END), 0)`,
        })
        .from(expenses)
        .where(baseWhere);

    const statusCounts: Record<string, number> = { pending: 0, paid: 0, cancelled: 0 };
    for (const row of countsRaw) {
        statusCounts[row.status] = row.count;
    }

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages:  Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
        statusCounts: {
            ...statusCounts,
            totalAmount:   totals?.totalAmount   ?? 0,
            paidAmount:    totals?.paidAmount     ?? 0,
            pendingAmount: totals?.pendingAmount  ?? 0,
        },
    };
}

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
