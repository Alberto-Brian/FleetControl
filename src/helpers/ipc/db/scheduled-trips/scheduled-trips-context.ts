// ========================================
// FILE: src/helpers/ipc/db/scheduled-trips/scheduled-trips-context.ts
// ========================================
import {
  GET_ALL_SCHEDULED_TRIPS,
  GET_SCHEDULED_TRIP_BY_ID,
  GET_TRIPS_BY_DRIVER,
  CREATE_SCHEDULED_TRIP,
  UPDATE_SCHEDULED_TRIP,
  CANCEL_SCHEDULED_TRIP,
  RUN_TRIP_SCHEDULER,
} from './scheduled-trips-channels';
import {
  ICreateScheduledTrip,
  IUpdateScheduledTrip,
  ICancelScheduledTrip,
  IScheduledTripsPaginationParams,
} from '@/lib/types/scheduled-trip';

export function exposeScheduledTripsContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_scheduled_trips', {
    getAll:       (params?: IScheduledTripsPaginationParams) =>
                    ipcRenderer.invoke(GET_ALL_SCHEDULED_TRIPS, params),
    getById:      (id: string) =>
                    ipcRenderer.invoke(GET_SCHEDULED_TRIP_BY_ID, id),
    getByDriver:  (driverId: string) =>
                    ipcRenderer.invoke(GET_TRIPS_BY_DRIVER, driverId),
    create:       (data: ICreateScheduledTrip) =>
                    ipcRenderer.invoke(CREATE_SCHEDULED_TRIP, data),
    update:       (id: string, data: IUpdateScheduledTrip) =>
                    ipcRenderer.invoke(UPDATE_SCHEDULED_TRIP, id, data),
    cancel:       (id: string, data?: ICancelScheduledTrip) =>
                    ipcRenderer.invoke(CANCEL_SCHEDULED_TRIP, id, data),
    runScheduler: () =>
                    ipcRenderer.invoke(RUN_TRIP_SCHEDULER),
  });
}