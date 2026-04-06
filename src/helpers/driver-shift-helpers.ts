
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
  return window._driverShifts.create(data);
}
 
export async function updateDriverShift(
  id: string, data: IUpdateDriverShift
): Promise<IDriverShift | null> {
  return window._driverShifts.update(id, data);
}
 
export async function updateDriverShiftStatus(
  id: string, status: ShiftStatus
): Promise<IDriverShift | null> {
  return window._driverShifts.updateStatus(id, status);
}
 
export async function deleteDriverShift(id: string): Promise<boolean> {
  return window._driverShifts.remove(id);
}
 
export async function addShiftMember(
  shiftId: string, data: IAddShiftMember
): Promise<IDriverShift | null> {
  return window._driverShifts.addMember(shiftId, data);
}
 
export async function removeShiftMember(
  shiftId: string, memberId: string
): Promise<IDriverShift | null> {
  return window._driverShifts.removeMember(shiftId, memberId);
}
 
export async function setShiftLeader(
  shiftId: string, memberId: string
): Promise<IDriverShift | null> {
  return window._driverShifts.setLeader(shiftId, memberId);
}
 
export async function updateShiftMember(
  shiftId: string, memberId: string, data: IUpdateShiftMember
): Promise<IDriverShift | null> {
  return window._driverShifts.updateMember(shiftId, memberId, data);
}
 
export async function replaceShiftMembers(
  shiftId: string,
  members: { driver_id: string; is_leader: boolean; notes?: string }[]
): Promise<IDriverShift | null> {
  return window._driverShifts.replaceMembers(shiftId, members);
}