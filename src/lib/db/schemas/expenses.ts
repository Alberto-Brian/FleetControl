import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { expense_categories } from './expense_categories';
import { trips } from './trips'
import { vehicles } from './vehicles';
import { drivers } from './drivers';

export const expenseStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const paymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  CHECK: 'check',
} as const;

export type ExpenseStatus = typeof expenseStatus[keyof typeof expenseStatus];
export type PaymentMethod = typeof paymentMethod[keyof typeof paymentMethod];

export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey(),
  category_id: text('category_id').notNull().references(() => expense_categories.id),
  vehicle_id: text('vehicle_id').references(() => vehicles.id),
  trip_id: text('trip_id').references(() => trips.id),
  driver_id: text('driver_id').references(() => drivers.id),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  expense_date: text('expense_date').notNull(),
  due_date: text('due_date'),
  payment_date: text('payment_date'),
  payment_method: text('payment_method', { enum: [
    paymentMethod.CASH,
    paymentMethod.CARD,
    paymentMethod.TRANSFER,
    paymentMethod.CHECK,
  ] }),
  status: text('status', { enum: [
    expenseStatus.PENDING,
    expenseStatus.PAID,
    expenseStatus.OVERDUE,
    expenseStatus.CANCELLED,
  ] }).notNull().default(expenseStatus.PENDING),
  document_number: text('document_number'),
  supplier: text('supplier'),
  notes: text('notes'),
  file_path: text('file_path'),
  created_at: text('created_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  created_by: text('created_by'),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now', 'localtime'))`),
  updated_by: text('updated_by'),
  deleted_at: text('deleted_at'),
  deleted_by: text('deleted_by'),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expense_categories, {
    fields: [expenses.category_id],
    references: [expense_categories.id],
  }),
  vehicle: one(vehicles, {
    fields: [expenses.vehicle_id],
    references: [vehicles.id],
  }),
  trip: one(trips, {
    fields: [expenses.trip_id],
    references: [trips.id],
  }),
  driver: one(drivers, {
    fields: [expenses.driver_id],
    references: [drivers.id],
  }),
}));

export const expenseHelpers = {
  isPaid: (expense: Expense): boolean => expense.status === expenseStatus.PAID,
  isOverdue: (expense: Expense): boolean => {
    if (expense.status === expenseStatus.PAID || expense.status === expenseStatus.CANCELLED) {
      return false;
    }
    if (!expense.due_date) return false;
    return new Date(expense.due_date) < new Date();
  },
  getDaysOverdue: (expense: Expense): number | null => {
    if (!expenseHelpers.isOverdue(expense) || !expense.due_date) return null;
    const diff = new Date().getTime() - new Date(expense.due_date).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};