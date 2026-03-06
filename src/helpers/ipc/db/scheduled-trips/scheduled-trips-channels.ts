// ========================================
// FILE: src/helpers/ipc/db/scheduled-trips/scheduled-trips-channels.ts
// ========================================
export const GET_ALL_SCHEDULED_TRIPS     = 'scheduled-trips:get-all';
export const GET_SCHEDULED_TRIP_BY_ID    = 'scheduled-trips:get-by-id';
export const GET_TRIPS_BY_DRIVER         = 'scheduled-trips:get-by-driver';
export const CREATE_SCHEDULED_TRIP       = 'scheduled-trips:create';
export const UPDATE_SCHEDULED_TRIP       = 'scheduled-trips:update';
export const CANCEL_SCHEDULED_TRIP       = 'scheduled-trips:cancel';
export const RUN_TRIP_SCHEDULER          = 'scheduled-trips:run-scheduler';