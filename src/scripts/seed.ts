// src/scripts/seed.ts
import { DatabaseManager } from '@/lib/db/db_manager'; // ajusta o caminho correto

async function main() {
  console.log('Iniciando seed seguro...');

  const manager = new DatabaseManager();
  const db = manager.initialize(); // ou await se for async

  const { seedDatabase } = await import('@/lib/db/seeds');

  await seedDatabase();

  console.log('Seed concluído.');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});