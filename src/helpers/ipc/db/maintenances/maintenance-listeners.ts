// ========================================
// FILE: src/helpers/ipc/db/maintenances/maintenances-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_MAINTENANCES,
    GET_MAINTENANCE_BY_ID,
    CREATE_MAINTENANCE,
    UPDATE_MAINTENANCE,
    COMPLETE_MAINTENANCE,
    DELETE_MAINTENANCE,
    GET_ACTIVE_MAINTENANCES,
    GET_MAINTENANCE_CATEGORIES,
    GET_WORKSHOPS,
} from "./maintenances-channels";

import {
    getAllMaintenances,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    completeMaintenance,
    deleteMaintenance,
    getActiveMaintenances,
} from '@/lib/db/queries/maintenances.queries';

import { getAllMaintenanceCategories } from '@/lib/db/queries/maintenance_categories.queries';
import { getAllWorkshops } from '@/lib/db/queries/workshops.queries';

import { ICreateMaintenance, IUpdateMaintenance } from '@/lib/types/maintenance';

export function addMaintenancesEventListeners() {
    ipcMain.handle(GET_ALL_MAINTENANCES, async (_) => await getAllMaintenances());
    ipcMain.handle(GET_MAINTENANCE_BY_ID, async (_, id: string) => await getMaintenanceById(id));
    ipcMain.handle(CREATE_MAINTENANCE, async (_, data: ICreateMaintenance) => await createMaintenance(data));
    ipcMain.handle(UPDATE_MAINTENANCE, async (_, id: string, data: IUpdateMaintenance) => await updateMaintenance(id, data));
    ipcMain.handle(COMPLETE_MAINTENANCE, async (_, id: string, data: IUpdateMaintenance) => await completeMaintenance(id, data));
    ipcMain.handle(DELETE_MAINTENANCE, async (_, id: string) => await deleteMaintenance(id));
    ipcMain.handle(GET_ACTIVE_MAINTENANCES, async (_) => await getActiveMaintenances());
    ipcMain.handle(GET_MAINTENANCE_CATEGORIES, async (_) => await getAllMaintenanceCategories());
    ipcMain.handle(GET_WORKSHOPS, async (_) => await getAllWorkshops());
}