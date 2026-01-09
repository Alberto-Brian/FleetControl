import { app } from 'electron';
import { eq } from 'drizzle-orm';
import { systemInfo } from '../lib/db/schemas/system';
import { MigrationRunner } from './migration_runner';
import { MIGRATIONS_FOLDER_PATH } from './system.config';
import Database from 'better-sqlite3';
import fs from "fs"
import path from 'path';

export class VersionManager {
  private db: any;
  private sqlite: Database.Database;
  private migrationRunner: MigrationRunner;

  constructor(db: any, sqlite: Database.Database) {
    this.db = db;
    this.sqlite = sqlite;
    this.migrationRunner = new MigrationRunner(sqlite);
  }

  static getCurrentVersion(): string {
    return app.getVersion();
  }

  static getSchemaVersion(): number {
    if (!fs.existsSync(MIGRATIONS_FOLDER_PATH)) {
        return 0;
      }
  
      const files = fs.readdirSync(MIGRATIONS_FOLDER_PATH)
        .filter(f => f.endsWith('.sql'))
        .sort();
  
      return files.length;
  }

  static compare(v1: string, v2: string): number {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (a[i] > b[i]) return 1;
      if (a[i] < b[i]) return -1;
    }
    return 0;
  }

  async getInstalledVersion(): Promise<string | null> {
    try {
      const result = await this.db
        .select()
        .from(systemInfo)
        .limit(1);

      return result[0]?.version || null;
    } catch (error) {
      return null;
    }
  }

  async registerInstallation(systemName: string = 'MercadoPro'): Promise<void> {
    const version = VersionManager.getCurrentVersion();
    const existing = await this.getInstalledVersion();

    if (!existing) {
      await this.db.insert(systemInfo).values({
        systemName,
        version,
        installedAt: new Date().toISOString()
      });
      console.log(`✅ Sistema instalado: v${version}`);
    }
  }

  async updateVersion(newVersion: string): Promise<void> {
    await this.db
      .update(systemInfo)
      .set({
        version: newVersion,
        updatedAt: new Date().toISOString()
      })
      .where(eq(systemInfo.id, 1));

    console.log(`✅ Versão actualizada para v${newVersion}`);
  }

  async needsUpgrade(): Promise<boolean> {
    const installedVersion = await this.getInstalledVersion();
    const currentVersion = VersionManager.getCurrentVersion();

    if (!installedVersion) return false;

    return VersionManager.compare(currentVersion, installedVersion) > 0;
  }

  /**
   * Executa migrations do Drizzle baseado na versão
   */
  async runMigrations(): Promise<void> {
    const dbVersion = await this.getInstalledVersion();
    const appVersion = VersionManager.getCurrentVersion();

    if (!dbVersion) {
      console.log('⚠️  Versão não encontrada no banco');
      return;
    }

    console.log(`📊 Versão do banco: ${dbVersion}`);
    console.log(`📊 Versão do app: ${appVersion}`);

    if (VersionManager.compare(appVersion, dbVersion) <= 0) {
      console.log('✅ Sistema já está atualizado');
      return;
    }

    console.log('🔄 Executando migrations...');
    await this.migrationRunner.runMigrations(dbVersion, appVersion);
    await this.updateVersion(appVersion);
    console.log('✅ Migrations concluídas!');
  }
}