import { app } from 'electron';
import { eq } from 'drizzle-orm';
import { systemInfo } from '../lib/db/schemas/system';
import { APP_NAME } from "@/system/system.config"

/**
 * Gerencia apenas a versão da aplicação
 * Migrations são gerenciadas automaticamente pelo Drizzle
 */
export class VersionManager {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Retorna a versão atual da aplicação (package.json)
   */
  static getCurrentVersion(): string {
    return app.getVersion();
  }

  /**
   * Compara duas versões (semver)
   * Retorna: 1 se v1 > v2, -1 se v1 < v2, 0 se iguais
   */
  static compare(v1: string, v2: string): number {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  }

  /**
   * Retorna a versão instalada no banco de dados
   */
  async getInstalledVersion(): Promise<string | null> {
    try {
      const result = await this.db
        .select()
        .from(systemInfo)
        .limit(1);

      return result[0]?.version || null;
    } catch (error) {
      console.warn('⚠️ Não foi possível ler versão instalada:', error);
      return null;
    }
  }

  /**
   * Registra a primeira instalação do sistema
   */
  async registerInstallation(systemName: string = APP_NAME): Promise<void> {
    const version = VersionManager.getCurrentVersion();

    try {
      await this.db.insert(systemInfo).values({
        systemName,
        version,
        installedAt: new Date().toISOString()
      });
      console.log(`✅ Sistema instalado: v${version}`);
    } catch (error) {
      console.error('❌ Erro ao registrar instalação:', error);
      throw error;
    }
  }

  /**
   * Atualiza a versão no banco de dados
   */
  async updateVersion(): Promise<void> {
    const newVersion = VersionManager.getCurrentVersion();

    try {
      await this.db
        .update(systemInfo)
        .set({
          version: newVersion,
          updatedAt: new Date().toISOString()
        })
        .where(eq(systemInfo.id, 1));

      console.log(`✅ Versão actualizada para v${newVersion}`);
    } catch (error) {
      console.error('❌ Erro ao actualizar versão:', error);
      throw error;
    }
  }

  /**
   * Verifica se a aplicação foi atualizada
   */
  async needsUpgrade(): Promise<boolean> {
    const installedVersion = await this.getInstalledVersion();
    const currentVersion = VersionManager.getCurrentVersion();

    if (!installedVersion) {
      return false; // Primeira instalação
    }

    return VersionManager.compare(currentVersion, installedVersion) > 0;
  }

  /**
   * Retorna informações completas da versão
   */
  async getVersionInfo() {
    const installed = await this.getInstalledVersion();
    const current = VersionManager.getCurrentVersion();

    return {
      installed,
      current,
      needsUpgrade: await this.needsUpgrade(),
      isFirstInstall: !installed
    };
  }
}