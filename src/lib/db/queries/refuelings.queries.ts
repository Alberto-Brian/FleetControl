// ========================================
// FILE: src/lib/db/queries/refuelings.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { refuelings, vehicles, drivers } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateRefueling } from '@/lib/types/refueling';

export async function createRefueling(refuelingData: ICreateRefueling) {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const totalCost = refuelingData.liters * refuelingData.price_per_liter;

    const result = await db
        .insert(refuelings)
        .values({
            id,
            refueling_date: new Date().toISOString(),
            total_cost: totalCost,
            ...refuelingData,
        })
        .returning();

    return result[0];
}

export async function getAllRefuelings() {
    const { db } = useDb();
    const result = await db
        .select({
            id: refuelings.id,
            vehicle_id: refuelings.vehicle_id,
            vehicle_license: vehicles.license_plate,
            driver_name: drivers.name,
            refueling_date: refuelings.refueling_date,
            fuel_type: refuelings.fuel_type,
            liters: refuelings.liters,
            price_per_liter: refuelings.price_per_liter,
            total_cost: refuelings.total_cost,
            current_mileage: refuelings.current_mileage,
            is_full_tank: refuelings.is_full_tank,
            created_at: refuelings.created_at,
        })
        .from(refuelings)
        .leftJoin(vehicles, eq(refuelings.vehicle_id, vehicles.id))
        .leftJoin(drivers, eq(refuelings.driver_id, drivers.id))
        .where(isNull(refuelings.deleted_at))
        .orderBy(desc(refuelings.refueling_date));

    return result;
}

export async function getRefuelingsByVehicle(vehicleId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(refuelings)
        .where(
            and(
                eq(refuelings.vehicle_id, vehicleId),
                isNull(refuelings.deleted_at)
            )
        )
        .orderBy(desc(refuelings.refueling_date));

    return result;
}
