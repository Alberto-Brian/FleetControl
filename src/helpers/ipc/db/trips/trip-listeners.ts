// ========================================
// FILE: src/helpers/ipc/db/trips/trips-listeners.ts (ATUALIZADO)
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_TRIPS,
    GET_TRIP_BY_ID,
    CREATE_TRIP,
    CANCEL_TRIP,
    GET_ACTIVE_TRIPS,
    COMPLETE_TRIP,
} from "./trips-channels";

import {
    getAllTrips,
    getTripById,
    createTrip,
    completeTrip,
    cancelTrip,
    getActiveTrips,
    isVehicleAvailable,
    isDriverAvailable,
} from '@/lib/db/queries/trips.queries';

import { ICreateTrip, ICompleteTrip } from '@/lib/types/trip';
import { NotFoundError, ValidationError } from '@/lib/errors/AppError';
import { tripStatus } from "@/lib/db/schemas/trips";

export function addTripsEventListeners() {
    ipcMain.handle(GET_ALL_TRIPS, async (_) => await getAllTrips());
    
    ipcMain.handle(GET_TRIP_BY_ID, async (_, id: string) => await getTripById(id));
    
    ipcMain.handle(GET_ACTIVE_TRIPS, async (_) => await getActiveTrips());

    // ✅ CREATE com validações
    ipcMain.handle(CREATE_TRIP, async (_, data: ICreateTrip) => {
        try {
            // Validação: veículo disponível
            const vehicleAvailable = await isVehicleAvailable(data.vehicle_id);
            if (!vehicleAvailable) {
                throw new ValidationError(
                    'trips:errors.vehicleNotAvailable',{
                        duration: 400
                    }
                );
            }

            // Validação: motorista disponível
            const driverAvailable = await isDriverAvailable(data.driver_id);
            if (!driverAvailable) {
                throw new ValidationError(
                    'trips:errors.driverNotAvailable',
                );
            }

            // Validação: rota OU origem/destino manual
            if (!data.route_id && (!data.origin || !data.destination)) {
                throw new ValidationError(
                    'trips:errors.originDestinationRequired',
                );
            }

            return await createTrip(data);
        } catch (error) {
            throw error;
        }
    });

    // ✅ COMPLETE com validações
    ipcMain.handle(COMPLETE_TRIP, async (_, id: string, data: ICompleteTrip) => {
        try {
            const tripExists = await getTripById(id);
            if(!tripExists){
                throw new NotFoundError('trips:errors.tripNotFound').toIpcString()
            }

            if(tripExists.status !== tripStatus.IN_PROGRESS){
                throw new ValidationError('trips:validation.tripNotInProgress').toIpcString();
            }

            return await completeTrip(id, data);
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle(CANCEL_TRIP, async (_, id: string) => {
        try {

             const tripExists = await getTripById(id);
            if(!tripExists){
                throw new NotFoundError('trips:errors.tripNotFound').toIpcString()
            }

            if(tripExists.status !== tripStatus.IN_PROGRESS){
                throw new ValidationError('trips:validation.tripNotInProgress').toIpcString();
            }
            
            return await cancelTrip(id);
        } catch (error) {
            throw error;
        }
    });
}