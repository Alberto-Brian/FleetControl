// ========================================
// FILE: src/system/backup_manager.ts
// ========================================

import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import Database from 'better-sqlite3';
import { APP_NAME } from './system.config';

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

export interface BackupProgress {
  step: string;
  current: number;
  total: number;
  message: string;
}

export class BackupManager {
  private readonly userDataPath: string;
  private readonly autoBackupDir: string;
  private readonly configFile: string;
  
  // Callback para progresso
  private onProgress?: (progress: BackupProgress) => void;

  constructor() {
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

    this.userDataPath = resolveUserData();
    this.autoBackupDir = path.join(this.userDataPath, 'backups', 'auto');
    this.configFile = path.join(this.userDataPath, 'backup-config.json');
    this.ensureDirectories();
    this.loadConfig();
  }

  /**
   * Define callback para monitorar progresso
   */
  setProgressCallback(callback: (progress: BackupProgress) => void): void {
    this.onProgress = callback;
  }

  private emitProgress(step: string, current: number, total: number, message: string): void {
    if (this.onProgress) {
      this.onProgress({ step, current, total, message });
    }
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
   * BACKUP AUTOMÁTICO usando SQLite Online Backup API
   */
  async createAutoBackup(): Promise<BackupReturn> {
    try {
      console.log('Iniciando backup automatico (Online Backup API)...');
      this.emitProgress('init', 0, 100, 'Inicializando backup automatico');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.autoBackupDir, `auto_${timestamp}`);
      
      fs.mkdirSync(backupDir, { recursive: true });
      this.emitProgress('prepare', 10, 100, 'Preparando diretorios');

      const dbDir = path.join(this.userDataPath, 'databases');
      const dbBackupDir = path.join(backupDir, 'databases');
      
      if (fs.existsSync(dbDir)) {
        fs.mkdirSync(dbBackupDir, { recursive: true });
        this.emitProgress('backup', 20, 100, 'Copiando databases');
        await this.backupDatabasesOnline(dbDir, dbBackupDir);
        this.emitProgress('backup', 70, 100, 'Databases copiados');
      }

      const appVersion =
        (() => {
          try {
            if (app && typeof (app as any).getVersion === 'function') {
              return app.getVersion();
            }
          } catch {}
          return process.env.npm_package_version || 'dev';
        })();

      const metadata: BackupMetadata = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        backupType: 'auto',
        databases: this.getDatabasesInfo(dbDir),
        hasUserData: false,
        hasLicense: false,
        totalSize: this.getDirectorySize(backupDir),
        appVersion
      };

      fs.writeFileSync(
        path.join(backupDir, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
      this.emitProgress('metadata', 80, 100, 'Metadata criada');

      this.cleanupAutoBackups();
      this.emitProgress('cleanup', 90, 100, 'Limpando backups antigos');

      const config = this.loadConfig();
      config.lastAutoBackup = new Date().toISOString();
      this.saveConfig(config);

      this.emitProgress('complete', 100, 100, 'Backup automatico concluido');
      console.log('Backup automatico concluido:', backupDir);

      return { success: true, path: backupDir };
    } catch (error) {
      console.error('Erro no backup automatico:', error);
      this.emitProgress('error', 0, 100, 'Erro no backup automatico');
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * BACKUP MANUAL usando SQLite Online Backup API
   */
  async createManualBackup(outputPath?: string): Promise<BackupReturn> {
    try {
      console.log('Iniciando backup manual (Online Backup API)...');
      this.emitProgress('init', 0, 100, 'Iniciando backup manual');

      let savePath = outputPath;
      if (!savePath) {
        const result = await dialog.showSaveDialog({
          title: 'Exportar Backup Completo',
          defaultPath: (() => {
            let documentsDir: string;
            try {
              documentsDir = app.getPath('documents');
            } catch {
              const home = process.env.USERPROFILE || process.env.HOME || process.cwd();
              documentsDir = path.join(home, 'Documents');
            }
            return path.join(
              documentsDir,
              `${APP_NAME.toLocaleLowerCase()}-backup-${new Date().toISOString().split('T')[0]}.zip`
            );
          })(),
          filters: [
            { name: 'Arquivo ZIP', extensions: ['zip'] },
          ],
        });

        if (result.canceled || !result.filePath) {
          this.emitProgress('cancel', 0, 100, 'Cancelado pelo usuario');
          return { success: false, error: 'Cancelado pelo usuario' };
        }

        savePath = result.filePath;
      }

      this.emitProgress('prepare', 10, 100, 'Preparando backup');

      const zip = new AdmZip();

      // Criar pasta temporária
      const tempDir = path.join(this.userDataPath, 'temp-backup');
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      fs.mkdirSync(tempDir, { recursive: true });

      // Backup dos databases
      const dbDir = path.join(this.userDataPath, 'databases');
      const tempDbDir = path.join(tempDir, 'databases');
      
      if (fs.existsSync(dbDir)) {
        fs.mkdirSync(tempDbDir, { recursive: true });
        this.emitProgress('backup', 20, 100, 'Copiando databases');
        await this.backupDatabasesOnline(dbDir, tempDbDir);
        this.emitProgress('backup', 60, 100, 'Databases copiados');
        zip.addLocalFolder(tempDbDir, 'databases');
      }

      // Adicionar user.json
      this.emitProgress('files', 70, 100, 'Adicionando arquivos de configuracao');
      const userFile = path.join(this.userDataPath, 'user.json');
      // if (fs.existsSync(userFile)) {
      //   zip.addLocalFile(userFile, '');
      // }

      // Adicionar machine.id
      const machineIdFile = path.join(this.userDataPath, 'machine.id');
      // if (fs.existsSync(machineIdFile)) {
      //   zip.addLocalFile(machineIdFile, '');
      // }

      // Criar metadata
      const appVersion =
        (() => {
          try {
            if (app && typeof (app as any).getVersion === 'function') {
              return app.getVersion();
            }
          } catch {}
          return process.env.npm_package_version || 'dev';
        })();
      const metadata: BackupMetadata = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        backupType: 'manual',
        databases: this.getDatabasesInfo(dbDir),
        hasUserData: fs.existsSync(userFile),
        hasLicense: false,
        totalSize: 0,
        appVersion
      };

      zip.addFile(
        'backup-metadata.json',
        Buffer.from(JSON.stringify(metadata, null, 2))
      );

      // Salvar ZIP
      this.emitProgress('compress', 80, 100, 'Compactando backup');
      zip.writeZip(savePath);

      // Limpar pasta temporária
      fs.rmSync(tempDir, { recursive: true, force: true });

      const stats = fs.statSync(savePath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      this.emitProgress('complete', 100, 100, `Backup criado (${sizeMB} MB)`);
      console.log('Backup manual criado:', savePath);
      console.log('Tamanho:', sizeMB, 'MB');

      return {
        success: true,
        path: savePath,
        size: stats.size,
      };
    } catch (error) {
      console.error('Erro no backup manual:', error);
      this.emitProgress('error', 0, 100, 'Erro no backup manual');
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * BACKUP ONLINE de databases usando SQLite .backup()
   */
  private async backupDatabasesOnline(sourceDir: string, destDir: string): Promise<void> {
    const files = fs.readdirSync(sourceDir);
    const dbFiles = files.filter(f => f.endsWith('.db'));

    console.log(`Copiando ${dbFiles.length} databases usando Online Backup API...`);

    for (let i = 0; i < dbFiles.length; i++) {
      const dbFile = dbFiles[i];
      const sourcePath = path.join(sourceDir, dbFile);
      const destPath = path.join(destDir, dbFile);

      try {
        const sourceDb = new Database(sourcePath, { readonly: true });
        
        await new Promise<void>((resolve, reject) => {
          sourceDb.backup(destPath)
            .then(() => {
              console.log(`${dbFile} copiado`);
              sourceDb.close();
              resolve();
            })
            .catch((error) => {
              sourceDb.close();
              reject(error);
            });
        });

        // Copiar .meta.json se existir
        const metaFile = dbFile.replace('.db', '.meta.json');
        const sourceMetaPath = path.join(sourceDir, metaFile);
        const destMetaPath = path.join(destDir, metaFile);
        
        if (fs.existsSync(sourceMetaPath)) {
          fs.copyFileSync(sourceMetaPath, destMetaPath);
        }

        // Emitir progresso (20-70% do total)
        const progress = 20 + Math.floor((i + 1) / dbFiles.length * 50);
        this.emitProgress('backup', progress, 100, `Copiando ${i + 1}/${dbFiles.length} databases`);

      } catch (error) {
        console.error(`Erro ao copiar ${dbFile}:`, error);
        throw error;
      }
    }

    console.log('Todos os databases copiados com sucesso');
  }

  /**
   * ✅ SIMPLIFICADO: Restaurar backup (AGENDA para próximo início)
   */
  async restoreBackup(backupPath: string): Promise<RestoreBackupReturn> {
    try {
      console.log('Preparando restore...');

      // 1. Validar backup
      const validation = await this.validateBackup(backupPath);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: 'Backup inválido: ' + validation.errors.join(', ') 
        };
      }

      // 2. Confirmar com usuário
      const proceed = await dialog.showMessageBox({
        type: 'warning',
        title: 'Restaurar Backup',
        message: 'A aplicação será reiniciada para restaurar o backup',
        detail: 
          'Esta operação irá:\n\n' +
          '1. Criar um backup de segurança dos dados atuais\n' +
          '2. Reiniciar a aplicação\n' +
          '3. Restaurar os dados do backup\n\n' +
          (validation.warnings.length > 0 
            ? 'Avisos:\n' + validation.warnings.map(w => `- ${w}`).join('\n') + '\n\n'
            : '') +
          'Deseja continuar?',
        buttons: ['Cancelar', 'Restaurar e Reiniciar'],
        defaultId: 1,
        cancelId: 0,
      });

      if (proceed.response === 0) {
        return { success: false, error: 'Cancelado pelo usuário' };
      }

      // 3. Criar backup de segurança
      console.log('Criando backup de segurança...');
      await this.createAutoBackup();

      // 4. AGENDAR RESTORE (próximo início)
      const { RestoreController } = await import('./restore_manager');
      const restoreCtrl = new RestoreController();
      
      await restoreCtrl.scheduleRestore(backupPath);
      // ☝️ Isso REINICIA a app automaticamente

      // Este código nunca executa (app já fechou)
      return { 
        success: true,
        requiresRestart: true 
      };

    } catch (error) {
      console.error('Erro ao agendar restore:', error);
      return { 
        success: false, 
        error: (error as Error).message 
      };
    }
  }

  // /**
  //  * RESTAURAR BACKUP usando SQLite .backup() reverso
  //  */
  // async restoreBackup(backupPath: string): Promise<RestoreBackupReturn> {
  //   try {
  //     console.log('Iniciando restauracao (Online Backup API)');
  //     this.emitProgress('init', 0, 100, 'Iniciando restauracao');

  //     // 1. Validar backup
  //     this.emitProgress('validate', 5, 100, 'Validando backup');
  //     const validation = await this.validateBackup(backupPath);
  //     if (!validation.isValid) {
  //       this.emitProgress('error', 0, 100, 'Backup invalido');
  //       return { 
  //         success: false, 
  //         error: 'Backup invalido: ' + validation.errors.join(', ') 
  //       };
  //     }

  //     // 2. Confirmar com usuário
  //     const proceed = await dialog.showMessageBox({
  //       type: 'warning',
  //       title: 'Restaurar Backup',
  //       message: 'Todos os dados atuais serao substituidos!',
  //       detail: 
  //         'Esta operacao ira:\n\n' +
  //         '- Criar um backup de seguranca dos dados actuais\n' +
  //         '- Restaurar os dados do backup\n' +
  //         '- O sistema continuara funcionando normalmente\n\n' +
  //         (validation.warnings.length > 0 
  //           ? 'Avisos:\n' + validation.warnings.map(w => `- ${w}`).join('\n') + '\n\n'
  //           : '') +
  //         'Usando SQLite Online Backup API (sem interrupcoes)',
  //       buttons: ['Cancelar', 'Restaurar Agora'],
  //       defaultId: 1,
  //       cancelId: 0,
  //     });

  //     if (proceed.response === 0) {
  //       this.emitProgress('cancel', 0, 100, 'Cancelado pelo usuario');
  //       return { success: false, error: 'Cancelado pelo usuario' };
  //     }

  //     // 3. Criar backup de segurança
  //     this.emitProgress('safety-backup', 10, 100, 'Criando backup de seguranca');
  //     await this.createAutoBackup();

  //     // 4. Extrair backup
  //     const tempDir = path.join(this.userDataPath, 'temp-restore');
  //     if (fs.existsSync(tempDir)) {
  //       fs.rmSync(tempDir, { recursive: true, force: true });
  //     }
  //     fs.mkdirSync(tempDir, { recursive: true });

  //     this.emitProgress('extract', 20, 100, 'Extraindo backup');
  //     const zip = new AdmZip(backupPath);
  //     zip.extractAllTo(tempDir, true);

  //     // 5. Restaurar databases
  //     const tempDbDir = path.join(tempDir, 'databases');
  //     const dbDir = path.join(this.userDataPath, 'databases');

  //     if (fs.existsSync(tempDbDir)) {
  //       this.emitProgress('restore', 30, 100, 'Restaurando databases');
  //       await this.restoreDatabasesOnline(tempDbDir, dbDir);
  //     }

  //     // 6. Restaurar user.json
  //     this.emitProgress('files', 85, 100, 'Restaurando configuracoes');
  //     const tempUserFile = path.join(tempDir, 'user.json');
  //     const userFile = path.join(this.userDataPath, 'user.json');
      
  //     if (fs.existsSync(tempUserFile)) {
  //       if (fs.existsSync(userFile)) {
  //         fs.unlinkSync(userFile);
  //       }
  //       fs.copyFileSync(tempUserFile, userFile);
  //     }

  //     // 7. Limpar temporários
  //     this.emitProgress('cleanup', 95, 100, 'Limpando arquivos temporarios');
  //     fs.rmSync(tempDir, { recursive: true, force: true });

  //     this.emitProgress('complete', 100, 100, 'Restauracao concluida');
  //     console.log('Restauracao concluida com sucesso');

  //     return {
  //       success: true,
  //       needsReactivation: false,
  //       requiresRestart: false,
  //     };

  //   } catch (error) {
  //     console.error('Erro na restauracao:', error);
  //     this.emitProgress('error', 0, 100, 'Erro na restauracao');
      
  //     return { 
  //       success: false, 
  //       error: (error as Error).message 
  //     };
  //   }
  // }

  // /**
  //  * RESTAURAÇÃO ONLINE usando .backup() reverso
  //  */
  // private async restoreDatabasesOnline(sourceDir: string, destDir: string): Promise<void> {
  //   const files = fs.readdirSync(sourceDir);
  //   const dbFiles = files.filter(f => f.endsWith('.db'));

  //   console.log(`Restaurando ${dbFiles.length} databases usando Online Backup API...`);

  //   //Limpar TUDO do diretório de destino primeiro
  //   if (fs.existsSync(destDir)) {
  //       console.log('Limpando databases antigos...');
  //       const oldFiles = fs.readdirSync(destDir);
  //       for (const oldFile of oldFiles) {
  //           const oldPath = path.join(destDir, oldFile);
  //           try {
  //               if (fs.statSync(oldPath).isFile()) {
  //                   fs.unlinkSync(oldPath);
  //               }
  //           } catch (error) {
  //               console.error(`Erro ao remover ${oldFile}:`, error);
  //           }
  //       }
  //       console.log('Databases antigos removidos');
  //   } else {
  //       // Se não existe, criar
  //       fs.mkdirSync(destDir, { recursive: true });
  //   }

  //   for (let i = 0; i < dbFiles.length; i++) {
  //     const dbFile = dbFiles[i];
  //     const sourcePath = path.join(sourceDir, dbFile);
  //     const destPath = path.join(destDir, dbFile);

  //     try {
  //       const sourceDb = new Database(sourcePath, { readonly: true });
        
  //       await new Promise<void>((resolve, reject) => {
  //         sourceDb.backup(destPath)
  //           .then(() => {
  //             console.log(`${dbFile} restaurado`);
  //             sourceDb.close();
  //             resolve();
  //           })
  //           .catch((error) => {
  //             sourceDb.close();
  //             reject(error);
  //           });
  //       });

  //       // Restaurar .meta.json
  //       const metaFile = dbFile.replace('.db', '.meta.json');
  //       const sourceMetaPath = path.join(sourceDir, metaFile);
  //       const destMetaPath = path.join(destDir, metaFile);
        
  //       if (fs.existsSync(sourceMetaPath)) {
  //         if (fs.existsSync(destMetaPath)) {
  //           fs.unlinkSync(destMetaPath);
  //         }
  //         fs.copyFileSync(sourceMetaPath, destMetaPath);
  //       }

  //       // Emitir progresso (30-85% do total)
  //       const progress = 30 + Math.floor((i + 1) / dbFiles.length * 55);
  //       this.emitProgress('restore', progress, 100, `Restaurando ${i + 1}/${dbFiles.length} databases`);

  //     } catch (error) {
  //       console.error(`Erro ao restaurar ${dbFile}:`, error);
  //       throw error;
  //     }
  //   }

  //   console.log('Todos os databases restaurados com sucesso');
  // }

  /**
   * VALIDAR BACKUP
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
        errors.push('Arquivo de metadata nao encontrado');
        return { isValid: false, errors, warnings };
      }

      metadata = JSON.parse(metadataEntry.getData().toString('utf8'));

      if (metadata && metadata.version !== '1.0') {
        warnings.push(`Versao do backup (${metadata.version}) diferente da esperada (1.0)`);
      }

      const hasDatabases = entries.some(e => e.entryName.startsWith('databases/'));
      if (!hasDatabases) {
        errors.push('Nenhuma base de dados encontrada no backup');
      }

      if (!entries.some(e => e.entryName === 'user.json')) {
        warnings.push('user.json nao encontrado - dados do usuario ausentes');
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
      console.log('Removendo backup antigo:', backup.name);
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
