// ========================================
// FILE: src/lib/db/schemas/driver_shifts.ts
// ========================================
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { drivers } from './drivers';
import { driver_shift_members } from './driver_shift_members';

// ─── Enum de status do turno ─────────────────────────────────────────────────

export const shiftStatus = {
  DRAFT:    'draft',    // Rascunho — ainda a ser configurado
  ACTIVE:   'active',  // Em vigor
  ARCHIVED: 'archived', // Arquivado / histórico
} as const;

export type ShiftStatus = typeof shiftStatus[keyof typeof shiftStatus];

// ─── Tabela principal: driver_shifts ──────────────────────────────────────────
// Um turno é um plano de trabalho com nome, período e horário.
// Não interfere com a lógica de viagens, férias ou disponibilidade —
// é informação de planeamento puro.

export const driver_shifts = sqliteTable('driver_shifts', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),              // Ex: "Turno A — Janeiro 2025"
  description: text('description'),                 // Descrição opcional
  start_date:  text('start_date').notNull(),         // YYYY-MM-DD — início do período
  end_date:    text('end_date').notNull(),           // YYYY-MM-DD — fim do período
  start_time:  text('start_time').notNull(),         // HH:MM — hora de entrada
  end_time:    text('end_time').notNull(),           // HH:MM — hora de saída
  status:      text('status', { enum: [
    shiftStatus.DRAFT,
    shiftStatus.ACTIVE,
    shiftStatus.ARCHIVED,
  ] }).notNull().default(shiftStatus.DRAFT),
  notes:       text('notes'),
  created_at:  text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_at:  text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  deleted_at:  text('deleted_at'),
});
