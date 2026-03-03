// ========================================
// FILE: src/lib/db/schemas/system_settings.ts
// ========================================
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Configurações persistentes do sistema.
 * Padrão single-row: apenas um registo com id = 'system_main'.
 *
 * Separação de responsabilidades:
 *   - system_settings (DB)  → decisões de negócio, PDF, relatórios, limites
 *   - localStorage          → tema, idioma, preferências de UI (não precisam de DB)
 */
export const system_settings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),

  // ── PDF / Relatórios ──────────────────────────────────────────────────────
  /** Mostrar marca de água nos relatórios PDF */
  pdf_watermark_enabled:  integer('pdf_watermark_enabled', { mode: 'boolean' }).notNull().default(false),
  /** Texto da marca de água (ex: "CONFIDENCIAL", "RASCUNHO") */
  pdf_watermark_text:     text('pdf_watermark_text').default('CONFIDENCIAL'),
  /** Opacidade da marca de água: 0.0 - 1.0 (guardado como texto "0.15") */
  pdf_watermark_opacity:  text('pdf_watermark_opacity').default('0.10'),
  /** Cor primária dos relatórios (hex) — cabeçalhos, títulos, badges */
  pdf_primary_color:      text('pdf_primary_color').default('#2563eb'),
  /** Cor secundária dos relatórios (hex) — textos auxiliares */
  pdf_secondary_color:    text('pdf_secondary_color').default('#64748b'),
  /** Mostrar rodapé com nome da empresa e paginação */
  pdf_show_footer:        integer('pdf_show_footer', { mode: 'boolean' }).notNull().default(true),
  /** Mostrar secção de resumo executivo nos relatórios gerais */
  pdf_show_summary:       integer('pdf_show_summary', { mode: 'boolean' }).notNull().default(true),
  /** Tamanho do papel: A4 | Letter */
  pdf_paper_size:         text('pdf_paper_size').default('A4'),
  /** Orientação: portrait | landscape */
  pdf_orientation:        text('pdf_orientation').default('portrait'),

  // ── Operações / Negócio ───────────────────────────────────────────────────
  /** Limite de km para alertar revisão do veículo */
  alert_mileage_threshold:    integer('alert_mileage_threshold').default(10000),
  /** Dias antes do vencimento da carta para alertar */
  alert_license_days_before:  integer('alert_license_days_before').default(30),
  /** Dias antes do vencimento do seguro para alertar */
  alert_insurance_days_before:integer('alert_insurance_days_before').default(30),
  /** Activar alertas de manutenção preventiva */
  alert_maintenance_enabled:  integer('alert_maintenance_enabled', { mode: 'boolean' }).notNull().default(true),
  /** Activar alertas de multas em atraso */
  alert_fines_enabled:        integer('alert_fines_enabled', { mode: 'boolean' }).notNull().default(true),

  // ── Viagens ───────────────────────────────────────────────────────────────
  /** Exigir aprovação para iniciar viagens */
  trips_require_approval:     integer('trips_require_approval', { mode: 'boolean' }).notNull().default(false),
  /** Exigir assinatura digital no final da viagem */
  trips_require_signature:    integer('trips_require_signature', { mode: 'boolean' }).notNull().default(false),
  /** Velocidade máxima registada (km/h) — 0 = sem limite */
  trips_max_speed:            integer('trips_max_speed').default(0),

  // ── Combustível ───────────────────────────────────────────────────────────
  /** Activar controlo de nível de combustível */
  fuel_level_control:         integer('fuel_level_control', { mode: 'boolean' }).notNull().default(true),
  /** Nível mínimo de combustível para alerta (%) */
  fuel_min_level_alert:       integer('fuel_min_level_alert').default(20),

  // ── Sistema / Sessão ──────────────────────────────────────────────────────
  /** Tempo de inactividade até logout automático (minutos, 0 = desactivado) */
  session_timeout_minutes:    integer('session_timeout_minutes').default(0),
  /** Permitir múltiplas sessões em simultâneo */
  session_multi_login:        integer('session_multi_login', { mode: 'boolean' }).notNull().default(true),
  /** Mostrar notificações no sistema */
  notifications_enabled:      integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),

  // ── Auditoria ─────────────────────────────────────────────────────────────
  /** Registar todas as acções do utilizador no log */
  audit_log_enabled:          integer('audit_log_enabled', { mode: 'boolean' }).notNull().default(true),
  /** Dias de retenção do log de auditoria */
  audit_log_retention_days:   integer('audit_log_retention_days').default(90),

  // ── Timestamps ────────────────────────────────────────────────────────────
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export type SystemSettings    = typeof system_settings.$inferSelect;
export type NewSystemSettings = typeof system_settings.$inferInsert;