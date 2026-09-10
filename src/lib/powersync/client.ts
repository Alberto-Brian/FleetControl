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

// Fase 6 (migração Standalone -> Connected-first), Prompt 6.1 — exportado
// para os módulos de query por-domínio (src/lib/db/queries/*.queries.powersync.ts)
// poderem correr leituras/escritas locais contra a mesma instância partilhada,
// nunca criando a sua própria — mesmo cuidado de instanciação preguiçosa já
// documentado acima (nunca ao carregar o módulo, só quando algo precisa de
// facto de tocar na base).
export async function getPowerSyncDb(): Promise<PowerSyncDatabaseType> {
  return getDb();
}

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

// Prompt 22.10 — ecrã de diagnóstico "Estado do PowerSync" no Desktop. Só
// leitura, nunca decide nada: mostra o que o SDK já sabe (db.currentStatus)
// e o que já está na base local (contagens + amostra de vehicles), para o
// utilizador conseguir VER a sincronização a acontecer sem precisar de ir
// aos logs do servidor. Nunca cria _db por si só (getDb() só é chamado se
// connect() já correu antes) — se ainda não houver sessão, devolve um
// estado "desligado" em vez de arrancar uma base nova só para diagnosticar.
export interface IPowerSyncStatusSnapshot {
  connected:      boolean;
  connecting:     boolean;
  lastSyncedAt:   string | null; // ISO — Date não atravessa bem o IPC
  hasSynced:      boolean;
  uploading:      boolean;
  downloading:    boolean;
  uploadError:    string | null; // Error não atravessa bem o IPC — só a mensagem
  downloadError:  string | null;
}

export async function getPowerSyncStatus(): Promise<IPowerSyncStatusSnapshot> {
  // Achado real (2026-09-0X): este early-return original ("se _db nunca foi
  // criado, não crie só para diagnosticar") tinha uma premissa errada — criar
  // _db aqui via getDb() só abre o ficheiro SQLite local, nunca liga a nada
  // (connect() continua a ser a única chamada que estabelece sessão de
  // sincronização real). Sem isto, testar offline logo a partir de um
  // arranque frio (connect() nunca chegou a correr, ex. sem sessão API
  // restaurável) mostrava sempre "sem dados" neste ecrã, mesmo com dados
  // reais já sincronizados de uma sessão anterior sentados no ficheiro —
  // exactamente o cenário que este ecrã de diagnóstico existe para mostrar.
  const db = await getDb();
  return mapStatus(db.currentStatus);
}

// Extraído de getPowerSyncStatus() para ser partilhado com
// subscribeToStatusChanges() abaixo — a mesma conversão SyncStatus (do SDK,
// não atravessa bem o IPC tal como está — Date/Error não serializam) →
// snapshot simples, usada tanto pela leitura pontual como pelo push
// em tempo real.
function mapStatus(s: PowerSyncDatabaseType['currentStatus']): IPowerSyncStatusSnapshot {
  return {
    connected:     s.connected,
    connecting:    s.connecting,
    lastSyncedAt:  s.lastSyncedAt ? s.lastSyncedAt.toISOString() : null,
    hasSynced:     !!s.hasSynced,
    uploading:     s.uploading,
    downloading:   s.downloading,
    uploadError:   s.uploadError   ? String(s.uploadError.message ?? s.uploadError)   : null,
    downloadError: s.downloadError ? String(s.downloadError.message ?? s.downloadError) : null,
  };
}

// As 15 tabelas dos Sync Streams (sync-config.yaml) — lista fixa, nunca
// interpolar um nome de tabela vindo do renderer directamente numa query
// SQL. Achado (2026-09-05): esta lista só tinha os 7 streams originais do
// Prompt 22.6 — nunca actualizada com os 8 domínios da Fase 4
// (routes/workshops/fuel_stations/maintenance_categories/fines/
// vehicle_documents/maintenance_items/scheduled_trips), o que escondia
// exactamente os dados que este ecrã de diagnóstico mais precisa de
// mostrar ao investigar "sobe para o Neon mas não aparece no Desktop".
const SYNCED_TABLES = [
  'vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'expenses', 'categories',
  'routes', 'workshops', 'fuel_stations', 'maintenance_categories',
  'fines', 'vehicle_documents', 'maintenance_items', 'scheduled_trips',
] as const;

export interface IPowerSyncVehiclePreviewRow {
  id:                string;
  license_plate:     string | null;
  brand:              string | null;
  model:               string | null;
  status:              string | null;
  tracking_enabled:   number | null;
}

export interface IPowerSyncSnapshot {
  counts:          Record<string, number>;
  vehiclesPreview: IPowerSyncVehiclePreviewRow[];
}

export async function getPowerSyncSnapshot(): Promise<IPowerSyncSnapshot> {
  // Mesmo achado de getPowerSyncStatus() acima — os dados já estão no
  // ficheiro local independentemente de connect() ter corrido nesta sessão.
  const db = await getDb();

  const counts: Record<string, number> = {};
  for (const table of SYNCED_TABLES) {
    const row = await db.get<{ n: number }>(`SELECT COUNT(*) as n FROM ${table}`);
    counts[table] = row.n;
  }

  const vehiclesPreview = await db.getAll<IPowerSyncVehiclePreviewRow>(
    'SELECT id, license_plate, brand, model, status, tracking_enabled FROM vehicles ORDER BY license_plate LIMIT 20',
  );

  return { counts, vehiclesPreview };
}

// Achado real (2026-09-0X): os dados chegavam ao ficheiro local (upload/
// download reais, confirmados no ecrã de diagnóstico), mas as páginas
// (VehiclesPageContent, etc.) só voltavam a consultar powersync.db quando
// o próprio utilizador fazia alguma acção (montar a página, premir
// Actualizar) — nada as avisava de que o PowerSync tinha recebido algo
// novo em segundo plano. O SDK já expõe exactamente esse aviso
// (db.onChangeWithCallback) — só não estava a ser usado. Devolve uma
// função de remoção (mesmo padrão de db.registerListener).
export async function subscribeToStatusChanges(cb: (status: IPowerSyncStatusSnapshot) => void): Promise<() => void> {
  const db = await getDb();
  return db.registerListener({
    statusChanged: (s) => cb(mapStatus(s)),
  });
}

// Achado real (2026-09-0X, confirmado por log em produção): event.changedTables
// devolve o nome de armazenamento INTERNO do SDK (ex. "ps_data__vehicles"),
// não o nome do schema/vista (ex. "vehicles") — todos os consumidores
// (usePowerSyncDataChanged.ts) comparavam contra o nome errado e nunca
// disparavam. Normalizado aqui, uma única vez, para que ninguém a jusante
// precise de saber deste pormenor interno do SDK.
const PS_DATA_PREFIX = 'ps_data__';
function stripPsDataPrefix(table: string): string {
  return table.startsWith(PS_DATA_PREFIX) ? table.slice(PS_DATA_PREFIX.length) : table;
}

// Mesma ideia, mas para dados (não para o estado da ligação) — usado para a
// UI voltar a consultar powersync.db sozinha quando uma sync em segundo
// plano altera alguma das tabelas sincronizadas.
export async function subscribeToDataChanges(cb: (changedTables: string[]) => void): Promise<() => void> {
  const db = await getDb();
  return db.onChangeWithCallback(
    { onChange: (event) => cb(event.changedTables.map(stripPsDataPrefix)) },
    { tables: [...SYNCED_TABLES] },
  );
}
