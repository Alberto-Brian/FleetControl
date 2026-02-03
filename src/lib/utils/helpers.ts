import { useDb } from '@/lib/db/db_helpers';
import { eq } from 'drizzle-orm'

// Formata data para SQLite
export function formatDateForDb(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Converte centavos para moeda formatada
export function formatCurrency(cents: number, currency: string = 'AOA'): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// Soft delete genérico
export async function softDelete(
  table: any,
  id: string,
  userId?: string
) {
  const db = useDb();
  await db
    .update(table)
    .set({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      updated_at: new Date().toISOString(),
    })
    .where(eq(table.id, id));
}