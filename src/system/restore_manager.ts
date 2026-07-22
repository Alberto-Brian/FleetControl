// src/system/restore_manager.ts

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import AdmZip from 'adm-zip';

interface RestorePending {
  backupPath: string;
  timestamp: string;
}

export class RestoreController {
  private readonly userDataPath: string;
  private readonly restoreFile: string;
  private readonly dbDir: string;

  constructor() {
    this.userDataPath = app.getPath('userData');
    this.restoreFile = path.join(this.userDataPath, '.restore-pending.json');
    this.dbDir = path.join(this.userDataPath, 'databases');
  }

  /**
   * ✅ PASSO 1: Marcar restore como pendente e REINICIAR
   */
  async scheduleRestore(backupPath: string): Promise<void> {
    console.log('[Restore] A agendar restore para o proximo inicio...');

    if (!fs.existsSync(backupPath)) {
      throw new Error('Arquivo de backup nao encontrado');
    }

    const pending: RestorePending = {
      backupPath,
      timestamp: new Date().toISOString()
    };

    try {
      fs.writeFileSync(this.restoreFile, JSON.stringify(pending, null, 2));
      console.log('[Restore] Restore agendado. A relançar aplicacao...');
      app.relaunch();
      app.quit();
    } catch (error: any) {
      console.error('[Restore] Erro ao agendar restore:', error.message);
      throw error;
    }
  }

  /**
   * ✅ PASSO 2: Executar restore na inicialização (SEM LOCKS)
   */
  async checkAndExecuteRestore(): Promise<boolean> {
    // Verificar se existe restore pendente
    if (!fs.existsSync(this.restoreFile)) {
      return false; // Nada para fazer
    }

    console.log('');
    console.log('==============================================');
    console.log('   RESTORE PENDENTE DETECTADO');
    console.log('==============================================');
    console.log('');

    try {
      // Ler instruções
      const pending: RestorePending = JSON.parse(
        fs.readFileSync(this.restoreFile, 'utf-8')
      );

      console.log('📦 Backup:', path.basename(pending.backupPath));
      console.log('🕐 Agendado em:', pending.timestamp);
      console.log('');

      // Executar restore
      await this.executeRestore(pending.backupPath);

      // Remover flag de restore
      fs.unlinkSync(this.restoreFile);

      console.log('');
      console.log('✅ RESTORE CONCLUÍDO COM SUCESSO');
      console.log('');

      return true;

    } catch (error) {
      console.error('❌ Erro no restore:', error);
      
      // Remover flag mesmo com erro (evitar loop)
      try {
        fs.unlinkSync(this.restoreFile);
      } catch {}

      throw error;
    }
  }

  /**
   * ✅ Executar restore (SEM LOCKS - app acabou de iniciar)
   */
  private async executeRestore(backupPath: string): Promise<void> {
    console.log('🗑️  Limpando databases antigas...');

    // 1. LIMPAR pasta databases completamente
    if (fs.existsSync(this.dbDir)) {
      const files = fs.readdirSync(this.dbDir);
      
      for (const file of files) {
        const filePath = path.join(this.dbDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`   ✓ Removido: ${file}`);
        } catch (error) {
          console.error(`   ✗ Erro ao remover ${file}:`, error);
          throw error; // Se não conseguir limpar, aborta
        }
      }
    } else {
      fs.mkdirSync(this.dbDir, { recursive: true });
    }

    console.log('✅ Pasta limpa');
    console.log('');

    // 2. EXTRAIR backup
    console.log('📦 Extraindo backup...');
    
    const zip = new AdmZip(backupPath);
    const entries = zip.getEntries();

    let restoredCount = 0;

    for (const entry of entries) {
      // Só arquivos da pasta databases/
      if (entry.entryName.startsWith('databases/') && !entry.isDirectory) {
        const fileName = path.basename(entry.entryName);
        const destPath = path.join(this.dbDir, fileName);

        // Extrair arquivo
        zip.extractEntryTo(entry, this.dbDir, false, true);
        
        console.log(`   ✓ Restaurado: ${fileName}`);
        restoredCount++;
      }
    }

    console.log('');
    console.log(`✅ ${restoredCount} arquivo(s) restaurado(s)`);
  }

  /**
   * Cancelar restore pendente (se necessário)
   */
  cancelPendingRestore(): void {
    if (fs.existsSync(this.restoreFile)) {
      fs.unlinkSync(this.restoreFile);
      console.log('❌ Restore pendente cancelado');
    }
  }

  /**
   * Verificar se há restore pendente
   */
  hasPendingRestore(): boolean {
    return fs.existsSync(this.restoreFile);
  }
}