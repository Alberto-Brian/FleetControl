import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sellers } from './sellers';
import { spaces } from './spaces';

export const payments = sqliteTable('payments', {
    id: text('id').primaryKey(),
    sellerId: text('seller_id').notNull().references(() => sellers.id, { onDelete: 'cascade' }),
    spaceId: text('space_id').notNull().references(() => spaces.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    status: text('status').notNull().default('Pendente'), // 'Pago', 'Pendente', 'Atrasado'
    method: text('method'), // 'Dinheiro', 'Transferência', 'Multicaixa'
    dueDate: text('due_date').notNull(),
    paidDate: text('paid_date'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});