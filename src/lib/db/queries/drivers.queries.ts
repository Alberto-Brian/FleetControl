// ========================================
// FILE: src/lib/db/queries/drivers_queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { drivers } from '@/lib/db/schemas/drivers';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, lte, gte } from 'drizzle-orm';
import { ICreateDriver, IUpdateDriver } from '@/lib/types/driver';

export async function createDriver(driverData: ICreateDriver) {
    const id = generateUuid();
    
    if (dbManager.shouldRotate()) {
        console.log('🔄 Limite atingido, rotacionando...');
        dbManager.rotate();
    }

    const result = await db
        .insert(drivers)
        .values({
            id: id,
            ...driverData,
            status: 'active',
            is_active: true,
        })
        .returning({
            id: drivers.id,
            name: drivers.name,
            phone: drivers.phone,
            email: drivers.email,
            license_number: drivers.license_number,
            license_category: drivers.license_category,
            license_expiry_date: drivers.license_expiry_date,
            status: drivers.status,
        });

    return result[0];
}

export async function getAllDrivers() {
    const result = await db
        .select({
            id: drivers.id,
            name: drivers.name,
            tax_id: drivers.tax_id,
            phone: drivers.phone,
            email: drivers.email,
            license_number: drivers.license_number,
            license_category: drivers.license_category,
            license_expiry_date: drivers.license_expiry_date,
            hire_date: drivers.hire_date,
            status: drivers.status,
            photo: drivers.photo,
            is_active: drivers.is_active,
            created_at: drivers.created_at,
        })
        .from(drivers)
        .where(isNull(drivers.deleted_at))
        .orderBy(desc(drivers.created_at));

    return result;
}

export async function getDriverById(driverId: string) {
    const result = await db
        .select()
        .from(drivers)
        .where(
            and(
                eq(drivers.id, driverId),
                isNull(drivers.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateDriver(driverId: string, driverData: IUpdateDriver) {
    const result = await db
        .update(drivers)
        .set({
            ...driverData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(drivers.id, driverId))
        .returning();

    return result[0];
}

export async function deleteDriver(driverId: string) {
    await db
        .update(drivers)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(drivers.id, driverId));

    return driverId;
}

export async function getActiveDrivers() {
    const result = await db
        .select({
            id: drivers.id,
            name: drivers.name,
            license_number: drivers.license_number,
            license_category: drivers.license_category,
        })
        .from(drivers)
        .where(
            and(
                eq(drivers.status, 'active'),
                isNull(drivers.deleted_at)
            )
        );

    return result;
}

export async function getExpiringLicenses(days: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const result = await db
        .select()
        .from(drivers)
        .where(
            and(
                isNull(drivers.deleted_at),
                eq(drivers.status, 'active'),
                gte(drivers.license_expiry_date, today.toISOString()),
                lte(drivers.license_expiry_date, futureDate.toISOString())
            )
        );

    return result;
}