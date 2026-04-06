// ========================================
// FILE: src/helpers/ipc/db/driver-shifts/driver-shifts-channels.ts
// ========================================

export const GET_ALL_DRIVER_SHIFTS      = 'driver-shifts:get-all';
export const GET_DRIVER_SHIFT_BY_ID     = 'driver-shifts:get-by-id';
export const GET_SHIFTS_FOR_DRIVER      = 'driver-shifts:get-for-driver';
export const GET_SHIFTS_FOR_ALL_DRIVERS = 'driver-shifts:get-for-all-drivers';
export const CREATE_DRIVER_SHIFT        = 'driver-shifts:create';
export const UPDATE_DRIVER_SHIFT        = 'driver-shifts:update';
export const UPDATE_DRIVER_SHIFT_STATUS = 'driver-shifts:update-status';
export const DELETE_DRIVER_SHIFT        = 'driver-shifts:delete';
export const ADD_SHIFT_MEMBER           = 'driver-shifts:add-member';
export const REMOVE_SHIFT_MEMBER        = 'driver-shifts:remove-member';
export const SET_SHIFT_LEADER           = 'driver-shifts:set-leader';
export const UPDATE_SHIFT_MEMBER        = 'driver-shifts:update-member';
export const REPLACE_SHIFT_MEMBERS      = 'driver-shifts:replace-members';