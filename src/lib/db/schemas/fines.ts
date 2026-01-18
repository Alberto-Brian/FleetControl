// ========================================
// FILE: src/lib/db/schemas/fines.ts
// ========================================
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { vehicles } from './vehicles';
import { drivers } from './drivers';

export const fineStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  CONTESTED: 'contested',
  CANCELLED: 'cancelled',
} as const;

export type FineStatus = typeof fineStatus[keyof typeof fineStatus];

export const fines = sqliteTable('fines', {
  id: text('id').primaryKey(),
  vehicle_id: text('vehicle_id').notNull().references(() => vehicles.id),
  driver_id: text('driver_id').references(() => drivers.id),
  fine_number: text('fine_number').notNull().unique(),
  fine_date: text('fine_date').notNull(),
  infraction_type: text('infraction_type').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  fine_amount: integer('fine_amount').notNull(),
  due_date: text('due_date'),
  payment_date: text('payment_date'),
  status: text('status', { enum: [
    fineStatus.PENDING,
    fineStatus.PAID,
    fineStatus.CONTESTED,
    fineStatus.CANCELLED,
  ] }).notNull().default(fineStatus.PENDING),
  points: integer('points'),
  authority: text('authority'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Fine = typeof fines.$inferSelect;
export type NewFine = typeof fines.$inferInsert;

export const finesRelations = relations(fines, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [fines.vehicle_id],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [fines.driver_id],
    references: [drivers.id],
  }),
}));

export const fineHelpers = {
  isPaid: (fine: Fine): boolean => fine.status === fineStatus.PAID,
  isOverdue: (fine: Fine): boolean => {
    if (fine.status === fineStatus.PAID || fine.status === fineStatus.CANCELLED) {
      return false;
    }
    if (!fine.due_date) return false;
    return new Date(fine.due_date) < new Date();
  },
  getDaysUntilDue: (fine: Fine): number | null => {
    if (!fine.due_date) return null;
    const diff = new Date(fine.due_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};