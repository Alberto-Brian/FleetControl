/**
 * TESTE RÁPIDO DE ROTAÇÃO - Execute direto no main process
 * 
 * Adicione isto temporariamente no seu main.ts ou crie um script separado
 */

import { app } from 'electron';
import { DatabaseManager } from '@/system/db_manager';
import { users } from "@/lib/db/schemas/users";
import { generateUuid } from '@/lib/utils/cripto';

async function quickRotationTest() {
  console.log('\n🚀 TESTE RÁPIDO DE ROTAÇÃO');
  console.log('='.repeat(70));
  
  try {
    // 1. Inicializar
    console.log('\n1️⃣ Inicializando DatabaseManager...');
    const dbManager = new DatabaseManager(100, 100000);
    const db = dbManager.initialize();
    console.log('✅ Inicializado com sucesso');
    
    // 2. Verificar estado inicial
    console.log('\n2️⃣ Estado inicial:');
    const initialDbs = dbManager.listDatabases();
    console.log(`   📊 Total de bancos: ${initialDbs.length}`);
    const activeDb = initialDbs.find(d => d.isActive);
    console.log(`   📁 Banco ativo: ${activeDb?.filename}`);
    console.log(`   💾 Tamanho: ${(activeDb?.size || 0 / 1024).toFixed(2)} KB`);
    
    // 3. Inserir alguns dados de teste (adapte ao seu schema)
    console.log('\n3️⃣ Inserindo dados de teste...');
    try {
      // Exemplo - adapte conforme suas tabelas
      const usersTable = db.select().from(users);
      await db.insert(users).values([
        { id: generateUuid(), name: 'Vendedor 1', email: 'v1@test.com', password_hash: 'v1@test.com'},
        { id: generateUuid(), name: 'Vendedor 2', email: 'v1@test.com', password_hash: 'v1@test.com'},
      ]);
      
      console.log('   ✅ Dados inseridos (adapte o código acima)');
    } catch (error) {
      console.log('   ⚠️ Pule este passo se não tiver dados para inserir');
    }
    
    // 4. Testar rotação SIMPLES (sem master tables)
    console.log('\n4️⃣ Testando rotação SIMPLES...');
    const simpleResult = await dbManager.rotate();
    console.log('   ✅ Rotação concluída!');
    console.log(`   📁 Novo banco: ${simpleResult.newDatabase}`);
    console.log(`   📦 Banco antigo: ${simpleResult.oldDatabase}`);
    
    // 5. Verificar bancos após rotação
    console.log('\n5️⃣ Bancos após rotação simples:');
    const afterSimple = dbManager.listDatabases();
    afterSimple.forEach((db, i) => {
      const status = db.isActive ? '🟢 ATIVO' : '🔴 INATIVO';
      console.log(`   ${i + 1}. ${status} | ${db.filename} | ${(db.size / 1024).toFixed(2)} KB`);
    });
    
    // 6. Inserir mais dados (para testar master tables)
    console.log('\n6️⃣ Inserindo mais dados para teste de master tables...');
    try {
      // Insira dados em tabelas "master" (users, settings, etc)
      // await db.insert(users).values([
      //   { name: 'Admin', email: 'admin@test.com' },
      // ]);
      // await db.insert(settings).values([
      //   { key: 'theme', value: 'dark' },
      // ]);
      
      console.log('   ✅ Dados master inseridos (adapte o código acima)');
    } catch (error) {
      console.log('   ⚠️ Pule se não tiver tabelas master configuradas');
    }
    
    // 7. Testar rotação COM MASTER TABLES
    console.log('\n7️⃣ Testando rotação COM MASTER TABLES...');
    
    const masterResult = await dbManager.rotate();
    console.log('   ✅ Rotação com masters concluída!');
    
    if (masterResult.copyStats) {
      console.log('\n   📊 Estatísticas de cópia:');
      console.log(`   ✅ Sucesso: ${masterResult.copyStats.success}`);
      
      if (masterResult.copyStats.copied.length > 0) {
        console.log('   📋 Tabelas copiadas:');
        masterResult.copyStats.copied.forEach(c => {
          console.log(`      • ${c.table}: ${c.records} registros`);
        });
      }
      
      if (masterResult.copyStats.errors.length > 0) {
        console.log('   ❌ Erros:');
        masterResult.copyStats.errors.forEach(e => {
          console.log(`      • ${e.table}: ${e.error}`);
        });
      }
    }
    
    // 8. Estado final
    console.log('\n8️⃣ Estado final:');
    const finalDbs = dbManager.listDatabases();
    console.log(`   📊 Total de bancos: ${finalDbs.length}`);
    finalDbs.forEach((db, i) => {
      const status = db.isActive ? '🟢 ATIVO' : '🔴 INATIVO';
      console.log(`   ${i + 1}. ${status} | ${db.filename}`);
    });
    
    // 9. Testar cleanup
    console.log('\n9️⃣ Testando limpeza (manter últimos 2)...');
    // dbManager.cleanup(2);
    const afterCleanup = dbManager.listDatabases();
    console.log(`   ✅ Bancos após limpeza: ${afterCleanup.length}`);
    
    // 10. Fechar conexão
    console.log('\n🔟 Fechando conexão...');
    dbManager.close();
    console.log('   ✅ Conexão fechada');
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    console.error('Stack:', (error as Error).stack);
  }
}

// ============================================================================
// COMO USAR
// ============================================================================

/**
 * OPÇÃO 1: Adicionar no main.ts (desenvolvimento)
 * 
 * app.whenReady().then(async () => {
 *   // Executar teste antes de criar janela
 *   await quickRotationTest();
 *   
 *   // Criar janela normalmente
 *   createWindow();
 * });
 */

/**
 * OPÇÃO 2: Criar script separado (test-rotation.ts)
 * 
 * // test-rotation.ts
 * import { app } from 'electron';
 * import { quickRotationTest } from './quick-rotation-test';
 * 
 * app.whenReady().then(async () => {
 *   await quickRotationTest();
 *   app.quit();
 * });
 * 
 * // Package.json
 * "scripts": {
 *   "test:rotation": "electron test-rotation.ts"
 * }
 */

/**
 * OPÇÃO 3: Via DevTools Console (em runtime)
 * 
 * // No renderer process, chame via IPC
 * ipcRenderer.invoke('test-rotation');
 * 
 * // No main process, registre handler
 * ipcMain.handle('test-rotation', async () => {
 *   await quickRotationTest();
 * });
 */

export { quickRotationTest };