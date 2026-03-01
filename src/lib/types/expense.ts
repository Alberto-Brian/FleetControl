// ========================================
// FILE: src/lib/types/expense.ts

import { ExpenseCategoryType } from "../db/schemas/expense_categories";
import { ExpenseStatus, PaymentMethod } from "../db/schemas/expenses";

// ========================================
export interface IExpense {
    id: string;
    category_id: string;
    vehicle_id?: string;
    trip_id?: string;
    driver_id?: string;
    description: string;
    amount: number;
    expense_date: string;
    due_date: string | null;
    payment_date: string | null;
    payment_method: PaymentMethod | null;
    status: ExpenseStatus;
    document_number: string | null;
    supplier: string | null;
    notes: string | null;
    created_at: string;
}

export interface ICreateExpense {
    category_id: string;
    vehicle_id?: string;
    trip_id?: string;
    driver_id?: string;
    description: string;
    amount: number;
    expense_date: string;
    due_date?: string;
    payment_method?: PaymentMethod;
    document_number?: string;
    supplier?: string;
    notes?: string;
}

export interface IUpdateExpense {
    category_id: string;
    vehicle_id?: string;
    trip_id?: string;
    driver_id?: string;
    description: string;
    amount: number;
    expense_date: string;
    due_date?: string;
    payment_method?: PaymentMethod;
    document_number?: string;
    supplier?: string;
    notes?: string;
}

export interface IExpenseCategory {
    id: string;
    name: string;
    type: ExpenseCategoryType;
    color: string;
}

export interface PaymentData {
    payment_date: string; 
    payment_method: PaymentMethod;
}