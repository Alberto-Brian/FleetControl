// ========================================
// FILE: src/lib/db/queries/generated-reports.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { generatedReports } from '@/lib/db/schemas';
import { type NewGeneratedReport } from '@/lib/db/schemas/generated-reports';
import { eq, desc, and, gte, lte, like } from 'drizzle-orm';
import { generateUuid } from '@/lib/utils/cripto';

// ==================== SAVE ====================

export async function saveGeneratedReport(params: {
  type: NewGeneratedReport['type'];
  title: string;
  periodStart: string;
  periodEnd: string;
  language: 'pt' | 'en';
  fileName: string;
  fileSize?: number;
  data: any;
  stats: any;
  createdBy?: string;
}): Promise<string> {
  const { db } = useDb();
  const id = generateUuid();

  await db.insert(generatedReports).values({
    id,
    type:         params.type,
    title:        params.title,
    period_start: params.periodStart,
    period_end:   params.periodEnd,
    language:     params.language,
    file_name:    params.fileName,
    file_size:    params.fileSize,
    data_json:    JSON.stringify(params.data),
    stats_json:   JSON.stringify(params.stats),
    created_by:   params.createdBy,
  });

  return id;
}

// ==================== LIST ====================

export async function listGeneratedReports(filters?: {
  type?: NewGeneratedReport['type'];
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const { db } = useDb();
  let query = db
    .select({
      id:           generatedReports.id,
      type:         generatedReports.type,
      title:        generatedReports.title,
      period_start: generatedReports.period_start,
      period_end:   generatedReports.period_end,
      language:     generatedReports.language,
      file_name:    generatedReports.file_name,
      file_size:    generatedReports.file_size,
      stats_json:   generatedReports.stats_json,
      created_at:   generatedReports.created_at,
      created_by:   generatedReports.created_by,
      // NÃO buscar data_json na listagem (pode ser grande)
    })
    .from(generatedReports)
    .orderBy(desc(generatedReports.created_at))
    .$dynamic();

  const conditions = [];

  if (filters?.type) {
    conditions.push(eq(generatedReports.type, filters.type));
  }
  if (filters?.startDate) {
    conditions.push(gte(generatedReports.created_at, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(generatedReports.created_at, filters.endDate));
  }
  if (filters?.search) {
    conditions.push(like(generatedReports.title, `%${filters.search}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const rows = await query;

  return rows.map((r: any) => ({
    ...r,
    stats: JSON.parse(r.stats_json),
  }));
}

// ==================== GET ONE (com data_json) ====================

export async function getGeneratedReport(id: string) {
  const { db } = useDb();
  const [row] = await db
    .select()
    .from(generatedReports)
    .where(eq(generatedReports.id, id));

  if (!row) return null;

  return {
    ...row,
    data:  JSON.parse(row.data_json),
    stats: JSON.parse(row.stats_json),
  };
}

// ==================== DELETE ====================

export async function deleteGeneratedReport(id: string) {
  const { db } = useDb();
  await db.delete(generatedReports).where(eq(generatedReports.id, id));
}

// ==================== STATS ====================

export async function getGeneratedReportsStats() {
  const { db } = useDb();
  const all = await db
    .select({
      type:       generatedReports.type,
      created_at: generatedReports.created_at,
    })
    .from(generatedReports);

  const now      = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    total:     all.length,
    thisMonth: all.filter((r: any) => r.created_at.startsWith(thisMonth)).length,
    byType:    Object.fromEntries(
      ['vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'financial', 'general'].map(type => [
        type,
        all.filter((r: any) => r.type === type).length,
      ])
    ),
  };
}