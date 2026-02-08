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

import { ICreateMaintenance, IUpdateMaintenance } from '@/lib/types/maintenance';
import { ValidationError, NotFoundError } from '@/lib/errors/AppError';

export function addMaintenancesEventListeners() {
    ipcMain.handle(GET_ALL_MAINTENANCES, async () => await getAllMaintenances());
    
    ipcMain.handle(GET_MAINTENANCE_BY_ID, async (_, id: string) => await getMaintenanceById(id));
    
    ipcMain.handle(GET_ACTIVE_MAINTENANCES, async () => await getActiveMaintenances());

    // ✅ CREATE com validações
    ipcMain.handle(CREATE_MAINTENANCE, async (_, data: ICreateMaintenance) => {
        try {
            // Validação: campos obrigatórios
            if (!data.vehicle_id) {
                throw new ValidationError('maintenances:validation.vehicleRequired', 'validation');
            }

            if (!data.category_id) {
                throw new ValidationError('maintenances:validation.categoryRequired', 'validation');
            }

            if (!data.type) {
                throw new ValidationError('maintenances:validation.typeRequired', 'validation');
            }

            if (!data.description || data.description.trim() === '') {
                throw new ValidationError('maintenances:validation.descriptionRequired', 'validation');
            }

            if (!data.vehicle_mileage || data.vehicle_mileage <= 0) {
                throw new ValidationError('maintenances:validation.mileagePositive', 'validation');
            }

            return await createMaintenance(data);
        } catch (error) {
            throw error;
        }
    });

    // ✅ UPDATE
    ipcMain.handle(UPDATE_MAINTENANCE, async (_, id: string, data: IUpdateMaintenance) => {
        try {
            return await updateMaintenance(id, data);
        } catch (error) {
            throw error;
        }
    });

    // ✅ COMPLETE
    ipcMain.handle(COMPLETE_MAINTENANCE, async (_, id: string, data: IUpdateMaintenance) => {
        try {
            return await completeMaintenance(id, data);
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle(DELETE_MAINTENANCE, async (_, id: string) => {
        try {
            return await deleteMaintenance(id);
        } catch (error) {
            throw error;
        }
    });
}