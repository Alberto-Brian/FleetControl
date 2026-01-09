import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { payments } from './payments';

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    type: text('type').notNull(), // 'Receita', 'Despesa'
    category: text('category').notNull(),
    description: text('description').notNull(),
    amount: integer('amount').notNull(),
    status: text('status').notNull().default('Pendente'), // 'Confirmado', 'Pendente', 'Pago', 'Cancelado'
    method: text('method'),
    paymentId: text('payment_id').references(() => payments.id, { onDelete: 'set null' }),
    date: text('date').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});