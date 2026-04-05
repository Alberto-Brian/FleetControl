// ========================================
// FILE: src/helpers/ipc/db/refuelings/refuelings-context.ts
// ========================================
import {
  GET_ALL_REFUELINGS,
  GET_REFUELING_BY_ID,
  GET_REFUELINGS_BY_VEHICLE,
  GET_REFUELINGS_BY_DRIVER,
  GET_REFUELINGS_BY_TRIP,
  GET_REFUELINGS_BY_STATION,
  GET_REFUELING_STATS,
  CREATE_REFUELING,
  UPDATE_REFUELING,
  DELETE_REFUELING,
} from './refuelings-channels';
import {
  ICreateRefueling,
  IUpdateRefueling,
  IRefuelingsPaginationParams,
} from '@/lib/types/refueling';

export function exposeRefuelingsContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_refuelings', {
    getAll: (params?: IRefuelingsPaginationParams) =>
      ipcRenderer.invoke(GET_ALL_REFUELINGS, params),

    getById: (id: string) =>
      ipcRenderer.invoke(GET_REFUELING_BY_ID, id),

    getByVehicle: (vehicleId: string) =>
      ipcRenderer.invoke(GET_REFUELINGS_BY_VEHICLE, vehicleId),

    getByDriver: (driverId: string) =>
      ipcRenderer.invoke(GET_REFUELINGS_BY_DRIVER, driverId),

    getByTrip: (tripId: string) =>
      ipcRenderer.invoke(GET_REFUELINGS_BY_TRIP, tripId),

    getByStation: (stationId: string) =>
      ipcRenderer.invoke(GET_REFUELINGS_BY_STATION, stationId),

    getStats: (params?: { from_date?: string; to_date?: string; vehicle_id?: string }) =>
      ipcRenderer.invoke(GET_REFUELING_STATS, params),

    create: (data: ICreateRefueling) =>
      ipcRenderer.invoke(CREATE_REFUELING, data),

    update: (id: string, data: IUpdateRefueling) =>
      ipcRenderer.invoke(UPDATE_REFUELING, id, data),

    remove: (id: string) =>
      ipcRenderer.invoke(DELETE_REFUELING, id),
  });
}