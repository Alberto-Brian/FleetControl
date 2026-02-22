// ========================================
// FILE: src/helpers/driver-leave-helpers.ts
// ========================================
import {
  IDriverLeave,
  ICreateDriverLeave,
  IUpdateDriverLeave,
  ICancelDriverLeave,
  IDriverLeavesPaginationParams,
} from '@/lib/types/driver-leave';
import { IPaginatedResult } from '@/lib/types/pagination';

export async function getAllDriverLeaves(
  params?: IDriverLeavesPaginationParams
): Promise<IPaginatedResult<IDriverLeave>> {
  return window._driverLeaves.getAll(params);
}

export async function getLeavesByDriver(driverId: string): Promise<IDriverLeave[]> {
  return window._driverLeaves.getByDriver(driverId);
}

export async function getDriverLeaveById(leaveId: string): Promise<IDriverLeave | null> {
  return window._driverLeaves.getById(leaveId);
}

export async function createDriverLeave(data: ICreateDriverLeave): Promise<IDriverLeave> {
  return window._driverLeaves.create(data);
}

export async function updateDriverLeave(
  leaveId: string,
  data: IUpdateDriverLeave
): Promise<IDriverLeave | null> {
  return window._driverLeaves.update(leaveId, data);
}

export async function cancelDriverLeave(
  leaveId: string,
  data?: ICancelDriverLeave
): Promise<IDriverLeave | null> {
  return window._driverLeaves.cancel(leaveId, data);
}

export async function forceLeaveSchedulerCycle(): Promise<void> {
  return window._driverLeaves.runScheduler();
}