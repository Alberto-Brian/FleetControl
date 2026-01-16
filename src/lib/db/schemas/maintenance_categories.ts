import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const maintenanceType = {
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
} as const;

export type MaintenanceType = typeof maintenanceType[keyof typeof maintenanceType];

export const maintenance_categories = sqliteTable('maintenance_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  type: text('type', { enum: [
    maintenanceType.PREVENTIVE,
    maintenanceType.CORRECTIVE,
  ] }).notNull().default(maintenanceType.CORRECTIVE),
  description: text('description'),
  color: text('color').notNull().default('#F59E0B'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type MaintenanceCategory = typeof maintenance_categories.$inferSelect;
export type NewMaintenanceCategory = typeof maintenance_categories.$inferInsert;

export const maintenanceCategoryHelpers = {
  isActive: (category: MaintenanceCategory): boolean => category.deleted_at === null && category.is_active,
};