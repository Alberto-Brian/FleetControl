// ========================================
// FILE: src/system/db_manager.ts
// ========================================

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { BackupManager } from '@/system/backup_manager';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../lib/db/schemas';
import { APP_NAME } from '@/system/system.config';

interface DatabaseFile {
  filename: string;
  filepath: string;
  size: number;
  createdAt: Date;
  recordCount: number;
  isActive: boolean;
}

/**
 * ✅ NOVA: Configuração completa de tabelas
 */
interface TableConfig {
  tableName: string;
  type: 'master' | 'transactional' | 'audit';
  copyStrategy: {
    copyAll?: boolean;           
    recentDays?: number;         // ✅ OPCIONAL - se não definido, usa transitionPeriodDays
    timestampColumn?: string;    
    customQuery?: string;        
  };
  excludeColumns?: string[];
}

export class DatabaseManager {
  private baseDir: string;
  private maxSizeInMB: number;
  private maxAgeInDays: number;
  private transitionPeriodDays: number; // ✅ NOVO
  private currentDb: Database.Database | null = null;
  private currentDbPath: string | null = null;
  private backupManager: BackupManager | null = null;
  private isInitialized: boolean = false;

  constructor(
    maxSizeInMB: number = 100,
    maxAgeInDays: number = 30,
    transitionPeriodDays: number = 30 // ✅ Valor PADRÃO global
  ) {
    this.maxSizeInMB = maxSizeInMB;
    this.maxAgeInDays = maxAgeInDays;
    this.transitionPeriodDays = transitionPeriodDays;
    this.baseDir = '';
    
    console.log('🔧 DatabaseManager criado');
    console.log(`   Limites: ${maxSizeInMB}MB, ${maxAgeInDays} dias`);
    console.log(`   Período de transição: ${transitionPeriodDays} dias`);
  }

  initialize() {
    if (this.isInitialized) {
      console.log('⚠️ DatabaseManager já inicializado');
      return this.getCurrentDrizzleInstance();
    }

    console.log('++ Inicializando DatabaseManager...');
    
    try {
      const resolveUserData = (): string => {
        try {
          if (app && typeof (app as any).getPath === 'function') {
            return app.getPath('userData');
          }
        } catch {}
        const platform = process.platform;
        if (platform === 'win32') {
          const appData =
            process.env.APPDATA ||
            path.join(process.env.USERPROFILE || process.cwd(), 'AppData', 'Roaming');
          return path.join(appData, APP_NAME);
        }
        if (platform === 'darwin') {
          return path.join(process.env.HOME || process.cwd(), 'Library', 'Application Support', APP_NAME);
        }
        const xdg = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || process.cwd(), '.config');
        return path.join(xdg, APP_NAME);
      };
      this.baseDir = path.join(resolveUserData(), 'databases');
      console.log('📁 Base dir:', this.baseDir);
      
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }

      this.backupManager = new BackupManager();

      const activeDb = this.getActiveDatabase();
      
      if (!activeDb) {
        this.createNewDatabase();
      } else {
        this.currentDbPath = activeDb.filepath;
        this.currentDb = new Database(activeDb.filepath);
        this.configurePragmas(this.currentDb);
      }

      this.applyMigrations();
      this.isInitialized = true;
      console.log('✅ DatabaseManager completamente inicializado');

      return this.getCurrentDrizzleInstance();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar DatabaseManager:', error);
      throw error;
    }
  }

  async checkAndRunAutoBackup(): Promise<void> {
    if (!this.isInitialized || !this.backupManager) {
      throw new Error('DatabaseManager não inicializado');
    }

    const config = this.backupManager['loadConfig']();
    
    if (!config.autoBackupEnabled) {
      console.log('ℹ️ Backup automático desabilitado');
      return;
    }
    
    const lastBackup = config.lastAutoBackup ? new Date(config.lastAutoBackup) : null;
    const now = new Date();
    const shouldBackup = !lastBackup || 
      (config.autoBackupFrequency === 'daily' && 
       now.getTime() - lastBackup.getTime() > 24 * 60 * 60 * 1000);
    
    if (shouldBackup) {
      console.log('🔄 Executando backup automático...');
      await this.backupManager.createAutoBackup();
    }
  }

  private applyMigrations() {
    if (!this.currentDbPath || !this.currentDb) {
      throw new Error('Database not initialized');
    }

    console.log('🔄 Verificando migrations...');
    
    try {
      const db = this.getCurrentDrizzleInstance();
      
      const isPackaged = (): boolean => {
        try {
          return !!(app && (app as any).isPackaged);
        } catch {
          return false;
        }
      };
      const migrationsFolder = isPackaged()
        ? path.join(process.resourcesPath || process.cwd(), 'drizzle')
        : path.join(process.cwd(), 'drizzle');

      if (!fs.existsSync(migrationsFolder)) {
        console.warn('⚠️ Pasta de migrations não encontrada');
        return;
      }

      migrate(db, { migrationsFolder });
      console.log('✅ Migrations aplicadas');
      
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.warn('⚠️ Migration já aplicada');
      } else {
        console.error('❌ Erro ao aplicar migrations:', error);
      }
    }
  }

  close(): void {
    if (this.currentDbPath) {
      const walPath = this.currentDbPath + '-wal';
      const shmPath = this.currentDbPath + '-shm';
      try {
        if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
        if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
      } catch (e) {
        // Ignorar erros
      }
    }

    if (this.currentDb) {
      try {
        this.currentDb.close();
        console.log('🔒 Conexão DB fechada');
      } catch (error) {
        console.error('❌ Erro ao fechar:', error);
      } finally {
        this.currentDb = null;
        this.currentDbPath = null;
      }
    }

    this.forceReleaseLocks();
  }

  private forceReleaseLocks(): void {
    if (global.gc) global.gc();
    const start = Date.now();
    while (Date.now() - start < 100) {
      // Busy wait
    }
  }

  getCurrentDrizzleInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return drizzle(this.currentDb, { schema });
  }

  getCurrentDbInstance() {
    if (!this.currentDb) {
      throw new Error('Database not initialized');
    }
    return this.currentDb;
  }

  shouldRotate(): boolean {
    console.log('========================================');
    console.log(' -- VERIFICAÇÃO DE ROTAÇÃO --');
    console.log('========================================');
    
    if (!this.currentDbPath || !this.currentDb) {
      console.log(' __ Banco não inicializado');
      console.log('');
      return false;
    }

    try {
      const stats = fs.statSync(this.currentDbPath);
      const sizeInMB = stats.size / (1024 * 1024);
      const createdAt = new Date(stats.birthtimeMs);
      const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      console.log(`__ Tamanho:  ${sizeInMB.toFixed(2)} MB / ${this.maxSizeInMB} MB`);
      console.log(`__ Idade:    ${ageInDays.toFixed(1)} dias / ${this.maxAgeInDays} dias`);
      console.log(`__ Arquivo:  ${path.basename(this.currentDbPath)}`);

      if (sizeInMB >= this.maxSizeInMB) {
        console.log(`__ ROTAÇÃO: Tamanho ultrapassou ${this.maxSizeInMB}MB`);
        console.log('');
        return true;
      }

      if (ageInDays >= this.maxAgeInDays) {
        console.log(` __ ROTAÇÃO: Banco com mais de ${this.maxAgeInDays} dias`);
        console.log('==========================================');
        return true;
      }

      console.log(' -- ROTAÇÃO NÃO NECESSÁRIA --');
      console.log('_____________________________________________');
      return false;

    } catch (error) {
      console.error('❌ Erro ao verificar rotação:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
  }

  private createNewDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database_${timestamp}.db`;
    const filepath = path.join(this.baseDir, filename);

    this.currentDbPath = filepath;
    this.currentDb = new Database(filepath);
    this.configurePragmas(this.currentDb);

    const metaPath = filepath.replace('.db', '.meta.json');
    const version =
      (() => {
        try {
          if (app && typeof (app as any).getVersion === 'function') {
            return app.getVersion();
          }
        } catch {}
        return process.env.npm_package_version || 'dev';
      })();
    const metadata = {
      filename,
      filepath,
      createdAt: new Date().toISOString(),
      isActive: true,
      version
    };
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    console.log(`📁 Novo banco criado: ${filename}`);
  }

  private configurePragmas(db: Database.Database) {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('cache_size = -64000');
  }

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
          recordCount: 0,
          isActive: meta.isActive || false
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return files;
  }

  private getActiveDatabase(): DatabaseFile | null {
    const databases = this.listDatabases();
    return databases.find(db => db.isActive) || null;
  }

  private readMetadata(metaPath: string): any {
    try {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      return {};
    }
  }

  getBackupManager(): BackupManager {
    if (!this.backupManager) {
      throw new Error('BackupManager not initialized');
    }
    return this.backupManager;
  }

  /**
   * ✅ NOVA VERSÃO: Rotação com período de transição
   */
  async rotate(copyRecentData: boolean = true, force: boolean = false) {
    if (!this.shouldRotate()) {
      console.log('⚠️ Rotação cancelada - limite não atingido');
      return null;
    }
    
    console.log('🔄 Iniciando rotação com período de transição...');
    console.log(`   Copiando dados dos últimos ${this.transitionPeriodDays} dias`);
    
    const oldDbPath = this.currentDbPath;
    
    if (!oldDbPath || !this.currentDb) {
      throw new Error('Nenhum banco ativo para rotacionar');
    }

    try {
      this.close();

      // Marcar banco antigo como inativo
      const metaPath = oldDbPath.replace('.db', '.meta.json');
      const meta = this.readMetadata(metaPath);
      meta.isActive = false;
      meta.closedAt = new Date().toISOString();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

      // Criar novo banco
      this.createNewDatabase();
      
      // Aplicar migrations
      this.applyMigrations();

      // ✅ Copiar tabelas com período de transição
      let copyStats = null;
      if (copyRecentData) {
        console.log('📋 Copiando tabelas com período de transição...');
        
        this.currentDb!.prepare(`ATTACH DATABASE '${oldDbPath}' AS old_db`).run();

        try {
          const tableConfigs = DatabaseManager.getTableConfigurations();
          copyStats = await this.copyTablesWithTransition(tableConfigs, 'old_db');
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
   * ✅ NOVO: Copia tabelas com estratégias diferentes
   */
  private async copyTablesWithTransition(
    tables: TableConfig[],
    attachedDbName: string
  ): Promise<{
    success: boolean;
    copied: { table: string; records: number; type: string }[];
    errors: { table: string; error: string }[];
  }> {
    const copied: { table: string; records: number; type: string }[] = [];
    const errors: { table: string; error: string }[] = [];

    if (!this.currentDb) {
      throw new Error('Banco atual não inicializado');
    }

        // ✅ Ordenar tabelas por dependência (master primeiro, depois transactional)
    const sortedTables = this.sortTablesByDependency(tables);

    for (const config of sortedTables) {
      try {
        console.log(`  📊 Processando ${config.tableName} (${config.type})...`);

        // Verificar se tabela existe
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

        // Construir query baseado na estratégia
        let insertQuery: string;
        
        if (config.copyStrategy.copyAll) {
          // ═══ MASTER TABLE: Copiar TUDO ═══
          insertQuery = `
            INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
            SELECT ${columnsList}
            FROM ${attachedDbName}.${config.tableName}
            WHERE deleted_at IS NULL
          `;
          
        } else if (/*config.copyStrategy.recentDays &&*/ config.copyStrategy.timestampColumn) {
          // ═══ TRANSACTIONAL TABLE: Copiar período recente ═══
          const daysAgo = config.copyStrategy.recentDays ?? this.transitionPeriodDays;
          const dateColumn = config.copyStrategy.timestampColumn;
          
          insertQuery = `
            INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
            SELECT ${columnsList}
            FROM ${attachedDbName}.${config.tableName}
            WHERE deleted_at IS NULL
              AND ${dateColumn} >= date('now', '-${daysAgo} days')
            ORDER BY ${dateColumn} DESC
          `;
          
        } else if (config.copyStrategy.customQuery) {
          // ═══ CUSTOM QUERY ═══
          const customQuery = config.copyStrategy.customQuery.replace(
            `FROM ${config.tableName}`,
            `FROM ${attachedDbName}.${config.tableName}`
          );
          insertQuery = `
            INSERT OR REPLACE INTO ${config.tableName} (${columnsList})
            ${customQuery}
          `;
          
        } else {
          console.warn(`  ⚠️ Nenhuma estratégia definida para ${config.tableName}`);
          continue;
        }

        // Executar cópia
        const result = this.currentDb.prepare(insertQuery).run();
        const recordCount = result.changes;

        console.log(`  ✅ ${recordCount} registros copiados (${config.type})`);
        copied.push({ 
          table: config.tableName, 
          records: recordCount,
          type: config.type
        });

      } catch (error: any) {
        console.error(`  ❌ Erro ao copiar ${config.tableName}:`, error.message);
        errors.push({ table: config.tableName, error: error.message });
      }
    }

    // Resumo
    console.log('');
    console.log('📊 RESUMO DA CÓPIA:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const masterCount = copied.filter(c => c.type === 'master').length;
    const transCount = copied.filter(c => c.type === 'transactional').length;
    const totalRecords = copied.reduce((sum, c) => sum + c.records, 0);
    
    console.log(`  Master tables:        ${masterCount} tabelas`);
    console.log(`  Transactional tables: ${transCount} tabelas (${this.transitionPeriodDays} dias)`);
    console.log(`  Total de registros:   ${totalRecords}`);
    console.log(`  Erros:                ${errors.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return { success: errors.length === 0, copied, errors };
  }

  /**
 * ✅ Ordena tabelas respeitando dependências de Foreign Keys
 */
private sortTablesByDependency(tables: TableConfig[]): TableConfig[] {
  // Ordem manual baseada nas dependências do seu schema
  const dependencyOrder = [
    // 1️⃣ Tabelas sem dependências (base)
    'system_info',
    'users',
    'company_settings',
    
    // 2️⃣ Categorias e configurações
    'vehicle_categories',
    'maintenance_categories',
    'expense_categories',
    'categories',
    'fuel_stations',
    'workshops',
    'routes',
    
    // 3️⃣ Mestres que dependem de categorias
    'drivers',
    'vehicles',
    
    // 4️⃣ Documentos (dependem de vehicles)
    'vehicle_documents',
    
    // 5️⃣ Transacionais (dependem de tudo acima)
    'trips', // depende de vehicle, driver, route
    'refuelings', // depende de vehicle, driver, trip, fuel_station
    'maintenances',
    'maintenance_items',
    'expenses',
    'fines'
  ];

  return tables.sort((a, b) => {
    const indexA = dependencyOrder.indexOf(a.tableName);
    const indexB = dependencyOrder.indexOf(b.tableName);
    
    // Se não estiver na lista, coloca no final
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}

  /**
   * ✅ NOVO: Configuração de tabelas do sistema
   * IMPORTANTE: Adapte as tabelas e colunas conforme seu schema!
   */
  static getTableConfigurations(): TableConfig[] {
    return [
      // ═══════════════════════════════════════════════════════════
      // MASTER TABLES - Copiar TUDO (configurações, referências)
      // ═══════════════════════════════════════════════════════════
      {
        tableName: 'system_info',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'users',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'drivers',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'vehicles',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'vehicle_categories',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'vehicle_documents',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'routes',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'fuel_stations',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'maintenance_categories',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'categories',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'workshops',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'company_settings',
        type: 'master',
        copyStrategy: { copyAll: true }
      },
      {
        tableName: 'expense_categories',
        type: 'master',
        copyStrategy: { copyAll: true }
      },

      // ═══════════════════════════════════════════════════════════
      // TRANSACTIONAL TABLES - Copiar últimos 30 dias
      // ═══════════════════════════════════════════════════════════
      {
        tableName: 'trips',
        type: 'transactional',
        copyStrategy: {
          recentDays: 60,
          timestampColumn: 'created_at' // ou 'created_at'
        }
      },
      {
        tableName: 'maintenances',
        type: 'transactional',
        copyStrategy: {
          recentDays: 30,
          timestampColumn: 'created_at'
        }
      },
      {
        tableName: 'maintenance_items',
        type: 'transactional',
        copyStrategy: {
          recentDays: 30,
          timestampColumn: 'created_at'
        }
      },
      {
        tableName: 'expenses',
        type: 'transactional',
        copyStrategy: {
          recentDays: 60,
          timestampColumn: 'created_at'
        }
      },
      // {
      //   tableName: 'fuel_records',
      //   type: 'transactional',
      //   copyStrategy: {
      //     recentDays: 30,
      //     timestampColumn: 'created_at'
      //   }
      // },
      {
        tableName: 'refuelings',
        type: 'transactional',
        copyStrategy: {
          recentDays: 30,
          timestampColumn: 'created_at'
        }
      },
      {
        tableName: 'fines',
        type: 'transactional',
        copyStrategy: {
          // recentDays: 30,
          timestampColumn: 'created_at'
        }
      },

      // ═══════════════════════════════════════════════════════════
      // AUDIT/LOG TABLES - NÃO incluir (não serão copiadas)
      // ═══════════════════════════════════════════════════════════
      // 'audit_logs' - Não incluir
      // 'system_logs' - Não incluir
    ];
  }

  /**
   * Consulta em múltiplos bancos (para relatórios históricos)
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
}
