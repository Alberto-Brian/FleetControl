import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const sellers = sqliteTable('sellers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    status: text('status').notNull().default('Ativo'), // 'Ativo', 'Pendente', 'Atrasado', 'Inativo'
    totalDebt: integer('total_debt').notNull().default(0),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});