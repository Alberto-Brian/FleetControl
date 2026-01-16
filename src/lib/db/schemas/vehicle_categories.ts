import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const vehicle_categories = sqliteTable('vehicle_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').notNull().default('#3B82F6'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type VehicleCategory = typeof vehicle_categories.$inferSelect;
export type NewVehicleCategory = typeof vehicle_categories.$inferInsert;

export const vehicleCategoryHelpers = {
  isActive: (category: VehicleCategory): boolean => category.deleted_at === null && category.is_active,
};