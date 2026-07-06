// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/db/tracking/tracking-channels.ts
// ========================================
export const GET_TRACKED_DEVICES    = 'tracking:get-devices';
export const CREATE_TRACKED_DEVICE  = 'tracking:create-device';
export const GET_DEVICE_POSITIONS   = 'tracking:get-positions';
export const GET_POSITION_HISTORY   = 'tracking:get-history';
export const SYNC_DEVICES           = 'tracking:sync-devices';
export const SYNC_GEOFENCES         = 'tracking:sync-geofences';
export const GET_GEOFENCES          = 'tracking:get-geofences';
export const GET_LINK_SUGGESTIONS   = 'tracking:get-link-suggestions';
export const LINK_VEHICLE_DEVICE    = 'tracking:link-vehicle-device';
export const UNLINK_VEHICLE_DEVICE  = 'tracking:unlink-vehicle-device';