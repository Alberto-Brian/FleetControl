// ========================================
// FILE: src/helpers/ipc/db/drivers/drivers-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_DRIVERS,
    GET_DRIVER_BY_ID,
    CREATE_DRIVER,
    UPDATE_DRIVER,
    DELETE_DRIVER,
    GET_ACTIVE_DRIVERS,
    GET_EXPIRING_LICENSES,
    GET_AVAILABLE_DRIVERS
} from "./drivers-channels";

import {
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver,
    getActiveDrivers,
    getExpiringLicenses,
    getActiveAndAvailableDrivers
} from '@/lib/db/queries/drivers.queries';

import { ICreateDriver, IUpdateDriver } from '@/lib/types/driver';

export function addDriversEventListeners() {
    ipcMain.handle(GET_ALL_DRIVERS, async (_) => await getAllDrivers());
    ipcMain.handle(GET_DRIVER_BY_ID, async (_, id: string) => await getDriverById(id));
    ipcMain.handle(CREATE_DRIVER, async (_, data: ICreateDriver) => await createDriver(data));
    ipcMain.handle(UPDATE_DRIVER, async (_, id: string, data: IUpdateDriver) => await updateDriver(id, data));
    ipcMain.handle(DELETE_DRIVER, async (_, id: string) => await deleteDriver(id));
    ipcMain.handle(GET_ACTIVE_DRIVERS, async (_) => await getActiveDrivers());
    ipcMain.handle(GET_AVAILABLE_DRIVERS, async (_) => await getActiveAndAvailableDrivers());
    ipcMain.handle(GET_EXPIRING_LICENSES, async (_, days: number) => await getExpiringLicenses(days));
}