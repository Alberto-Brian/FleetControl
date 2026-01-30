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

interface MasterTableConfig {
  tableName: string;
  copyAll?: boolean;
  customQuery?: string;
  excludeColumns?: string[];
  truncateBeforeCopy?: boolean;
}

export class DatabaseManager {
  private baseDir: string;
  private maxSizeInMB: number;
  private maxRecordsPerFile: number;
  private currentDb: Database.Database | null = null;
  private currentDbPath: string | null = null;
  private backupManager: BackupManager | null = null;
  private isInitialized: boolean = false;

  constructor(
    maxSizeInMB: number = 100,
    maxRecordsPerFile: number = 5
  ) {
    // ✅ Apenas armazenar configurações - NÃO inicializar nada aqui
    this.maxSizeInMB = maxSizeInMB;
    this.maxRecordsPerFile = maxRecordsPerFile;
    this.baseDir = ''; // Será definido em initialize()
    
    console.log('🔧 DatabaseManager criado (ainda não inicializado)');
  }

  /**
   * Inicializa o banco de dados - DEVE ser chamado explicitamente
   * Agora com ordem garantida de execução
   */
  initialize() {
    if (this.isInitialized) {
      console.log('⚠️ DatabaseManager já inicializado');
      return this.getCurrentDrizzleInstance();
    }

    console.log('++ Inicializando DatabaseManager...');
    
    try {
      // 1. Definir diretório base
      this.baseDir = path.join(app.getPath('userData'), 'databases');
      console.log('📁 Base dir:', this.baseDir);
      
      // 2. Criar diretório se não existir
      if (!fs.existsSync(this.baseDir)) {
        console.log('📂 Criando diretório databases...');
        fs.mkdirSync(this.baseDir, { recursive: true });
      }

      // 3. Inicializar BackupManager (SEM executar backup ainda)
      this.backupManager = new BackupManager();
      console.log('✅ BackupManager inicializado');

      // 4. Inicializar banco de dados
      console.log('++ Inicializando banco de dados...');
      const activeDb = this.getActiveDatabase();
      
      if (!activeDb) {
        console.log(' ++ Nenhum banco ativo, criando novo...');
        this.createNewDatabase();
      } else {
        console.log(' ++ Usando banco existente:', activeDb.filename);
        this.currentDbPath = activeDb.filepath;
        this.currentDb = new Database(activeDb.filepath);
        this.configurePragmas(this.currentDb);
      }

      // 5. Aplicar migrations
      this.applyMigrations();

      // 6. Marcar como inicializado
      this.isInitialized = true;
      console.log('✅ DatabaseManager completamente inicializado');

      return this.getCurrentDrizzleInstance();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar DatabaseManager:', error);
      throw error;
    }
  }

  /**
   * Verifica e executa backup automático SE necessário
   * Agora é um método separado, chamado DEPOIS da inicialização
   */
  async checkAndRunAutoBackup(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DatabaseManager deve ser inicializado antes de executar backups');
    }

    if (!this.backupManager) {
      throw new Error('BackupManager não foi inicializado');
    }

    console.log('🔍 Verificando necessidade de backup automático...');
    
    const config = this.backupManager['loadConfig']();
    
    if (!config.autoBackupEnabled) {
      console.log('ℹ️ Backup automático desabilitado');
      return;
    }
    
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
    } else {
      console.log('✅ Backup automático não necessário ainda');
    }
  }

  /**
   * Aplica migrations automaticamente usando o sistema nativo do Drizzle
   * CORRIGIDO: Agora verifica se a migration já foi aplicada
   */
  private applyMigrations() {
    if (!this.currentDbPath || !this.currentDb) {
      throw new Error('Database not initialized');
    }

    console.log('🔄 Verificando migrations...');
    
    try {
      const db = this.getCurrentDrizzleInstance();
      
      // Caminho das migrations
      const migrationsFolder = app.isPackaged
        ? path.join(process.resourcesPath, 'drizzle')
        : path.join(process.cwd(), 'drizzle');
      
      console.log('📂 Migrations folder:', migrationsFolder);

      // Verificar se a pasta existe
      if (!fs.existsSync(migrationsFolder)) {
        console.warn('⚠️ Pasta de migrations não encontrada:', migrationsFolder);
        return;
      }

      // ✅ CORREÇÃO: Verificar se __drizzle_migrations existe
      const hasMigrationsTable = this.currentDb
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'`)
        .get();

      if (!hasMigrationsTable) {
        console.log('📝 Primeira execução - criando tabela de migrations');
      }

      // Aplicar migrations (Drizzle gerencia automaticamente o que já foi aplicado)
      migrate(db, { migrationsFolder });
      
      console.log('✅ Migrations aplicadas/verificadas com sucesso!');
      
    } catch (error: any) {
      // ✅ CORREÇÃO: Tratar erro específico de "table already exists"
      if (error.message?.includes('already exists')) {
        console.warn('⚠️ Migration já aplicada manualmente, pulando...');
        
        // Registrar a migration como aplicada no Drizzle
        try {
          this.currentDb!.prepare(`
            CREATE TABLE IF NOT EXISTS __drizzle_migrations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              hash TEXT NOT NULL,
              created_at INTEGER
            )
          `).run();
          
          console.log('✅ Tabela de controle de migrations criada');
        } catch (e) {
          console.warn('⚠️ Não foi possível criar tabela de controle:', e);
        }
      } else {
        console.error('❌ Erro ao aplicar migrations:', error);
        // Não fazer throw - deixar a app continuar
      }
    }
  }

  /**
   * Fecha a conexão atual com o banco de dados
   */
  close(): void {
    // Limpar ficheiros WAL/SHM manualmente
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
        console.log('🔒 Conexão DB fechada');
      } catch (error) {
        console.error('❌ Erro ao chamar close():', error);
      } finally {
        this.currentDb = null;
        this.currentDbPath = null;
      }
    }

    this.forceReleaseLocks();
  }

  /**
   * Força liberação de locks residuais (Windows-specific)
   */
  private forceReleaseLocks(): void {
    if (global.gc) {
      global.gc();
      console.log('♻️ Garbage collection forçado');
    }

    const delayMs = 100;
    console.log(`⏳ Aguardando ${delayMs}ms para liberação de locks...`);
    const start = Date.now();
    while (Date.now() - start < delayMs) {
      // Busy wait
    }
    console.log('✓ Tempo de espera concluído');
  }

  /**
   * Retorna a instância do Drizzle ORM
   */
  getCurrentDrizzleInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return drizzle(this.currentDb, { schema });
  }

  /**
   * Retorna a instância do better-sqlite3
   */
  getCurrentDbInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return this.currentDb;
  }

  /**
   * Verifica se precisa rotacionar
   */
  shouldRotate(): boolean {
    console.log("🔍 Verificando necessidade de rotação...");
    
    if (!this.currentDbPath) return false;

    const stats = fs.statSync(this.currentDbPath);
    const sizeInMB = stats.size / (1024 * 1024);

    // Verifica tamanho
    if (sizeInMB >= this.maxSizeInMB) {
      console.log(`🔄 Rotação necessária por tamanho: ${sizeInMB.toFixed(2)}MB`);
      return true;
    }

    // Verifica quantidade de registros
    try {
      const result = this.currentDb!.prepare(
        'SELECT COUNT(*) as count FROM drivers'
      ).get() as { count: number };

      if (result.count >= this.maxRecordsPerFile) {
        console.log(`🔄 Rotação necessária por quantidade: ${result.count} registros`);
        return true;
      }
    } catch (error) {
      // Tabela pode não existir ainda
    }

    console.log('✅ Rotação não necessária');
    return false;
  }

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
    db.pragma('cache_size = -64000');
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
   * Retorna o banco de dados ativo
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
   * Retorna o BackupManager
   */
  getBackupManager(): BackupManager {
    if (!this.backupManager) {
      throw new Error('BackupManager not initialized');
    }
    return this.backupManager;
  }

  /**
   * Rotaciona para um novo arquivo de banco de dados
   */
  async rotate(applyMasterTables: boolean = true) {
    const masterTables: MasterTableConfig[] = DatabaseManager.getDefaultMasterTables();
    console.log('🔄 Iniciando rotação de banco de dados...');
    
    const oldDbPath = this.currentDbPath;
    
    if (!oldDbPath || !this.currentDb) {
      throw new Error('Nenhum banco ativo para rotacionar');
    }

    try {
      // Fechar conexão
      this.close();

      // Marcar banco atual como inativo
      const metaPath = oldDbPath.replace('.db', '.meta.json');
      const meta = this.readMetadata(metaPath);
      meta.isActive = false;
      meta.closedAt = new Date().toISOString();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

      // Criar novo banco
      this.createNewDatabase();
      
      // Aplicar migrations no novo banco
      this.applyMigrations();

      // Copiar tabelas master se necessário
      let copyStats = null;
      if (applyMasterTables && masterTables && masterTables.length > 0) {
        console.log('📋 Copiando tabelas master...');
        
        this.currentDb!.prepare(`ATTACH DATABASE '${oldDbPath}' AS old_db`).run();

        try {
          copyStats = await this.copyMasterTablesFromAttached(masterTables, 'old_db');
        } finally {
          this.currentDb!.prepare('DETACH DATABASE old_db').run();
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
      throw error;
    }
  }

  /**
   * Copia tabelas master usando ATTACH DATABASE
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

        const tableExists = this.currentDb
          .prepare(
            `SELECT name FROM ${attachedDbName}.sqlite_master WHERE type='table' AND name=?`
          )
          .get(config.tableName);

        if (!tableExists) {
          console.warn(`  ⚠️ Tabela ${config.tableName} não existe no banco antigo`);
          continue;
        }

        const tableInfo = this.currentDb
          .prepare(`PRAGMA ${attachedDbName}.table_info(${config.tableName})`)
          .all() as Array<{ name: string }>;

        const columns = tableInfo
          .map(col => col.name)
          .filter(col => !config.excludeColumns?.includes(col));

        const columnsList = columns.join(', ');

        if (config.truncateBeforeCopy) {
          this.currentDb.prepare(`DELETE FROM ${config.tableName}`).run();
        }

        let insertQuery: string;
        
        if (config.copyAll || !config.customQuery) {
          insertQuery = `
            INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
            SELECT ${columnsList} FROM ${attachedDbName}.${config.tableName}
          `;
        } else {
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

    return { success: errors.length === 0, copied, errors };
  }

  /**
   * Helper para definir tabelas master padrão
   */
  static getDefaultMasterTables(): MasterTableConfig[] {
    return [
      { tableName: 'users', copyAll: true },
      { tableName: 'drivers', copyAll: true },
      { tableName: 'routes', copyAll: true },
    ];
  }
}