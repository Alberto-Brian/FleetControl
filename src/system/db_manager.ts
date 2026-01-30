import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { BackupManager } from '@/system/backup_manager';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../lib/db/schemas';

interface DatabaseFile {
  filename: string;
  filepath: string;
  size: number;
  createdAt: Date;
  recordCount: number;
  isActive: boolean;
}

/**
 * Configuração de tabelas master que devem ser copiadas durante rotação
 */
interface MasterTableConfig {
  tableName: string;
  /** Se true, copia TODOS os registros. Se false, usa customQuery */
  copyAll?: boolean;
  /** Query customizada para selecionar quais registros copiar */
  customQuery?: string;
  /** Colunas a ignorar na cópia (ex: timestamps que devem ser regenerados) */
  excludeColumns?: string[];
  /** Se true, limpa a tabela de destino antes de copiar */
  truncateBeforeCopy?: boolean;
}

export class DatabaseManager {
  private baseDir: string;
  private maxSizeInMB: number;
  private maxRecordsPerFile: number;
  private currentDb: Database.Database | null = null;
  private currentDbPath: string | null = null;
  private backupManager: BackupManager;

  constructor(
    maxSizeInMB: number = 100,
    maxRecordsPerFile: number = 5 // 100000
  ) {
    console.log('🔧 Inicializando DatabaseManager...');

    try {

      this.backupManager = new BackupManager()
      // Verificar se precisa fazer backup automático
      this.checkAutoBackup();

      this.baseDir = path.join(app.getPath('userData'), 'databases');
      console.log('📁 Base dir:', this.baseDir);
      
      this.maxSizeInMB = maxSizeInMB;
      this.maxRecordsPerFile = maxRecordsPerFile;
      
      // Criar diretório se não existir
      if (!fs.existsSync(this.baseDir)) {
        console.log('📂 Criando diretório databases...');
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
      
      console.log('✅ DatabaseManager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar DatabaseManager:', error);
      throw error;
    }
  }

  /**
   * Aplica migrations automaticamente usando o sistema nativo do Drizzle
   */
  private applyMigrations() {
    if (!this.currentDbPath || !this.currentDb) {
      throw new Error('Database not initialized');
    }

    console.log('🔄 Verificando migrations...');
    
    try {
      const db = this.getCurrentDrizzleInstance();
      
      // Caminho das migrations (em produção e desenvolvimento)
      const migrationsFolder = app.isPackaged
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(process.cwd(), 'drizzle');
      
      console.log('📂 Migrations folder:', migrationsFolder);

      // Verificar se a pasta existe
      if (!fs.existsSync(migrationsFolder)) {
        console.warn('⚠️ Pasta de migrations não encontrada:', migrationsFolder);
        return;
      }

      // O Drizzle automaticamente:
      // 1. Cria tabela __drizzle_migrations se não existir
      // 2. Verifica quais migrations já foram aplicadas (por hash)
      // 3. Executa apenas as novas
      // 4. Registra os hashes na tabela
      migrate(db, { migrationsFolder });
      
      console.log('✅ Migrations aplicadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao aplicar migrations:', error);
      // Não fazer throw - deixar a app continuar mesmo com erro
    }
  }

  /**
   * Inicializa o banco de dados
   */
  initialize() {
    console.log('++ Inicializando banco de dados...');
    
    try {
      const activeDb = this.getActiveDatabase();
      
      if (!activeDb) {
        console.log(' ++ Nenhum banco activo, criando novo...');
        this.createNewDatabase();
      } else {
        console.log(' ++ Usando banco existente:', activeDb.filename);
        this.currentDbPath = activeDb.filepath;
        this.currentDb = new Database(activeDb.filepath);
        this.configurePragmas(this.currentDb);
      }

      // ⭐ Aplicar migrations SEMPRE que inicializar
      this.applyMigrations();

      return this.getCurrentDrizzleInstance();
    } catch (error) {
      console.error('-- Erro ao inicializar banco:', error);
      throw error;
    }
  }

/**
 * Fecha a conexão actual com o banco de dados e tenta liberar locks
 * Deve ser chamado antes de qualquer operação FS na pasta databases
 */
close(): void {
  // Limpar ficheiros WAL/SHM manualmente (Windows lock comum)
  if (this.currentDbPath) {
    const walPath = this.currentDbPath + '-wal';
    const shmPath = this.currentDbPath + '-shm';
    try {
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      console.log('🗑️ WAL/SHM limpos manualmente');
    } catch (e: any) {
      console.log('ℹ️ WAL/SHM já limpos ou locked:', e.message);
    }
  }

  if (this.currentDb) {
    try {
      this.currentDb.close();
      console.log('🔒 Conexão DB fechada (close chamado)');
    } catch (error) {
      console.error('❌ Erro ao chamar close():', error);
    } finally {
      this.currentDb = null;
      this.currentDbPath = null;
    }
  } else {
    console.log('ℹ️ Nenhuma conexão activa para fechar');
  }

  // Forçar liberação de handles no Windows
  this.forceReleaseLocks();
}

/**
 * Força liberação de locks residuais (Windows-specific)
 */
private forceReleaseLocks(): void {
  // 1. Forçar garbage collection (libera handles JS)
  if (global.gc) {
    global.gc();
    console.log('♻️ Garbage collection forçado');
  }

  // 2. Delay curto para OS liberar file handles
  // Isso é crucial no Windows - sem delay, rmSync/renameSync falha
  const delayMs = 100; // 1.5 segundos - ajusta se necessário
  console.log(`⏳ Aguardando ${delayMs}ms para liberação de locks...`);
  const start = Date.now();
  while (Date.now() - start < delayMs) {
    // Busy wait simples (não bloqueia event loop muito)
  }
  console.log('✓ Tempo de espera concluído');
}

  /**
   * Retorna a instância do Drizzle ORM para o banco ativo
   */
  getCurrentDrizzleInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return drizzle(this.currentDb, { schema });
  }

  /**
   * Retorna a instância do better-sqlite3 para o banco ativo
   */
  getCurrentDbInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return this.currentDb;
  }

  /**
   * Verifica se precisa rotacionar para um novo arquivo
   */
  shouldRotate(): boolean {

    console.log("SHOULD ROTATE CALLED");
    // Fecha antes de qualquer FS op
    this.close();

    if (!this.currentDbPath) return false;

    const stats = fs.statSync(this.currentDbPath);
    const sizeInMB = stats.size / (1024 * 1024);

    // Verifica tamanho
    if (sizeInMB >= this.maxSizeInMB) {
      console.log(`🔄 Rotação por tamanho: ${sizeInMB.toFixed(2)}MB`);
      return true;
    }

    // Verifica quantidade de registros
    try {
      // Contar registros de uma tabela principal (ajuste conforme necessário)
      const result = this.currentDb!.prepare(
        'SELECT COUNT(*) as count FROM drivers'
      ).get() as { count: number };

      if (result.count >= this.maxRecordsPerFile) {
        console.log(`🔄 Rotação por quantidade: ${result.count} registros`);
        return true;
      }
    } catch (error) {
      // Tabela pode não existir ainda
    }

    return false;
  }

  /**
   * Rotaciona para um novo arquivo de banco de dados
   */
  // rotate() {
  //   console.log('🔄 Iniciando rotação de banco de dados...');
    
  //   // Fechar banco atual
  //   this.close()

  //   // Marcar banco atual como inativo
  //   if (this.currentDbPath) {
  //     const metaPath = this.currentDbPath.replace('.db', '.meta.json');
  //     const meta = this.readMetadata(metaPath);
  //     meta.isActive = false;
  //     meta.closedAt = new Date().toISOString();
  //     fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  //   }

  //   // Criar novo banco
  //   this.createNewDatabase();
    
  //   // Aplicar migrations no novo banco
  //   this.applyMigrations();
    
  //   console.log('✅ Rotação concluída!');
  //   return this.getCurrentDrizzleInstance();
  // }

  /**
   * Cria um novo arquivo de banco de dados
   */
  private createNewDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_${timestamp}.db`;
    const filepath = path.join(this.baseDir, filename);

    this.currentDbPath = filepath;
    this.currentDb = new Database(filepath);
    this.configurePragmas(this.currentDb);

    // Criar metadata
    const metaPath = filepath.replace('.db', '.meta.json');
    const metadata = {
      filename,
      filepath,
      createdAt: new Date().toISOString(),
      isActive: true,
      version: app.getVersion()
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    console.log(`📁 Novo banco criado: ${filename}`);
  }

  /**
   * Configura PRAGMAs do SQLite
   */
  private configurePragmas(db: Database.Database) {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('cache_size = -64000'); // 64MB de cache
  }

  /**
 * Desactiva PRAGMAs temporariamente para operações de sistema de arquivos
 * Isso previne locks de arquivo (especialmente WAL mode) que causam EBUSY
 * 
 * IMPORTANTE: Sempre chamar restorePragmas() depois!
 * 
 * @example
 * dbManager.disablePragmas();
 * try {
 *   fs.rmSync(backupDir, { recursive: true });
 * } finally {
 *   dbManager.restorePragmas();
 * }
 */
disablePragmas(): void {
  if (!this.currentDb) {
    console.warn('⚠️ Nenhum banco activo para desactivar PRAGMAs');
    return;
  }

  console.log('🔓 Desactivando PRAGMAs para operações FS...');
  
  try {
    // 1. Fazer checkpoint do WAL (flush para o DB principal)
    this.currentDb.pragma('wal_checkpoint(TRUNCATE)');
    console.log('  ✓ WAL checkpoint executado');
    
    // 2. Mudar para DELETE mode (sem arquivos -wal/-shm)
    this.currentDb.pragma('journal_mode = DELETE');
    console.log('  ✓ Journal mode: WAL → DELETE');
    
    // 3. Reduzir cache (libera memória)
    this.currentDb.pragma('cache_size = -2000'); // 2MB apenas
    console.log('  ✓ Cache reduzido');
    
    // 4. Desativar synchronous (mais rápido para operações FS)
    this.currentDb.pragma('synchronous = OFF');
    console.log('  ✓ Synchronous desativado');
    
    console.log('✅ PRAGMAs desativados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao desativar PRAGMAs:', error);
  }
}

/**
 * Restaura PRAGMAs para valores normais de produção
 * Deve ser chamado após disablePragmas()
 */
restorePragmas(): void {
  if (!this.currentDb) {
    console.warn('⚠️ Nenhum banco ativo para restaurar PRAGMAs');
    return;
  }

  console.log('🔒 Restaurando PRAGMAs...');
  
  try {
    this.configurePragmas(this.currentDb);
    console.log('✅ PRAGMAs restaurados');
  } catch (error) {
    console.error('❌ Erro ao restaurar PRAGMAs:', error);
  }
}

/**
 * Executa uma operação FS com PRAGMAs desactivados automaticamente
 * Garante que PRAGMAs sempre são restaurados, mesmo com erro
 * 
 * @param operation - Função com a operação FS a executar
 * @returns Resultado da operação
 * 
 * @example
 * await dbManager.withDisabledPragmas(() => {
 *   fs.rmSync(backupDir, { recursive: true, force: true });
 *   fs.renameSync(oldPath, newPath);
 * });
 */
async withDisabledPragmas<T>(
  operation: () => T | Promise<T>
): Promise<T> {
  this.disablePragmas();
  
  try {
    const result = await operation();
    return result;
  } finally {
    // Sempre restaurar, mesmo com erro
    this.restorePragmas();
  }
}

  /**
   * Lista todos os arquivos de banco
   */
  listDatabases(): DatabaseFile[] {
    const files = fs.readdirSync(this.baseDir)
      .filter(f => f.endsWith('.db'))
      .map(filename => {
        const filepath = path.join(this.baseDir, filename);
        const metaPath = filepath.replace('.db', '.meta.json');
        const stats = fs.statSync(filepath);
        
        let meta: any = {};
        if (fs.existsSync(metaPath)) {
          meta = this.readMetadata(metaPath);
        }

        return {
          filename,
          filepath,
          size: stats.size,
          createdAt: new Date(stats.birthtime),
          recordCount: this.getRecordCount(filepath),
          isActive: meta.isActive || false
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return files;
  }

  /**
   * Retorna o banco de dados activo
   */
  private getActiveDatabase(): DatabaseFile | null {
    const databases = this.listDatabases();
    return databases.find(db => db.isActive) || null;
  }

  /**
   * Conta registros em um banco
   */
  private getRecordCount(filepath: string): number {
    try {
      const db = new Database(filepath, { readonly: true });
      const result = db.prepare(
        'SELECT COUNT(*) as count FROM sellers'
      ).get() as { count: number };
      db.close();
      return result.count;
    } catch {
      return 0;
    }
  }

  /**
   * Lê metadata de um arquivo
   */
  private readMetadata(metaPath: string): any {
    try {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      return {};
    }
  }

  /**
   * Cria backup de bancos específicos
   */
  async createBackup(options: {
    includeActive?: boolean;
    maxFiles?: number;
    outputDir?: string;
  } = {}) {
    const {
      includeActive = true,
      maxFiles = 10,
      outputDir = path.join(app.getPath('userData'), 'backups')
    } = options;

    // Criar diretório de backup
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(outputDir, `backup_${timestamp}`);
    fs.mkdirSync(backupDir);

    // Listar bancos para backup
    let databases = this.listDatabases();
    
    if (!includeActive) {
      databases = databases.filter(db => !db.isActive);
    }

    // Limitar quantidade
    databases = databases.slice(0, maxFiles);

    console.log(`📦 Criando backup de ${databases.length} arquivo(s)...`);

    // Copiar arquivos
    for (const db of databases) {
      const destPath = path.join(backupDir, db.filename);
      const destMetaPath = destPath.replace('.db', '.meta.json');
      
      fs.copyFileSync(db.filepath, destPath);
      
      const metaPath = db.filepath.replace('.db', '.meta.json');
      if (fs.existsSync(metaPath)) {
        fs.copyFileSync(metaPath, destMetaPath);
      }

      console.log(`  ✓ ${db.filename}`);
    }

    // Criar arquivo de manifesto
    const manifest = {
      createdAt: new Date().toISOString(),
      files: databases.map(db => ({
        filename: db.filename,
        size: db.size,
        recordCount: db.recordCount,
        createdAt: db.createdAt
      })),
      totalSize: databases.reduce((sum, db) => sum + db.size, 0)
    };

    fs.writeFileSync(
      path.join(backupDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`✅ Backup concluído em: ${backupDir}`);
    
    return {
      backupPath: backupDir,
      fileCount: databases.length,
      totalSize: manifest.totalSize
    };
  }

  /**
   * Remove arquivos antigos (limpeza)
   */
  cleanup(keepLastN: number = 5) {
    const databases = this.listDatabases()
      .filter(db => !db.isActive)
      .slice(keepLastN);

    console.log(`🗑️ Limpando ${databases.length} arquivo(s) antigo(s)...`);

    for (const db of databases) {
      fs.unlinkSync(db.filepath);
      
      const metaPath = db.filepath.replace('.db', '.meta.json');
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }

      // Remover arquivos WAL e SHM se existirem
      const walPath = db.filepath + '-wal';
      const shmPath = db.filepath + '-shm';
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

      console.log(`  ✓ Removido: ${db.filename}`);
    }
  }

  /**
   * Verifica e executa backup automático se necessário
   */
  private async checkAutoBackup() {
    const config = this.backupManager['loadConfig']();
    
    if (!config.autoBackupEnabled) return;
    
    const lastBackup = config.lastAutoBackup 
      ? new Date(config.lastAutoBackup)
      : null;
    
    const now = new Date();
    const shouldBackup = !lastBackup || 
      (config.autoBackupFrequency === 'daily' && 
       now.getTime() - lastBackup.getTime() > 24 * 60 * 60 * 1000);
    
    if (shouldBackup) {
      console.log('🔄 Executando backup automático agendado...');
      await this.backupManager.createAutoBackup();
    }
  }
  
  getBackupManager(): BackupManager {
    return this.backupManager;
  }

  /**
   * Consulta em múltiplos bancos (para buscar dados históricos)
   */
  queryMultiple<T>(
    query: string,
    params: any[] = [],
    maxDatabases: number = 5
  ): T[] {
    const databases = this.listDatabases().slice(0, maxDatabases);
    const results: T[] = [];

    for (const dbFile of databases) {
      try {
        const db = new Database(dbFile.filepath, { readonly: true });
        const rows = db.prepare(query).all(...params) as T[];
        results.push(...rows);
        db.close();
      } catch (error) {
        console.error(`Erro ao consultar ${dbFile.filename}:`, error);
      }
    }

    return results;
  }


/**
 * Rotaciona para um novo arquivo de banco de dados COM suporte a tabelas master
 * 
 * @param masterTables - Configuração de tabelas a copiar (opcional)
 * 
 * @example
 * // Rotação simples sem master tables
 * dbManager.rotate();
 * 
 * // Rotação com master tables
 * dbManager.rotate([
 *   { tableName: 'users', copyAll: true },
 *   { tableName: 'settings', copyAll: true }
 * ]);
 */
async rotate(applyMasterTables: boolean = true) {
  const masterTables: MasterTableConfig[] = DatabaseManager.getDefaultMasterTables();
  console.log('🔄 Iniciando rotação de banco de dados...');
  
  // Guardar referência ao banco antigo ANTES de fechar
  const oldDbPath = this.currentDbPath;
  
  if (!oldDbPath || !this.currentDb) {
    throw new Error('Nenhum banco ativo para rotacionar');
  }

  try {
    // 1. Se houver tabelas master, anexar banco antigo ANTES de fechar
    if (applyMasterTables && masterTables && masterTables.length > 0) {
      console.log('📋 Preparando cópia de tabelas master...');
      // Não fechar ainda - vamos precisar do banco antigo anexado
    } else {
      // Rotação simples - fechar normalmente
      this.close();
    }

    // 2. Marcar banco atual como inativo
    const metaPath = oldDbPath.replace('.db', '.meta.json');
    const meta = this.readMetadata(metaPath);
    meta.isActive = false;
    meta.closedAt = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

    // 3. Criar novo banco usando método existente
    this.createNewDatabase();
    
    // Adicionar metadata sobre origem (se houver cópia)
    if (masterTables && masterTables.length > 0) {
      const newMetaPath = this.currentDbPath!.replace('.db', '.meta.json');
      const newMeta = this.readMetadata(newMetaPath);
      newMeta.copiedFrom = path.basename(oldDbPath);
      fs.writeFileSync(newMetaPath, JSON.stringify(newMeta, null, 2));
    }

    // 4. Aplicar migrations no novo banco
    this.applyMigrations();

    // 5. Copiar tabelas master se fornecidas
    let copyStats = null;
    if (masterTables && masterTables.length > 0) {
      console.log('📋 Copiando tabelas master do banco antigo...');
      
      // Anexar banco antigo temporariamente
      this.currentDb!.prepare(`ATTACH DATABASE '${oldDbPath}' AS old_db`).run();

      try {
        copyStats = await this.copyMasterTablesFromAttached(masterTables, 'old_db');
      } finally {
        // Desanexar banco antigo
        this.currentDb!.prepare('DETACH DATABASE old_db').run();
      }

      // Agora sim, limpar arquivos WAL/SHM do banco antigo manualmente
      const walPath = oldDbPath + '-wal';
      const shmPath = oldDbPath + '-shm';
      try {
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
        console.log('🗑️ WAL/SHM do banco antigo limpos');
      } catch (e: any) {
        console.log('ℹ️ WAL/SHM já limpos:', e.message);
      }
    }

    console.log('✅ Rotação concluída!');
    
    return {
      newDatabase: this.currentDbPath,
      oldDatabase: oldDbPath,
      copyStats,
      drizzle: this.getCurrentDrizzleInstance()
    };

  } catch (error) {
    console.error('❌ Erro durante rotação:', error);
    
    // Rollback: restaurar banco antigo como ativo
    const metaPath = oldDbPath.replace('.db', '.meta.json');
    const meta = this.readMetadata(metaPath);
    meta.isActive = true;
    delete meta.closedAt;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    
    // Se já criou novo banco, tentar removê-lo
    if (this.currentDbPath && this.currentDbPath !== oldDbPath) {
      try {
        this.close();
        fs.unlinkSync(this.currentDbPath);
        const newMetaPath = this.currentDbPath.replace('.db', '.meta.json');
        if (fs.existsSync(newMetaPath)) {
          fs.unlinkSync(newMetaPath);
        }
        console.log('🗑️ Novo banco removido no rollback');
      } catch (cleanupError) {
        console.error('⚠️ Erro ao limpar novo banco:', cleanupError);
      }
    }
    
    // Reabrir banco antigo
    this.currentDbPath = oldDbPath;
    this.currentDb = new Database(oldDbPath);
    this.configurePragmas(this.currentDb);
    
    throw error;
  }
}

/**
 * Copia tabelas master usando ATTACH DATABASE (mais eficiente)
 * Reutilizado internamente pelo rotate()
 */
private async copyMasterTablesFromAttached(
  tables: MasterTableConfig[],
  attachedDbName: string
): Promise<{
  success: boolean;
  copied: { table: string; records: number }[];
  errors: { table: string; error: string }[];
}> {
  const copied: { table: string; records: number }[] = [];
  const errors: { table: string; error: string }[] = [];

  if (!this.currentDb) {
    throw new Error('Banco atual não inicializado');
  }

  for (const config of tables) {
    try {
      console.log(`  📊 Copiando ${config.tableName}...`);

      // Verificar se tabela existe no banco antigo
      const tableExists = this.currentDb
        .prepare(
          `SELECT name FROM ${attachedDbName}.sqlite_master WHERE type='table' AND name=?`
        )
        .get(config.tableName);

      if (!tableExists) {
        console.warn(`  ⚠️ Tabela ${config.tableName} não existe no banco antigo`);
        continue;
      }

      // Obter colunas
      const tableInfo = this.currentDb
        .prepare(`PRAGMA ${attachedDbName}.table_info(${config.tableName})`)
        .all() as Array<{ name: string }>;

      const columns = tableInfo
        .map(col => col.name)
        .filter(col => !config.excludeColumns?.includes(col));

      const columnsList = columns.join(', ');

      // Truncar se necessário
      if (config.truncateBeforeCopy) {
        this.currentDb.prepare(`DELETE FROM ${config.tableName}`).run();
      }

      // Copiar dados usando INSERT SELECT (muito mais rápido!)
      let insertQuery: string;
      
      if (config.copyAll || !config.customQuery) {
        insertQuery = `
          INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
          SELECT ${columnsList} FROM ${attachedDbName}.${config.tableName}
        `;
      } else {
        // Adaptar query customizada para usar banco anexado
        const customQuery = config.customQuery.replace(
          `FROM ${config.tableName}`,
          `FROM ${attachedDbName}.${config.tableName}`
        );
        insertQuery = `
          INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
          ${customQuery}
        `;
      }

      const result = this.currentDb.prepare(insertQuery).run();
      const recordCount = result.changes;

      console.log(`  ✅ ${recordCount} registros copiados`);
      copied.push({ table: config.tableName, records: recordCount });

    } catch (error: any) {
      console.error(`  ❌ Erro ao copiar ${config.tableName}:`, error.message);
      errors.push({ table: config.tableName, error: error.message });
    }
  }

  const summary = { success: errors.length === 0, copied, errors };

  console.log('📊 Resumo da cópia:');
  console.log(`  ✅ Sucesso: ${copied.length} tabelas`);
  console.log(`  ❌ Erros: ${errors.length} tabelas`);
  console.log(`  📈 Total de registros: ${copied.reduce((sum, c) => sum + c.records, 0)}`);

  return summary;
}

/**
 * Helper para definir tabelas master padrão do sistema
 * Customize conforme suas necessidades
 */
static getDefaultMasterTables(): MasterTableConfig[] {
  return [
    { tableName: 'users', copyAll: true },
    { tableName: 'drivers', copyAll: true },
    { tableName: 'routes', copyAll: true },
    { 
      tableName: 'vehicles', 
      customQuery: 'SELECT * FROM products WHERE active = 1',
      excludeColumns: ['created_at', 'updated_at']
    }
  ];
 }
}

// ============================================================================
// EXEMPLOS DE USO
// ============================================================================

/**
 * Exemplo 1: Rotação simples (sem master tables)
 * Comportamento idêntico ao rotate() original
 */
// await dbManager.rotate();

/**
 * Exemplo 2: Rotação com tabelas master padrão
 */
// const masterTables = DatabaseManager.getDefaultMasterTables();
// await dbManager.rotate(masterTables);

/**
 * Exemplo 3: Rotação com configuração customizada
 */
// await dbManager.rotate([
//   { tableName: 'users', copyAll: true },
//   { tableName: 'settings', copyAll: true },
//   { 
//     tableName: 'sellers',
//     customQuery: 'SELECT * FROM sellers WHERE active = 1',
//     excludeColumns: ['created_at', 'updated_at'],
//     truncateBeforeCopy: true
//   }
// ]);

/**
 * Exemplo 4: Rotação automática ao atingir limite
 */
// if (dbManager.shouldRotate()) {
//   const masterTables = DatabaseManager.getDefaultMasterTables();
//   const result = await dbManager.rotate(masterTables);
//   console.log('Rotacionado:', result);
// }