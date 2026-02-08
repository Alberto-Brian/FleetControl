// ========================================
// FILE: src/helpers/ipc/db/maintenance_categories/maintenance-categories-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_MAINTENANCE_CATEGORIES,
    CREATE_MAINTENANCE_CATEGORY,
    UPDATE_MAINTENANCE_CATEGORY,
    DELETE_MAINTENANCE_CATEGORY,
    RESTORE_MAINTENANCE_CATEGORY,
} from "./maintenance-categories-channels";

import {
    getAllMaintenanceCategories,
    createMaintenanceCategory,
    updateMaintenanceCategory,
    deleteMaintenanceCategory,
    findMaintenanceCategoryByName,
    getMaintenanceCategoryById,
    getMaintenancesByCategory,
} from '@/lib/db/queries/maintenance_categories.queries';

import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory } from '@/lib/types/maintenance_category';
import { ConflictError, NotFoundError, WarningError } from '@/lib/errors/AppError';

export function addMaintenanceCategoriesEventListeners() {
    ipcMain.handle(GET_ALL_MAINTENANCE_CATEGORIES, async () => await getAllMaintenanceCategories());
    
    // ✅ CREATE com validação de nome duplicado
    ipcMain.handle(CREATE_MAINTENANCE_CATEGORY, async (_, data: ICreateMaintenanceCategory) => {
        const categoryExists = await findMaintenanceCategoryByName(data.name);
        
        if (categoryExists) {
            if (categoryExists.is_active) {
                throw new Error(
                    new ConflictError(
                        'maintenances:errors.categoryAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
            
            // ✨ Categoria inactiva - oferece restaurar
            throw new Error(
                new WarningError(
                    'maintenances:warnings.categoryExistsInactive',
                    {
                        i18n: { name: data.name },
                        duration: 10000,
                        action: {
                            label: 'maintenances:actions.activate',
                            handler: RESTORE_MAINTENANCE_CATEGORY,
                            data: { categoryId: categoryExists.id },
                            loadingLabel: 'maintenances:actions.activating',
                            successLabel: 'maintenances:toast.categoryRestored',
                            errorLabel: 'maintenances:errors.restoreFailed'
                        },
                        cancel: {
                            label: 'common:actions.cancel'
                        }
                    }
                ).toIpcString()
            );
        }
        
        return await createMaintenanceCategory(data);
    });

    // ✨ RESTORE (activar categoria inactiva)
    ipcMain.handle(RESTORE_MAINTENANCE_CATEGORY, async (_, data: { categoryId: string }) => {
        const category = await getMaintenanceCategoryById(data.categoryId);
        
        if (!category) {
            throw new Error(
                new NotFoundError('maintenances:errors.categoryNotFound').toIpcString()
            );
        }
        
        const restored = await updateMaintenanceCategory(data.categoryId, {
            is_active: true,
            updated_at: new Date().toISOString()
        } as any);
        
        return restored;
    });

    ipcMain.handle(UPDATE_MAINTENANCE_CATEGORY, async (_, id: string, data: IUpdateMaintenanceCategory) => {
        const categoryExists = await getMaintenanceCategoryById(id);
        
        if (!categoryExists) {
            throw new Error(
                new NotFoundError('maintenances:errors.categoryNotFound').toIpcString()
            );
        }
        
        if (data.name) {
            const otherCategory = await findMaintenanceCategoryByName(data.name);
            
            if (otherCategory && otherCategory.id !== id) {
                throw new Error(
                    new ConflictError(
                        'maintenances:errors.categoryAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
        }
        
        return await updateMaintenanceCategory(id, data);
    });

    ipcMain.handle(DELETE_MAINTENANCE_CATEGORY, async (_, id: string) => {
        const categoryExists = await getMaintenanceCategoryById(id);
        
        if (!categoryExists) {
            throw new Error(
                new NotFoundError('maintenances:errors.categoryNotFound').toIpcString()
            );
        }
        
        const linkedMaintenances = await getMaintenancesByCategory(id);
        
        if (linkedMaintenances && linkedMaintenances.length > 0) {
            const plural = linkedMaintenances.length > 1 ? 'ões' : 'ão';
            const s = linkedMaintenances.length > 1 ? 's' : '';
            throw new Error(
                new ConflictError(
                    'maintenances:errors.categoryHasMaintenances',
                    { 
                        i18n: { 
                            count: linkedMaintenances.length,
                            plural,
                            s 
                        } 
                    }
                ).toIpcString()
            );
        }
        
        return await deleteMaintenanceCategory(id);
    });
}