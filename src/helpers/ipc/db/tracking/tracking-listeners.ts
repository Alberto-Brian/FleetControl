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
  CREATE_GEOFENCE, UPDATE_GEOFENCE, DELETE_GEOFENCE,
  GET_GEOFENCE_DEVICES, ASSIGN_GEOFENCE_DEVICE, REMOVE_GEOFENCE_DEVICE,
  GET_ALERTS, ACKNOWLEDGE_ALERT, ACKNOWLEDGE_ALL_ALERTS,
  GET_ALERT_SETTINGS, UPDATE_ALERT_SETTINGS,
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
    // console.log('O MEU TOKEN: ', apiHeaders());
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

  ipcMain.handle(CREATE_GEOFENCE, async (_event, data) => {
    const { data: res } = await axios.post(`${API_URL}/api/traccar/geofences`, data, {
      headers: apiHeaders(), timeout: 15_000,
    });
    return res.data;
  });

  ipcMain.handle(UPDATE_GEOFENCE, async (_event, traccarId: number, data) => {
    const { data: res } = await axios.put(`${API_URL}/api/traccar/geofences/${traccarId}`, data, {
      headers: apiHeaders(), timeout: 15_000,
    });
    return res.data;
  });

  ipcMain.handle(DELETE_GEOFENCE, async (_event, traccarId: number) => {
    await axios.delete(`${API_URL}/api/traccar/geofences/${traccarId}`, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return true;
  });

  ipcMain.handle(GET_GEOFENCE_DEVICES, async (_event, traccarId: number) => {
    const { data } = await axios.get(`${API_URL}/api/traccar/geofences/${traccarId}/devices`, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return data.data;
  });

  ipcMain.handle(ASSIGN_GEOFENCE_DEVICE, async (_event, traccarId: number, deviceId: number) => {
    await axios.post(`${API_URL}/api/traccar/geofences/${traccarId}/devices/${deviceId}`, {}, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return true;
  });

  ipcMain.handle(REMOVE_GEOFENCE_DEVICE, async (_event, traccarId: number, deviceId: number) => {
    await axios.delete(`${API_URL}/api/traccar/geofences/${traccarId}/devices/${deviceId}`, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return true;
  });

  ipcMain.handle(GET_ALERTS, async (_event, params) => {
    const { data } = await axios.get(`${API_URL}/api/alerts`, {
      params, headers: apiHeaders(), timeout: 10_000,
    });
    return data;
  });

  ipcMain.handle(ACKNOWLEDGE_ALERT, async (_event, id: string) => {
    await axios.patch(`${API_URL}/api/alerts/${id}/acknowledge`, {}, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return true;
  });

  ipcMain.handle(ACKNOWLEDGE_ALL_ALERTS, async () => {
    const { data } = await axios.patch(`${API_URL}/api/alerts/acknowledge-all`, {}, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return data;
  });

  ipcMain.handle(GET_ALERT_SETTINGS, async () => {
    const { data } = await axios.get(`${API_URL}/api/alerts/settings`, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return data.data;
  });

  ipcMain.handle(UPDATE_ALERT_SETTINGS, async (_event, data) => {
    const { data: res } = await axios.put(`${API_URL}/api/alerts/settings`, data, {
      headers: apiHeaders(), timeout: 10_000,
    });
    return res.data;
  });
}
