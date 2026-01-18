// ========================================
// FILE: src/lib/db/queries/vehicle_categories.queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { vehicle_categories } from '@/lib/db/schemas/vehicle_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, isNull, desc } from 'drizzle-orm';
import { ICreateVehicleCategory, IUpdateVehicleCategory } from '@/lib/types/vehicle-category';

export async function createVehicleCategory(categoryData: ICreateVehicleCategory) {
    const id = generateUuid();
    
    if (dbManager.shouldRotate()) {
        console.log('🔄 Limite atingido, rotacionando...');
        dbManager.rotate();
    }

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
        });

    return result[0];
}

export async function getAllVehicleCategories() {
    const result = await db
        .select({
            id: vehicle_categories.id,
            name: vehicle_categories.name,
            description: vehicle_categories.description,
            color: vehicle_categories.color,
            is_active: vehicle_categories.is_active,
            created_at: vehicle_categories.created_at,
        })
        .from(vehicle_categories)
        .where(isNull(vehicle_categories.deleted_at))
        .orderBy(desc(vehicle_categories.created_at));

    return result;
}

export async function updateVehicleCategory(categoryId: string, categoryData: IUpdateVehicleCategory) {
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

export async function deleteVehicleCategory(categoryId: string) {
    await db
        .update(vehicle_categories)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(vehicle_categories.id, categoryId));

    return categoryId;
}