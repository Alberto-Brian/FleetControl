const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const drizzleDir = path.join(__dirname, '../../drizzle');
const metaDir = path.join(drizzleDir, 'meta');
const journalPath = path.join(metaDir, '_journal.json');

// Encontrar última migration gerada
const files = fs.readdirSync(drizzleDir)
  .filter(f => f.endsWith('.sql'))
  .sort()
  .reverse();

if (files.length === 0) {
  console.log('❌ Nenhuma migration nova encontrada');
  process.exit(1);
}

const lastMigration = files[0];
console.log(`📄 Última migration gerada: ${lastMigration}`);

rl.question('🔢 Qual a versão? (ex: 1.1.0): ', (version) => {
  rl.question('📝 Descrição curta: ', (description) => {
    const newName = `${version}_${description.replace(/\s+/g, '_')}.sql`;
    
    const oldPath = path.join(drizzleDir, lastMigration);
    const newPath = path.join(drizzleDir, newName);
    
    // Renomear arquivo SQL
    fs.renameSync(oldPath, newPath);
    
    // Atualizar _journal.json
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
    
    // Encontrar e atualizar a entrada no journal
    const lastEntry = journal.entries[journal.entries.length - 1];
    if (lastEntry && lastEntry.tag === lastMigration.replace('.sql', '')) {
      lastEntry.tag = newName.replace('.sql', '');
      
      // Salvar journal atualizado
      fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));
      console.log('✅ Journal atualizado');
    }
    
    console.log(`✅ Migration renomeada para: ${newName}`);
    rl.close();
  });
});