// src/lib/db/queries/maintenance_categories.queries.ts
import { dbManager, db } from '@/lib/db/db_client';
import { maintenance_categories } from '@/lib/db/schemas/maintenance_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory } from '@/lib/types/maintenance_category';

export async function createMaintenanceCategory(categoryData: ICreateMaintenanceCategory) {
    const id = generateUuid();
    
    if (dbManager.shouldRotate()) {
        dbManager.rotate();
    }

    const result = await db
        .insert(maintenance_categories)
        .values({
            id,
            color: '#F59E0B',
            ...categoryData,
        })
        .returning();

    return result[0];
}

export async function getAllMaintenanceCategories() {
    const result = await db
        .select({
            id: maintenance_categories.id,
            name: maintenance_categories.name,
            type: maintenance_categories.type,
            description: maintenance_categories.description,
            color: maintenance_categories.color,
            is_active: maintenance_categories.is_active,
            created_at: maintenance_categories.created_at,
        })
        .from(maintenance_categories)
        .where(isNull(maintenance_categories.deleted_at));

    return result;
}

export async function getMaintenanceCategoryById(categoryId: string) {
    const result = await db
        .select()
        .from(maintenance_categories)
        .where(
            and(
                eq(maintenance_categories.id, categoryId),
                isNull(maintenance_categories.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateMaintenanceCategory(categoryId: string, categoryData: IUpdateMaintenanceCategory) {
    const result = await db
        .update(maintenance_categories)
        .set({
            ...categoryData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenance_categories.id, categoryId))
        .returning();

    return result[0];
}

export async function deleteMaintenanceCategory(categoryId: string) {
    await db
        .update(maintenance_categories)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(maintenance_categories.id, categoryId));

    return categoryId;
}

export async function getActiveMaintenanceCategories() {
    const result = await db
        .select()
        .from(maintenance_categories)
        .where(
            and(
                eq(maintenance_categories.is_active, true),
                isNull(maintenance_categories.deleted_at)
            )
        );

    return result;
}