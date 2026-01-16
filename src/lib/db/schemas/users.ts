import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  avatar: text('avatar'),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  last_access_at: text('last_access_at'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userHelpers = {
  isActive: (user: User): boolean => user.deleted_at === null && user.is_active,
  getDisplayName: (user: User): string => user.name || user.email,
};