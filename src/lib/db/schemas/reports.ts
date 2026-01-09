import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const reports = sqliteTable('reports', {
    id: text('id').primaryKey(),
    type: text('type').notNull(), // 'weekly', 'monthly', 'block', 'payment_type'
    period: text('period').notNull(),
    totalCollected: integer('total_collected').notNull().default(0),
    totalPending: integer('total_pending').notNull().default(0),
    totalOverdue: integer('total_overdue').notNull().default(0),
    occupancyRate: integer('occupancy_rate').notNull().default(0),
    activeSpaces: integer('active_spaces').notNull().default(0),
    data: text('data'), // JSON
    generatedAt: text('generated_at').notNull(),
    createdAt: text('created_at').notNull(),
});