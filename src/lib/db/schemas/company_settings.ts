import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const company_settings = sqliteTable('company_settings', {
  id: text('id').primaryKey(),
  company_name: text('company_name').notNull(),
  tax_id: text('tax_id'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postal_code: text('postal_code'),
  logo: text('logo'),
  currency: text('currency').notNull().default('AOA'),
  timezone: text('timezone').notNull().default('Africa/Luanda'),
  deleted_at: text('deleted_at'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export type CompanySetting = typeof company_settings.$inferSelect;
export type NewCompanySetting = typeof company_settings.$inferInsert;
