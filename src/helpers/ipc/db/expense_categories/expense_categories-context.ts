// src/helpers/ipc/db/maintenance-categories/maintenance-categories-context.ts
import {
    CREATE_EXPENSE_CATEGORY,
    GET_ALL_EXPENSE_CATEGORIES,
    UPDATE_EXPENSE_CATEGORY,
    DELETE_EXPENSE_CATEGORY,
    GET_EXPENSE_CATEGORY_BY_ID
} from "./expense-categories-channels";

import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory } from '@/lib/types/maintenance_category';

export function exposeExpenseCategoriesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_expense_categories", {
        create: (data: ICreateMaintenanceCategory) => ipcRenderer.invoke(CREATE_EXPENSE_CATEGORY, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_EXPENSE_CATEGORIES),
        update: (id: string, data: IUpdateMaintenanceCategory) => ipcRenderer.invoke(UPDATE_EXPENSE_CATEGORY, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_EXPENSE_CATEGORY, id),
        getById: (id: string) => ipcRenderer.invoke(GET_EXPENSE_CATEGORY_BY_ID, id),
    });
}