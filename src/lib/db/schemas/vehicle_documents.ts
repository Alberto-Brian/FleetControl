import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { vehicles } from './vehicles';

export const vehicle_documents = sqliteTable('vehicle_documents', {
  id: text('id').primaryKey(),
  vehicle_id: text('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  document_type: text('document_type').notNull(), // insurance, license, inspection
  document_number: text('document_number'),
  issue_date: text('issue_date'),
  expiry_date: text('expiry_date'),
  value: integer('value'),
  file_path: text('file_path'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type VehicleDocument = typeof vehicle_documents.$inferSelect;
export type NewVehicleDocument = typeof vehicle_documents.$inferInsert;

export const vehicleDocumentsRelations = relations(vehicle_documents, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicle_documents.vehicle_id],
    references: [vehicles.id],
  }),
}));

export const vehicleDocumentHelpers = {
  isExpired: (doc: VehicleDocument): boolean => {
    if (!doc.expiry_date) return false;
    return new Date(doc.expiry_date) < new Date();
  },
  daysUntilExpiry: (doc: VehicleDocument): number | null => {
    if (!doc.expiry_date) return null;
    const diff = new Date(doc.expiry_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
  isExpiringSoon: (doc: VehicleDocument, days: number = 30): boolean => {
    const daysLeft = vehicleDocumentHelpers.daysUntilExpiry(doc);
    return daysLeft !== null && daysLeft <= days && daysLeft > 0;
  },
};