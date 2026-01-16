import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

export const expenseCategoryType = {
  OPERATIONAL: 'operational',
  ADMINISTRATIVE: 'administrative',
  EXTRAORDINARY: 'extraordinary',
} as const;

export type ExpenseCategoryType = typeof expenseCategoryType[keyof typeof expenseCategoryType];

export const expense_categories = sqliteTable('expense_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  color: text('color').notNull().default('#EF4444'),
  type: text('type', { enum: [
    expenseCategoryType.OPERATIONAL,
    expenseCategoryType.ADMINISTRATIVE,
    expenseCategoryType.EXTRAORDINARY,
  ] }).notNull().default(expenseCategoryType.OPERATIONAL),
  is_active: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type ExpenseCategory = typeof expense_categories.$inferSelect;
export type NewExpenseCategory = typeof expense_categories.$inferInsert;

export const expenseCategoryHelpers = {
  isActive: (category: ExpenseCategory): boolean => category.deleted_at === null && category.is_active,
};