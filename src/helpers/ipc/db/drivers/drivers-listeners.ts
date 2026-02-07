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
import { ConflictError, ValidationError } from '@/lib/errors/AppError';

export function addDriversEventListeners() {
    ipcMain.handle(GET_ALL_DRIVERS, async (_) => await getAllDrivers());
    
    ipcMain.handle(GET_DRIVER_BY_ID, async (_, id: string) => await getDriverById(id));

    // ✅ CREATE com validações
    ipcMain.handle(CREATE_DRIVER, async (_, data: ICreateDriver) => {
        try {
            // Validação: carta de condução duplicada
            const existingLicense = await findDriverByLicenseNumber(data.license_number);
            if (existingLicense) {
                throw new ConflictError(
                    'drivers:errors.driverWithSameLicenseAlreadyExists',
                    { i18n: { license: data.license_number } }
                )
            }

            // Validação: NIF duplicado (se fornecido)
            if (data.tax_id) {
                const existingTaxId = await findDriverByTaxId(data.tax_id);
                if (existingTaxId) {
                    throw new ConflictError(
                        'drivers:errors.driverWithSameTaxIdAlreadyExists',
                        { i18n: { taxId: data.tax_id } }
                    );
                }
            }

            // Validação: carta expirada
            const expiryDate = new Date(data.license_expiry_date);
            if (expiryDate < new Date()) {
                throw new ValidationError(
                    'drivers:errors.licenseExpired',
                );
            }

            return await createDriver(data);
        } catch (error) {
            throw error;
        }
    });

    // ✅ UPDATE com validações
    ipcMain.handle(UPDATE_DRIVER, async (_, id: string, data: IUpdateDriver) => {
        try {
            // Validação: carta duplicada (exceto o próprio)
            if (data.license_number) {
                const hasDuplicate = await hasDriverWithLicense(data.license_number, id);
                if (hasDuplicate) {
                    throw new ConflictError(
                        'drivers:errors.driverWithSameLicenseAlreadyExists',
                        { i18n: { license: data.license_number } }
                    ).toIpcString();
                }
            }

            // Validação: NIF duplicado (exceto o próprio)
            if (data.tax_id) {
                const hasDuplicate = await hasDriverWithTaxId(data.tax_id, id);
                if (hasDuplicate) {
                    throw new ConflictError(
                        'drivers:errors.driverWithSameTaxIdAlreadyExists',
                        { i18n: { taxId: data.tax_id } }
                    ).toIpcString();
                }
            }

            // Validação: carta expirada (se fornecida)
            if (data.license_expiry_date) {
                const expiryDate = new Date(data.license_expiry_date);
                if (expiryDate < new Date()) {
                    throw new ValidationError(
                        'drivers:errors.licenseExpired',
                    );
                }
            }

            return await updateDriver(id, data);
        } catch (error) {
            throw error;
        }
    });

    ipcMain.handle(DELETE_DRIVER, async (_, id: string) => await deleteDriver(id));
    
    ipcMain.handle(GET_ACTIVE_DRIVERS, async (_) => await getActiveDrivers());
    
    ipcMain.handle(GET_AVAILABLE_DRIVERS, async (_) => await getActiveAndAvailableDrivers());
    
    ipcMain.handle(GET_EXPIRING_LICENSES, async (_, days: number) => await getExpiringLicenses(days));
}