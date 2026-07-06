// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/tracking/tracking-listeners.ts
// ========================================
import { ipcMain } from 'electron';
import axios        from 'axios';
import {
  GET_TRACKED_DEVICES,
  CREATE_TRACKED_DEVICE,
  GET_DEVICE_POSITIONS,
  GET_POSITION_HISTORY,
  SYNC_DEVICES,
  SYNC_GEOFENCES,
  GET_GEOFENCES,
  GET_LINK_SUGGESTIONS,
  LINK_VEHICLE_DEVICE,
  UNLINK_VEHICLE_DEVICE,
} from './tracking-channels';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Usa o access token guardado em memória pelo auth service ou license service
// O auth service já existe no teu projecto (exposeServiceAuthContext)
import { getStoredApiToken } from '@/helpers/ipc/services/auth/token-store'

function apiHeaders() {
  const token = getStoredApiToken();
  if (!token) throw new Error('Sem token de autenticação — activa a licença primeiro');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function addTrackingEventListeners() {
  ipcMain.handle(GET_TRACKED_DEVICES, async () => {
    const { data } = await axios.get(`${API_URL}/api/traccar/devices`, {
      headers: apiHeaders(),
      timeout: 10_000,
    });
    return data.data;
  });

  ipcMain.handle(CREATE_TRACKED_DEVICE, async (_event, payload: { name: string; uniqueId: string }) => {
    const { data } = await axios.post(`${API_URL}/api/traccar/devices`, payload, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
    return data.data;
  });

  ipcMain.handle(GET_DEVICE_POSITIONS, async (_event, deviceId?: number) => {
    const url = deviceId
      ? `${API_URL}/api/traccar/positions/live?deviceId=${deviceId}`
      : `${API_URL}/api/traccar/positions/live`;
    const { data } = await axios.get(url, { headers: apiHeaders(), timeout: 10_000 });
    return data.data;
  });

  ipcMain.handle(GET_POSITION_HISTORY, async (_event, deviceId: number, from: string, to: string) => {
    const { data } = await axios.get(
      `${API_URL}/api/traccar/devices/${deviceId}/positions`,
      { params: { from, to }, headers: apiHeaders(), timeout: 15_000 },
    );
    return data.data;
  });

  ipcMain.handle(SYNC_DEVICES, async () => {
    console.log('O MEU TOKEN: ', apiHeaders());
    const { data } = await axios.post(`${API_URL}/api/traccar/devices/sync`, {}, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
    return data.data;
  });

  ipcMain.handle(SYNC_GEOFENCES, async () => {
    const { data } = await axios.post(`${API_URL}/api/traccar/geofences/sync`, {}, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
    return data.data;
  });

  ipcMain.handle(GET_GEOFENCES, async () => {
    const { data } = await axios.get(`${API_URL}/api/traccar/geofences`, {
      headers: apiHeaders(),
      timeout: 10_000,
    });
    return data.data;
  });

  ipcMain.handle(GET_LINK_SUGGESTIONS, async () => {
    const { data } = await axios.get(`${API_URL}/api/traccar/link-suggestions`, {
      headers: apiHeaders(),
      timeout: 15_000,
    });
    return data.data;
  });

  ipcMain.handle(LINK_VEHICLE_DEVICE, async (_event, vehicleId: string, traccarDeviceId: string) => {
    const { data } = await axios.patch(
      `${API_URL}/api/traccar/vehicles/${vehicleId}/link-device`,
      { traccarDeviceId },
      { headers: apiHeaders(), timeout: 10_000 },
    );
    return data;
  });

  ipcMain.handle(UNLINK_VEHICLE_DEVICE, async (_event, vehicleId: string) => {
    const { data } = await axios.delete(
      `${API_URL}/api/traccar/vehicles/${vehicleId}/link-device`,
      { headers: apiHeaders(), timeout: 10_000 },
    );
    return data;
  });
}
