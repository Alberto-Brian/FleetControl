// src/helpers/ipc/db/maintenance-categories/maintenance-categories-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_MAINTENANCE_CATEGORY,
    GET_ALL_MAINTENANCE_CATEGORIES,
    GET_MAINTENANCE_CATEGORY_BY_ID,
    UPDATE_MAINTENANCE_CATEGORY,
    DELETE_MAINTENANCE_CATEGORY,
    GET_ACTIVE_MAINTENANCE_CATEGORIES,
} from "./maintenance-categories-channels";

import {
    createMaintenanceCategory,
    getAllMaintenanceCategories,
    getMaintenanceCategoryById,
    updateMaintenanceCategory,
    deleteMaintenanceCategory,
    getActiveMaintenanceCategories,
} from "@/lib/db/queries/maintenance_categories.queries";

import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory } from "@/lib/types/maintenance_category";

export function addMaintenanceCategoriesEventListeners() {
    ipcMain.handle(CREATE_MAINTENANCE_CATEGORY, async (_, data: ICreateMaintenanceCategory) => await createMaintenanceCategory(data));
    ipcMain.handle(GET_ALL_MAINTENANCE_CATEGORIES, async (_) => await getAllMaintenanceCategories());
    ipcMain.handle(GET_MAINTENANCE_CATEGORY_BY_ID, async (_, id: string) => await getMaintenanceCategoryById(id));
    ipcMain.handle(UPDATE_MAINTENANCE_CATEGORY, async (_, id: string, data: IUpdateMaintenanceCategory) => await updateMaintenanceCategory(id, data));
    ipcMain.handle(DELETE_MAINTENANCE_CATEGORY, async (_, id: string) => await deleteMaintenanceCategory(id));
    ipcMain.handle(GET_ACTIVE_MAINTENANCE_CATEGORIES, async (_) => await getActiveMaintenanceCategories());
}