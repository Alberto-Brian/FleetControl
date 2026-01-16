import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { maintenance_categories } from './maintenance_categories';
import { vehicles } from './vehicles';
import { workshops } from './workshops';
import { maintenanceType } from './maintenance_categories';

export const maintenanceStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const maintenancePriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type MaintenanceStatus = typeof maintenanceStatus[keyof typeof maintenanceStatus];
export type MaintenancePriority = typeof maintenancePriority[keyof typeof maintenancePriority];

export const maintenances = sqliteTable('maintenances', {
  id: text('id').primaryKey(),
  vehicle_id: text('vehicle_id').notNull().references(() => vehicles.id),
  category_id: text('category_id').notNull().references(() => maintenance_categories.id),
  workshop_id: text('workshop_id').references(() => workshops.id),
  type: text('type', { enum: [
    maintenanceType.PREVENTIVE,
    maintenanceType.CORRECTIVE,
  ] }).notNull(),
  entry_date: text('entry_date').notNull(),
  exit_date: text('exit_date'),
  vehicle_mileage: integer('vehicle_mileage').notNull(),
  description: text('description').notNull(),
  diagnosis: text('diagnosis'),
  solution: text('solution'),
  parts_cost: integer('parts_cost').notNull().default(0),
  labor_cost: integer('labor_cost').notNull().default(0),
  total_cost: integer('total_cost').notNull().default(0),
  status: text('status', { enum: [
    maintenanceStatus.SCHEDULED,
    maintenanceStatus.IN_PROGRESS,
    maintenanceStatus.COMPLETED,
    maintenanceStatus.CANCELLED,
  ] }).notNull().default(maintenanceStatus.SCHEDULED),
  priority: text('priority', { enum: [
    maintenancePriority.LOW,
    maintenancePriority.NORMAL,
    maintenancePriority.HIGH,
    maintenancePriority.URGENT,
  ] }).notNull().default(maintenancePriority.NORMAL),
  work_order_number: text('work_order_number'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Maintenance = typeof maintenances.$inferSelect;
export type NewMaintenance = typeof maintenances.$inferInsert;

export const maintenancesRelations = relations(maintenances, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenances.vehicle_id],
    references: [vehicles.id],
  }),
  category: one(maintenance_categories, {
    fields: [maintenances.category_id],
    references: [maintenance_categories.id],
  }),
  workshop: one(workshops, {
    fields: [maintenances.workshop_id],
    references: [workshops.id],
  }),
}));

export const maintenanceHelpers = {
  isCompleted: (maintenance: Maintenance): boolean => maintenance.status === maintenanceStatus.COMPLETED,
  getDurationDays: (maintenance: Maintenance): number | null => {
    if (!maintenance.exit_date) return null;
    const entry = new Date(maintenance.entry_date).getTime();
    const exit = new Date(maintenance.exit_date).getTime();
    return Math.ceil((exit - entry) / (1000 * 60 * 60 * 24));
  },
  isOverdue: (maintenance: Maintenance): boolean => {
    if (maintenance.status === maintenanceStatus.COMPLETED || maintenance.status === maintenanceStatus.CANCELLED) {
      return false;
    }
    return new Date(maintenance.entry_date) < new Date();
  },
};