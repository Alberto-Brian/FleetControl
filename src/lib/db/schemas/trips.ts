import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { vehicles } from './vehicles';
import { drivers } from './drivers';
import { routes } from './routes';

export const tripStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = typeof tripStatus[keyof typeof tripStatus];

export const trips = sqliteTable('trips', {
  id: text('id').primaryKey(),
  vehicle_id: text('vehicle_id').notNull().references(() => vehicles.id),
  driver_id: text('driver_id').notNull().references(() => drivers.id),
  route_id: text('route_id').references(() => routes.id),
  trip_code: text('trip_code').notNull().unique(),
  start_date: text('start_date').notNull(),
  end_date: text('end_date'),
  start_mileage: integer('start_mileage').notNull(),
  end_mileage: integer('end_mileage'),
  origin: text('origin'),
  destination: text('destination'),
  purpose: text('purpose'),
  status: text('status', { enum: [
    tripStatus.IN_PROGRESS,
    tripStatus.COMPLETED,
    tripStatus.CANCELLED,
  ] }).notNull().default(tripStatus.IN_PROGRESS),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

export const tripsRelations = relations(trips, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [trips.vehicle_id],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [trips.driver_id],
    references: [drivers.id],
  }),
  route: one(routes, {
    fields: [trips.route_id],
    references: [routes.id],
  }),
}));

export const tripHelpers = {
  isCompleted: (trip: Trip): boolean => trip.status === tripStatus.COMPLETED,
  getTotalDistance: (trip: Trip): number | null => {
    if (!trip.end_mileage) return null;
    return trip.end_mileage - trip.start_mileage;
  },
  getDuration: (trip: Trip): number | null => {
    if (!trip.end_date) return null;
    const start = new Date(trip.start_date).getTime();
    const end = new Date(trip.end_date).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60)); // hours
  },
};