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
    findVehcleCategoryByName
} from '@/lib/db/queries/vehicle_categories.queries';

import { ICreateVehicleCategory, IUpdateVehicleCategory, IVehicleCategory } from '@/lib/types/vehicle-category';

export function addVehicleCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLE_CATEGORIES, async (_) => await getAllVehicleCategories());
    ipcMain.handle(CREATE_VEHICLE_CATEGORY, async (_, data: ICreateVehicleCategory) => await createVehicleCategoryEvent(data));
    ipcMain.handle(UPDATE_VEHICLE_CATEGORY, async (_, id: string, data: IUpdateVehicleCategory) => await updateVehicleCategory(id, data));
    ipcMain.handle(DELETE_VEHICLE_CATEGORY, async (_, id: string) => await deleteVehicleCategory(id));
}

async function createVehicleCategoryEvent(data: ICreateVehicleCategory): Promise<IVehicleCategory | Error> {
    const categoryVehicleExistes = await findVehcleCategoryByName(data.name);
    if(categoryVehicleExistes) {
        throw new Error("vehicles:errors.vehicleCategoryAlreadyExists");
    }
    const client = await createVehicleCategory(data);
    return client;
}

export async function updateVehicleCategoryEvent(id: string, data: IUpdateVehicleCategory): Promise<IVehicleCategory | Error> {
    
    if(data.name){
        const categoryVehicleExistes = await findVehcleCategoryByName(data.name);
        if(categoryVehicleExistes) {
            throw new Error("vehicles:errors.vehicleCategoryAlreadyExists");
        }
    }
    const client = await updateVehicleCategory(id, data);
    return client;
}
