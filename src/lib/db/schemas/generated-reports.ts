// ========================================
// FILE: src/db/schema/generated-reports.schema.ts
// ========================================
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const generatedReports = sqliteTable('generated_reports', {
  id:           text('id').primaryKey(),
  type:         text('type', { enum: ['vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'financial', 'general'] }).notNull(),
  title:        text('title').notNull(),
  period_start: text('period_start').notNull(),
  period_end:   text('period_end').notNull(),
  language:     text('language', { enum: ['pt', 'en'] }).notNull().default('pt'),
  file_name:    text('file_name').notNull(),
  file_size:    integer('file_size'),            // bytes
  data_json:    text('data_json').notNull(),      // snapshot completo dos dados
  stats_json:   text('stats_json').notNull(),     // snapshot das estatísticas
  created_at:   text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by:   text('created_by'),
});

export type GeneratedReport    = typeof generatedReports.$inferSelect;
export type NewGeneratedReport = typeof generatedReports.$inferInsert;