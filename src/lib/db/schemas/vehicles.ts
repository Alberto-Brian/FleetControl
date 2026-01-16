import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { vehicle_categories } from './vehicle_categories';

export const vehicleStatus = {
  AVAILABLE: 'available',
  IN_USE: 'in_use',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
} as const;

export type VehicleStatus = typeof vehicleStatus[keyof typeof vehicleStatus];

export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  category_id: text('category_id').notNull().references(() => vehicle_categories.id),
  license_plate: text('license_plate').notNull().unique(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  color: text('color'),
  chassis_number: text('chassis_number'),
  engine_number: text('engine_number'),
  fuel_tank_capacity: integer('fuel_tank_capacity'),
  current_mileage: integer('current_mileage').notNull().default(0),
  acquisition_date: text('acquisition_date'),
  acquisition_value: integer('acquisition_value'),
  status: text('status', { enum: [
    vehicleStatus.AVAILABLE,
    vehicleStatus.IN_USE,
    vehicleStatus.MAINTENANCE,
    vehicleStatus.INACTIVE,
  ] }).notNull().default(vehicleStatus.AVAILABLE),
  notes: text('notes'),
  photo: text('photo'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  category: one(vehicle_categories, {
    fields: [vehicles.category_id],
    references: [vehicle_categories.id],
  }),
}));

export const vehicleHelpers = {
  isActive: (vehicle: Vehicle): boolean => vehicle.deleted_at === null && vehicle.is_active,
  isAvailable: (vehicle: Vehicle): boolean => vehicle.status === vehicleStatus.AVAILABLE,
  getAge: (vehicle: Vehicle): number => new Date().getFullYear() - vehicle.year,
};
