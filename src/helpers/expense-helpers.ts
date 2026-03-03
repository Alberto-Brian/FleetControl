// src/helpers/expenses-helpers.ts
import { ICreateExpense, IUpdateExpense, IExpense, PaymentData } from '@/lib/types/expense';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';

export async function getAllExpenses(params?: IPaginationParams): Promise<IPaginatedResult<IExpense>> {
    try {
        const result = await window._expenses.getAll(params);
        return result;
    } catch (error) {
        throw error; // ✨ Propaga
    }
}

export async function createExpense(data: ICreateExpense): Promise<IExpense> {
    try {
        const result = await window._expenses.create(data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function updateExpense(id: string, data: IUpdateExpense): Promise<IExpense> {
    try {
        const result = await window._expenses.update(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function deleteExpense(id: string): Promise<string> {
    try {
        const result = await window._expenses.delete(id);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function markAsPaid(id: string, data: PaymentData): Promise<IExpense> {
    try {
        const result = await window._expenses.markAsPaid(id, data);
        return result;
    } catch (error) {
        throw error;
    }
}

export async function getAllCategories(): Promise<any[]> {
    try {
        const result = await window._expenses.getCategories();
        return result;
    } catch (error) {
        throw error;
    }
}