// src/helpers/ipc/db/fuel-stations/fuel-stations-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_FUEL_STATION,
    GET_ALL_FUEL_STATIONS,
    GET_FUEL_STATION_BY_ID,
    UPDATE_FUEL_STATION,
    DELETE_FUEL_STATION,
    RESTORE_FUEL_STATION
} from "./fuel-stations-channels";

import {
    createFuelStation,
    getAllFuelStations,
    getFuelStationById,
    updateFuelStation,
    deleteFuelStation,
} from "@/lib/db/queries/fuel_stations.queries";
import { ConflictError, NotFoundError, WarningError } from '@/lib/errors/AppError';
import { ICreateFuelStation, IUpdateFuelStation } from "@/lib/types/fuel-station";
import { findStationByName } from "@/lib/db/queries/fuel_stations.queries";
import { getRefuelingsByStation } from "@/lib/db/queries/refuelings.queries";

export function addFuelStationsEventListeners() {
    ipcMain.handle(CREATE_FUEL_STATION, async (_, data: ICreateFuelStation) => await createFuelStationEvent(data));
    ipcMain.handle(GET_ALL_FUEL_STATIONS, async (_) => await getAllFuelStations());
    ipcMain.handle(GET_FUEL_STATION_BY_ID, async (_, id: string) => await getFuelStationById(id));
    ipcMain.handle(UPDATE_FUEL_STATION, async (_, id: string, data: IUpdateFuelStation) => await updateFuelStation(id, data));
    ipcMain.handle(DELETE_FUEL_STATION, async (_, id: string) => await deleteFuelStationEvent(id));

    // CREATE com validação
    async function createFuelStationEvent(data: ICreateFuelStation) {
        const stationExists = await findStationByName(data.name);
        
        if (stationExists) {
            if (stationExists.is_active) {
                throw new Error(
                    new ConflictError(
                        'refuelings:errors.stationAlreadyExists',
                        { i18n: { name: data.name } }
                    ).toIpcString()
                );
            }
            
            // ✨ Posto inactivo - oferece restaurar
            throw new Error(
                new WarningError(
                    'refuelings:warnings.stationExistsInactive',
                    {
                        i18n: { name: data.name },
                        duration: 10000,
                        action: {
                            label: 'refuelings:actions.activate',
                            handler: RESTORE_FUEL_STATION,
                            data: { stationId: stationExists.id },
                            loadingLabel: 'refuelings:actions.activating',
                            successLabel: 'refuelings:toast.stationRestored',
                            errorLabel: 'refuelings:errors.restoreFailed'
                        },
                        cancel: {
                            label: 'common:actions.cancel'
                        }
                    }
                ).toIpcString()
            );
        }
        
        return await createFuelStation(data);
    };

    // ✨ RESTORE
    ipcMain.handle(RESTORE_FUEL_STATION, async (_, data: { stationId: string }) => {
        const station = await getFuelStationById(data.stationId);
        
        if (!station) {
            throw new Error(
                new NotFoundError('refuelings:errors.stationNotFound').toIpcString()
            );
        }
        
        const restored = await updateFuelStation(data.stationId, {
            is_active: true,
            updated_at: new Date().toISOString()
        } as any);
        
        return restored;
    });

    // DELETE com validação
    async function deleteFuelStationEvent (id: string) {
        const stationExists = await getFuelStationById(id);
        
        if (!stationExists) {
            throw new Error(
                new NotFoundError('refuelings:errors.stationNotFound').toIpcString()
            );
        }
        
        const linkedRefuelings = await getRefuelingsByStation(id);
        
        if (linkedRefuelings && linkedRefuelings.length > 0) {
            const plural = linkedRefuelings.length > 1 ? 's' : '';
            throw new Error(
                new ConflictError(
                    'refuelings:errors.stationHasRefuelings',
                    { 
                        i18n: { 
                            count: linkedRefuelings.length,
                            plural 
                        } 
                    }
                ).toIpcString()
            );
        }
        
        return await deleteFuelStation(id);
    };
}    