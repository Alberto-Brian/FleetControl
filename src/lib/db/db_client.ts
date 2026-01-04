// import { drizzle } from 'drizzle-orm/libsql';
// import * as schema from "./schemas";
// import { dbUrl } from './db_consts';
// import { createClient } from '@libsql/client';

// const client = createClient({ url: dbUrl });

// // configuração de WAL para performance na leitura e escrita
//  client.execute(`
//         PRAGMA journal_mode = WAL;
//         PRAGMA synchronous = NORMAL;
//         PRAGMA foreign_keys = ON;
//     `)

// export const db = drizzle(client, { schema: schema });

/*=====================================================================================*/

// import { drizzle } from 'drizzle-orm/better-sqlite3';
// import * as schema from "./schemas";
// import { dbUrl } from './db_consts';
// import Database from 'better-sqlite3';

// const sqlite = new Database(dbUrl);

// // Configuração de WAL para performance na leitura e escrita
// sqlite.pragma('journal_mode = WAL');
// sqlite.pragma('synchronous = NORMAL');
// sqlite.pragma('foreign_keys = ON');

// export const db = drizzle(sqlite, { schema: schema });

//====================================================================================

import { DatabaseManager } from './db_manager';

// Criar instância do gerenciador
// 100MB por arquivo, máximo de 100.000 registros
export const dbManager = new DatabaseManager(100, 100000);

// Inicializar banco
export const db = dbManager.initialize();

// Exportar para uso em IPC handlers
// export { dbManager };