// check-migrations.js
const Database = require('better-sqlite3');

// Cole aqui o caminho exato do banco ATIVO, que apareceu no seu log:
// "Verificando migrations em: C:\Users\BRIAV DEV\AppData\Roaming\FleetControl\databases\database_2026-02-17T13-57-42-400Z.db"
const dbPath = String.raw`C:\Users\BRIAV DEV\AppData\Roaming\FleetControl\databases\database_2026-02-17T13-57-42-400Z.db`;

const db = new Database(dbPath, { readonly: true });

console.log('=== __drizzle_migrations (o que o banco ACHA que já aplicou) ===');
try {
  const rows = db.prepare('SELECT * FROM __drizzle_migrations ORDER BY created_at').all();
  console.table(rows);
} catch (e) {
  console.log('Erro ao ler __drizzle_migrations:', e.message);
}

console.log('=== Colunas atuais de vehicles ===');
try {
  const cols = db.prepare('PRAGMA table_info(vehicles)').all();
  console.log(cols.map(c => c.name));
} catch (e) {
  console.log('Erro ao ler colunas:', e.message);
}

db.close();