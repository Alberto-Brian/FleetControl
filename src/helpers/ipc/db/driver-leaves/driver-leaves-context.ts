// ========================================
// FILE: src/helpers/ipc/db/driver-leaves/driver-leaves-context.ts
// ========================================
import {
  GET_ALL_DRIVER_LEAVES,
  GET_LEAVES_BY_DRIVER,
  GET_DRIVER_LEAVE_BY_ID,
  CREATE_DRIVER_LEAVE,
  UPDATE_DRIVER_LEAVE,
  CANCEL_DRIVER_LEAVE,
  RUN_LEAVE_SCHEDULER,
} from './driver-leaves-channels';
import { ICreateDriverLeave, IUpdateDriverLeave, ICancelDriverLeave, IDriverLeavesPaginationParams } from '@/lib/types/driver-leave';

export function exposeDriverLeavesContext() {
  const { contextBridge, ipcRenderer } = window.require('electron');

  contextBridge.exposeInMainWorld('_driverLeaves', {
    getAll:       (params?: IDriverLeavesPaginationParams) =>
                    ipcRenderer.invoke(GET_ALL_DRIVER_LEAVES, params),
    getByDriver:  (driverId: string) =>
                    ipcRenderer.invoke(GET_LEAVES_BY_DRIVER, driverId),
    getById:      (leaveId: string) =>
                    ipcRenderer.invoke(GET_DRIVER_LEAVE_BY_ID, leaveId),
    create:       (data: ICreateDriverLeave) =>
                    ipcRenderer.invoke(CREATE_DRIVER_LEAVE, data),
    update:       (leaveId: string, data: IUpdateDriverLeave) =>
                    ipcRenderer.invoke(UPDATE_DRIVER_LEAVE, leaveId, data),
    cancel:       (leaveId: string, data?: ICancelDriverLeave) =>
                    ipcRenderer.invoke(CANCEL_DRIVER_LEAVE, leaveId, data),
    runScheduler: () =>
                    ipcRenderer.invoke(RUN_LEAVE_SCHEDULER),
  });
}