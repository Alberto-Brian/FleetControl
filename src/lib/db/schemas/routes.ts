import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const routes = sqliteTable('routes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  distance_km: integer('distance_km').notNull(),
  estimated_duration_hours: integer('estimated_duration_hours'),
  route_type: text('route_type').notNull().default('regular'),
  description: text('description'),
  waypoints: text('waypoints'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
})

export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;

export const routeHelpers = {
  isActive: (route: Route): boolean => route.deleted_at === null && route.is_active,
  getEstimatedHours: (route: Route): number => (route.estimated_duration_hours || 0) / 60,
};