// import { drizzle } from 'drizzle-orm/libsql';
// import { createClient } from '@libsql/client';
// import { migrate } from 'drizzle-orm/libsql/migrator';
// import { dbUrl } from './db_consts';

// export function runMigrations() {
//   const client = createClient({ url: dbUrl });
//   const db = drizzle(client);
  
//   migrate(db, { migrationsFolder: './drizzle' });
  
//   console.log('Migrations completed!');
// }

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { dbUrl } from './db_consts';

export function runMigrations() {
  const sqlite = new Database(dbUrl);
  const db = drizzle(sqlite);
  
  migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Migrations completed!');
}