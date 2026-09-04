// ========================================
// FILE: src/lib/db/queries/routes.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.9 — Routes.
// Confirmado na investigação do Prompt 6.5: Routes já tinha CRUD legado
// completo no Desktop (não é um domínio novo sem UI) — corte mecânico
// igual aos 7 domínios prioritários. `routes.queries.ts` (Drizzle/app.db)
// não tocado, fica como backup. Sem dependências cruzadas — org-only,
// tabela dedicada, nome/colunas idênticos entre local e PowerSync
// (confirmado contra schema.ts antes de escrever).
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateRoute, IUpdateRoute, IRoute } from '@/lib/types/route';

interface RouteRow {
  id: string; name: string; origin: string; destination: string; distance_km: number;
  estimated_duration_hours: number | null; route_type: string; description: string | null;
  waypoints: string | null; is_active: number; created_at: string;
}

function mapRow(row: RouteRow): IRoute {
  return {
    id: row.id, name: row.name, origin: row.origin, destination: row.destination,
    distance_km: row.distance_km, estimated_duration_hours: row.estimated_duration_hours ?? undefined,
    route_type: row.route_type, description: row.description ?? undefined, waypoints: row.waypoints ?? undefined,
    is_active: !!row.is_active, created_at: row.created_at,
  };
}

const ROUTE_COLUMNS = `id, name, origin, destination, distance_km, estimated_duration_hours, route_type, description, waypoints, is_active, created_at`;

export async function createRoute(routeData: ICreateRoute): Promise<IRoute> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();
  const routeType = routeData.route_type || 'regular';

  await db.execute(
    `INSERT INTO routes (
      id, organization_id, name, origin, destination, distance_km, estimated_duration_hours,
      route_type, description, waypoints, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, routeData.name, routeData.origin, routeData.destination, routeData.distance_km,
      routeData.estimated_duration_hours ?? null, routeType, routeData.description ?? null,
      routeData.waypoints ?? null, 1, now, now,
    ],
  );

  return { id, name: routeData.name, origin: routeData.origin, destination: routeData.destination,
    distance_km: routeData.distance_km, estimated_duration_hours: routeData.estimated_duration_hours,
    route_type: routeType, description: routeData.description, waypoints: routeData.waypoints,
    is_active: true, created_at: now };
}

export async function getAllRoutes(): Promise<IRoute[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<RouteRow>(`SELECT ${ROUTE_COLUMNS} FROM routes WHERE deleted_at IS NULL`);
  return rows.map(mapRow);
}

export async function getRouteById(routeId: string): Promise<IRoute | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<RouteRow>(
    `SELECT ${ROUTE_COLUMNS} FROM routes WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [routeId],
  );
  return row ? mapRow(row) : null;
}

export async function updateRoute(routeId: string, routeData: IUpdateRoute): Promise<IRoute | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...routeData };
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;
  delete updateData.status; // sem coluna equivalente, nunca esteve no schema local

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE routes SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), routeId],
    );
  }
  return getRouteById(routeId);
}

export async function deleteRoute(routeId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(`UPDATE routes SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), routeId]);
  return routeId;
}

export async function getActiveRoutes(): Promise<IRoute[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<RouteRow>(`SELECT ${ROUTE_COLUMNS} FROM routes WHERE is_active = 1 AND deleted_at IS NULL`);
  return rows.map(mapRow);
}
