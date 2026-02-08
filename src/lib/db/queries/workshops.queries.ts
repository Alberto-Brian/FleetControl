// ========================================
// FILE: src/lib/db/queries/workshops_queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { workshops } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateWorkshop, IUpdateWorkshop } from '@/lib/types/workshop';

export async function createWorkshop(workshopData: ICreateWorkshop) {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(workshops)
        .values({
            id,
            ...workshopData,
        })
        .returning();

    return result[0];
}

export async function getAllWorkshops() {
    const { db } = useDb();
    const result = await db
        .select({
            id: workshops.id,
            name: workshops.name,
            phone: workshops.phone,
            email: workshops.email,
            address: workshops.address,
            city: workshops.city,
            specialties: workshops.specialties,
            is_active: workshops.is_active,
            created_at: workshops.created_at,
        })
        .from(workshops)
        .where(isNull(workshops.deleted_at));

    return result;
}

export async function getWorkshopById(workshopId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(workshops)
        .where(
            and(
                eq(workshops.id, workshopId),
                isNull(workshops.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function findWorkshopByName(name: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(workshops)
        .where(eq(workshops.name, name))
        .limit(1);
    return result[0] || null;
}

export async function updateWorkshop(workshopId: string, workshopData: IUpdateWorkshop) {
    const { db } = useDb();
    const result = await db
        .update(workshops)
        .set({
            ...workshopData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(workshops.id, workshopId))
        .returning();

    return result[0];
}

export async function deleteWorkshop(workshopId: string) {
    const { db } = useDb();
    await db
        .update(workshops)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(workshops.id, workshopId));

    return workshopId;
}
