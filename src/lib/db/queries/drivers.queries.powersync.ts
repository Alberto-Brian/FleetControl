// ========================================
// FILE: src/lib/db/queries/drivers.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first), Prompt 6.2 — primeiro
// domínio cortado para PowerSync-first (`powersync.db` como fonte
// operacional principal, substituindo `app.db`/Drizzle). Espelha 1:1 as
// assinaturas e o comportamento de `drivers.queries.ts` (mesmos nomes,
// mesmos parâmetros, mesma forma de retorno, mesmas mensagens de erro) —
// `drivers-listeners.ts` só troca a origem do import, a lógica de
// validação/negócio em si (nomes duplicados, carta expirada, viagem
// activa) fica exactamente onde estava, inalterada.
//
// `drivers.queries.ts` (Drizzle/app.db) NÃO foi tocado nem removido —
// fica como referência/backup, conforme a regra explícita da Fase 6
// ("app.db deve permanecer apenas como backup/referência de migração").
//
// Seam temporário, documentado: a verificação de "viagem activa"
// (updateDriver/deleteDriver) continua a consultar `trips` via app.db
// (useDb(), Drizzle), não via powersync.db — Trips só é cortado no
// Prompt 6.5 desta mesma fase; até lá, uma viagem criada nesta mesma
// instância do Desktop só existe em app.db, nunca em powersync.db (as
// duas bases não se espelham uma à outra localmente). Verificar
// powersync.db aqui produziria falsos-negativos (deixaria alterar/apagar
// um motorista com uma viagem activa real). Remover este seam faz parte
// do Prompt 6.5.
import { getPowerSyncDb } from '@/lib/powersync/client';
import { getSessionOrganizationId } from '@/helpers/ipc/services/auth/token-store';
import { generateUuid } from '@/lib/utils/cripto';
import { useDb } from '@/lib/db/db_helpers';
import { trips } from '@/lib/db/schemas/trips';
import { and, eq, isNull } from 'drizzle-orm';
import { ICreateDriver, IUpdateDriver, IDriver } from '@/lib/types/driver';
import { IPaginationParams, IPaginatedResult } from '@/lib/types/pagination';
import { driverStatus, driverAvailability } from '@/lib/db/schemas/drivers';

// ── Mapeamento de linha ──────────────────────────────────────────────────
// PowerSync devolve tipos SQLite crus (is_active como 0/1) — nunca
// coeridos automaticamente para boolean como o `{mode:'boolean'}` do
// Drizzle fazia.
interface DriverRow {
  id: string; name: string; tax_id: string | null; id_number: string | null;
  birth_date: string | null; phone: string | null; email: string | null;
  address: string | null; city: string | null; state: string | null;
  postal_code: string | null; license_number: string; license_category: string;
  license_expiry_date: string; hire_date: string | null; status: string;
  availability: string; photo: string | null; notes: string | null;
  is_active: number; created_at: string; updated_at: string;
}

function mapRow(row: DriverRow): IDriver {
  return {
    id: row.id, name: row.name, tax_id: row.tax_id, id_number: row.id_number,
    birth_date: row.birth_date, phone: row.phone, email: row.email,
    address: row.address, city: row.city, state: row.state, postal_code: row.postal_code,
    license_number: row.license_number, license_category: row.license_category,
    license_expiry_date: row.license_expiry_date, hire_date: row.hire_date,
    status: row.status as IDriver['status'], availability: row.availability as IDriver['availability'],
    photo: row.photo, notes: row.notes, is_active: !!row.is_active,
    created_at: row.created_at, updated_at: row.updated_at,
  };
}

const DRIVER_COLUMNS = `id, name, tax_id, id_number, birth_date, phone, email, address, city, state,
  postal_code, license_number, license_category, license_expiry_date, hire_date, status,
  availability, photo, notes, is_active, created_at, updated_at`;

/**
 * ✅ Busca motorista por número de carta
 */
export async function findDriverByLicenseNumber(licenseNumber: string) {
  const db = await getPowerSyncDb();
  return db.getOptional<{ id: string; name: string; license_number: string }>(
    `SELECT id, name, license_number FROM drivers WHERE license_number = ? AND deleted_at IS NULL LIMIT 1`,
    [licenseNumber],
  );
}

/**
 * ✅ Busca motorista por NIF
 */
export async function findDriverByTaxId(taxId: string) {
  const db = await getPowerSyncDb();
  return db.getOptional<{ id: string; name: string; tax_id: string | null }>(
    `SELECT id, name, tax_id FROM drivers WHERE tax_id = ? AND deleted_at IS NULL LIMIT 1`,
    [taxId],
  );
}

/**
 * ✅ Verifica se já existe motorista com a mesma carta (exceto o próprio)
 */
export async function hasDriverWithLicense(licenseNumber: string, excludeId?: string): Promise<boolean> {
  const db = await getPowerSyncDb();
  const sql = excludeId
    ? `SELECT id FROM drivers WHERE license_number = ? AND deleted_at IS NULL AND id != ? LIMIT 1`
    : `SELECT id FROM drivers WHERE license_number = ? AND deleted_at IS NULL LIMIT 1`;
  const params = excludeId ? [licenseNumber, excludeId] : [licenseNumber];
  const row = await db.getOptional(sql, params);
  return !!row;
}

/**
 * ✅ Verifica se já existe motorista com o mesmo NIF (exceto o próprio)
 */
export async function hasDriverWithTaxId(taxId: string, excludeId?: string): Promise<boolean> {
  const db = await getPowerSyncDb();
  const sql = excludeId
    ? `SELECT id FROM drivers WHERE tax_id = ? AND deleted_at IS NULL AND id != ? LIMIT 1`
    : `SELECT id FROM drivers WHERE tax_id = ? AND deleted_at IS NULL LIMIT 1`;
  const params = excludeId ? [taxId, excludeId] : [taxId];
  const row = await db.getOptional(sql, params);
  return !!row;
}

/**
 * Cria um novo motorista
 */
export async function createDriver(driverData: ICreateDriver): Promise<IDriver> {
  const db = await getPowerSyncDb();
  const id = generateUuid();
  const organizationId = getSessionOrganizationId();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO drivers (
      id, organization_id, name, tax_id, id_number, birth_date, phone, email, address, city, state,
      postal_code, license_number, license_category, license_expiry_date, hire_date, photo, notes,
      status, availability, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, organizationId, driverData.name, driverData.tax_id ?? null, driverData.id_number ?? null,
      driverData.birth_date ?? null, driverData.phone ?? null, driverData.email ?? null,
      driverData.address ?? null, driverData.city ?? null, driverData.state ?? null,
      driverData.postal_code ?? null, driverData.license_number, driverData.license_category,
      driverData.license_expiry_date, driverData.hire_date ?? null, driverData.photo ?? null,
      driverData.notes ?? null, driverStatus.ACTIVE, driverAvailability.AVAILABLE, 1, now, now,
    ],
  );

  const created = await getDriverById(id);
  return created as IDriver;
}

/**
 * Obtém todos os motoristas (não deletados)
 */
export async function getAllDrivers(params: IPaginationParams = {}): Promise<IPaginatedResult<IDriver>> {
  const db = await getPowerSyncDb();

  const page   = params.page  || 1;
  const limit  = params.limit || 20;
  const offset = (page - 1) * limit;

  const filters: string[] = ['deleted_at IS NULL'];
  const filterParams: unknown[] = [];

  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    filters.push('(LOWER(name) LIKE ? OR LOWER(license_number) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ?)');
    filterParams.push(s, s, s, s);
  }
  // Reutilizamos "status" (IPaginationParams) para filtrar por availability, mesma convenção do Drizzle original.
  if (params.status && params.status !== 'all') {
    filters.push('availability = ?');
    filterParams.push(params.status);
  }

  const where = filters.join(' AND ');

  const totalRow = await db.get<{ total: number }>(`SELECT COUNT(*) as total FROM drivers WHERE ${where}`, filterParams);
  const total = totalRow.total;

  const rows = await db.getAll<DriverRow>(
    `SELECT ${DRIVER_COLUMNS} FROM drivers WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...filterParams, limit, offset],
  );

  // Counts por availability/status — sem filtro de availability (totais reais), só o de pesquisa.
  const baseFilters: string[] = ['deleted_at IS NULL'];
  const baseParams: unknown[] = [];
  if (params.search?.trim()) {
    const s = `%${params.search.toLowerCase()}%`;
    baseFilters.push('(LOWER(name) LIKE ? OR LOWER(license_number) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(email) LIKE ?)');
    baseParams.push(s, s, s, s);
  }
  const baseWhere = baseFilters.join(' AND ');

  const availabilityCountsRaw = await db.getAll<{ availability: string; count: number }>(
    `SELECT availability, COUNT(*) as count FROM drivers WHERE ${baseWhere} GROUP BY availability`, baseParams,
  );
  const statusCountsRaw = await db.getAll<{ status: string; count: number }>(
    `SELECT status, COUNT(*) as count FROM drivers WHERE ${baseWhere} GROUP BY status`, baseParams,
  );

  const statusCounts: Record<string, number> = {
    available: 0, on_trip: 0, offline: 0, on_leave: 0, terminated: 0,
  };
  for (const row of availabilityCountsRaw) {
    if (row.availability in statusCounts) statusCounts[row.availability] = row.count;
  }
  for (const row of statusCountsRaw) {
    if (row.status === 'on_leave' || row.status === 'terminated') statusCounts[row.status] = row.count;
  }

  return {
    data: rows.map(mapRow),
    pagination: {
      total, page, limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
    statusCounts,
  };
}

/**
 * Obtém um motorista por ID
 */
export async function getDriverById(driverId: string): Promise<IDriver | null> {
  const db = await getPowerSyncDb();
  const row = await db.getOptional<DriverRow>(
    `SELECT ${DRIVER_COLUMNS} FROM drivers WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
    [driverId],
  );
  return row ? mapRow(row) : null;
}

/**
 * Atualiza um motorista
 * ✅ Retorna o motorista completo atualizado
 */
export async function updateDriver(driverId: string, driverData: IUpdateDriver): Promise<IDriver | null> {
  const db = await getPowerSyncDb();

  const updateData: Record<string, unknown> = { ...driverData };

  if (driverData.status === driverStatus.ON_LEAVE || driverData.status === driverStatus.TERMINATED) {
    // Seam temporário — ver comentário no topo do ficheiro. Consulta app.db
    // (Trips ainda não cortado para PowerSync), não powersync.db.
    const { db: legacyDb } = useDb();
    const activeTrip = await legacyDb
      .select({ id: trips.id })
      .from(trips)
      .where(and(eq(trips.driver_id, driverId), eq(trips.status, 'in_progress'), isNull(trips.deleted_at)))
      .limit(1);

    if (activeTrip.length > 0) {
      throw new Error('drivers:errors.driverHasActiveTrip');
    }

    updateData.availability = driverAvailability.OFFLINE;
  }

  const now = new Date().toISOString();
  // Nunca vincular `undefined` como parâmetro SQL (o SDK rejeita) — um campo
  // genuinamente não fornecido nunca deve entrar no UPDATE de qualquer forma.
  const fields = Object.keys(updateData).filter(f => updateData[f] !== undefined);
  if (fields.length > 0) {
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    await db.execute(
      `UPDATE drivers SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...fields.map(f => updateData[f]), now, driverId],
    );
  }

  return getDriverById(driverId);
}

/**
 * Deleta (soft delete) um motorista
 */
export async function deleteDriver(driverId: string): Promise<string> {
  const db = await getPowerSyncDb();

  // Seam temporário — ver comentário no topo do ficheiro.
  const { db: legacyDb } = useDb();
  const activeTrip = await legacyDb
    .select({ id: trips.id, trip_code: trips.trip_code })
    .from(trips)
    .where(and(eq(trips.driver_id, driverId), eq(trips.status, 'in_progress'), isNull(trips.deleted_at)))
    .limit(1);

  if (activeTrip.length > 0) {
    throw new Error('drivers:errors.driverHasActiveTrip');
  }

  const now = new Date().toISOString();
  await db.execute(
    `UPDATE drivers SET deleted_at = ?, updated_at = ?, is_active = 0 WHERE id = ?`,
    [now, now, driverId],
  );

  return driverId;
}

/**
 * Obtém motoristas activos
 */
export async function getActiveDrivers(): Promise<IDriver[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<DriverRow>(
    `SELECT ${DRIVER_COLUMNS} FROM drivers WHERE status = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY name DESC`,
    [driverStatus.ACTIVE],
  );
  return rows.map(mapRow);
}

/**
 * Obtém motoristas activos e disponíveis
 */
export async function getActiveAndAvailableDrivers(): Promise<IDriver[]> {
  const db = await getPowerSyncDb();
  const rows = await db.getAll<DriverRow>(
    `SELECT ${DRIVER_COLUMNS} FROM drivers WHERE status = ? AND availability = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY name DESC`,
    [driverStatus.ACTIVE, driverAvailability.AVAILABLE],
  );
  return rows.map(mapRow);
}

/**
 * Obtém motoristas com licenças próximas do vencimento
 */
export async function getExpiringLicenses(days: number = 30): Promise<IDriver[]> {
  const db = await getPowerSyncDb();

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const rows = await db.getAll<DriverRow>(
    `SELECT ${DRIVER_COLUMNS} FROM drivers
     WHERE deleted_at IS NULL AND status = ?
       AND license_expiry_date >= ? AND license_expiry_date <= ?
     ORDER BY license_expiry_date`,
    [driverStatus.ACTIVE, today.toISOString().split('T')[0], futureDate.toISOString().split('T')[0]],
  );
  return rows.map(mapRow);
}
