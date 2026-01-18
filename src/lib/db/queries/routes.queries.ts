// ========================================
// FILE: src/lib/db/queries/routes.queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { routes } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull } from 'drizzle-orm';
import { ICreateRoute, IUpdateRoute } from '@/lib/types/route';

export async function createRoute(routeData: ICreateRoute) {
    const id = generateUuid();
    
    if (dbManager.shouldRotate()) {
        dbManager.rotate();
    }

    const result = await db
        .insert(routes)
        .values({
            id,
            route_type: 'regular',
            ...routeData,
        })
        .returning();

    return result[0];
}

export async function getAllRoutes() {
    const result = await db
        .select({
            id: routes.id,
            name: routes.name,
            origin: routes.origin,
            destination: routes.destination,
            distance_km: routes.distance_km,
            estimated_duration_hours: routes.estimated_duration_hours,
            route_type: routes.route_type,
            description: routes.description,
            is_active: routes.is_active,
            created_at: routes.created_at,
        })
        .from(routes)
        .where(isNull(routes.deleted_at));

    return result;
}

export async function getRouteById(routeId: string) {
    const result = await db
        .select()
        .from(routes)
        .where(
            and(
                eq(routes.id, routeId),
                isNull(routes.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateRoute(routeId: string, routeData: IUpdateRoute) {
    const result = await db
        .update(routes)
        .set({
            ...routeData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(routes.id, routeId))
        .returning();

    return result[0];
}

export async function deleteRoute(routeId: string) {
    await db
        .update(routes)
        .set({
            deleted_at: new Date().toISOString(),
        })
        .where(eq(routes.id, routeId));

    return routeId;
}

export async function getActiveRoutes() {
    const result = await db
        .select()
        .from(routes)
        .where(
            and(
                eq(routes.is_active, true),
                isNull(routes.deleted_at)
            )
        );

    return result;
}