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

// Geofence CRUD
export const CREATE_GEOFENCE         = 'tracking:create-geofence';
export const UPDATE_GEOFENCE         = 'tracking:update-geofence';
export const DELETE_GEOFENCE         = 'tracking:delete-geofence';

// Geofence ↔ Device assignment
export const GET_GEOFENCE_DEVICES    = 'tracking:get-geofence-devices';
export const ASSIGN_GEOFENCE_DEVICE  = 'tracking:assign-geofence-device';
export const REMOVE_GEOFENCE_DEVICE  = 'tracking:remove-geofence-device';

// Alerts
export const GET_ALERTS              = 'tracking:get-alerts';
export const ACKNOWLEDGE_ALERT       = 'tracking:acknowledge-alert';
export const ACKNOWLEDGE_ALL_ALERTS  = 'tracking:acknowledge-all-alerts';
export const GET_ALERT_SETTINGS      = 'tracking:get-alert-settings';
export const UPDATE_ALERT_SETTINGS   = 'tracking:update-alert-settings';

// Device commands
export const GET_COMMAND_TYPES       = 'tracking:get-command-types';
export const SEND_DEVICE_COMMAND     = 'tracking:send-device-command';

// GPS reports
export const GET_GPS_SUMMARY         = 'tracking:get-gps-summary';
export const GET_GPS_STOPS           = 'tracking:get-gps-stops';
export const GET_GPS_EVENTS          = 'tracking:get-gps-events';