
// ========================================
// FILE: src/scripts/seed.ts
// ========================================
import { initializeDatabase } from '@/lib/db/db_client';

async function main() {
  console.log('Iniciando seed seguro...');

  initializeDatabase();

  const { seedDatabase } = await import('@/lib/db/seeds');

  await seedDatabase();

  console.log('Seed concluído.');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
