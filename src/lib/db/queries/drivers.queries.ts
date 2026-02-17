// ========================================
// FILE: src/lib/db/queries/drivers.queries.ts (ATUALIZADO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { drivers, driverStatus, driverAvailability } from '@/lib/db/schemas/drivers';
import { generateUuid } from '@/lib/utils/cripto';
import { sql, eq, and, isNull, desc, lte, gte, or } from 'drizzle-orm';
import { ICreateDriver, IUpdateDriver, IDriver } from '@/lib/types/driver';

/**
 * ✅ Busca motorista por número de carta
 */
export async function findDriverByLicenseNumber(licenseNumber: string) {
    const { db } = useDb();
    const result = await db
        .select({
            id: drivers.id,
            name: drivers.name,
            license_number: drivers.license_number,
        })
        .from(drivers)
        .where(
            and(
                eq(drivers.license_number, licenseNumber),
                isNull(drivers.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

/**
 * ✅ Busca motorista por NIF
 */
export async function findDriverByTaxId(taxId: string) {
    const { db } = useDb();
    const result = await db
        .select({
            id: drivers.id,
            name: drivers.name,
            tax_id: drivers.tax_id,
        })
        .from(drivers)
        .where(
            and(
                eq(drivers.tax_id, taxId),
                isNull(drivers.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

/**
 * ✅ Verifica se já existe motorista com a mesma carta (exceto o próprio)
 */
export async function hasDriverWithLicense(licenseNumber: string, excludeId?: string) {
    const { db } = useDb();
    const conditions = [
        eq(drivers.license_number, licenseNumber),
        isNull(drivers.deleted_at)
    ];

    if (excludeId) {
        conditions.push(sql`${drivers.id} != ${excludeId}`);
    }

    const result = await db
        .select({ id: drivers.id })
        .from(drivers)
        .where(and(...conditions))
        .limit(1);

    return result.length > 0;
}

/**
 * ✅ Verifica se já existe motorista com o mesmo NIF (exceto o próprio)
 */
export async function hasDriverWithTaxId(taxId: string, excludeId?: string) {
    const { db } = useDb();
    const conditions = [
        eq(drivers.tax_id, taxId),
        isNull(drivers.deleted_at)
    ];

    if (excludeId) {
        conditions.push(sql`${drivers.id} != ${excludeId}`);
    }

    const result = await db
        .select({ id: drivers.id })
        .from(drivers)
        .where(and(...conditions))
        .limit(1);

    return result.length > 0;
}

/**
 * Cria um novo motorista
 */
export async function createDriver(driverData: ICreateDriver): Promise<IDriver> {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(drivers)
        .values({
            id: id,
            name: driverData.name,
            tax_id: driverData.tax_id,
            id_number: driverData.id_number,
            birth_date: driverData.birth_date,
            phone: driverData.phone,
            email: driverData.email,
            address: driverData.address,
            city: driverData.city,
            state: driverData.state,
            postal_code: driverData.postal_code,
            license_number: driverData.license_number,
            license_category: driverData.license_category,
            license_expiry_date: driverData.license_expiry_date,
            hire_date: driverData.hire_date,
            photo: driverData.photo,
            notes: driverData.notes,
            status: driverStatus.ACTIVE,
            availability: driverAvailability.AVAILABLE,
            is_active: true,
        })
        .returning();

    return result[0];
}

/**
 * Obtém todos os motoristas (não deletados)
 */
export async function getAllDrivers(): Promise<IDriver[]> {
    const { db } = useDb();
    
    const result = await db
        .select()
        .from(drivers)
        .where(isNull(drivers.deleted_at))
        .orderBy(desc(drivers.created_at));

    return result;
}

/**
 * Obtém um motorista por ID
 */
export async function getDriverById(driverId: string): Promise<IDriver | null> {
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
 * ✅ Retorna o motorista completo atualizado
 */
export async function updateDriver(driverId: string, driverData: IUpdateDriver): Promise<IDriver | null> {
  const { db } = useDb();

  // Se o status for alterado para on_leave ou terminated, forçar availability para offline
  const updateData: any = { ...driverData };
  
  if (driverData.status === driverStatus.ON_LEAVE || driverData.status === driverStatus.TERMINATED) {
    updateData.availability = driverAvailability.OFFLINE;
  }

  await db
    .update(drivers)
    .set({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .where(eq(drivers.id, driverId));

  // ✅ Retorna motorista completo
  return await getDriverById(driverId);
}

/**
 * Deleta (soft delete) um motorista
 */
export async function deleteDriver(driverId: string): Promise<string> {
    const { db } = useDb();
    
    await db
        .update(drivers)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: false,
        })
        .where(eq(drivers.id, driverId));

    return driverId;
}

/**
 * Obtém motoristas activos
 */
export async function getActiveDrivers(): Promise<IDriver[]> {
    const { db } = useDb();
    
    const result = await db
        .select()
        .from(drivers)
        .where(
            and(
                eq(drivers.status, driverStatus.ACTIVE),
                eq(drivers.is_active, true),
                isNull(drivers.deleted_at)
            )
        )
        .orderBy(desc(drivers.name));

    return result;
}

/**
 * Obtém motoristas activos e disponíveis
 */
export async function getActiveAndAvailableDrivers(): Promise<IDriver[]> {
    const { db } = useDb();
    
    const result = await db
        .select()
        .from(drivers)
        .where(
            and(
                eq(drivers.status, driverStatus.ACTIVE),
                eq(drivers.availability, driverAvailability.AVAILABLE),
                eq(drivers.is_active, true),
                isNull(drivers.deleted_at)
            )
        )
        .orderBy(desc(drivers.name));

    return result;
}

/**
 * Obtém motoristas com licenças próximas do vencimento
 */
export async function getExpiringLicenses(days: number = 30): Promise<IDriver[]> {
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
                eq(drivers.status, driverStatus.ACTIVE),
                gte(drivers.license_expiry_date, today.toISOString().split('T')[0]),
                lte(drivers.license_expiry_date, futureDate.toISOString().split('T')[0])
            )
        )
        .orderBy(drivers.license_expiry_date);

    return result;
}

/**
 * Conta motoristas por status
 */
export async function countDriversByStatus() {
    const { db } = useDb();
    const result = await db
        .select({
            status: drivers.status,
            count: sql<number>`count(${drivers.id})`,
        })
        .from(drivers)
        .where(isNull(drivers.deleted_at))
        .groupBy(drivers.status);
    
    return result;
}

/**
 * Conta motoristas por disponibilidade
 */
export async function countDriversByAvailability() {
    const { db } = useDb();
    const result = await db
        .select({
            availability: drivers.availability,
            count: sql<number>`count(${drivers.id})`,
        })
        .from(drivers)
        .where(
            and(
                eq(drivers.status, driverStatus.ACTIVE),
                isNull(drivers.deleted_at)
            )
        )
        .groupBy(drivers.availability);
    
    return result;
}