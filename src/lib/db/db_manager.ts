import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schemas';

interface DatabaseFile {
  filename: string;
  filepath: string;
  size: number;
  createdAt: Date;
  recordCount: number;
  isActive: boolean;
}

export class DatabaseManager {
  private baseDir: string;
  private maxSizeInMB: number;
  private maxRecordsPerFile: number;
  private currentDb: Database.Database | null = null;
  private currentDbPath: string | null = null;

  constructor(
    maxSizeInMB: number = 100,
    maxRecordsPerFile: number = 100000
  ) {
    console.log('🔧 Inicializando DatabaseManager...');
    
    try {
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
    console.log('🔧 Inicializando banco de dados...');
    
    try {
      const activeDb = this.getActiveDatabase();
      
      if (!activeDb) {
        console.log('📝 Nenhum banco ativo, criando novo...');
        this.createNewDatabase();
      } else {
        console.log('✅ Usando banco existente:', activeDb.filename);
        this.currentDbPath = activeDb.filepath;
        this.currentDb = new Database(activeDb.filepath);
        this.configurePragmas(this.currentDb);
      }

      // ⭐ Aplicar migrations SEMPRE que inicializar
      this.applyMigrations();

      return this.getCurrentDrizzleInstance();
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error);
      throw error;
    }
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
        'SELECT COUNT(*) as count FROM sellers'
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
  rotate() {
    console.log('🔄 Iniciando rotação de banco de dados...');
    
    // Fechar banco atual
    if (this.currentDb) {
      this.currentDb.close();
    }

    // Marcar banco atual como inativo
    if (this.currentDbPath) {
      const metaPath = this.currentDbPath.replace('.db', '.meta.json');
      const meta = this.readMetadata(metaPath);
      meta.isActive = false;
      meta.closedAt = new Date().toISOString();
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }

    // Criar novo banco
    this.createNewDatabase();
    
    // Aplicar migrations no novo banco
    this.applyMigrations();
    
    console.log('✅ Rotação concluída!');
    return this.getCurrentDrizzleInstance();
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
    db.pragma('cache_size = -64000'); // 64MB de cache
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
}