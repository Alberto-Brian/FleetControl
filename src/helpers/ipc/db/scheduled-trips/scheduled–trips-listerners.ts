// ========================================
// FILE: src/helpers/ipc/db/scheduled-trips/scheduled-trips-listeners.ts (ORGANIZADO)
// ========================================
import { ipcMain } from 'electron';
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
  getAllScheduledTrips,
  getScheduledTripById,
  getScheduledTripsByDriver,
  createScheduledTrip,
  updateScheduledTrip,
  cancelScheduledTrip,
  hasConflictingScheduledTrip,
} from '@/lib/db/queries/scheduled_trips.queries';
import { runTripSchedulerCycle } from '@/lib/db/schedulers/trip-scheduler';
import {
  ICreateScheduledTrip,
  IUpdateScheduledTrip,
  ICancelScheduledTrip,
  IScheduledTripsPaginationParams,
} from '@/lib/types/scheduled-trip';
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors/AppError';

// Chaves de tradução para erros
const T_ERRORS = {
  DATE_IN_PAST: 'scheduledTrips:errors.dateInPast',
  DRIVER_CONFLICT: 'scheduledTrips:errors.driverConflict',
  VEHICLE_CONFLICT: 'scheduledTrips:errors.vehicleConflict',
  NOT_FOUND: 'scheduledTrips:errors.notFound',
  CANNOT_EDIT_NON_SCHEDULED: 'scheduledTrips:errors.cannotEditNonScheduled',
} as const;

export function addScheduledTripsEventListeners() {
  ipcMain.handle(GET_ALL_SCHEDULED_TRIPS, async (_, params?: IScheduledTripsPaginationParams) => await getAllScheduledTripsEvent(params));
  ipcMain.handle(GET_SCHEDULED_TRIP_BY_ID, async (_, id: string) => await getScheduledTripByIdEvent(id));
  ipcMain.handle(GET_TRIPS_BY_DRIVER, async (_, driverId: string) => await getTripsByDriverEvent(driverId));
  ipcMain.handle(CREATE_SCHEDULED_TRIP, async (_, data: ICreateScheduledTrip) => await createScheduledTripEvent(data));
  ipcMain.handle(UPDATE_SCHEDULED_TRIP, async (_, id: string, data: IUpdateScheduledTrip) => await updateScheduledTripEvent(id, data));
  ipcMain.handle(CANCEL_SCHEDULED_TRIP, async (_, id: string, data?: ICancelScheduledTrip) => await cancelScheduledTripEvent(id, data));
  ipcMain.handle(RUN_TRIP_SCHEDULER, async () => await runTripSchedulerEvent());
}

// ── EVENT HANDLERS ─────────────────────────────────────────────────────

async function getAllScheduledTripsEvent(params?: IScheduledTripsPaginationParams) {
  return await getAllScheduledTrips(params || {});
}

async function getScheduledTripByIdEvent(id: string) {
  const result = await getScheduledTripById(id);
  if (!result) {
    throw new Error(new NotFoundError(T_ERRORS.NOT_FOUND).toIpcString());
  }
  return result;
}

async function getTripsByDriverEvent(driverId: string) {
  return await getScheduledTripsByDriver(driverId);
}

async function createScheduledTripEvent(data: ICreateScheduledTrip) {
  const today = new Date().toISOString().split('T')[0];

  // Validação: data não pode ser no passado
  if (data.scheduled_date < today) {
    throw new Error(new ValidationError(T_ERRORS.DATE_IN_PAST).toIpcString());
  }

  // Validação: conflito de motorista no mesmo dia
  const driverConflict = await hasConflictingScheduledTrip(
    data.driver_id,
    data.scheduled_date
  );
  if (driverConflict) {
    throw new Error(
      new ConflictError(T_ERRORS.DRIVER_CONFLICT, {
        i18n: { driverId: data.driver_id, date: data.scheduled_date }
      }).toIpcString()
    );
  }

  // Validação: conflito de veículo no mesmo dia
  const vehicleConflict = await hasConflictingScheduledTrip(
    undefined,
    data.scheduled_date,
    data.vehicle_id
  );
  if (vehicleConflict) {
    throw new Error(
      new ConflictError(T_ERRORS.VEHICLE_CONFLICT, {
        i18n: { vehicleId: data.vehicle_id, date: data.scheduled_date }
      }).toIpcString()
    );
  }

  const scheduledTrip = await createScheduledTrip(data);

  // Se a data é hoje → forçar ciclo do scheduler imediatamente
  if (data.scheduled_date === today) {
    runTripSchedulerCycle();
  }

  return scheduledTrip;
}

async function updateScheduledTripEvent(id: string, data: IUpdateScheduledTrip) {
  const existing = await getScheduledTripById(id);
  if (!existing) {
    throw new Error(new NotFoundError(T_ERRORS.NOT_FOUND).toIpcString());
  }

  if (existing.status !== 'scheduled') {
    throw new Error(new ValidationError(T_ERRORS.CANNOT_EDIT_NON_SCHEDULED).toIpcString());
  }

  if (data.scheduled_date) {
    const today = new Date().toISOString().split('T')[0];
    
    if (data.scheduled_date < today) {
      throw new Error(new ValidationError(T_ERRORS.DATE_IN_PAST).toIpcString());
    }

    const driverConflict = await hasConflictingScheduledTrip(
      existing.driver_id,
      data.scheduled_date,
      undefined,
      id
    );
    
    if (driverConflict) {
      throw new Error(
        new ConflictError(T_ERRORS.DRIVER_CONFLICT, {
          i18n: { driverId: existing.driver_id, date: data.scheduled_date }
        }).toIpcString()
      );
    }
  }

  return await updateScheduledTrip(id, data);
}

async function cancelScheduledTripEvent(id: string, data?: ICancelScheduledTrip) {
  const existing = await getScheduledTripById(id);
  if (!existing) {
    throw new Error(new NotFoundError(T_ERRORS.NOT_FOUND).toIpcString());
  }

  return await cancelScheduledTrip(id, data);
}

async function runTripSchedulerEvent() {
  return await runTripSchedulerCycle();
}