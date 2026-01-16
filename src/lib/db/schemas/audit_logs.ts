import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const auditAction = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type AuditAction = typeof auditAction[keyof typeof auditAction];

export const audit_logs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  table_name: text('table_name').notNull(),
  record_id: text('record_id').notNull(),
  action: text('action', { enum: [
    auditAction.CREATE,
    auditAction.UPDATE,
    auditAction.DELETE,
  ] }).notNull(),
  previous_data: text('previous_data'), // JSON
  new_data: text('new_data'), // JSON
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
});

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;

export const auditLogsRelations = relations(audit_logs, ({ one }) => ({
  user: one(users, {
    fields: [audit_logs.user_id],
    references: [users.id],
  }),
}));

export const auditLogHelpers = {
  parseData: (log: AuditLog): { previous: any; new: any } => ({
    previous: log.previous_data ? JSON.parse(log.previous_data) : null,
    new: log.new_data ? JSON.parse(log.new_data) : null,
  }),
  getChanges: (log: AuditLog): Record<string, { old: any; new: any }> => {
    if (log.action !== auditAction.UPDATE) return {};
    const { previous, new: newData } = auditLogHelpers.parseData(log);
    const changes: Record<string, { old: any; new: any }> = {};
    
    if (previous && newData) {
      Object.keys(newData).forEach(key => {
        if (previous[key] !== newData[key]) {
          changes[key] = { old: previous[key], new: newData[key] };
        }
      });
    }
    
    return changes;
  },
};