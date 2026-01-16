import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { vehicles } from './vehicles';
import { fuel_stations } from './fuel_stations';
import { drivers } from './drivers';
import { trips } from './trips';


export const fuelType = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ETHANOL: 'ethanol',
  CNG: 'cng',
} as const;

export type FuelType = typeof fuelType[keyof typeof fuelType];

export const refuelings = sqliteTable('refuelings', {
  id: text('id').primaryKey(),
  vehicle_id: text('vehicle_id').notNull().references(() => vehicles.id),
  driver_id: text('driver_id').references(() => drivers.id),
  trip_id: text('trip_id').references(() => trips.id),
  station_id: text('station_id').references(() => fuel_stations.id),
  refueling_date: text('refueling_date').notNull(),
  fuel_type: text('fuel_type', { enum: [
    fuelType.GASOLINE,
    fuelType.DIESEL,
    fuelType.ETHANOL,
    fuelType.CNG,
  ] }).notNull(),
  liters: integer('liters').notNull(),
  price_per_liter: integer('price_per_liter').notNull(),
  total_cost: integer('total_cost').notNull(),
  current_mileage: integer('current_mileage').notNull(),
  is_full_tank: integer('is_full_tank', { mode: 'boolean' }).notNull().default(false),
  invoice_number: text('invoice_number'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Refueling = typeof refuelings.$inferSelect;
export type NewRefueling = typeof refuelings.$inferInsert;

export const refuelingsRelations = relations(refuelings, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [refuelings.vehicle_id],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [refuelings.driver_id],
    references: [drivers.id],
  }),
  trip: one(trips, {
    fields: [refuelings.trip_id],
    references: [trips.id],
  }),
  station: one(fuel_stations, {
    fields: [refuelings.station_id],
    references: [fuel_stations.id],
  }),
}));

export const refuelingHelpers = {
  calculateConsumption: (refueling: Refueling, previousMileage: number): number | null => {
    if (!refueling.is_full_tank) return null;
    const distance = refueling.current_mileage - previousMileage;
    if (distance <= 0) return null;
    return distance / refueling.liters; // km/l
  },
};