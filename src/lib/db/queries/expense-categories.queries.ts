// ========================================
// FILE: src/lib/db/queries/expense-categories.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { expense_categories } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateExpenseCategory, IUpdateExpenseCategory } from '@/lib/types/expense-category';

export async function createExpenseCategory(categoryData: ICreateExpenseCategory) {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(expense_categories)
        .values({
            id,
            ...categoryData,
        })
        .returning();

    return result[0];
}

export async function getAllExpenseCategories() {
    const { db } = useDb();
    const result = await db
        .select({
            id: expense_categories.id,
            name: expense_categories.name,
            description: expense_categories.description,
            type: expense_categories.type,
            color: expense_categories.color,
            is_active: expense_categories.is_active,
            created_at: expense_categories.created_at,
        })
        .from(expense_categories)
        .where(isNull(expense_categories.deleted_at));

    return result;
}

export async function getExpenseCategoryById(categoryId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(expense_categories)
        .where(
            and(
                eq(expense_categories.id, categoryId),
                isNull(expense_categories.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateExpenseCategory(categoryId: string, categoryData: IUpdateExpenseCategory) {
    const { db } = useDb();
    const result = await db
        .update(expense_categories)
        .set({
            ...categoryData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(expense_categories.id, categoryId))
        .returning();

    return result[0];
}

export async function deleteExpenseCategory(categoryId: string) {
    const { db } = useDb();
    await db
        .update(expense_categories)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(expense_categories.id, categoryId));

    return categoryId;
}

// ✨ Helper para buscar por nome
export async function findExpenseCategoryByName(name: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(expense_categories)
        .where(eq(expense_categories.name, name))
        .limit(1);
    
    return result[0] || null;
}