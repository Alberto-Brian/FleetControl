import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const systemInfo = sqliteTable('system_info', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  systemName: text('system_name').notNull(),
  version: text('version').notNull(),
  installedAt: text('installed_at').notNull(),
  updatedAt: text('updated_at')
});