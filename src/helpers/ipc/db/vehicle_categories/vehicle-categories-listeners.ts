// ========================================
// FILE: src/helpers/ipc/db/vehicle_categories/vehicle-categories-listeners.ts (ATUALIZADO)
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

// Chaves de tradução para erros
const T_ERRORS = {
    CATEGORY_NOT_FOUND: 'vehicles:errors.categoryNotFound',
    CATEGORY_EXISTS: 'vehicles:errors.categoryAlreadyExists', // Reutilizando padrão similar
    CATEGORY_EXISTS_INACTIVE: 'vehicles:warnings.categoryExistsInactive',
    CATEGORY_HAS_VEHICLES: 'vehicles:errors.categoryHasVehicles'
} as const;

export function addVehicleCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_VEHICLE_CATEGORIES, async () => await getAllVehicleCategories());
    ipcMain.handle(CREATE_VEHICLE_CATEGORY, async (_, data: ICreateVehicleCategory) => await createVehicleCategoryEvent(data));
    ipcMain.handle(UPDATE_VEHICLE_CATEGORY, async (_, id: string, data: IUpdateVehicleCategory) => await updateVehicleCategoryEvent(id, data));
    ipcMain.handle(DELETE_VEHICLE_CATEGORY, async (_, id: string) => await deleteVehicleCategoryEvent(id));
}

async function createVehicleCategoryEvent(data: ICreateVehicleCategory): Promise<IVehicleCategory | Error> {
    const categoryExists = await findVehicleCategoryByName(data.name.trim());
    
    if (categoryExists) {
        if (categoryExists.is_active) {
            throw new Error(
                new ConflictError(T_ERRORS.CATEGORY_EXISTS, {
                    i18n: { name: data.name.trim() }
                }).toIpcString()
            );
        }
        
        console.log("Chegamos até aqui")

        throw new Error(
                new WarningError(
                    'vehicles:warnings.categoryExistsInactive',
                    {
                        i18n: { name: data.name },
                        duration: 10000, // 10 segundos
                        // ✨ Configuração da acção COM LABELS
                        action: {
                            label: 'vehicles:actions.activate', // Label do botão
                            type: 'RESTORE_CATEGORY', // Tipo da acção (para o callback)
                            data: {
                                categoryId: categoryExists.id,
                                categoryName: categoryExists.name
                            },
                            // ✨ Labels para os estados do toast.promise
                            loadingLabel: 'vehicles:actions.activating', // "A activar..."
                            successLabel: 'vehicles:toast.categoryRestored', // "Categoria activada com sucesso!"
                            errorLabel: 'vehicles:errors.restoreFailed' // "Erro ao activar categoria"
                        },
                        // Botão de cancelar
                        cancel: {
                            label: 'common:actions.cancel'
                        }
                    }).toIpcString()
            );
    }
    
    return await createVehicleCategory(data);
}

export async function updateVehicleCategoryEvent(id: string, data: IUpdateVehicleCategory): Promise<IVehicleCategory | Error> {
    const categoryExists = await findVehicleCategoryById(id);
    
    if (!categoryExists) {
        throw new Error(
            new NotFoundError(T_ERRORS.CATEGORY_NOT_FOUND).toIpcString()
        );
    }
    
    if (data.name) {
        const otherCategory = await findVehicleCategoryByName(data.name);
        
        if (otherCategory && otherCategory.id !== id) {
                new ConflictError(T_ERRORS.CATEGORY_EXISTS, {
                    i18n: { name: data.name.trim() }
                })
        }
    }
    
    return await updateVehicleCategory(id, data);
}

async function deleteVehicleCategoryEvent(id: string): Promise<string | Error> {
    const categoryExists = await findVehicleCategoryById(id);
    
    if (!categoryExists) {
        throw new Error(
            new NotFoundError(T_ERRORS.CATEGORY_NOT_FOUND).toIpcString()
        );
    } 
    
    const linkedVehicles = await getVehiclesByCategory(id);
    
    if (linkedVehicles && linkedVehicles.length > 0) {
        throw new Error(
            new ConflictError(T_ERRORS.CATEGORY_HAS_VEHICLES, {
                i18n: { count: linkedVehicles.length }
            }).toIpcString()
        );
    }
    
    return await deleteVehicleCategory(id);
}