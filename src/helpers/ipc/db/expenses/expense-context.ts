// ========================================
// FILE: src/helpers/ipc/db/expenses/expenses-context.ts
// ========================================
import {
    GET_ALL_EXPENSES,
    GET_EXPENSE_BY_ID,
    CREATE_EXPENSE,
    UPDATE_EXPENSE,
    DELETE_EXPENSE,
    MARK_AS_PAID,
    GET_EXPENSES_BY_PERIOD,
    GET_ALL_EXPENSES_CATEGORIES,
} from "./expenses-channels";

import { ICreateExpense, IUpdateExpense, PaymentData } from '@/lib/types/expense';

export function exposeExpensesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    
    contextBridge.exposeInMainWorld("_expenses", {
        getAll: () => ipcRenderer.invoke(GET_ALL_EXPENSES),
        getById: (id: string) => ipcRenderer.invoke(GET_EXPENSE_BY_ID, id),
        create: (data: ICreateExpense) => ipcRenderer.invoke(CREATE_EXPENSE, data),
        update: (id: string, data: IUpdateExpense) => ipcRenderer.invoke(UPDATE_EXPENSE, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_EXPENSE, id),
        getByPeriod: (startDate: string, endDate: string) => ipcRenderer.invoke(GET_EXPENSES_BY_PERIOD, startDate, endDate),
        markAsPaid: (id: string, data: PaymentData) => ipcRenderer.invoke(MARK_AS_PAID, id, data),
        getCategories: () => ipcRenderer.invoke(GET_ALL_EXPENSES_CATEGORIES),
    });
}