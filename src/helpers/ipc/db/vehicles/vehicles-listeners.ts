// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/vehicles/vehicles-listeners.ts
// ========================================
import { ipcMain } from "electron";
import axios from "axios";
import {
  GET_ALL_VEHICLES,
  GET_VEHICLE_BY_ID,
  CREATE_VEHICLE,
  UPDATE_VEHICLE,
  DELETE_VEHICLE,
  GET_AVAILABLE_VEHICLES,
  UPDATE_VEHICLE_STATUS,
  UPDATE_VEHICLE_MILEAGE,
  GET_VEHICLES_BY_CATEGORY,
  COUNT_VEHICLES_BY_STATUS,
} from "./vehicles-channels";

import {
  getAllVehicles,
  findVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  updateVehicleStatus,
  updateVehicleMileage,
  getVehiclesByCategory,
  countVehiclesByStatus,
  findVehicleByLicensePlate,
} from '@/lib/db/queries/vehicles.queries';

import { IPaginationParams } from "@/lib/types/pagination";

import {
  findVehicleCategoryById
} from '@/lib/db/queries/vehicle_categories.queries'

import { ICreateVehicle, IUpdateStatus, IUpdateVehicle } from '@/lib/types/vehicle';
import { ConflictError, NotFoundError, WarningError } from "@/lib/errors/AppError";
import { vehicleStatus } from "@/lib/db/schemas/vehicles";
import { getStoredApiToken } from "@/helpers/ipc/services/auth/token-store";

const API_URL = process.env.API_URL || 'http://localhost:3001';

function apiHeaders() {
  const token = getStoredApiToken();
  if (!token) throw new Error('Sem token de autenticação — activa a licença primeiro');
  return { Authorization: `Bearer ${token}` };
}

// Chaves de tradução para erros
const T_ERRORS = {
  VEHICLE_NOT_FOUND: 'vehicles:errors.vehicleNotFound',
  CATEGORY_NOT_FOUND: 'vehicles:errors.categoryNotFound',
  VEHICLE_EXISTS: 'vehicles:errors.vehicleWithSamePlate',
  VEHICLE_IN_USE: 'vehicles:errors.vehicleInUse',
  CATEGORY_REQUIRED: 'common:warnings.categoryRequired',
  LICENSE_PLATE_REQUIRED: 'common:warnings.licensePlateRequired',
  NO_AVAILABLE_VEHICLES: 'vehicles:warnings.noAvailableVehicles'
} as const;

export function addVehiclesEventListeners() {
  ipcMain.handle(GET_ALL_VEHICLES, async (_, params?: IPaginationParams) => await getAllVehiclesEvent(params));
  ipcMain.handle(GET_VEHICLE_BY_ID, async (_, vehicleId: string) => await getVehicleByIdEvent(vehicleId));
  ipcMain.handle(CREATE_VEHICLE, async (_, vehicleData: ICreateVehicle) => await createVehicleEvent(vehicleData));
  ipcMain.handle(UPDATE_VEHICLE, async (_, vehicleId: string, vehicleData: IUpdateVehicle) => await updateVehicleEvent(vehicleId, vehicleData));
  ipcMain.handle(DELETE_VEHICLE, async (_, vehicleId: string) => await deleteVehicleEvent(vehicleId));
  ipcMain.handle(GET_AVAILABLE_VEHICLES, async () => await getAvailableVehiclesEvent());
  ipcMain.handle(UPDATE_VEHICLE_STATUS, async (_, vehicleId: string, data: IUpdateStatus) => await updateVehicleStatusEvent(vehicleId, data));
  ipcMain.handle(UPDATE_VEHICLE_MILEAGE, async (_, vehicleId: string, mileage: number) => await updateVehicleMileageEvent(vehicleId, mileage));
  ipcMain.handle(GET_VEHICLES_BY_CATEGORY, async (_, categoryId: string) => await getVehiclesByCategoryEvent(categoryId));
  ipcMain.handle(COUNT_VEHICLES_BY_STATUS, async () => await countVehiclesByStatusEvent());
}

async function getAllVehiclesEvent(params?: IPaginationParams) {
  return await getAllVehicles(params || {});
}

async function getVehicleByIdEvent(vehicleId: string) {
  const result = await findVehicleById(vehicleId);
  if (!result) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }
  return result;
}

async function createVehicleEvent(vehicleData: ICreateVehicle) {
  if (!vehicleData.category_id) {
    throw new Error(new WarningError(T_ERRORS.CATEGORY_REQUIRED).toIpcString());
  }

  const categoryExists = await findVehicleCategoryById(vehicleData.category_id);
  if (!categoryExists) {
    throw new Error(new NotFoundError(T_ERRORS.CATEGORY_NOT_FOUND).toIpcString());
  }

  if (!vehicleData.license_plate) {
    throw new Error(new WarningError(T_ERRORS.LICENSE_PLATE_REQUIRED).toIpcString());
  }

  const vehicleExists = await findVehicleByLicensePlate(vehicleData.license_plate);
  if (vehicleExists) {
    throw new Error(
      new ConflictError(T_ERRORS.VEHICLE_EXISTS, {
        i18n: { plate: vehicleData.license_plate }
      }).toIpcString()
    );
  }

  // Cadastrar na nuvem
  if (vehicleData.createTraccarDevice) {
    await axios.post(`${API_URL}/api/vehicles`, {
      license_plate: vehicleData.license_plate,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      color: vehicleData.color,
      chassis_number: vehicleData.chassis_number,
      engine_number: vehicleData.engine_number,
      fuel_tank_capacity: vehicleData.fuel_tank_capacity,
      tire_size: vehicleData.tire_size,
      current_mileage: vehicleData.current_mileage,
      acquisition_date: vehicleData.acquisition_date,
      acquisition_value: vehicleData.acquisition_value,
      photo: vehicleData.photo,
      notes: vehicleData.notes,
      createTraccarDevice: true,
      traccarDevice: {
        name: vehicleData.traccarDevice?.name || `${vehicleData.license_plate} - ${vehicleData.brand} ${vehicleData.model}`,
        uniqueId: vehicleData.traccarDevice?.uniqueId || vehicleData.license_plate,
        attributes: vehicleData.traccarDevice?.attributes,
      },
    }, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
  }

  return await createVehicle(vehicleData);
}

async function updateVehicleEvent(vehicleId: string, vehicleData: IUpdateVehicle) {
  const vehicleExists = await findVehicleById(vehicleId);
  if (!vehicleExists) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }

  if (vehicleData.category_id) {
    const categoryExists = await findVehicleCategoryById(vehicleData.category_id);
    if (!categoryExists) {
      throw new Error(new NotFoundError(T_ERRORS.CATEGORY_NOT_FOUND).toIpcString());
    }
  }

  if (vehicleData.license_plate) {
    const other = await findVehicleByLicensePlate(vehicleData.license_plate);
    if (other && other.id !== vehicleId) {
      throw new Error(
        new ConflictError(T_ERRORS.VEHICLE_EXISTS, {
          i18n: { plate: vehicleData.license_plate }
        }).toIpcString()
      );
    }
  }

  return await updateVehicle(vehicleId, vehicleData);
}

async function deleteVehicleEvent(vehicleId: string) {
  const vehicleExists = await findVehicleById(vehicleId);
  if (!vehicleExists) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }

  if(vehicleExists.status === vehicleStatus.IN_USE) {
    throw new Error(
      new ConflictError(T_ERRORS.VEHICLE_IN_USE, {
        i18n: { plate: vehicleExists.license_plate }
      }).toIpcString()
    );
  }

  return await deleteVehicle(vehicleId);
}

async function getAvailableVehiclesEvent() {
  const result = await getAvailableVehicles();
  if (result.length === 0) {
    throw new Error(new WarningError(T_ERRORS.NO_AVAILABLE_VEHICLES).toIpcString());
  }
  return result;
}

async function updateVehicleStatusEvent(vehicleId: string, data: IUpdateStatus) {
  const vehicleExists = await findVehicleById(vehicleId);
  if (!vehicleExists) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }
  return await updateVehicleStatus(vehicleId, data);
}

async function updateVehicleMileageEvent(vehicleId: string, mileage: number) {
  const vehicleExists = await findVehicleById(vehicleId);
  if (!vehicleExists) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }
  return await updateVehicleMileage(vehicleId, mileage);
}

async function getVehiclesByCategoryEvent(categoryId: string) {
  return await getVehiclesByCategory(categoryId);
}

async function countVehiclesByStatusEvent() {
  return await countVehiclesByStatus();
}
