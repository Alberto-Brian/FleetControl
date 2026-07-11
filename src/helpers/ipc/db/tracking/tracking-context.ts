// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/tracking/tracking-context.ts
// ========================================
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
  GET_ALERTS, ACKNOWLEDGE_ALERT, ACKNOWLEDGE_ALL_ALERTS,
  GET_ALERT_SETTINGS, UPDATE_ALERT_SETTINGS,
} from './tracking-channels';

export function exposeTrackingContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_tracking', {
    getDevices:          ()                                               => ipcRenderer.invoke(GET_TRACKED_DEVICES),
    createDevice:        (data: { name: string; uniqueId: string })       => ipcRenderer.invoke(CREATE_TRACKED_DEVICE, data),
    getPositions:        (deviceId?: number)                             => ipcRenderer.invoke(GET_DEVICE_POSITIONS, deviceId),
    getHistory:          (deviceId: number, from: string, to: string)    => ipcRenderer.invoke(GET_POSITION_HISTORY, deviceId, from, to),
    syncDevices:         ()                                               => ipcRenderer.invoke(SYNC_DEVICES),
    syncGeofences:       ()                                               => ipcRenderer.invoke(SYNC_GEOFENCES),
    getGeofences:        ()                                               => ipcRenderer.invoke(GET_GEOFENCES),
    getLinkSuggestions:  ()                                               => ipcRenderer.invoke(GET_LINK_SUGGESTIONS),
    linkVehicleDevice:   (vehicleId: string, traccarDeviceId: string)    => ipcRenderer.invoke(LINK_VEHICLE_DEVICE, vehicleId, traccarDeviceId),
    unlinkVehicleDevice: (vehicleId: string)                             => ipcRenderer.invoke(UNLINK_VEHICLE_DEVICE, vehicleId),

    createGeofence:       (data: { name: string; area: string; description?: string; attributes?: Record<string, unknown>; deviceIds?: number[] }) =>
                            ipcRenderer.invoke(CREATE_GEOFENCE, data),
    updateGeofence:       (traccarId: number, data: { name?: string; area?: string; attributes?: Record<string, unknown> }) =>
                            ipcRenderer.invoke(UPDATE_GEOFENCE, traccarId, data),
    deleteGeofence:       (traccarId: number) => ipcRenderer.invoke(DELETE_GEOFENCE, traccarId),

    getAlerts:            (params?: { page?: number; limit?: number; from?: string; to?: string; deviceId?: number; type?: string; acknowledged?: boolean }) =>
                            ipcRenderer.invoke(GET_ALERTS, params),
    acknowledgeAlert:     (id: string)  => ipcRenderer.invoke(ACKNOWLEDGE_ALERT, id),
    acknowledgeAllAlerts: ()            => ipcRenderer.invoke(ACKNOWLEDGE_ALL_ALERTS),
    getAlertSettings:     ()            => ipcRenderer.invoke(GET_ALERT_SETTINGS),
    updateAlertSettings:  (data: Record<string, unknown>) => ipcRenderer.invoke(UPDATE_ALERT_SETTINGS, data),
  });
}
