// ========================================
// FILE: src/lib/db/queries/fuel_stations.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { fuel_stations } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateFuelStation, IUpdateFuelStation } from '@/lib/types/fuel-station';

export async function createFuelStation(stationData: ICreateFuelStation) {
    // await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(fuel_stations)
        .values({
            id,
            ...stationData,
        })
        .returning();

    return result[0];
}

// ✨ Helper para buscar por nome
export async function findStationByName(name: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(fuel_stations)
        .where(eq(fuel_stations.name, name))
        .limit(1);
    return result[0] || null;
}

// ✨ Helper para verificar abastecimentos vinculados
export async function getAllFuelStations() {
    const { db } = useDb();
    const result = await db
        .select({
            id: fuel_stations.id,
            name: fuel_stations.name,
            brand: fuel_stations.brand,
            phone: fuel_stations.phone,
            address: fuel_stations.address,
            city: fuel_stations.city,
            fuel_types: fuel_stations.fuel_types,
            has_convenience_store: fuel_stations.has_convenience_store,
            has_car_wash: fuel_stations.has_car_wash,
            is_active: fuel_stations.is_active,
            created_at: fuel_stations.created_at,
        })
        .from(fuel_stations)
        .where(isNull(fuel_stations.deleted_at));

    return result;
}

export async function getFuelStationById(stationId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(fuel_stations)
        .where(
            and(
                eq(fuel_stations.id, stationId),
                isNull(fuel_stations.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateFuelStation(stationId: string, stationData: IUpdateFuelStation) {
    const { db } = useDb();
    const result = await db
        .update(fuel_stations)
        .set({
            ...stationData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(fuel_stations.id, stationId))
        .returning();

    return result[0];
}

export async function deleteFuelStation(stationId: string) {
    const { db } = useDb();
    await db
        .update(fuel_stations)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(fuel_stations.id, stationId));

    return stationId;
}
