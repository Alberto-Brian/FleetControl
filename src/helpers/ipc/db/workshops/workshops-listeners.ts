// src/helpers/ipc/db/workshops/workshops-listeners.ts (ATUALIZAR)
import { ipcMain } from "electron";
import {
    CREATE_WORKSHOP,
    GET_ALL_WORKSHOPS,
    UPDATE_WORKSHOP,
    DELETE_WORKSHOP,
    RESTORE_WORKSHOP, // ✨ NOVO
} from "./workshops-channels";

import {
    createWorkshop,
    getAllWorkshops,
    updateWorkshop,
    deleteWorkshop,
    getWorkshopById,
    findWorkshopByName
} from "@/lib/db/queries/workshops.queries";

import { getMaintenancesByWorkshop } from "@/lib/db/queries/maintenances.queries";

import { ICreateWorkshop, IUpdateWorkshop } from "@/lib/types/workshop";
import { ConflictError, NotFoundError, WarningError } from '@/lib/errors/AppError';


export function addWorkshopsEventListeners() {
    ipcMain.handle(GET_ALL_WORKSHOPS, async () => await getAllWorkshops());
    
    // ✨ CREATE com validação
    ipcMain.handle(CREATE_WORKSHOP, async (_, data: ICreateWorkshop) => {
        const workshopExists = await findWorkshopByName(data.name);
        
        if (workshopExists) {
            if (workshopExists.is_active) {
                throw new Error(
                    new ConflictError(
                        'maintenances:errors.workshopAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
            
            // ✨ Oficina inactiva - oferece restaurar
            throw new Error(
                new WarningError(
                    'maintenances:warnings.workshopExistsInactive',
                    {
                        i18n: { name: data.name },
                        duration: 10000,
                        action: {
                            label: 'maintenances:actions.activate',
                            handler: RESTORE_WORKSHOP,
                            data: { workshopId: workshopExists.id },
                            loadingLabel: 'maintenances:actions.activating',
                            successLabel: 'maintenances:workshops.toast.restored',
                            errorLabel: 'maintenances:workshops.errors.restoreFailed'
                        },
                        cancel: {
                            label: 'common:actions.cancel'
                        }
                    }
                ).toIpcString()
            );
        }
        
        return await createWorkshop(data);
    });

    // ✨ RESTORE
    ipcMain.handle(RESTORE_WORKSHOP, async (_, data: { workshopId: string }) => {
        const workshop = await getWorkshopById(data.workshopId);
        
        if (!workshop) {
            throw new Error(
                new NotFoundError('maintenances:workshops.errors.workshopNotFound').toIpcString()
            );
        }
        
        const restored = await updateWorkshop(data.workshopId, {
            is_active: true,
            updated_at: new Date().toISOString()
        } as any);
        
        return restored;
    });

    // UPDATE com validação
    ipcMain.handle(UPDATE_WORKSHOP, async (_, id: string, data: IUpdateWorkshop) => {
        const workshopExists = await getWorkshopById(id);
        
        if (!workshopExists) {
            throw new Error(
                new NotFoundError('maintenances:workshops.errors.workshopNotFound').toIpcString()
            );
        }
        
        if (data.name) {
            const otherWorkshop = await findWorkshopByName(data.name);
            
            if (otherWorkshop && otherWorkshop.id !== id) {
                throw new Error(
                    new ConflictError(
                        'maintenances:workshops.errors.workshopAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
        }
        
        return await updateWorkshop(id, data);
    });

    // DELETE com validação
    ipcMain.handle(DELETE_WORKSHOP, async (_, id: string) => {
        const workshopExists = await getWorkshopById(id);
        
        if (!workshopExists) {
            throw new Error(
                new NotFoundError('maintenances:workshops.errors.workshopNotFound').toIpcString()
            );
        }
        
        const linkedMaintenances = await getMaintenancesByWorkshop(id);
        
        if (linkedMaintenances && linkedMaintenances.length > 0) {
            const plural = linkedMaintenances.length > 1 ? 'ões' : 'ão';
            const s = linkedMaintenances.length > 1 ? 's' : '';
            throw new Error(
                new ConflictError(
                    'maintenances:workshops.errors.workshopHasMaintenances',
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
        
        return await deleteWorkshop(id);
    });
}