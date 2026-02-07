// ========================================
// FILE: src/lib/db/queries/vehicle_categories.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { vehicle_categories } from '@/lib/db/schemas/vehicle_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, isNull, desc } from 'drizzle-orm';
import { ICreateVehicleCategory, IUpdateVehicleCategory, IVehicleCategory } from '@/lib/types/vehicle-category';

export async function createVehicleCategory(categoryData: ICreateVehicleCategory): Promise<IVehicleCategory> {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(vehicle_categories)
        .values({
            id: id,
            name: categoryData.name,
            description: categoryData.description,
            color: categoryData.color || '#3B82F6',
            is_active: true,
        })
        .returning({
            id: vehicle_categories.id,
            name: vehicle_categories.name,
            description: vehicle_categories.description,
            color: vehicle_categories.color,
            is_active: vehicle_categories.is_active,
            created_at: vehicle_categories.created_at,
            updated_at: vehicle_categories.updated_at
        });

    return result[0];
}

export async function findVehicleCategoryByName(name: string): Promise<IVehicleCategory>{
    const { db } = useDb();
    const result  = await db    
        .select({
            id: vehicle_categories.id,
            name: vehicle_categories.name,
            description: vehicle_categories.description,
            color: vehicle_categories.color,
            is_active: vehicle_categories.is_active,
            created_at: vehicle_categories.created_at,
            updated_at: vehicle_categories.updated_at
        })
        .from(vehicle_categories)
        .where(eq(vehicle_categories.name, name))

        return result[0];
}

export async function findVehicleCategoryById(category_id: string): Promise<IVehicleCategory>{
    const { db } = useDb();
    const result  = await db    
        .select({
            id: vehicle_categories.id,
            name: vehicle_categories.name,
            description: vehicle_categories.description,
            color: vehicle_categories.color,
            is_active: vehicle_categories.is_active,
            created_at: vehicle_categories.created_at,
            updated_at: vehicle_categories.updated_at
        })
        .from(vehicle_categories)
        .where(eq(vehicle_categories.id, category_id))

        return result[0];
}

export async function getAllVehicleCategories(): Promise<IVehicleCategory[]> {
    const { db } = useDb();
    const result = await db
        .select({
            id: vehicle_categories.id,
            name: vehicle_categories.name,
            description: vehicle_categories.description,
            color: vehicle_categories.color,
            is_active: vehicle_categories.is_active,
            created_at: vehicle_categories.created_at,
            updated_at: vehicle_categories.updated_at
        })
        .from(vehicle_categories)
        .where(isNull(vehicle_categories.deleted_at))
        .orderBy(desc(vehicle_categories.created_at))

    return result;
}

export async function updateVehicleCategory(categoryId: string, categoryData: IUpdateVehicleCategory): Promise<IVehicleCategory> {
    const { db } = useDb();
    const result = await db
        .update(vehicle_categories)
        .set({
            ...categoryData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicle_categories.id, categoryId))
        .returning();

    return result[0];
}

export async function deleteVehicleCategory(categoryId: string): Promise<string> {
    const { db } = useDb();
    await db
        .update(vehicle_categories)
        .set({
            is_active: false,
            deleted_at: new Date().toISOString(),
        })
        .where(eq(vehicle_categories.id, categoryId));

    return categoryId;
}
