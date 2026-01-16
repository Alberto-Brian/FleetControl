import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { maintenances } from './maintenances';

export const maintenanceItemType = {
  PART: 'part',
  SERVICE: 'service',
} as const;

export type MaintenanceItemType = typeof maintenanceItemType[keyof typeof maintenanceItemType];

export const maintenance_items = sqliteTable('maintenance_items', {
  id: text('id').primaryKey(),
  maintenance_id: text('maintenance_id').notNull().references(() => maintenances.id, { onDelete: 'cascade' }),
  type: text('type', { enum: [
    maintenanceItemType.PART,
    maintenanceItemType.SERVICE,
  ] }).notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unit_price: integer('unit_price').notNull(),
  total_price: integer('total_price').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type MaintenanceItem = typeof maintenance_items.$inferSelect;
export type NewMaintenanceItem = typeof maintenance_items.$inferInsert;

export const maintenanceItemsRelations = relations(maintenance_items, ({ one }) => ({
  maintenance: one(maintenances, {
    fields: [maintenance_items.maintenance_id],
    references: [maintenances.id],
  }),
}));