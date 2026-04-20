// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/tracking/tracking-context.ts
// ========================================
import {
  GET_TRACKED_DEVICES,
  GET_DEVICE_POSITIONS,
  GET_POSITION_HISTORY,
  SYNC_DEVICES,
  SYNC_GEOFENCES,
  GET_GEOFENCES,
} from './tracking-channels';

export function exposeTrackingContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_tracking', {
    getDevices:       ()                                          => ipcRenderer.invoke(GET_TRACKED_DEVICES),
    getPositions:     (deviceId?: number)                        => ipcRenderer.invoke(GET_DEVICE_POSITIONS, deviceId),
    getHistory:       (deviceId: number, from: string, to: string) => ipcRenderer.invoke(GET_POSITION_HISTORY, deviceId, from, to),
    syncDevices:      ()                                          => ipcRenderer.invoke(SYNC_DEVICES),
    syncGeofences:    ()                                          => ipcRenderer.invoke(SYNC_GEOFENCES),
    getGeofences:     ()                                          => ipcRenderer.invoke(GET_GEOFENCES),
  });
}