// ========================================
// FILE: src/helpers/ipc/db/driver-shifts/driver-shifts-context.ts
// ========================================
import {
  GET_ALL_DRIVER_SHIFTS,
  GET_DRIVER_SHIFT_BY_ID,
  GET_SHIFTS_FOR_DRIVER,
  GET_SHIFTS_FOR_ALL_DRIVERS,
  CREATE_DRIVER_SHIFT,
  UPDATE_DRIVER_SHIFT,
  UPDATE_DRIVER_SHIFT_STATUS,
  DELETE_DRIVER_SHIFT,
  ADD_SHIFT_MEMBER,
  REMOVE_SHIFT_MEMBER,
  SET_SHIFT_LEADER,
  UPDATE_SHIFT_MEMBER,
  REPLACE_SHIFT_MEMBERS,
} from './driver-shifts-channels';
import {
  ICreateDriverShift,
  IUpdateDriverShift,
  IAddShiftMember,
  IUpdateShiftMember,
  IDriverShiftsPaginationParams,
} from '@/lib/types/driver-shift';
import { ShiftStatus } from '@/lib/db/schemas/driver_shifts';
 
export function exposeDriverShiftsContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');
 
  contextBridge.exposeInMainWorld('_driverShifts', {
    getAll:           (params?: IDriverShiftsPaginationParams) =>
                        ipcRenderer.invoke(GET_ALL_DRIVER_SHIFTS, params),
    getById:          (id: string) =>
                        ipcRenderer.invoke(GET_DRIVER_SHIFT_BY_ID, id),
    getForDriver:     (driverId: string) =>
                        ipcRenderer.invoke(GET_SHIFTS_FOR_DRIVER, driverId),
    getForAllDrivers: () =>
                        ipcRenderer.invoke(GET_SHIFTS_FOR_ALL_DRIVERS),
    create:           (data: ICreateDriverShift) =>
                        ipcRenderer.invoke(CREATE_DRIVER_SHIFT, data),
    update:           (id: string, data: IUpdateDriverShift) =>
                        ipcRenderer.invoke(UPDATE_DRIVER_SHIFT, id, data),
    updateStatus:     (id: string, status: ShiftStatus) =>
                        ipcRenderer.invoke(UPDATE_DRIVER_SHIFT_STATUS, id, status),
    remove:           (id: string) =>
                        ipcRenderer.invoke(DELETE_DRIVER_SHIFT, id),
    addMember:        (shiftId: string, data: IAddShiftMember) =>
                        ipcRenderer.invoke(ADD_SHIFT_MEMBER, shiftId, data),
    removeMember:     (shiftId: string, memberId: string) =>
                        ipcRenderer.invoke(REMOVE_SHIFT_MEMBER, shiftId, memberId),
    setLeader:        (shiftId: string, memberId: string) =>
                        ipcRenderer.invoke(SET_SHIFT_LEADER, shiftId, memberId),
    updateMember:     (shiftId: string, memberId: string, data: IUpdateShiftMember) =>
                        ipcRenderer.invoke(UPDATE_SHIFT_MEMBER, shiftId, memberId, data),
    replaceMembers:   (shiftId: string, members: { driver_id: string; is_leader: boolean; notes?: string }[]) =>
                        ipcRenderer.invoke(REPLACE_SHIFT_MEMBERS, shiftId, members),
  });
}