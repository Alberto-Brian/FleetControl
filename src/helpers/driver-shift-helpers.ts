// ========================================
// FILE: src/helpers/driver-shift-helpers.ts
// ========================================
import {
  IDriverShift,
  IDriverShiftSummary,
  ICreateDriverShift,
  IUpdateDriverShift,
  IAddShiftMember,
  IUpdateShiftMember,
  IDriverShiftBadge,
  IDriverShiftsPaginationParams,
} from '@/lib/types/driver-shift';
import { ShiftStatus } from '@/lib/db/schemas/driver_shifts';
import { IPaginatedResult } from '@/lib/types/pagination';

export async function getAllDriverShifts(
  params?: IDriverShiftsPaginationParams
): Promise<IPaginatedResult<IDriverShiftSummary>> {
  return window._driverShifts.getAll(params);
}

export async function getDriverShiftById(id: string): Promise<IDriverShift | null> {
  return window._driverShifts.getById(id);
}

export async function getShiftsForDriver(driverId: string): Promise<IDriverShiftBadge[]> {
  return window._driverShifts.getForDriver(driverId);
}

export async function getShiftsForAllDrivers(): Promise<Record<string, IDriverShiftBadge[]>> {
  return window._driverShifts.getForAllDrivers();
}

export async function createDriverShift(data: ICreateDriverShift): Promise<IDriverShift> {
  const result = await window._driverShifts.create(data);

  return result;
}

export async function updateDriverShift(
  id: string, data: IUpdateDriverShift
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.update(id, data);

  return result;
}

export async function updateDriverShiftStatus(
  id: string, status: ShiftStatus
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.updateStatus(id, status);

  return result;
}

export async function deleteDriverShift(id: string): Promise<boolean> {
  const result = await window._driverShifts.remove(id);

  return result;
}

export async function addShiftMember(
  shiftId: string, data: IAddShiftMember
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.addMember(shiftId, data);

  return result;
}

export async function removeShiftMember(
  shiftId: string, memberId: string
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.removeMember(shiftId, memberId);

  return result;
}

export async function setShiftLeader(
  shiftId: string, memberId: string
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.setLeader(shiftId, memberId);

  return result;
}

export async function updateShiftMember(
  shiftId: string, memberId: string, data: IUpdateShiftMember
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.updateMember(shiftId, memberId, data);

  return result;
}

export async function replaceShiftMembers(
  shiftId: string,
  members: { driver_id: string; is_leader: boolean; notes?: string }[]
): Promise<IDriverShift | null> {
  const result = await window._driverShifts.replaceMembers(shiftId, members);

  return result;
}
