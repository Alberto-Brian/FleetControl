// ========================================
// FILE: src/helpers/expenses-helpers.ts
// ========================================
import { ICreateExpense, IUpdateExpense, IExpense, PaymentData } from '@/lib/types/expense';

export async function getAllExpenses(): Promise<IExpense[]> {
    try {
        const result = await window._expenses.getAll();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getExpenseById(id: string): Promise<IExpense | null> {
    try {
        const result = await window._expenses.getById(id);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createExpense(data: ICreateExpense): Promise<IExpense | null> {
    try {
        const result = await window._expenses.create(data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function updateExpense(id: string, data: IUpdateExpense): Promise<IExpense | null> {
    try {
        const result = await window._expenses.update(id, data);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function deleteExpense(id: string): Promise<string | null> {
    try {
        const result = await window._expenses.delete(id);
        return result as string;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function markAsPaid(id: string, data: PaymentData): Promise<IExpense | Error> {
    try {
        const result = await window._expenses.markAsPaid(id, data);
        return result;
    } catch (error: any) {
        console.error(error);
        throw new Error("Erro ao marcar como pago: ", error);
    }
}
export async function getByPeriod(startDate: string, endDate: string): Promise<IExpense[]> {
    try {
        const result = await window._expenses.getByPeriod(startDate, endDate);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getAllCategories(): Promise<IExpense[]> {
    try {
        const result = await window._expenses.getCategories();
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}