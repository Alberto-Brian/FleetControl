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

// Fase 6, Prompt 6.8 — powersync.db passa a ser a fonte operacional
// (era app.db/Drizzle). expenses.queries.ts fica só como backup.
import {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    markAsPaid,
    getExpensesByPeriod,
} from '@/lib/db/queries/expenses.queries.powersync';

// Categories já corre em powersync.db desde o Prompt 6.4 — usar sempre a
// versão PowerSync-backed, nunca a app.db.
import { getExpenseCategoryById, getAllExpenseCategories } from "@/lib/db/queries/expense-categories.queries.powersync";

import { WarningError, NotFoundError } from "@/lib/errors/AppError";

import { ICreateExpense, IUpdateExpense, PaymentData } from '@/lib/types/expense';
import { IPaginationParams } from "@/lib/types/pagination";

// Chaves de tradução para erros
const T_ERRORS = {
  CATEGORY_NOT_FOUND: 'expenses:errors.categoryNotFound',
  CATEGORY_REQUIRED: 'common:warnings.categoryRequired',
} as const;

export function addExpensesEventListeners() {
    ipcMain.handle(GET_ALL_EXPENSES, async (_, params?: IPaginationParams) => await getAllExpenses(params || {}));
    ipcMain.handle(GET_EXPENSE_BY_ID, async (_, id: string) => await getExpenseById(id));
    ipcMain.handle(CREATE_EXPENSE, async (_, data: ICreateExpense) => await createExpenseEvent(data));
    ipcMain.handle(UPDATE_EXPENSE, async (_, id: string, data: IUpdateExpense) => await updateExpense(id, data));
    ipcMain.handle(DELETE_EXPENSE, async (_, id: string) => await deleteExpense(id));
    ipcMain.handle(MARK_AS_PAID, async (_, id: string, data: PaymentData) => await markAsPaid(id, data));
    ipcMain.handle(GET_EXPENSES_BY_PERIOD, async (_, startDate: string, endDate: string) => await getExpensesByPeriod(startDate, endDate));
    ipcMain.handle(GET_ALL_EXPENSES_CATEGORIES, async (_) => await getAllExpenseCategories());
}


async function createExpenseEvent(data: ICreateExpense) {

     if (!data.category_id) {
        throw new Error(new WarningError(T_ERRORS.CATEGORY_REQUIRED).toIpcString());
      }
    
      const categoryExists = await getExpenseCategoryById(data.category_id);
      if (!categoryExists) {
        throw new Error(new NotFoundError('expenses:errors.categoryNotFound').toIpcString());
      }

    return await createExpense(data);
}