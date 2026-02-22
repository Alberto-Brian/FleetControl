// ========================================
// FILE: src/helpers/ipc/db/driver-leaves/driver-leaves-channels.ts
// ========================================
export const GET_ALL_DRIVER_LEAVES   = 'driver-leaves:get-all';
export const GET_LEAVES_BY_DRIVER    = 'driver-leaves:get-by-driver';
export const GET_DRIVER_LEAVE_BY_ID  = 'driver-leaves:get-by-id';
export const CREATE_DRIVER_LEAVE     = 'driver-leaves:create';
export const UPDATE_DRIVER_LEAVE     = 'driver-leaves:update';
export const CANCEL_DRIVER_LEAVE     = 'driver-leaves:cancel';
export const RUN_LEAVE_SCHEDULER     = 'driver-leaves:run-scheduler'; // força ciclo manual