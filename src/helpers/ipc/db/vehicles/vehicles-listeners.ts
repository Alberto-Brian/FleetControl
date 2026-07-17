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
  SYNC_VEHICLE_TO_API,
  REGISTER_GPS_ON_VEHICLE,
  UNREGISTER_GPS_FROM_VEHICLE,
  TOGGLE_VEHICLE_TRACKING,
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
import { vehicleStatus, vehicles } from "@/lib/db/schemas/vehicles";
import { useDb } from '@/lib/db/db_helpers';
import { eq } from 'drizzle-orm';
import { getStoredApiToken } from "@/helpers/ipc/services/auth/token-store";

const API_URL = process.env.API_URL || 'http://localhost:3001';

function apiHeaders() {
  const token = getStoredApiToken();
  if (!token) throw new Error('Sem token de autenticação — activa a licença primeiro');
  return { Authorization: `Bearer ${token}` };
}

// Chaves de tradução para erros
const T_ERRORS = {
  VEHICLE_NOT_FOUND:         'vehicles:errors.vehicleNotFound',
  CATEGORY_NOT_FOUND:        'vehicles:errors.categoryNotFound',
  VEHICLE_EXISTS:            'vehicles:errors.vehicleWithSamePlate',
  VEHICLE_IN_USE:            'vehicles:errors.vehicleInUse',
  CATEGORY_REQUIRED:         'common:warnings.categoryRequired',
  LICENSE_PLATE_REQUIRED:    'common:warnings.licensePlateRequired',
  NO_AVAILABLE_VEHICLES:     'vehicles:warnings.noAvailableVehicles',
  IMEI_REQUIRES_CONNECTED:   'vehicles:errors.imeiRequiresConnected',
  IMEI_ALREADY_EXISTS:       'vehicles:errors.imeiAlreadyExists',
  TRACCAR_UNAVAILABLE:       'vehicles:errors.traccarUnavailable',
  TRACCAR_ERROR:             'vehicles:errors.traccarError',
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
  ipcMain.handle(SYNC_VEHICLE_TO_API,     async (_, vehicleId: string, imei?: string) => await syncVehicleToApiEvent(vehicleId, imei));
  ipcMain.handle(REGISTER_GPS_ON_VEHICLE, async (_, vehicleId: string, imei: string)  => await registerGpsOnVehicleEvent(vehicleId, imei));

  ipcMain.handle(UNREGISTER_GPS_FROM_VEHICLE, async (_, vehicleId: string) => {
    const token = getStoredApiToken();
    if (!token) throw new Error('Sem token de autenticação');

    const response = await axios.post(
      `${API_URL}/api/vehicles/${vehicleId}/unregister-gps`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status !== 200) throw new Error('Erro ao remover GPS na API');

    const { db } = useDb();
    await db.update(vehicles)
      .set({ traccar_unique_id: null, updated_at: new Date().toISOString() })
      .where(eq(vehicles.id, vehicleId));

    return { success: true };
  });

  ipcMain.handle(TOGGLE_VEHICLE_TRACKING, async (_, vehicleId: string, enabled: boolean) => {
    const token = getStoredApiToken();
    if (!token) throw new Error('Sem token de autenticação');

    const response = await axios.patch(
      `${API_URL}/api/vehicles/${vehicleId}/tracking`,
      { tracking_enabled: enabled },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    if (response.status !== 200) throw new Error('Erro ao actualizar rastreamento na API');

    const { db } = useDb();
    await db.update(vehicles)
      .set({ tracking_enabled: enabled, updated_at: new Date().toISOString() })
      .where(eq(vehicles.id, vehicleId));

    return { success: true };
  });
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

  const hasImei  = !!vehicleData.traccar_unique_id?.trim();
  const token    = getStoredApiToken();
  const { db }   = useDb();

  // ── Com IMEI: fluxo transaccional ─────────────────────────────────────────
  // O IMEI só pode ser registado se houver ligação à API (modo conectado),
  // pois requer a criação do device no Traccar. Se falhar, o veículo não é criado.
  if (hasImei) {
    if (!token) {
      throw new Error(new WarningError(T_ERRORS.IMEI_REQUIRES_CONNECTED).toIpcString());
    }

    // 1. Criar localmente (provisório)
    const localVehicle = await createVehicle(vehicleData);

    // 2. Tentar registar na API (que inclui criação do device Traccar)
    try {
      const { data: apiResponse } = await axios.post(`${API_URL}/api/vehicles`, {
        license_plate:      vehicleData.license_plate,
        brand:              vehicleData.brand,
        model:              vehicleData.model,
        year:               vehicleData.year,
        color:              vehicleData.color,
        chassis_number:     vehicleData.chassis_number,
        engine_number:      vehicleData.engine_number,
        fuel_tank_capacity: vehicleData.fuel_tank_capacity,
        tire_size:          vehicleData.tire_size,
        current_mileage:    vehicleData.current_mileage,
        acquisition_date:   vehicleData.acquisition_date,
        acquisition_value:  vehicleData.acquisition_value,
        photo:              vehicleData.photo,
        notes:              vehicleData.notes,
        traccar_unique_id:  vehicleData.traccar_unique_id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20_000,
      });

      // Sucesso: gravar api_vehicle_id localmente
      if (apiResponse?.data?.id) {
        await db.update(vehicles)
          .set({ api_vehicle_id: apiResponse.data.id, api_synced_at: new Date().toISOString() })
          .where(eq(vehicles.id, localVehicle.id));
        return { ...localVehicle, api_vehicle_id: apiResponse.data.id };
      }
      return localVehicle;

    } catch (err: any) {
      // Rollback local — o veículo não deve existir se o IMEI não foi registado
      try {
        await db.delete(vehicles).where(eq(vehicles.id, localVehicle.id));
      } catch (rollbackErr) {
        console.error('[Vehicles] Falha no rollback local:', rollbackErr);
      }

      // Mapear erro da API para mensagem i18n apropriada
      const status  = err?.response?.status as number | undefined;
      const apiMsg  = (err?.response?.data?.message as string | undefined) ?? '';
      const isConflict = status === 409 || apiMsg.toLowerCase().includes('imei');
      const isUnavailable = !err?.response || err?.code === 'ECONNREFUSED'
        || err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT' || status === 503;

      if (isConflict) {
        throw new Error(new ConflictError(T_ERRORS.IMEI_ALREADY_EXISTS).toIpcString());
      }
      if (isUnavailable) {
        throw new Error(new WarningError(T_ERRORS.TRACCAR_UNAVAILABLE).toIpcString());
      }
      throw new Error(new WarningError(T_ERRORS.TRACCAR_ERROR).toIpcString());
    }
  }

  // ── Sem IMEI: guardar localmente + sync best-effort ───────────────────────
  const localVehicle = await createVehicle(vehicleData);

  if (token) {
    try {
      const { data: apiResponse } = await axios.post(`${API_URL}/api/vehicles`, {
        license_plate:      vehicleData.license_plate,
        brand:              vehicleData.brand,
        model:              vehicleData.model,
        year:               vehicleData.year,
        color:              vehicleData.color,
        chassis_number:     vehicleData.chassis_number,
        engine_number:      vehicleData.engine_number,
        fuel_tank_capacity: vehicleData.fuel_tank_capacity,
        tire_size:          vehicleData.tire_size,
        current_mileage:    vehicleData.current_mileage,
        acquisition_date:   vehicleData.acquisition_date,
        acquisition_value:  vehicleData.acquisition_value,
        photo:              vehicleData.photo,
        notes:              vehicleData.notes,
        traccar_unique_id:  null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15_000,
      });

      if (apiResponse?.data?.id) {
        await db.update(vehicles)
          .set({ api_vehicle_id: apiResponse.data.id, api_synced_at: new Date().toISOString() })
          .where(eq(vehicles.id, localVehicle.id));
        return { ...localVehicle, api_vehicle_id: apiResponse.data.id };
      }
    } catch (err: any) {
      console.warn('[Vehicles] Sync API sem IMEI falhou (best-effort):', err?.message ?? err);
    }
  }

  return localVehicle;
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

// Regista um IMEI num veículo já sincronizado com a API (sem GPS configurado)
async function registerGpsOnVehicleEvent(vehicleId: string, imei: string) {
  const vehicle = await findVehicleById(vehicleId);
  if (!vehicle) throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());

  if (!imei?.trim()) throw new Error('IMEI é obrigatório');

  try {
    await axios.post(`${API_URL}/api/vehicles/${vehicleId}/register-gps`, {
      traccar_unique_id: imei.trim(),
    }, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      throw new Error(err.response.data?.message ?? 'IMEI já registado');
    }
    throw err;
  }

  const { db } = useDb();
  await db.update(vehicles)
    .set({ traccar_unique_id: imei.trim() })
    .where(eq(vehicles.id, vehicleId));

  return await findVehicleById(vehicleId);
}

// Sincroniza um veículo local com a API (quando a licença conectada é activada)
// imei: IMEI fornecido pelo utilizador no momento do sync (sobrepõe o valor guardado localmente)
async function syncVehicleToApiEvent(vehicleId: string, imei?: string) {
  const vehicle = await findVehicleById(vehicleId);
  if (!vehicle) {
    throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());
  }

  if (vehicle.api_vehicle_id) {
    return vehicle;
  }

  // IMEI: usa o fornecido agora > o guardado localmente > null
  const traccar_unique_id = imei?.trim() || vehicle.traccar_unique_id || null;

  let apiResponse: any;
  try {
    const { data } = await axios.post(`${API_URL}/api/vehicles`, {
      license_plate:      vehicle.license_plate,
      brand:              vehicle.brand,
      model:              vehicle.model,
      year:               vehicle.year,
      color:              vehicle.color,
      chassis_number:     vehicle.chassis_number,
      engine_number:      vehicle.engine_number,
      fuel_tank_capacity: vehicle.fuel_tank_capacity,
      tire_size:          vehicle.tire_size,
      current_mileage:    vehicle.current_mileage,
      acquisition_date:   vehicle.acquisition_date,
      acquisition_value:  vehicle.acquisition_value,
      notes:              vehicle.notes,
      traccar_unique_id,
    }, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
    apiResponse = data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      throw new Error(err.response.data?.message ?? 'IMEI já registado');
    }
    throw err;
  }

  const apiVehicleId = apiResponse?.data?.id;
  if (!apiVehicleId) throw new Error('API não devolveu ID do veículo criado');


  // Persistir localmente: api_vehicle_id + IMEI (se fornecido agora)
  const { db } = useDb();
  await db.update(vehicles)
    .set({
      api_vehicle_id:    apiVehicleId,
      api_synced_at:     new Date().toISOString(),
      ...(traccar_unique_id ? { traccar_unique_id } : {}),
    })
    .where(eq(vehicles.id, vehicleId));

  return { ...vehicle, api_vehicle_id: apiVehicleId, traccar_unique_id, api_synced_at: new Date().toISOString() };
}
