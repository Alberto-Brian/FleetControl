// ========================================
// FILE: src/lib/db/queries/drivers.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { drivers } from '@/lib/db/schemas/drivers';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, lte, gte } from 'drizzle-orm';
import { ICreateDriver, IUpdateDriver } from '@/lib/types/driver';

/**
 * Cria um novo motorista
 * ✅ Verifica necessidade de rotação antes de inserir
 */
export async function createDriver(driverData: ICreateDriver) {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

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

/**
 * Obtém todos os motoristas ativos
 */
export async function getAllDrivers() {
    const { db } = useDb();
    
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

/**
 * Obtém um motorista por ID
 */
export async function getDriverById(driverId: string) {
    const { db } = useDb();
    
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

/**
 * Atualiza um motorista
 */
export async function updateDriver(driverId: string, driverData: IUpdateDriver) {
    const { db } = useDb();
    
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

/**
 * Deleta (soft delete) um motorista
 */
export async function deleteDriver(driverId: string) {
    const { db } = useDb();
    
    await db
        .update(drivers)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(drivers.id, driverId));

    return driverId;
}

/**
 * Obtém motoristas ativos
 */
export async function getActiveDrivers() {
    const { db } = useDb();
    
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

/**
 * Obtém motoristas com licenças próximas do vencimento
 */
export async function getExpiringLicenses(days: number = 30) {
    const { db } = useDb();
    
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
