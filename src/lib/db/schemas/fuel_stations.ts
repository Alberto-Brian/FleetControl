import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const fuel_stations = sqliteTable('fuel_stations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  fuel_types: text('fuel_types'),
  has_convenience_store: text('has_convenience_store').notNull().default('false'),
  has_car_wash: text('has_car_wash').notNull().default('false'),
  notes: text('notes'),
   is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type FuelStation = typeof fuel_stations.$inferSelect;
export type NewFuelStation = typeof fuel_stations.$inferInsert;

export const fuelStationHelpers = {
  isActive: (station: FuelStation): boolean => station.deleted_at === null && station.is_active,
};