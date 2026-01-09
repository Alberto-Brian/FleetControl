import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { MIGRATIONS_FOLDER_PATH } from './system.config';

interface MigrationFile {
  filename: string;
  version: string;
  description: string;
  sql: string;
}

export class MigrationRunner {
  private sqlite: Database.Database;
  private migrationsPath: string;

  constructor(sqlite: Database.Database) {
    this.sqlite = sqlite;
    this.migrationsPath = MIGRATIONS_FOLDER_PATH;
  }

  /**
   * Lista todas as migrations disponíveis
   */
  listMigrations(): MigrationFile[] {
    if (!fs.existsSync(this.migrationsPath)) {
      console.warn('⚠️  Pasta de migrations não encontrada:', this.migrationsPath);
      return [];
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    return files.map(filename => {
      const match = filename.match(/^(\d+\.\d+\.\d+)_(.+)\.sql$/);
      
      if (!match) {
        console.warn(`⚠️  Migration ignorada (formato inválido): ${filename}`);
        return null;
      }

      const [, version, description] = match;
      const filepath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filepath, 'utf-8');

      return {
        filename,
        version,
        description: description.replace(/_/g, ' '),
        sql
      };
    }).filter(Boolean) as MigrationFile[];
  }

  /**
   * Conta todas as migrations
   */
  countMigrations(): number {
    if (!fs.existsSync(this.migrationsPath)) {
      console.warn('⚠️  Pasta de migrations não encontrada:', this.migrationsPath);
      return 0;
    }

    const files = fs.readdirSync(this.migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    return files.length;
  }

  /**
   * Executa migrations entre duas versões
   */
  async runMigrations(fromVersion: string, toVersion: string): Promise<void> {
    const migrations = this.listMigrations();
    
    console.log(`📊 Total de migrations disponíveis: ${migrations.length}`);

    for (const migration of migrations) {
      const needsRun = this.shouldRunMigration(migration.version, fromVersion, toVersion);

      if (needsRun) {
        console.log(`🔄 Executando: ${migration.filename}`);
        
        try {
          this.sqlite.exec(migration.sql);
          console.log(`✅ Migration ${migration.version} concluída: ${migration.description}`);
        } catch (error) {
          console.error(`❌ Erro na migration ${migration.filename}:`, error);
          throw error;
        }
      } else {
        console.log(`⏭️  Pulando: ${migration.filename} (já aplicada)`);
      }
    }
  }

  /**
   * Verifica se uma migration deve ser executada
   */
  private shouldRunMigration(migrationVersion: string, fromVersion: string, toVersion: string): boolean {
    const compare = (v1: string, v2: string): number => {
      const a = v1.split('.').map(Number);
      const b = v2.split('.').map(Number);

      for (let i = 0; i < 3; i++) {
        if (a[i] > b[i]) return 1;
        if (a[i] < b[i]) return -1;
      }
      return 0;
    };

    // Migration deve ser > fromVersion e <= toVersion
    return compare(migrationVersion, fromVersion) > 0 && 
           compare(migrationVersion, toVersion) <= 0;
  }
}