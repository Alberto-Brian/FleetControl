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
    findVehicleCategoryByName,
    findVehicleCategoryById
} from '@/lib/db/queries/vehicle_categories.queries';
import { getVehiclesByCategory } from '@/lib/db/queries/vehicles.queries';

import { ICreateVehicleCategory, IUpdateVehicleCategory, IVehicleCategory } from '@/lib/types/vehicle-category';
import { ConflictError, NotFoundError, WarningError } from '@/lib/errors/AppError';

export function addVehicleCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLE_CATEGORIES, async (_) => await getAllVehicleCategories());
    ipcMain.handle(CREATE_VEHICLE_CATEGORY, async (_, data: ICreateVehicleCategory) => await createVehicleCategoryEvent(data));
    ipcMain.handle(UPDATE_VEHICLE_CATEGORY, async (_, id: string, data: IUpdateVehicleCategory) => await updateVehicleCategoryEvent(id, data));
    ipcMain.handle(DELETE_VEHICLE_CATEGORY, async (_, id: string) => await deleteVehicleCategoryEvent(id));
}

async function createVehicleCategoryEvent(data: ICreateVehicleCategory): Promise<IVehicleCategory | Error> {
    const categoryVehicleExists = await findVehicleCategoryByName(data.name);
    
    if (categoryVehicleExists) {
        if (categoryVehicleExists.is_active) {
            // Categoria ativa já existe - erro vermelho
            throw new Error(
                new ConflictError('vehicles:errors.vehicleCategoryAlreadyExists', {
                    categoryName: data.name
                }).toIpcString()
            );
        }
        
        // Categoria existe mas está inativa - warning amarelo
        throw new Error(
            new WarningError('vehicles:warnings.vehicleCategoryAlreadyExistsWithStatusFalse', {
                categoryName: data.name,
                categoryId: categoryVehicleExists.id
            }).toIpcString()
        );
    }
    
    const category = await createVehicleCategory(data);
    return category;
}

export async function updateVehicleCategoryEvent(id: string, data: IUpdateVehicleCategory): Promise<IVehicleCategory | Error> {
    const categoryVehicleExists = await findVehicleCategoryById(id);
    if(!categoryVehicleExists) {
        throw new Error(
            new NotFoundError('categoryVehicle').toIpcString()
        )
    }
    if (data.name) {
        const categoryVehicleExists = await findVehicleCategoryByName(data.name);
        
        if (categoryVehicleExists && categoryVehicleExists.id !== id) {
            throw new Error(
                new ConflictError('vehicles:errors.vehicleCategoryAlreadyExists', {
                    categoryName: data.name
                }).toIpcString()
            );
        }
    }
    
    const category = await updateVehicleCategory(id, data);
    return category;
}

async function deleteVehicleCategoryEvent(id: string): Promise<string | Error> {
    const categoryVehicleExists = await findVehicleCategoryById(id);
    if(!categoryVehicleExists) {
        throw new Error(
            new NotFoundError('categoryVehicle').toIpcString()
        )
    } 
    
    const linkedVehicles = await getVehiclesByCategory(id);
    if (linkedVehicles && linkedVehicles.length > 0) {
        throw new Error(
            new ConflictError('vehicles:errors.categoryHasVehicles', {
                categoryId: id,
                vehicleCount: linkedVehicles.length,
                vehicleIds: linkedVehicles.map(v => v.id)
            }).toIpcString() // --> toIpcString para serializar o erro no formato esperado pelo método handleError 
        );
    }
    
    return await deleteVehicleCategory(id);
}