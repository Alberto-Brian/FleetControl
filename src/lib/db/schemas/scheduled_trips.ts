// ========================================
// FILE: src/lib/db/schemas/scheduled_trips.ts
// ========================================
// Tabela para viagens agendadas para o futuro.
// Quando a scheduled_date chega, o scheduler cria automaticamente
// um registo em `trips` (com status in_progress) e marca esta como LAUNCHED.
//
// Estados:
//  scheduled     — agendada, data ainda não chegou
//  pending_leave — data chegou mas o driver está on_leave — aguarda fim de férias
//  launched      — convertida em trip real (trip_id preenchido)
//  cancelled     — cancelada manualmente
// ========================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { drivers }  from './drivers';
import { vehicles } from './vehicles';
import { routes }   from './routes';
import { trips }    from './trips';

export const scheduledTripStatus = {
  SCHEDULED:     'scheduled',      // Aguarda a data
  PENDING_LEAVE: 'pending_leave',  // Driver de licença — aguarda regresso
  LAUNCHED:      'launched',       // Trip real criada (trip_id preenchido)
  CANCELLED:     'cancelled',      // Cancelada manualmente
} as const;

export type ScheduledTripStatus = typeof scheduledTripStatus[keyof typeof scheduledTripStatus];

export const scheduled_trips = sqliteTable('scheduled_trips', {
  id:             text('id').primaryKey(),

  // Referências principais
  driver_id:      text('driver_id').notNull().references(() => drivers.id),
  vehicle_id:     text('vehicle_id').notNull().references(() => vehicles.id),
  route_id:       text('route_id').references(() => routes.id),

  // Quando lançar a viagem
  scheduled_date: text('scheduled_date').notNull(), // YYYY-MM-DD

  // Dados da viagem a criar
  origin:         text('origin'),
  destination:    text('destination'),
  purpose:        text('purpose'),
  notes:          text('notes'),

  // Estado
  status: text('status', {
    enum: [
      scheduledTripStatus.SCHEDULED,
      scheduledTripStatus.PENDING_LEAVE,
      scheduledTripStatus.LAUNCHED,
      scheduledTripStatus.CANCELLED,
    ],
  }).notNull().default(scheduledTripStatus.SCHEDULED),

  // Preenchido quando lançada
  trip_id:        text('trip_id').references(() => trips.id),
  launched_at:    text('launched_at'),

  // Cancelamento
  cancelled_at:     text('cancelled_at'),
  cancelled_reason: text('cancelled_reason'),

  // Auditoria
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
});

export type ScheduledTrip    = typeof scheduled_trips.$inferSelect;
export type NewScheduledTrip = typeof scheduled_trips.$inferInsert;

export const scheduledTripsRelations = relations(scheduled_trips, ({ one }) => ({
  driver:  one(drivers,  { fields: [scheduled_trips.driver_id],  references: [drivers.id]  }),
  vehicle: one(vehicles, { fields: [scheduled_trips.vehicle_id], references: [vehicles.id] }),
  route:   one(routes,   { fields: [scheduled_trips.route_id],   references: [routes.id]   }),
  trip:    one(trips,    { fields: [scheduled_trips.trip_id],     references: [trips.id]    }),
}));