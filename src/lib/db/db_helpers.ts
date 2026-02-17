// ========================================
// FILE: src/lib/db/db_helpers.ts
// ========================================
// 
// Helper centralizado para gerenciar cache de instâncias do banco de dados
// Uso: import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
//
import { getDb, getDbManager } from '@/lib/db/db_client';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DatabaseManager } from '@/system/db_manager';
import * as schema from '@/lib/db/schemas';

// ============================================================================
// CACHE DAS INSTÂNCIAS
// ============================================================================

let dbCache: BetterSQLite3Database<typeof schema> | null = null;
let dbManagerCache: DatabaseManager | null = null;

// ============================================================================
// FUNÇÕES PÚBLICAS
// ============================================================================

/**
 * Obtém instâncias do DB e DBManager com cache
 * 
 * ✅ Uso recomendado:
 * - Chame no início de cada função de query
 * - A primeira chamada inicializa o cache
 * - Chamadas subsequentes reutilizam a instância
 * - Cache é automaticamente invalidado após rotação
 * 
 * @returns {object} { db, dbManager } - Instâncias cacheadas
 * 
 * @example
 * export async function getAllDrivers() {
 *   const { db } = useDb();
 *   return await db.select().from(drivers);
 * }
 */
export function useDb(): {
    db: BetterSQLite3Database<typeof schema>;
    dbManager: DatabaseManager;
} {
    // Inicializar cache na primeira chamada
    if (!dbCache || !dbManagerCache) {
        try {
            dbCache = getDb();
            dbManagerCache = getDbManager();
            console.log('📦 Cache do DB inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar cache do DB:', error);
            throw new Error(
                'Falha ao obter instâncias do banco. ' +
                'Certifique-se que initializeDatabase() foi chamado.'
            );
        }
    }

    return {
        db: dbCache,
        dbManager: dbManagerCache
    };
}

/**
 * Invalida o cache das instâncias
 * 
 * ⚠️ USO INTERNO - Chamado automaticamente após rotação
 * Não precisa chamar manualmente nas queries
 */
export function invalidateDbCache(): void {
    if (dbCache || dbManagerCache) {
        dbCache = null;
        dbManagerCache = null;
        console.log('🔄 Cache do DB invalidado');
    }
}

/**
 * Verifica se o banco precisa rotacionar e executa se necessário
 * 
 * ✅ Use esta função em operações de INSERT que podem atingir limites:
 * - Verifica automaticamente se atingiu limite de tamanho ou registros
 * - Rotaciona o banco se necessário
 * - Invalida o cache automaticamente após rotação
 * - Garante que próximas queries usem a nova instância
 * 
 * ⚠️ NÃO use em SELECT/UPDATE/DELETE (não precisam de rotação)
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * export async function createDriver(data: ICreateDriver) {
 *   // await checkAndRotate(); // ✅ Verifica antes de inserir
 *   
 *   const { db } = useDb(); // Sempre instância atualizada
 *   return await db.insert(drivers).values(data).returning();
 * }
 */
export async function checkAndRotate(): Promise<void> {
    const { dbManager } = useDb();
    
    if (dbManager.shouldRotate()) {
        console.log('🔄 Limite atingido - iniciando rotação...');
        
        try {
            await dbManager.rotate(true); // true = aplicar master tables
            
            // ✅ Invalidar cache para próximas queries usarem nova instância
            invalidateDbCache();
            
            console.log('✅ Rotação concluída - cache atualizado');
        } catch (error) {
            console.error('❌ Erro durante rotação:', error);
            throw error;
        }
    }
}

/**
 * Força invalidação e recarregamento do cache
 * 
 * ⚠️ Usar apenas em casos específicos:
 * - Após backup/restore manual
 * - Após alterações externas no banco
 * - Em testes que precisam resetar estado
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // Após restore de backup
 * await restoreBackup(backupPath);
 * await reloadDbCache();
 */
export async function reloadDbCache(): Promise<void> {
    console.log('🔄 Forçando reload do cache...');
    invalidateDbCache();
    
    // Forçar nova inicialização
    const { db, dbManager } = useDb();
    
    console.log('✅ Cache recarregado');
}

// ============================================================================
// FUNÇÕES AUXILIARES (OPCIONAL - para casos avançados)
// ============================================================================

/**
 * Verifica se o cache está inicializado
 * 
 * @returns {boolean} true se cache está ativo
 */
export function isCacheInitialized(): boolean {
    return dbCache !== null && dbManagerCache !== null;
}

/**
 * Obtém estatísticas do banco atual
 * 
 * @returns {object} Informações do banco atual
 * 
 * @example
 * const stats = getDbStats();
 * console.log('Banco atual:', stats.currentPath);
 */
export function getDbStats(): {
    cacheInitialized: boolean;
    currentPath: string | null;
} {
    const { dbManager } = useDb();
    
    return {
        cacheInitialized: isCacheInitialized(),
        currentPath: dbManager['currentDbPath'] || null
    };
}