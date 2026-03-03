// ========================================
// FILE: src/lib/db/queries/system_settings.queries.ts
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { system_settings } from '@/lib/db/schemas/system_settings';
import { eq } from 'drizzle-orm';
import {
  ISystemSettings,
  IUpdateSystemSettings,
  SYSTEM_SETTINGS_DEFAULTS,
} from '@/lib/types/system-settings';

const SYSTEM_ID = 'system_main';

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtém as configurações do sistema.
 * Se ainda não existirem, cria com os valores padrão e retorna.
 */
export async function getSystemSettings(): Promise<ISystemSettings> {
  const { db } = useDb();

  const result = await db
    .select()
    .from(system_settings)
    .where(eq(system_settings.id, SYSTEM_ID))
    .limit(1);

  if (result[0]) return result[0] as ISystemSettings;

  // Primeira vez — inicializar com defaults
  return createSystemSettings();
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE (interno — só chamado na primeira vez)
// ─────────────────────────────────────────────────────────────────────────────

async function createSystemSettings(): Promise<ISystemSettings> {
  const { db } = useDb();

  const result = await db
    .insert(system_settings)
    .values({ id: SYSTEM_ID, ...SYSTEM_SETTINGS_DEFAULTS })
    .returning();

  return result[0] as ISystemSettings;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE (upsert)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateSystemSettings(
  data: IUpdateSystemSettings
): Promise<ISystemSettings> {
  const { db } = useDb();

  // Garantir que o registo existe
  await getSystemSettings();

  await db
    .update(system_settings)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(eq(system_settings.id, SYSTEM_ID));

  return getSystemSettings();
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET (repõe os defaults de fábrica)
// ─────────────────────────────────────────────────────────────────────────────

export async function resetSystemSettings(): Promise<ISystemSettings> {
  return updateSystemSettings(SYSTEM_SETTINGS_DEFAULTS);
}