// ========================================
// FILE: src/helpers/ipc/db/vehicle_categories/vehicle-categories-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_VEHICLE_CATEGORIES,
    CREATE_VEHICLE_CATEGORY,
    UPDATE_VEHICLE_CATEGORY,
    DELETE_VEHICLE_CATEGORY,
} from "./vehicle-categories-channels";

import {
    getAllVehicleCategories,
    createVehicleCategory,
    updateVehicleCategory,
    deleteVehicleCategory,
} from '@/lib/db/queries/vehicle_categories.queries';

import { ICreateVehicleCategory, IUpdateVehicleCategory } from '@/lib/types/vehicle-category';

export function addVehicleCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLE_CATEGORIES, async (_) => await getAllVehicleCategories());
    ipcMain.handle(CREATE_VEHICLE_CATEGORY, async (_, data: ICreateVehicleCategory) => await createVehicleCategory(data));
    ipcMain.handle(UPDATE_VEHICLE_CATEGORY, async (_, id: string, data: IUpdateVehicleCategory) => await updateVehicleCategory(id, data));
    ipcMain.handle(DELETE_VEHICLE_CATEGORY, async (_, id: string) => await deleteVehicleCategory(id));
}