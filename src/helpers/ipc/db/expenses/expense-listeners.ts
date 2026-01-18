// ========================================
// FILE: src/helpers/ipc/db/expenses/expenses-listeners.ts
// ========================================
import { ipcMain } from "electron";
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

import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
    getAllExpenseCategories,
    getExpensesByPeriod,
} from '@/lib/db/queries/expenses.queries';

import { ICreateExpense, IUpdateExpense, PaymentData } from '@/lib/types/expense';

export function addExpensesEventListeners() {
    ipcMain.handle(GET_ALL_EXPENSES, async (_) => await getAllExpenses());
    ipcMain.handle(GET_EXPENSE_BY_ID, async (_, id: string) => await getExpenseById(id));
    ipcMain.handle(CREATE_EXPENSE, async (_, data: ICreateExpense) => await createExpense(data));
    ipcMain.handle(UPDATE_EXPENSE, async (_, id: string, data: IUpdateExpense) => await updateExpense(id, data));
    ipcMain.handle(DELETE_EXPENSE, async (_, id: string) => await deleteExpense(id));
    ipcMain.handle(MARK_AS_PAID, async (_, id: string, data: PaymentData) => await markAsPaid(id, data));
    ipcMain.handle(GET_EXPENSES_BY_PERIOD, async (_, startDate: string, endDate: string) => await getExpensesByPeriod(startDate, endDate));
    ipcMain.handle(GET_ALL_EXPENSES_CATEGORIES, async (_) => await getAllExpenseCategories());
}