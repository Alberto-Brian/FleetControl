// ========================================
// FILE: src/helpers/ipc/db/refuelings/refuelings-listeners.ts
// ========================================
import { ipcMain } from 'electron';
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
  getAllRefuelings,
  getRefuelingById,
  getRefuelingsByVehicle,
  getRefuelingsByDriver,
  getRefuelingsByTrip,
  getRefuelingsByStation,
  getRefuelingStats,
  createRefueling,
  updateRefueling,
  softDeleteRefueling,
} from '@/lib/db/queries/refuelings.queries';
import {
  ICreateRefueling,
  IUpdateRefueling,
  IRefuelingsPaginationParams,
} from '@/lib/types/refueling';

export function addRefuelingsEventListeners() {

  // ── GET ALL ──────────────────────────────────────────────────────────────
  ipcMain.handle(GET_ALL_REFUELINGS, async (_, params?: IRefuelingsPaginationParams) =>
    getAllRefuelings(params || {})
  );

  // ── GET BY ID ────────────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELING_BY_ID, async (_, id: string) =>
    getRefuelingById(id)
  );

  // ── GET BY VEHICLE ───────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELINGS_BY_VEHICLE, async (_, vehicleId: string) =>
    getRefuelingsByVehicle(vehicleId)
  );

  // ── GET BY DRIVER ────────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELINGS_BY_DRIVER, async (_, driverId: string) =>
    getRefuelingsByDriver(driverId)
  );

  // ── GET BY TRIP ──────────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELINGS_BY_TRIP, async (_, tripId: string) =>
    getRefuelingsByTrip(tripId)
  );

  // ── GET BY STATION ───────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELINGS_BY_STATION, async (_, stationId: string) =>
    getRefuelingsByStation(stationId)
  );

  // ── GET STATS ────────────────────────────────────────────────────────────
  ipcMain.handle(GET_REFUELING_STATS, async (_, params?: {
    from_date?: string;
    to_date?: string;
    vehicle_id?: string;
  }) => getRefuelingStats(params || {})
  );

  // ── CREATE ───────────────────────────────────────────────────────────────
  ipcMain.handle(CREATE_REFUELING, async (_, data: ICreateRefueling) => {
    // Validação: liters > 0
    if (!data.liters || data.liters <= 0) {
      throw new Error('refuelings:errors.invalidLiters');
    }
    // Validação: price_per_liter > 0
    if (!data.price_per_liter || data.price_per_liter <= 0) {
      throw new Error('refuelings:errors.invalidPrice');
    }
    // Validação: mileage >= 0
    if (data.current_mileage < 0) {
      throw new Error('refuelings:errors.invalidMileage');
    }
    return createRefueling(data);
  });

  // ── UPDATE ───────────────────────────────────────────────────────────────
  ipcMain.handle(UPDATE_REFUELING, async (_, id: string, data: IUpdateRefueling) => {
    const existing = await getRefuelingById(id);
    if (!existing) {
      throw new Error('refuelings:errors.notFound');
    }
    // Validações dos campos editáveis
    if (data.liters !== undefined && data.liters <= 0) {
      throw new Error('refuelings:errors.invalidLiters');
    }
    if (data.price_per_liter !== undefined && data.price_per_liter <= 0) {
      throw new Error('refuelings:errors.invalidPrice');
    }
    if (data.current_mileage !== undefined && data.current_mileage < 0) {
      throw new Error('refuelings:errors.invalidMileage');
    }
    return updateRefueling(id, data);
  });

  // ── SOFT DELETE ──────────────────────────────────────────────────────────
  ipcMain.handle(DELETE_REFUELING, async (_, id: string) => {
    const existing = await getRefuelingById(id);
    if (!existing) {
      throw new Error('refuelings:errors.notFound');
    }
    return softDeleteRefueling(id);
  });
}