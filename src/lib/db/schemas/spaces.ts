import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { blocks } from './blocks';
import { sellers } from './sellers';

export const spaces = sqliteTable('spaces', {
    id: text('id').primaryKey(),
    blockId: text('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'Contentor', 'Bancada', 'Casota'
    number: text('number').notNull(),
    size: text('size').notNull(),
    status: text('status').notNull().default('Disponível'), // 'Ocupado', 'Disponível', 'Manutenção'
    isFixed: integer('is_fixed', { mode: 'boolean' }).notNull().default(true),
    paymentType: text('payment_type').notNull(), // 'Semanal', 'Diário'
    price: integer('price').notNull(),
    sellerId: text('seller_id').references(() => sellers.id, { onDelete: 'set null' }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});