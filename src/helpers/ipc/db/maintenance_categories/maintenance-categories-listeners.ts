// src/helpers/ipc/db/maintenance-categories/maintenance-categories-listeners.ts
import { ipcMain } from "electron";
import { GET_ALL_MAINTENANCE_CATEGORIES } from "./maintenance-categories-channels";
import { getAllMaintenanceCategories } from "@/lib/db/queries/maintenance_categories.queries";

export function addMaintenanceCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_MAINTENANCE_CATEGORIES, async (_) => await getAllMaintenanceCategories());
}