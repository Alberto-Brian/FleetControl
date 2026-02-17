// ========================================
// FILE: src/lib/db/queries/fines.queries.ts (CORRIGIDO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { fines, vehicles, drivers } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateFine, IUpdateFine, PayFineData } from '@/lib/types/fine';

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

export async function getAllFines() {
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
            created_at: fines.created_at,
        })
        .from(fines)
        .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(fines.driver_id, drivers.id))
        .where(isNull(fines.deleted_at))
        .orderBy(desc(fines.fine_date));

    return result;
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