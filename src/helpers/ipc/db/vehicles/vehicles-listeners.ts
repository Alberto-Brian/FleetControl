// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/vehicles/vehicles-listeners.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.3 — powersync.db
// passa a ser a fonte operacional de Vehicles (era app.db/Drizzle). O CRUD
// principal (create/update/delete/list/status/mileage) sobe pela fila do
// PowerSync automaticamente — deixou de haver um `POST /api/vehicles`
// síncrono nem `api_vehicle_id`/`api_synced_at` a reconciliar (o id local
// JÁ é o id final). Ligação de GPS Traccar (register-gps/unregister-gps/
// tracking) continua a ser um caminho REST directo e dedicado — nunca
// passa pelo PowerSync, ver a nota grande em vehicles.queries.powersync.ts.
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
  REGISTER_GPS_ON_VEHICLE,
  UNREGISTER_GPS_FROM_VEHICLE,
  TOGGLE_VEHICLE_TRACKING,
  GET_ACTIVE_IMEIS,
  FLUSH_SYNC_QUEUE,
} from "./vehicles-channels";
import { enqueue, flushPendingOps } from './api-sync-queue';

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
  getActiveImeis,
  setLocalGpsFields,
} from '@/lib/db/queries/vehicles.queries.powersync';

import { IPaginationParams } from "@/lib/types/pagination";

import {
  findVehicleCategoryById
} from '@/lib/db/queries/vehicle_categories.queries.powersync'

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
  VEHICLE_NOT_YET_SYNCED:    'vehicles:errors.vehicleNotYetSynced',
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
  ipcMain.handle(REGISTER_GPS_ON_VEHICLE, async (_, vehicleId: string, imei: string)  => await registerGpsOnVehicleEvent(vehicleId, imei));

  ipcMain.handle(UNREGISTER_GPS_FROM_VEHICLE, async (_, vehicleId: string) => {
    const vehicle = await findVehicleById(vehicleId);
    if (!vehicle) throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());

    // powersync.db é autoritativo — actualizar imediatamente, sem esperar pela API.
    await setLocalGpsFields(vehicleId, { traccar_unique_id: null, tracking_enabled: false });

    // Sync API em fire-and-forget: não bloqueia o retorno ao renderer.
    // Se offline (sem resposta do servidor), enfileira para retry automático
    // quando o TrackingContext detectar reconexão.
    try {
      const headers = apiHeaders(); // lança se sem token (standalone) — não enfileirar
      axios.post(`${API_URL}/api/vehicles/${vehicleId}/unregister-gps`, {}, { headers, timeout: 10_000 })
        .catch((err: any) => {
          if (!err.response) enqueue('post', `/api/vehicles/${vehicleId}/unregister-gps`, {});
          else console.warn('[vehicles] unregister-gps falhou:', err.response.status);
        });
    } catch {
      // sem token (modo standalone) — não enfileirar
    }

    return { success: true };
  });

  ipcMain.handle(TOGGLE_VEHICLE_TRACKING, async (_, vehicleId: string, enabled: boolean) => {
    const vehicle = await findVehicleById(vehicleId);
    if (!vehicle) throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());

    // powersync.db é autoritativo — actualizar imediatamente, sem esperar pela API.
    await setLocalGpsFields(vehicleId, { tracking_enabled: enabled });

    // Sync API em fire-and-forget com retry automático em caso de offline.
    try {
      const headers = apiHeaders();
      axios.patch(`${API_URL}/api/vehicles/${vehicleId}/tracking`, { tracking_enabled: enabled }, { headers, timeout: 8_000 })
        .catch((err: any) => {
          if (!err.response) enqueue('patch', `/api/vehicles/${vehicleId}/tracking`, { tracking_enabled: enabled });
          else console.warn('[vehicles] toggle-tracking falhou:', err.response.status);
        });
    } catch {
      // sem token (modo standalone) — não enfileirar
    }

    return { success: true };
  });

  ipcMain.handle(GET_ACTIVE_IMEIS, async () => await getActiveImeis());

  // Chamado pelo TrackingContext quando detecta reconexão ao servidor (reconnectCount sobe).
  // Reutiliza a monitorização de conectividade já existente — sem scheduler adicional.
  ipcMain.handle(FLUSH_SYNC_QUEUE, async () => {
    await flushPendingOps();
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

  const hasImei = !!vehicleData.traccar_unique_id?.trim();
  if (hasImei && !getStoredApiToken()) {
    throw new Error(new WarningError(T_ERRORS.IMEI_REQUIRES_CONNECTED).toIpcString());
  }

  // O veículo é sempre criado localmente primeiro (nunca inclui GPS — ver
  // vehicles.queries.powersync.ts) e sobe pela fila do PowerSync sozinho,
  // online ou offline. Isto NUNCA é revertido a seguir — ao contrário do
  // fluxo antigo (REST síncrono + rollback local se falhasse), o PowerSync
  // não tem um protocolo de "desfazer" uma escrita local já efectuada.
  const localVehicle = await createVehicle(vehicleData);

  if (!hasImei) return localVehicle;

  // Ligação de GPS é best-effort a seguir à criação: se falhar (IMEI
  // desconhecido/já ligado/servidor em baixo), o veículo FICA criado — só a
  // ligação de GPS é que não se concretizou. O erro propaga-se ao chamador
  // (mesmo padrão de sempre: toast de erro no renderer), mas uma nova
  // consulta à lista já mostra o veículo criado, sem GPS — assimetria
  // conhecida face ao comportamento antigo (rollback atómico), aceite como
  // consequência directa de não haver rollback no modelo PowerSync.
  return await registerGpsOnVehicleEvent(localVehicle.id, vehicleData.traccar_unique_id!);
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

// Espera até o veículo existir no backend (upload PowerSync já aterrou) —
// necessário porque register-gps faz vehicleRepository.findById(id) e dá
// 404 se ainda não tiver chegado. Nunca consome a fila de CRUD do PowerSync
// directamente (getNextCrudTransaction()/getCrudBatch() são exclusivos do
// connector — consumi-los aqui competiria com o próprio upload); em vez
// disso pergunta directamente ao servidor, que é a fonte real da resposta
// que interessa.
async function waitForVehicleOnBackend(vehicleId: string, headers: Record<string, string>): Promise<boolean> {
  const MAX_WAIT_MS = 12_000;
  const INTERVAL_MS = 800;
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    try {
      await axios.get(`${API_URL}/api/vehicles/${vehicleId}`, { headers, timeout: 5_000 });
      return true;
    } catch (err: any) {
      if (err?.response?.status !== 404) throw err; // erro real (não "ainda não existe") propaga-se já
    }
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
  }
  return false;
}

// Regista um IMEI num veículo, ligando o dispositivo Traccar via o
// endpoint REST dedicado (nunca via powersync.db directamente — ver nota
// (2) em vehicles.queries.powersync.ts).
async function registerGpsOnVehicleEvent(vehicleId: string, imei: string) {
  const vehicle = await findVehicleById(vehicleId);
  if (!vehicle) throw new Error(new NotFoundError(T_ERRORS.VEHICLE_NOT_FOUND).toIpcString());

  if (!imei?.trim()) throw new Error('IMEI é obrigatório');

  const headers = apiHeaders();

  const existsOnBackend = await waitForVehicleOnBackend(vehicleId, headers);
  if (!existsOnBackend) {
    throw new Error(new WarningError(T_ERRORS.VEHICLE_NOT_YET_SYNCED).toIpcString());
  }

  try {
    await axios.post(`${API_URL}/api/vehicles/${vehicleId}/register-gps`, {
      traccar_unique_id: imei.trim(),
    }, {
      headers,
      timeout: 15_000,
    });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status  = err.response?.status as number | undefined;
      const data    = err.response?.data as { message?: string; code?: string } | undefined;
      const isUnavailable = !err.response || err.code === 'ECONNREFUSED'
        || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || status === 503;

      if (isUnavailable) {
        throw new Error(new WarningError(T_ERRORS.TRACCAR_UNAVAILABLE).toIpcString());
      }
      const error = new Error(data?.message ?? 'Erro ao registar GPS') as Error & { apiCode?: string };
      if (data?.code) error.apiCode = data.code;
      throw error;
    }
    throw err;
  }

  await setLocalGpsFields(vehicleId, { traccar_unique_id: imei.trim(), tracking_enabled: true });

  return await findVehicleById(vehicleId);
}

