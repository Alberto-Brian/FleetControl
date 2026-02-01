import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const driverStatus = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
} as const;

export const driverAvailability = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  OFFLINE: 'offline',
} as const;

export type DriverAvailability =
  typeof driverAvailability[keyof typeof driverAvailability];

export type DriverStatus = typeof driverStatus[keyof typeof driverStatus];

export const drivers = sqliteTable('drivers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  tax_id: text('tax_id').unique(),
  id_number: text('id_number'),
  birth_date: text('birth_date'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postal_code: text('postal_code'),
  license_number: text('license_number').notNull().unique(),
  license_category: text('license_category').notNull(),
  license_expiry_date: text('license_expiry_date').notNull(),
  hire_date: text('hire_date'),
  status: text('status', { enum: [
    driverStatus.ACTIVE,
    driverStatus.ON_LEAVE,
    driverStatus.TERMINATED,
  ] }).notNull().default(driverStatus.ACTIVE),
  availability: text('availability', {
  enum: [
    driverAvailability.AVAILABLE,
    driverAvailability.ON_TRIP,
    driverAvailability.OFFLINE,
    ],
  }).notNull().default(driverAvailability.AVAILABLE),
  photo: text('photo'),
  notes: text('notes'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;

export const driverHelpers = {
  isActive: (driver: Driver): boolean => driver.deleted_at === null && driver.is_active && driver.status === driverStatus.ACTIVE,
  isLicenseExpired: (driver: Driver): boolean => new Date(driver.license_expiry_date) < new Date(),
  isLicenseExpiringSoon: (driver: Driver, days: number = 30): boolean => {
    const expiryDate = new Date(driver.license_expiry_date);
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysLeft <= days && daysLeft > 0;
  },
};