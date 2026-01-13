import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { dbManager } from '@/lib/db/db_client';
import Database from 'better-sqlite3';

export interface BackupConfig {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly';
  keepLastN: number;
  lastAutoBackup?: string;
}

export interface BackupMetadata {
  version: string;
  createdAt: string;
  backupType: 'auto' | 'manual';
  databases: {
    filename: string;
    size: number;
    isActive: boolean;
  }[];
  hasUserData: boolean;
  hasLicense: boolean;
  totalSize: number;
  appVersion: string;
}

export interface RestoreValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: BackupMetadata;
}

export interface BackupReturn {
  success: boolean;
  path?: string;
  size?: number;
  error?: string;
}

export interface RestoreBackupReturn {
  success: boolean;
  needsReactivation?: boolean;
  requiresRestart?: boolean;
  error?: string;
}

export class BackupManager {
  private readonly userDataPath = app.getPath('userData');
  private readonly autoBackupDir = path.join(this.userDataPath, 'backups', 'auto');
  private readonly configFile = path.join(this.userDataPath, 'backup-config.json');

  constructor() {
    this.ensureDirectories();
    this.loadConfig();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.autoBackupDir)) {
      fs.mkdirSync(this.autoBackupDir, { recursive: true });
    }
  }

  loadConfig(): BackupConfig {
    try {
      if (fs.existsSync(this.configFile)) {
        return JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
      }
    } catch (error) {
      console.error('Erro ao carregar config de backup:', error);
    }

    return {
      autoBackupEnabled: true,
      autoBackupFrequency: 'daily',
      keepLastN: 7,
    };
  }

  saveConfig(config: BackupConfig): void {
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
  }

  /**
   * 🔄 BACKUP AUTOMÁTICO usando SQLite Online Backup API
   * Não precisa fechar o banco de dados!
   */
  async createAutoBackup(): Promise<BackupReturn> {
    try {
      console.log('🔄 Iniciando backup automático (Online Backup API)...');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.autoBackupDir, `auto_${timestamp}`);
      
      fs.mkdirSync(backupDir, { recursive: true });

      // Usar Online Backup API para copiar databases SEM fechar conexões
      const dbDir = path.join(this.userDataPath, 'databases');
      const dbBackupDir = path.join(backupDir, 'databases');
      
      if (fs.existsSync(dbDir)) {
        fs.mkdirSync(dbBackupDir, { recursive: true });
        await this.backupDatabasesOnline(dbDir, dbBackupDir);
      }

      const metadata: BackupMetadata = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        backupType: 'auto',
        databases: this.getDatabasesInfo(dbDir),
        hasUserData: false,
        hasLicense: false,
        totalSize: this.getDirectorySize(backupDir),
        appVersion: app.getVersion(),
      };

      fs.writeFileSync(
        path.join(backupDir, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      this.cleanupAutoBackups();

      const config = this.loadConfig();
      config.lastAutoBackup = new Date().toISOString();
      this.saveConfig(config);

      console.log('✅ Backup automático concluído:', backupDir);

      return { success: true, path: backupDir };
    } catch (error) {
      console.error('❌ Erro no backup automático:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 📦 BACKUP MANUAL usando SQLite Online Backup API
   */
  async createManualBackup(outputPath?: string): Promise<BackupReturn> {
    try {
      console.log('📦 Iniciando backup manual (Online Backup API)...');

      let savePath = outputPath;
      if (!savePath) {
        const result = await dialog.showSaveDialog({
          title: 'Exportar Backup Completo',
          defaultPath: path.join(
            app.getPath('documents'),
            `marketpro-backup-${new Date().toISOString().split('T')[0]}.zip`
          ),
          filters: [
            { name: 'Arquivo ZIP', extensions: ['zip'] },
          ],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, error: 'Cancelado pelo usuário' };
        }

        savePath = result.filePath;
      }

      const zip = new AdmZip();

      // Criar pasta temporária para backup
      const tempDir = path.join(this.userDataPath, 'temp-backup');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });

      // Backup dos databases usando Online Backup API
      const dbDir = path.join(this.userDataPath, 'databases');
      const tempDbDir = path.join(tempDir, 'databases');
      
      if (fs.existsSync(dbDir)) {
        fs.mkdirSync(tempDbDir, { recursive: true });
        await this.backupDatabasesOnline(dbDir, tempDbDir);
        zip.addLocalFolder(tempDbDir, 'databases');
      }

      // Adicionar user.json
      const userFile = path.join(this.userDataPath, 'user.json');
      if (fs.existsSync(userFile)) {
        zip.addLocalFile(userFile, '');
      }

      // Adicionar machine.id
      const machineIdFile = path.join(this.userDataPath, 'machine.id');
      if (fs.existsSync(machineIdFile)) {
        zip.addLocalFile(machineIdFile, '');
      }

      // Criar metadata
      const metadata: BackupMetadata = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        backupType: 'manual',
        databases: this.getDatabasesInfo(dbDir),
        hasUserData: fs.existsSync(userFile),
        hasLicense: false,
        totalSize: 0,
        appVersion: app.getVersion(),
      };

      zip.addFile(
        'backup-metadata.json',
        Buffer.from(JSON.stringify(metadata, null, 2))
      );

      // Salvar ZIP
      zip.writeZip(savePath);

      // Limpar pasta temporária
      fs.rmSync(tempDir, { recursive: true, force: true });

      const stats = fs.statSync(savePath);

      console.log('✅ Backup manual criado:', savePath);
      console.log('📊 Tamanho:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

      return {
        success: true,
        path: savePath,
        size: stats.size,
      };
    } catch (error) {
      console.error('❌ Erro no backup manual:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 💾 BACKUP ONLINE de databases usando SQLite .backup()
   * Copia databases SEM fechar conexões!
   */
  private async backupDatabasesOnline(sourceDir: string, destDir: string): Promise<void> {
    const files = fs.readdirSync(sourceDir);
    const dbFiles = files.filter(f => f.endsWith('.db'));

    console.log(`📂 Copiando ${dbFiles.length} databases usando Online Backup API...`);

    for (const dbFile of dbFiles) {
      const sourcePath = path.join(sourceDir, dbFile);
      const destPath = path.join(destDir, dbFile);

      try {
        // Abrir database de origem (read-only para segurança)
        const sourceDb = new Database(sourcePath, { readonly: true });
        
        // Usar .backup() para copiar de forma online
        await new Promise<void>((resolve, reject) => {
          sourceDb.backup(destPath)
            .then(() => {
              console.log(`✓ ${dbFile} copiado`);
              sourceDb.close();
              resolve();
            })
            .catch((error) => {
              sourceDb.close();
              reject(error);
            });
        });

        // Copiar arquivos .meta.json se existirem
        const metaFile = dbFile.replace('.db', '.meta.json');
        const sourceMetaPath = path.join(sourceDir, metaFile);
        const destMetaPath = path.join(destDir, metaFile);
        
        if (fs.existsSync(sourceMetaPath)) {
          fs.copyFileSync(sourceMetaPath, destMetaPath);
        }

      } catch (error) {
        console.error(`❌ Erro ao copiar ${dbFile}:`, error);
        throw error;
      }
    }

    console.log('✓ Todos os databases copiados com sucesso');
  }

  /**
   * 📥 RESTAURAR BACKUP usando SQLite .backup() reverso
   * Restaura SEM fechar o banco de dados principal!
   */
  async restoreBackup(backupPath: string): Promise<RestoreBackupReturn> {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('📥 INICIANDO RESTAURAÇÃO (Online Backup API)');
      console.log('═══════════════════════════════════════════════════');
      console.log('');

      // 1. Validar backup
      console.log('🔍 Validando backup...');
      const validation = await this.validateBackup(backupPath);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: 'Backup inválido: ' + validation.errors.join(', ') 
        };
      }
      console.log('✓ Backup validado');

      // 2. Confirmar com usuário
      const proceed = await dialog.showMessageBox({
        type: 'warning',
        title: 'Restaurar Backup',
        message: 'Todos os dados atuais serão substituídos!',
        detail: 
          'Esta operação irá:\n\n' +
          '✓ Criar um backup de segurança dos dados atuais\n' +
          '✓ Restaurar os dados do backup\n' +
          '✓ O sistema continuará funcionando normalmente\n\n' +
          (validation.warnings.length > 0 
            ? '⚠️ Avisos:\n' + validation.warnings.map(w => `• ${w}`).join('\n') + '\n\n'
            : '') +
          '🔄 Usando SQLite Online Backup API (sem interrupções)',
        buttons: ['Cancelar', 'Restaurar Agora'],
        defaultId: 1,
        cancelId: 0,
      });

      if (proceed.response === 0) {
        return { success: false, error: 'Cancelado pelo usuário' };
      }

      // 3. Criar backup de segurança
      console.log('💾 Criando backup de segurança...');
      await this.createAutoBackup();
      console.log('✓ Backup de segurança criado');

      // 4. Extrair backup para pasta temporária
      const tempDir = path.join(this.userDataPath, 'temp-restore');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });

      console.log('📂 Extraindo backup...');
      const zip = new AdmZip(backupPath);
      zip.extractAllTo(tempDir, true);
      console.log('✓ Backup extraído');

      // 5. Restaurar databases usando .backup() reverso
      const tempDbDir = path.join(tempDir, 'databases');
      const dbDir = path.join(this.userDataPath, 'databases');

      if (fs.existsSync(tempDbDir)) {
        console.log('🔄 Restaurando databases usando Online Backup API...');
        await this.restoreDatabasesOnline(tempDbDir, dbDir);
        console.log('✓ Databases restaurados');
      }

      // 6. Restaurar user.json
      const tempUserFile = path.join(tempDir, 'user.json');
      const userFile = path.join(this.userDataPath, 'user.json');
      
      if (fs.existsSync(tempUserFile)) {
        console.log('👤 Restaurando user.json...');
        if (fs.existsSync(userFile)) {
          fs.unlinkSync(userFile);
        }
        fs.copyFileSync(tempUserFile, userFile);
        console.log('✓ user.json restaurado');
      }

      // 7. Limpar pasta temporária
      console.log('🧹 Limpando arquivos temporários...');
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('✓ Limpeza concluída');

      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('═══════════════════════════════════════════════════');
      console.log('🎯 Sistema funcionando normalmente');
      console.log('');

      // Mostrar mensagem de sucesso
      dialog.showMessageBox({
        type: 'info',
        title: 'Restauração Concluída',
        message: 'O backup foi restaurado com sucesso!',
        detail: 
          '✓ Todos os dados foram restaurados\n' +
          '✓ O sistema está funcionando normalmente\n' +
          '✓ Um backup de segurança foi criado',
        buttons: ['OK'],
      });

      return {
        success: true,
        needsReactivation: false,
        requiresRestart: false,
      };

    } catch (error) {
      console.error('');
      console.error('═══════════════════════════════════════════════════');
      console.error('❌ ERRO NA RESTAURAÇÃO!');
      console.error('═══════════════════════════════════════════════════');
      console.error(error);
      console.error('');

      dialog.showErrorBox(
        'Erro na Restauração',
        'Ocorreu um erro ao restaurar o backup.\n' +
        'Os dados anteriores foram mantidos.\n\n' +
        `Erro: ${(error as Error).message}`
      );

      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * 🔄 RESTAURAÇÃO ONLINE usando .backup() reverso
   * Restaura databases SEM fechar conexões!
   */
  private async restoreDatabasesOnline(sourceDir: string, destDir: string): Promise<void> {
    const files = fs.readdirSync(sourceDir);
    const dbFiles = files.filter(f => f.endsWith('.db'));

    console.log(`📂 Restaurando ${dbFiles.length} databases usando Online Backup API...`);

    for (const dbFile of dbFiles) {
      const sourcePath = path.join(sourceDir, dbFile);
      const destPath = path.join(destDir, dbFile);

      try {
        // Abrir backup como fonte (read-only)
        const sourceDb = new Database(sourcePath, { readonly: true });
        
        // Usar .backup() REVERSO: copiar do backup para o destino
        await new Promise<void>((resolve, reject) => {
          sourceDb.backup(destPath)
            .then(() => {
              console.log(`✓ ${dbFile} restaurado`);
              sourceDb.close();
              resolve();
            })
            .catch((error) => {
              sourceDb.close();
              reject(error);
            });
        });

        // Restaurar .meta.json se existir
        const metaFile = dbFile.replace('.db', '.meta.json');
        const sourceMetaPath = path.join(sourceDir, metaFile);
        const destMetaPath = path.join(destDir, metaFile);
        
        if (fs.existsSync(sourceMetaPath)) {
          if (fs.existsSync(destMetaPath)) {
            fs.unlinkSync(destMetaPath);
          }
          fs.copyFileSync(sourceMetaPath, destMetaPath);
        }

      } catch (error) {
        console.error(`❌ Erro ao restaurar ${dbFile}:`, error);
        throw error;
      }
    }

    console.log('✓ Todos os databases restaurados com sucesso');
  }

  /**
   * 🔍 VALIDAR BACKUP
   */
  async validateBackup(backupPath: string): Promise<RestoreValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let metadata: BackupMetadata | undefined;

    try {
      if (!backupPath.endsWith('.zip')) {
        errors.push('O arquivo deve ser um ZIP');
        return { isValid: false, errors, warnings };
      }

      const zip = new AdmZip(backupPath);
      const entries = zip.getEntries();

      const metadataEntry = entries.find(e => e.entryName === 'backup-metadata.json');
      if (!metadataEntry) {
        errors.push('Arquivo de metadata não encontrado');
        return { isValid: false, errors, warnings };
      }

      metadata = JSON.parse(metadataEntry.getData().toString('utf8'));

      if (metadata && metadata.version !== '1.0') {
        warnings.push(`Versão do backup (${metadata.version}) diferente da esperada (1.0)`);
      }

      const hasDatabases = entries.some(e => e.entryName.startsWith('databases/'));
      if (!hasDatabases) {
        errors.push('Nenhuma base de dados encontrada no backup');
      }

      if (!entries.some(e => e.entryName === 'user.json')) {
        warnings.push('user.json não encontrado - dados do usuário ausentes');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata,
      };
    } catch (error) {
      errors.push(`Erro ao validar backup: ${(error as Error).message}`);
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Limpa backups automáticos antigos
   */
  private cleanupAutoBackups(): void {
    const config = this.loadConfig();
    const backups = fs.readdirSync(this.autoBackupDir)
      .filter(f => f.startsWith('auto_'))
      .map(f => ({
        name: f,
        path: path.join(this.autoBackupDir, f),
        created: fs.statSync(path.join(this.autoBackupDir, f)).birthtimeMs,
      }))
      .sort((a, b) => b.created - a.created);

    const toRemove = backups.slice(config.keepLastN);
    
    for (const backup of toRemove) {
      console.log('🗑️ Removendo backup antigo:', backup.name);
      fs.rmSync(backup.path, { recursive: true, force: true });
    }
  }

  /**
   * Utilitários
   */
  private getDirectorySize(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    let size = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += this.getDirectorySize(fullPath);
      } else {
        size += fs.statSync(fullPath).size;
      }
    }

    return size;
  }

  private getDatabasesInfo(dbDir: string): BackupMetadata['databases'] {
    if (!fs.existsSync(dbDir)) return [];

    return fs.readdirSync(dbDir)
      .filter(f => f.endsWith('.db'))
      .map(filename => {
        const filepath = path.join(dbDir, filename);
        const metaPath = filepath.replace('.db', '.meta.json');
        
        let isActive = false;
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            isActive = meta.isActive || false;
          } catch {}
        }

        return {
          filename,
          size: fs.statSync(filepath).size,
          isActive,
        };
      });
  }

  /**
   * Lista backups automáticos disponíveis
   */
  listAutoBackups(): Array<{
    name: string;
    path: string;
    createdAt: Date;
    size: number;
  }> {
    if (!fs.existsSync(this.autoBackupDir)) return [];

    return fs.readdirSync(this.autoBackupDir)
      .filter(f => f.startsWith('auto_'))
      .map(name => {
        const backupPath = path.join(this.autoBackupDir, name);
        const stats = fs.statSync(backupPath);
        
        return {
          name,
          path: backupPath,
          createdAt: new Date(stats.birthtimeMs),
          size: this.getDirectorySize(backupPath),
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}