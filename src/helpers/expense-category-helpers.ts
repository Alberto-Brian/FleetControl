// ========================================
// FILE: src/helpers/expense-category-helpers.ts
// ========================================
import { ICreateExpenseCategory, IUpdateExpenseCategory, IExpenseCategory } from '@/lib/types/expense-category';

export async function getAllExpenseCategories(): Promise<IExpenseCategory[]> {
    try {
        const result = await window._expense_categories.getAll();
        return result;
    } catch (error) {
        throw error; // ✨ Propaga
    }
}

export async function getExpenseCategoryById(id: string): Promise<IExpenseCategory | null> {
    try {
        const result = await window._expense_categories.getById(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function createExpenseCategory(data: ICreateExpenseCategory): Promise<IExpenseCategory> {
    try {
        const result = await window._expense_categories.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateExpenseCategory(id: string, data: IUpdateExpenseCategory): Promise<IExpenseCategory> {
    try {
        const result = await window._expense_categories.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteExpenseCategory(id: string): Promise<string> {
    try {
        const result = await window._expense_categories.delete(id);
        return result;
    } catch (error) {
        throw error;
    }
}