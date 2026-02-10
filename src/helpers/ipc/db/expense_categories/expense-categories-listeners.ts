// ========================================
// FILE: src/helpers/ipc/db/expense-categories/expense-categories-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    CREATE_EXPENSE_CATEGORY,
    GET_ALL_EXPENSE_CATEGORIES,
    GET_EXPENSE_CATEGORY_BY_ID,
    UPDATE_EXPENSE_CATEGORY,
    DELETE_EXPENSE_CATEGORY,
    RESTORE_EXPENSE_CATEGORY,
} from "./expense-categories-channels";

import {
    createExpenseCategory,
    getAllExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
    findExpenseCategoryByName,
} from '@/lib/db/queries/expense-categories.queries';

import { ICreateExpenseCategory, IUpdateExpenseCategory } from '@/lib/types/expense-category';
import { ConflictError, NotFoundError, WarningError } from '@/lib/errors/AppError';
import { useDb } from '@/lib/db/db_helpers';
import { expenses } from '@/lib/db/schemas';
import { eq, and, isNull } from 'drizzle-orm';

// ✨ Helper para verificar despesas vinculadas
async function getExpensesByCategory(categoryId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(expenses)
        .where(and(
            eq(expenses.category_id, categoryId),
            isNull(expenses.deleted_at)
        ));
    return result;
}

export function addExpenseCategoriesEventListeners() {
    // CREATE com validação
    ipcMain.handle(CREATE_EXPENSE_CATEGORY, async (_, data: ICreateExpenseCategory) => {
        const categoryExists = await findExpenseCategoryByName(data.name);
        
        if (categoryExists) {
            if (categoryExists.is_active) {
                throw new Error(
                    new ConflictError(
                        'expenses:errors.categoryAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
            
            throw new Error(
                new WarningError(
                    'expenses:warnings.categoryExistsInactive',
                    {
                        i18n: { name: data.name },
                        duration: 10000,
                        action: {
                            label: 'expenses:actions.activate',
                            handler: RESTORE_EXPENSE_CATEGORY,
                            data: { categoryId: categoryExists.id },
                            loadingLabel: 'expenses:actions.activating',
                            successLabel: 'expenses:toast.categoryRestored',
                            errorLabel: 'expenses:errors.restoreFailed'
                        },
                        cancel: { label: 'common:actions.cancel' }
                    }
                ).toIpcString()
            );
        }
        
        return await createExpenseCategory(data);
    });

    ipcMain.handle(RESTORE_EXPENSE_CATEGORY, async (_, data: { categoryId: string }) => {
        const category = await getExpenseCategoryById(data.categoryId);
        
        if (!category) {
            throw new Error(
                new NotFoundError('expenses:errors.categoryNotFound').toIpcString()
            );
        }
        
        const restored = await updateExpenseCategory(data.categoryId, {
            is_active: true,
            updated_at: new Date().toISOString()
        } as any);
        
        return restored;
    });

    ipcMain.handle(UPDATE_EXPENSE_CATEGORY, async (_, id: string, data: IUpdateExpenseCategory) => {
        const categoryExists = await getExpenseCategoryById(id);
        
        if (!categoryExists) {
            throw new Error(
                new NotFoundError('expenses:errors.categoryNotFound').toIpcString()
            );
        }
        
        if (data.name && data.name !== categoryExists.name) {
            const nameExists = await findExpenseCategoryByName(data.name);
            if (nameExists && nameExists.id !== id) {
                throw new Error(
                    new ConflictError(
                        'expenses:errors.categoryAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
        }
        
        return await updateExpenseCategory(id, data);
    });

    ipcMain.handle(DELETE_EXPENSE_CATEGORY, async (_, id: string) => {
        const categoryExists = await getExpenseCategoryById(id);
        
        if (!categoryExists) {
            throw new Error(
                new NotFoundError('expenses:errors.categoryNotFound').toIpcString()
            );
        }
        
        const linkedExpenses = await getExpensesByCategory(id);
        
        if (linkedExpenses && linkedExpenses.length > 0) {
            const plural = linkedExpenses.length > 1 ? 's' : '';
            throw new Error(
                new ConflictError(
                    'expenses:errors.categoryHasExpenses',
                    { i18n: { count: linkedExpenses.length, plural } }
                ).toIpcString()
            );
        }
        
        return await deleteExpenseCategory(id);
    });

    ipcMain.handle(GET_ALL_EXPENSE_CATEGORIES, async (_) => await getAllExpenseCategories());
    ipcMain.handle(GET_EXPENSE_CATEGORY_BY_ID, async (_, id: string) => await getExpenseCategoryById(id));
}