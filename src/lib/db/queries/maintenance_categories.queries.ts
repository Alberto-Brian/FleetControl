// ========================================
// FILE: src/lib/db/queries/maintenance_categories.queries.ts (ATUALIZADO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { maintenance_categories, maintenances } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateMaintenanceCategory, IUpdateMaintenanceCategory, IMaintenanceCategory } from '@/lib/types/maintenance_category';

/**
 * ✅ Busca categoria por nome
 */
export async function findMaintenanceCategoryByName(name: string): Promise<IMaintenanceCategory | null> {
    const { db } = useDb();
    const result = await db
        .select()
        .from(maintenance_categories)
        .where(eq(maintenance_categories.name, name))
        .limit(1);

    return result[0] || null;
}

/**
 * ✅ Verifica se categoria tem manutenções vinculadas
 */
export async function getMaintenancesByCategory(categoryId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(maintenances)
        .where(
            and(
                eq(maintenances.category_id, categoryId),
                isNull(maintenances.deleted_at)
            )
        );

    return result;
}

/**
 * Cria categoria
 */
export async function createMaintenanceCategory(categoryData: ICreateMaintenanceCategory): Promise<IMaintenanceCategory> {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    const result = await db
        .insert(maintenance_categories)
        .values({
            id,
            color: categoryData.color || '#F59E0B',
            ...categoryData,
        })
        .returning();

    return result[0];
}

/**
 * Obtém todas as categorias
 */
export async function getAllMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    const { db } = useDb();
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

/**
 * Busca categoria por ID
 */
export async function getMaintenanceCategoryById(categoryId: string): Promise<IMaintenanceCategory | null> {
    const { db } = useDb();
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

/**
 * Atualiza categoria
 */
export async function updateMaintenanceCategory(categoryId: string, categoryData: IUpdateMaintenanceCategory): Promise<IMaintenanceCategory> {
    const { db } = useDb();
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

/**
 * Deleta categoria
 */
export async function deleteMaintenanceCategory(categoryId: string): Promise<string> {
    const { db } = useDb();
    
    await db
        .update(maintenance_categories)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(maintenance_categories.id, categoryId));

    return categoryId;
}

/**
 * Obtém categorias activas
 */
export async function getActiveMaintenanceCategories(): Promise<IMaintenanceCategory[]> {
    const { db } = useDb();
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