// ========================================
// FILE: src/helpers/ipc/db/trips/trips-listeners.ts
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
    // getTripById,
    createTrip,
    completeTrip,
    cancelTrip,
    getActiveTrips,
} from '@/lib/db/queries/trips.queries';

import { ICreateTrip, ICompleteTrip } from '@/lib/types/trip';

export function addTripsEventListeners() {
    ipcMain.handle(GET_ALL_TRIPS, async (_) => await getAllTrips());
    // ipcMain.handle(GET_TRIP_BY_ID, async (_, id: string) => await getTripById(id));
    ipcMain.handle(CREATE_TRIP, async (_, data: ICreateTrip) => await createTrip(data));
    ipcMain.handle(COMPLETE_TRIP, async (_, id: string, data: ICompleteTrip) => await completeTrip(id, data));
    ipcMain.handle(CANCEL_TRIP, async (_, id: string) => await cancelTrip(id));
    ipcMain.handle(GET_ACTIVE_TRIPS, async (_) => await getActiveTrips());
}