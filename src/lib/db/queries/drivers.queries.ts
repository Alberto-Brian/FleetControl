// ========================================
// FILE: src/lib/db/queries/drivers.queries.ts (ATUALIZADO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { drivers, driverStatus, driverAvailability } from '@/lib/db/schemas/drivers';
import { trips } from '@/lib/db/schemas/trips';
import { generateUuid } from '@/lib/utils/cripto';
import { sql, eq, and, isNull, desc, lte, gte, or, count, like, SQL  } from 'drizzle-orm';
import { ICreateDriver, IUpdateDriver, IDriver } from '@/lib/types/driver';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';


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
export async function getAllDrivers(params: IPaginationParams = {}): Promise<IPaginatedResult<IDriver>> {
    const { db } = useDb();

    const page   = params.page  || 1;
    const limit  = params.limit || 20;
    const offset = (page - 1) * limit;

    // Condições com filtros
    const conditions: SQL[] = [isNull(drivers.deleted_at)];

    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        conditions.push(or(
            like(drivers.name, s),
            like(drivers.license_number, s),
            like(drivers.phone, s),
            like(drivers.email, s),
        )!);
    }
    if (params.status && params.status !== 'all') {
        // Reutilizamos "status" para filtrar por availability
        conditions.push(eq(drivers.availability, params.status));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Total com filtros
    const [{ total }] = await db
        .select({ total: count() })
        .from(drivers)
        .where(whereClause);

    // Dados paginados
    const data = await db
        .select()
        .from(drivers)
        .where(whereClause)
        .orderBy(desc(drivers.created_at))
        .limit(limit)
        .offset(offset);

    // Counts por availability — sem filtro de availability (totais reais)
    const baseConditions: SQL[] = [isNull(drivers.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        baseConditions.push(or(
            like(drivers.name, s),
            like(drivers.license_number, s),
            like(drivers.phone, s),
            like(drivers.email, s),
        )!);
    }
    const baseWhere = baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    const availabilityCountsRaw = await db
        .select({ availability: drivers.availability, count: count() })
        .from(drivers)
        .where(baseWhere)
        .groupBy(drivers.availability);

    const statusCountsRaw = await db
        .select({ status: drivers.status, count: count() })
        .from(drivers)
        .where(baseWhere)
        .groupBy(drivers.status);

    const statusCounts: Record<string, number> = {
        available:  0,
        on_trip:    0,
        offline:    0,
        on_leave:   0,
        terminated: 0,
    };

    for (const row of availabilityCountsRaw) {
        if (row.availability in statusCounts) {
            statusCounts[row.availability] = row.count;
        }
    }
    for (const row of statusCountsRaw) {
        // on_leave e terminated vêm do status, não da availability
        if (row.status === 'on_leave' || row.status === 'terminated') {
            statusCounts[row.status] = row.count;
        }
    }

    return {
        data: data as IDriver[],
        pagination: {
            total,
            page,
            limit,
            totalPages:  Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
        statusCounts,
    };
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
 
    const updateData: any = { ...driverData };
 
    if (driverData.status === driverStatus.ON_LEAVE || driverData.status === driverStatus.TERMINATED) {
        // Verificar se driver está numa viagem activa
        const activeTrip = await db
            .select({ id: trips.id })
            .from(trips)
            .where(
                and(
                    eq(trips.driver_id, driverId),
                    eq(trips.status, 'in_progress'),
                    isNull(trips.deleted_at)
                )
            )
            .limit(1);
 
        if (activeTrip.length > 0) {
            throw new Error('drivers:errors.driverHasActiveTrip');
        }
 
        updateData.availability = driverAvailability.OFFLINE;
    }
 
    await db.update(drivers).set({
        ...updateData,
        updated_at: new Date().toISOString(),
    }).where(eq(drivers.id, driverId));
 
    return getDriverById(driverId);
}

/**
 * Deleta (soft delete) um motorista
 */
export async function deleteDriver(driverId: string): Promise<string> {
    const { db } = useDb();
 
    // Verificar se driver está numa viagem activa
    const activeTrip = await db
        .select({ id: trips.id, trip_code: trips.trip_code })
        .from(trips)
        .where(
            and(
                eq(trips.driver_id, driverId),
                eq(trips.status, 'in_progress'),
                isNull(trips.deleted_at)
            )
        )
        .limit(1);
 
    if (activeTrip.length > 0) {
        throw new Error('drivers:errors.driverHasActiveTrip');
    }
 
    await db.update(drivers).set({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active:  false,
    }).where(eq(drivers.id, driverId));
 
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