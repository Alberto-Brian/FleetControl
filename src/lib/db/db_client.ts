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
 * Inicializa o DatabaseManager pela primeira vez
 * DEVE ser chamado no app.whenReady() da main.ts
 * 
 * @param maxSizeInMB - Tamanho máximo do arquivo de banco em MB
 * @param maxRecordsPerFile - Número máximo de registros por arquivo
 * @returns Instância do Drizzle ORM
 */
export function initializeDatabase(
  maxSizeInMB: number = 100,
  maxRecordsPerFile: number = 5
): BetterSQLite3Database<typeof schema> {
  if (dbManagerInstance) {
    console.log('⚠️ DatabaseManager já foi inicializado');
    return dbManagerInstance.getCurrentDrizzleInstance();
  }

  console.log('🚀 Criando DatabaseManager...');
  dbManagerInstance = new DatabaseManager(maxSizeInMB, maxRecordsPerFile);
  
  console.log('🚀 Inicializando DatabaseManager...');
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