// ========================================
// FILE: src/lib/types/expense-category.ts
// ========================================
import { ExpenseCategoryType } from "../db/schemas/expense_categories";

export interface IExpenseCategory {
    id: string;
    name: string;
    description?: string;
    type: ExpenseCategoryType;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface ICreateExpenseCategory {
    name: string;
    description?: string;
    type: ExpenseCategoryType;
    color: string;
}

export interface IUpdateExpenseCategory {
    name?: string;
    description?: string;
    type?: ExpenseCategoryType;
    color?: string;
    is_active?: boolean;
}