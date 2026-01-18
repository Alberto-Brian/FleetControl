// ========================================
// FILE: src/lib/db/queries/maintenance_categories.queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { maintenance_categories } from '@/lib/db/schemas/maintenance_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { isNull } from 'drizzle-orm';

export async function getAllMaintenanceCategories() {
    const result = await db
        .select({
            id: maintenance_categories.id,
            name: maintenance_categories.name,
            type: maintenance_categories.type,
            description: maintenance_categories.description,
            color: maintenance_categories.color,
        })
        .from(maintenance_categories)
        .where(isNull(maintenance_categories.deleted_at));

    return result;
}