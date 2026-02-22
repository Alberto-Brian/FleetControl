// ========================================
// FILE: src/lib/db/schemas/driver_leaves.ts
// ========================================
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { drivers } from './drivers';

export const leaveStatus = {
  SCHEDULED:    'scheduled',    // Agendada, data ainda não chegou
  PENDING_TRIP: 'pending_trip', // Data chegou mas driver está on_trip — aguarda viagem terminar
  ACTIVE:       'active',       // Em curso (driver está on_leave)
  COMPLETED:    'completed',    // Concluída (data de fim passou, driver voltou a available)
  CANCELLED:    'cancelled',    // Cancelada manualmente
} as const;

export type LeaveStatus = typeof leaveStatus[keyof typeof leaveStatus];

export const driver_leaves = sqliteTable('driver_leaves', {
  id:               text('id').primaryKey(),
  driver_id:        text('driver_id').notNull().references(() => drivers.id),
  start_date:       text('start_date').notNull(),   // YYYY-MM-DD
  end_date:         text('end_date').notNull(),      // YYYY-MM-DD (inclusive)
  reason:           text('reason'),                  // Motivo (opcional)
  notes:            text('notes'),
  status:           text('status', { enum: [
    leaveStatus.SCHEDULED,
    leaveStatus.PENDING_TRIP,
    leaveStatus.ACTIVE,
    leaveStatus.COMPLETED,
    leaveStatus.CANCELLED,
  ] }).notNull().default(leaveStatus.SCHEDULED),
  cancelled_at:     text('cancelled_at'),
  cancelled_reason: text('cancelled_reason'),
  created_at:       text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by:       text('created_by'),
  updated_at:       text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by:       text('updated_by'),
  deleted_at:       text('deleted_at'),
});

export type DriverLeave    = typeof driver_leaves.$inferSelect;
export type NewDriverLeave = typeof driver_leaves.$inferInsert;

export const driverLeavesRelations = relations(driver_leaves, ({ one }) => ({
  driver: one(drivers, {
    fields:     [driver_leaves.driver_id],
    references: [drivers.id],
  }),
}));