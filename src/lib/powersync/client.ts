// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/lib/powersync/client.ts
// ========================================
//
// Fase 12, Prompt 22.8 — instância PowerSyncDatabase (processo principal,
// @powersync/node + better-sqlite3 — já dependência do projecto, já
// recompilada para o Electron via `npm run rebuild`/postinstall). Ficheiro
// SQLite PRÓPRIO (powersync.db), separado do app.db gerido pelo Drizzle
// (tabela `users` local, o "cadeado do cache" da Fase 11B.10) — o PowerSync
// gere a sua própria base/migrações internamente, nunca deve partilhar
// ficheiro com outra base gerida por outro ORM.
//
// Instanciada de forma preguiçosa (só quando connect()/disconnectAndClear()
// é chamado pela primeira vez via IPC), nunca no carregamento do módulo —
// mesmo cuidado já usado em session-cache.ts para app.getPath('userData'),
// que só está disponível de forma fiável depois de app.whenReady().
//
// Achado ao correr a app real pela primeira vez: @powersync/node é ESM-only
// ("type":"module", sem condição "require" no seu package.json), mas o
// processo principal deste Electron compila para CJS (vite.main.config.ts) e
// externaliza `dependencies` (vite.base.config.ts) — um `import` estático
// aqui virava `require('@powersync/node')` no bundle final e rebentava com
// ERR_PACKAGE_PATH_NOT_EXPORTED assim que a app arrancava (mesmo sem nunca
// chamar connect()/disconnectAndClear(), só por o main process carregar o
// módulo). Corrigido com `import()` dinâmico — suportado nativamente pelo
// Node/Electron a partir de um módulo CJS, e preservado como `import()`
// genuíno (não reescrito para `require()`) pelo Rollup 4 usado por este Vite
// (dynamicImportInCjs, default `true` para módulos externos). `PowerSyncCredentials`/
// `PowerSyncBackendConnector`/`AbstractPowerSyncDatabase` continuam a ser só
// tipos (`import type`, ver connector.ts) — nunca geram um `require()` em
// tempo de execução, por isso não precisaram do mesmo tratamento.
import { app } from 'electron';
import path from 'path';
import type { PowerSyncDatabase as PowerSyncDatabaseType } from '@powersync/node';
import { loadAppSchema } from './schema';
import { PowerSyncConnector } from './connector';

let _db: PowerSyncDatabaseType | null = null;
let _connector: PowerSyncConnector | null = null;

async function getDb(): Promise<PowerSyncDatabaseType> {
  if (!_db) {
    const [{ PowerSyncDatabase }, schema] = await Promise.all([
      import('@powersync/node'),
      loadAppSchema(),
    ]);
    _db = new PowerSyncDatabase({
      schema,
      database: {
        dbFilename: path.join(app.getPath('userData'), 'powersync.db'),
      },
    });
  }
  return _db;
}

// Chamado depois de um login/restauro de sessão API bem-sucedido
// (license-helpers.ts, Fase 11B.8/11B.9) — nunca antes: fetchCredentials()
// exige um access_token válido em token-store.ts, que só existe a partir
// daí. connect() é fire-and-forget por desenho do próprio SDK (não bloqueia
// à espera do primeiro sync) — chamar de novo com uma sessão já ligada é
// seguro/idempotente (o SDK ignora um connect() repetido com o mesmo
// connector enquanto já ligado).
export async function connectPowerSync(): Promise<void> {
  if (!_connector) _connector = new PowerSyncConnector();
  const db = await getDb();
  await db.connect(_connector);
}

// Ligado a clearApiSession()/removeLicense() (Fase 11B) — desliga a
// sincronização e APAGA a base local (dados só de outra pessoa/organização,
// nunca deve sobreviver a um logout ou troca de licença num Desktop
// partilhado). Seguro chamar mesmo sem nunca ter chamado connect() antes
// (ex. logout de uma sessão que nunca chegou a autenticar-se ao PowerSync).
export async function disconnectAndClearPowerSync(): Promise<void> {
  if (!_db) return;
  await _db.disconnectAndClear();
}
