import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { drivers } from './drivers';
import { driver_shifts } from './driver_shifts';

// ─── Tabela de membros: driver_shift_members ──────────────────────────────────
// Cada linha associa um motorista a um turno.
// is_leader = 1 → este motorista é o líder do turno.
// Um turno pode ter no máximo um líder (enforced na query layer).

export const driver_shift_members = sqliteTable('driver_shift_members', {
  id:        text('id').primaryKey(),
  shift_id:  text('shift_id').notNull().references(() => driver_shifts.id, { onDelete: 'cascade' }),
  driver_id: text('driver_id').notNull().references(() => drivers.id),
  is_leader: integer('is_leader', { mode: 'boolean' }).notNull().default(false),
  notes:     text('notes'),                         // Nota específica para este membro neste turno
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const driverShiftsRelations = relations(driver_shifts, ({ many }) => ({
  members: many(driver_shift_members),
}));

export const driverShiftMembersRelations = relations(driver_shift_members, ({ one }) => ({
  shift:  one(driver_shifts, { fields: [driver_shift_members.shift_id],  references: [driver_shifts.id] }),
  driver: one(drivers,       { fields: [driver_shift_members.driver_id], references: [drivers.id] }),
}));