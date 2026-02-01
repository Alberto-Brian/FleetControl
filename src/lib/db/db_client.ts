// ========================================
// FILE: src/lib/db/db_client.ts
// ========================================

import { DatabaseManager } from '@/system/db_manager';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schemas';

// ✅ NÃO instanciar aqui - apenas declarar
let dbManagerInstance: DatabaseManager | null = null;

/**
 * Obtém ou cria a instância do DatabaseManager (lazy initialization)
 * DEVE ser chamado APENAS depois do app.whenReady()
 */
export function getDbManager(): DatabaseManager {
  if (!dbManagerInstance) {
    throw new Error(
      'DatabaseManager not initialized. Call initializeDatabase() first in app.whenReady()'
    );
  }
  return dbManagerInstance;
}

/**
 * ✅ ATUALIZADO: Suporte a período de transição
 * 
 * @param maxSizeInMB - Tamanho máximo (padrão: 100MB)
 * @param maxAgeInDays - Idade máxima (padrão: 30 dias)
 * @param transitionPeriodDays - Dias de dados a copiar (padrão: 30 dias)
 */
export function initializeDatabase(
  maxSizeInMB: number = 100,
  maxAgeInDays: number = 30,
  transitionPeriodDays: number = 30 // ✅ NOVO
): BetterSQLite3Database<typeof schema> {
  if (dbManagerInstance) {
    return dbManagerInstance.getCurrentDrizzleInstance();
  }

  dbManagerInstance = new DatabaseManager(
    maxSizeInMB, 
    maxAgeInDays, 
    transitionPeriodDays
  );
  
  return dbManagerInstance.initialize();
}

/**
 * Obtém a instância do Drizzle ORM
 * Atalho para getDbManager().getCurrentDrizzleInstance()
 */
export function getDb(): BetterSQLite3Database<typeof schema> {
  return getDbManager().getCurrentDrizzleInstance();
}

// ✅ Exportar função de inicialização também
export { DatabaseManager };