// ========================================
// FILE: src/helpers/ipc/db/drivers/drivers-listeners.ts (ATUALIZADO)
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
    getActiveAndAvailableDrivers,
    findDriverByLicenseNumber,
    findDriverByTaxId,
    hasDriverWithLicense,
    hasDriverWithTaxId
} from '@/lib/db/queries/drivers.queries';

import { ICreateDriver, IUpdateDriver } from '@/lib/types/driver';
import { ConflictError, NotFoundError, ValidationError, WarningError } from '@/lib/errors/AppError';
import { IPaginationParams } from '@/lib/types/pagination';

// Chaves de tradução para erros
const T_ERRORS = {
    DRIVER_NOT_FOUND: 'drivers:errors.driverNotFound',
    DRIVER_EXISTS_LICENSE: 'drivers:errors.driverWithSameLicenseAlreadyExists',
    DRIVER_EXISTS_TAX_ID: 'drivers:errors.driverWithSameTaxIdAlreadyExists',
    LICENSE_EXPIRED: 'drivers:errors.licenseExpired',
    NO_ACTIVE_DRIVERS: 'drivers:warnings.noActiveDrivers',
    NO_AVAILABLE_DRIVERS: 'drivers:warnings.noAvailableDrivers',
    LICENSE_NUMBER_REQUIRED: 'common:warnings.licenseNumberRequired',
    NAME_REQUIRED: 'common:warnings.nameRequired',
    DRIVER_HAS_ACTIVE_TRIP: 'drivers:errors.driverHasActiveTrip'
} as const;

export function addDriversEventListeners() {
    ipcMain.handle(GET_ALL_DRIVERS, async (_, params?: IPaginationParams) => await getAllDriversEvent(params));
    ipcMain.handle(GET_DRIVER_BY_ID, async (_, id: string) => await getDriverByIdEvent(id));
    ipcMain.handle(CREATE_DRIVER, async (_, data: ICreateDriver) => await createDriverEvent(data));
    ipcMain.handle(UPDATE_DRIVER, async (_, id: string, data: IUpdateDriver) => await updateDriverEvent(id, data));
    ipcMain.handle(DELETE_DRIVER, async (_, id: string) => await deleteDriverEvent(id));
    ipcMain.handle(GET_ACTIVE_DRIVERS, async () => await getActiveDriversEvent());
    ipcMain.handle(GET_AVAILABLE_DRIVERS, async () => await getAvailableDriversEvent());
    ipcMain.handle(GET_EXPIRING_LICENSES, async (_, days: number) => await getExpiringLicensesEvent(days));
}

async function getAllDriversEvent(params?: IPaginationParams) {
    return await getAllDrivers(params || {});
}

async function getDriverByIdEvent(id: string) {
    const result = await getDriverById(id);
    if (!result) {
        throw new Error(new NotFoundError(T_ERRORS.DRIVER_NOT_FOUND).toIpcString());
    }
    return result;
}

async function createDriverEvent(data: ICreateDriver) {
    // Validação: nome obrigatório
    if (!data.name || data.name.trim() === '') {
        throw new Error(new ValidationError(T_ERRORS.NAME_REQUIRED).toIpcString());
    }

    // Validação: carta de condução obrigatória
    if (!data.license_number) {
        throw new Error(new ValidationError(T_ERRORS.LICENSE_NUMBER_REQUIRED).toIpcString());
    }

    // Validação: carta de condução duplicada
    const existingLicense = await findDriverByLicenseNumber(data.license_number);
    if (existingLicense) {
        throw new Error(
            new ConflictError(T_ERRORS.DRIVER_EXISTS_LICENSE, {
                i18n: { license: data.license_number }
            }).toIpcString()
        );
    }

    // Validação: NIF duplicado (se fornecido)
    if (data.tax_id) {
        const existingTaxId = await findDriverByTaxId(data.tax_id);
        if (existingTaxId) {
            throw new Error(
                new ConflictError(T_ERRORS.DRIVER_EXISTS_TAX_ID, {
                    i18n: { taxId: data.tax_id }
                }).toIpcString()
            );
        }
    }

    // Validação: carta expirada
    const expiryDate = new Date(data.license_expiry_date);
    if (expiryDate < new Date()) {
        throw new Error(new ValidationError(T_ERRORS.LICENSE_EXPIRED).toIpcString());
    }

    return await createDriver(data);
}

async function updateDriverEvent(id: string, data: IUpdateDriver) {
    const driverExists = await getDriverById(id);
    if (!driverExists) {
        throw new Error(new NotFoundError(T_ERRORS.DRIVER_NOT_FOUND).toIpcString());
    }
 
    // Validação: carta duplicada (exceto o próprio)
    if (data.license_number) {
        const hasDuplicate = await hasDriverWithLicense(data.license_number, id);
        if (hasDuplicate) {
            throw new Error(
                new ConflictError(T_ERRORS.DRIVER_EXISTS_LICENSE, {
                    i18n: { license: data.license_number }
                }).toIpcString()
            );
        }
    }
 
    // Validação: NIF duplicado (exceto o próprio)
    if (data.tax_id) {
        const hasDuplicate = await hasDriverWithTaxId(data.tax_id, id);
        if (hasDuplicate) {
            throw new Error(
                new ConflictError(T_ERRORS.DRIVER_EXISTS_TAX_ID, {
                    i18n: { taxId: data.tax_id }
                }).toIpcString()
            );
        }
    }
 
    // Validação: carta expirada (se fornecida)
    if (data.license_expiry_date) {
        const expiryDate = new Date(data.license_expiry_date);
        if (expiryDate < new Date()) {
            throw new Error(new ValidationError(T_ERRORS.LICENSE_EXPIRED).toIpcString());
        }
    }
 
    // updateDriver já valida internamente se há viagem activa
    // e lança 'drivers:errors.driverHasActiveTrip' — deixamos propagar
    return updateDriver(id, data);
}

async function deleteDriverEvent(id: string) {
    const driverExists = await getDriverById(id);
    if (!driverExists) {
        throw new Error(new NotFoundError(T_ERRORS.DRIVER_NOT_FOUND).toIpcString());
    }
 
    // deleteDriver já valida internamente se há viagem activa
    // e lança 'drivers:errors.driverHasActiveTrip' — deixamos propagar
    return deleteDriver(id);
}

async function getActiveDriversEvent() {
    const result = await getActiveDrivers();
    if (result.length === 0) {
        throw new Error(new WarningError(T_ERRORS.NO_ACTIVE_DRIVERS).toIpcString());
    }
    return result;
}

async function getAvailableDriversEvent() {
    const result = await getActiveAndAvailableDrivers();
    if (result.length === 0) {
        throw new Error(new WarningError(T_ERRORS.NO_AVAILABLE_DRIVERS).toIpcString());
    }
    return result;
}

async function getExpiringLicensesEvent(days: number) {
    return await getExpiringLicenses(days);
}