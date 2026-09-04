// ========================================
// FILE: src/lib/db/queries/fuel_stations.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.9 — Fuel
// Stations. Mesmo padrão de Routes/Workshops: CRUD legado já completo,
// corte mecânico. `fuel_stations.queries.ts` (Drizzle/app.db) não tocado,
// fica como backup.
//
// Única diferença de tipo, não estrutural: localmente
// has_convenience_store/has_car_wash são TEXTO ('true'/'false', ver
// schemas/fuel_stations.ts e IFuelStation) — o PowerSync/API guardam-nos
// como boolean real (mesma descoberta já documentada na Fase 4,
// migrate-data.ts, para os dados reais do cliente). Convertido nos dois
// sentidos aqui para o `IFuelStation` (renderer) continuar a receber
// string, exactamente como sempre recebeu — zero mudança de contrato.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { ICreateFuelStation, IUpdateFuelStation, IFuelStation } from '@/lib/types/fuel-station';

interface FuelStationRow {
  id: string; name: string; brand: string | null; phone: string | null; address: string | null;
  city: string | null; fuel_types: string | null; has_convenience_store: number; has_car_wash: number;
  notes: string | null; is_active: number; created_at: string;
}

function mapRow(row: FuelStationRow): IFuelStation {
  return {
    id: row.id, name: row.name, brand: row.brand ?? undefined, phone: row.phone ?? undefined,
    address: row.address ?? undefined, city: row.city ?? undefined, fuel_types: row.fuel_types ?? undefined,
    has_convenience_store: row.has_convenience_store ? 'true' : 'false',
    has_car_wash: row.has_car_wash ? 'true' : 'false',
    notes: row.notes ?? undefined, is_active: !!row.is_active, created_at: row.created_at,
  };
}

const STATION_COLUMNS = `id, name, brand, phone, address, city, fuel_types, has_convenience_store, has_car_wash, notes, is_active, created_at`;

export async function createFuelStation(stationData: ICreateFuelStation): Promise<IFuelStation> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();
  const hasStore = stationData.has_convenience_store === 'true';
  const hasWash = stationData.has_car_wash === 'true';

  await db.execute(
    `INSERT INTO fuel_stations (
      id, organization_id, name, brand, phone, address, city, fuel_types,
      has_convenience_store, has_car_wash, notes, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, stationData.name, stationData.brand ?? null, stationData.phone ?? null,
      stationData.address ?? null, stationData.city ?? null, stationData.fuel_types ?? null,
      hasStore ? 1 : 0, hasWash ? 1 : 0, stationData.notes ?? null, 1, now, now,
    ],
  );

  return {
    id, name: stationData.name, brand: stationData.brand, phone: stationData.phone, address: stationData.address,
    city: stationData.city, fuel_types: stationData.fuel_types,
    has_convenience_store: hasStore ? 'true' : 'false', has_car_wash: hasWash ? 'true' : 'false',
    notes: stationData.notes, is_active: true, created_at: now,
  };
}

export async function findStationByName(name: string): Promise<IFuelStation | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<FuelStationRow>(
    `SELECT ${STATION_COLUMNS} FROM fuel_stations WHERE name = ? LIMIT 1`, [name],
  );
  return row ? mapRow(row) : null;
}

export async function getAllFuelStations(): Promise<IFuelStation[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<FuelStationRow>(`SELECT ${STATION_COLUMNS} FROM fuel_stations WHERE deleted_at IS NULL`);
  return rows.map(mapRow);
}

export async function getFuelStationById(stationId: string): Promise<IFuelStation | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<FuelStationRow>(
    `SELECT ${STATION_COLUMNS} FROM fuel_stations WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [stationId],
  );
  return row ? mapRow(row) : null;
}

export async function updateFuelStation(stationId: string, stationData: IUpdateFuelStation): Promise<IFuelStation | null> {
  const db = await getPowerSyncDb();
  const updateData: Record<string, unknown> = { ...stationData };
  if ('has_convenience_store' in updateData) updateData.has_convenience_store = updateData.has_convenience_store === 'true' ? 1 : 0;
  if ('has_car_wash' in updateData) updateData.has_car_wash = updateData.has_car_wash === 'true' ? 1 : 0;
  if ('is_active' in updateData) updateData.is_active = updateData.is_active ? 1 : 0;

  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE fuel_stations SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), new Date().toISOString(), stationId],
    );
  }
  return getFuelStationById(stationId);
}

export async function deleteFuelStation(stationId: string): Promise<string> {
  const db = await getPowerSyncDb();
  await db.execute(`UPDATE fuel_stations SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), stationId]);
  return stationId;
}
