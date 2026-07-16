// ========================================
// FILE: src/lib/db/queries/fines.queries.ts (CORRIGIDO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { fines, vehicles, drivers } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, sql, SQL, or, count, like } from 'drizzle-orm';
import { ICreateFine, IUpdateFine, PayFineData, IFine } from '@/lib/types/fine';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';

// ✅ HELPER: Buscar dados completos com JOINs
async function getFineWithDetails(fineId: string) {
    const { db } = useDb();
    const result = await db
        .select({
            id: fines.id,
            vehicle_id: fines.vehicle_id,
            driver_id: fines.driver_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            driver_name: drivers.name,
            fine_number: fines.fine_number,
            fine_date: fines.fine_date,
            infraction_type: fines.infraction_type,
            description: fines.description,
            location: fines.location,
            fine_amount: fines.fine_amount,
            due_date: fines.due_date,
            payment_date: fines.payment_date,
            status: fines.status,
            points: fines.points,
            authority: fines.authority,
            notes: fines.notes,
            responsible_party: fines.responsible_party,
            created_at: fines.created_at,
        })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(fines.driver_id, drivers.id))
        .where(eq(fines.id, fineId))
        .limit(1);

    return result[0] || null;
}

export async function createFine(fineData: ICreateFine) {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    await db
        .insert(fines)
        .values({
            id,
            status: 'pending',
            ...fineData,
            updated_at: new Date().toISOString()
        });

    // ✅ RETORNAR com dados completos (JOIN)
    return await getFineWithDetails(id);
}

export async function getAllFines(params: IPaginationParams = {}): Promise<IPaginatedResult<IFine>> {
    const { db } = useDb();

    const page   = params.page  || 1;
    const limit  = params.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [isNull(fines.deleted_at)];

    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        conditions.push(or(
            like(fines.fine_number,       s),
            like(vehicles.license_plate,  s),
            like(fines.infraction_type,   s),
            like(drivers.name,            s),
        )!);
    }
    if (params.status && params.status !== 'all') {
        conditions.push(eq(fines.status, params.status));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const selectFields = {
        id:              fines.id,
        vehicle_id:      fines.vehicle_id,
        driver_id:       fines.driver_id,
        vehicle_license: vehicles.license_plate,
        vehicle_brand:   vehicles.brand,
        vehicle_model:   vehicles.model,
        driver_name:     drivers.name,
        fine_number:     fines.fine_number,
        fine_date:       fines.fine_date,
        infraction_type: fines.infraction_type,
        description:     fines.description,
        location:        fines.location,
        fine_amount:     fines.fine_amount,
        due_date:        fines.due_date,
        payment_date:    fines.payment_date,
        status:          fines.status,
        points:            fines.points,
        authority:         fines.authority,
        notes:             fines.notes,
        responsible_party: fines.responsible_party,
        created_at:        fines.created_at,
    };

    const [{ total }] = await db
        .select({ total: count() })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers,  eq(fines.driver_id,  drivers.id))
        .where(whereClause);

    const data = await db
        .select(selectFields)
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers,  eq(fines.driver_id,  drivers.id))
        .where(whereClause)
        .orderBy(desc(fines.fine_date))
        .limit(limit)
        .offset(offset);

    // Counts por status (sem filtro de status)
    const baseConditions: SQL[] = [isNull(fines.deleted_at)];
    if (params.search?.trim()) {
        const s = `%${params.search.toLowerCase()}%`;
        baseConditions.push(or(
            like(fines.fine_number,      s),
            like(vehicles.license_plate, s),
            like(fines.infraction_type,  s),
            like(drivers.name,           s),
        )!);
    }
    const baseWhere = baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    const countsRaw = await db
        .select({ status: fines.status, count: count() })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers,  eq(fines.driver_id,  drivers.id))
        .where(baseWhere)
        .groupBy(fines.status);

    const [totals] = await db
        .select({
            totalAmount:   sql<number>`COALESCE(SUM(${fines.fine_amount}), 0)`,
            pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN ${fines.status} = 'pending' THEN ${fines.fine_amount} ELSE 0 END), 0)`,
        })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers,  eq(fines.driver_id,  drivers.id))
        .where(baseWhere);

    const statusCounts: Record<string, number> = {
        pending:   0,
        paid:      0,
        contested: 0,
        cancelled: 0,
    };
    for (const row of countsRaw) {
        statusCounts[row.status] = row.count;
    }

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages:  Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
        },
        statusCounts: {
            ...statusCounts,
            totalAmount:   totals?.totalAmount   ?? 0,
            pendingAmount: totals?.pendingAmount  ?? 0,
        },
    };
}

export async function getFineById(fineId: string) {
    // ✅ Retorna com dados completos
    return await getFineWithDetails(fineId);
}

export async function updateFine(fineId: string, fineData: IUpdateFine) {
    const { db } = useDb();
    
    await db
        .update(fines)
        .set({
            ...fineData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(fines.id, fineId));

    // ✅ RETORNAR com dados completos (JOIN)
    return await getFineWithDetails(fineId);
}

export async function markFineAsPaid(fineId: string, paymentData: PayFineData) {
    const { db } = useDb();
    
    await db
        .update(fines)
        .set({
            payment_date: paymentData.payment_date,
            status: 'paid',
            updated_at: new Date().toISOString(),
        })
        .where(eq(fines.id, fineId));

    // ✅ RETORNAR com dados completos (JOIN)
    return await getFineWithDetails(fineId);
}

export async function deleteFine(fineId: string) {
    const { db } = useDb();
    await db
        .update(fines)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(fines.id, fineId));

    return fineId;
}

export async function getPendingFines() {
    const { db } = useDb();
    const result = await db
        .select({
            id: fines.id,
            vehicle_id: fines.vehicle_id,
            driver_id: fines.driver_id,
            vehicle_license: vehicles.license_plate,
            driver_name: drivers.name,
            fine_number: fines.fine_number,
            fine_date: fines.fine_date,
            infraction_type: fines.infraction_type,
            description: fines.description,
            location: fines.location,
            fine_amount: fines.fine_amount,
            due_date: fines.due_date,
            status: fines.status,
            points: fines.points,
            authority: fines.authority,
            responsible_party: fines.responsible_party,
            created_at: fines.created_at,
        })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(fines.driver_id, drivers.id))
        .where(
            and(
                eq(fines.status, 'pending'),
                isNull(fines.deleted_at)
            )
        )
        .orderBy(desc(fines.fine_date));

    return result;
}