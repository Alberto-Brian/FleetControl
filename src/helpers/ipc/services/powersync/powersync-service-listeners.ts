//src/helpers/ipc/services/powersync/powersync-service-listeners.ts
// Fase 12, Prompt 22.8
import { ipcMain, BrowserWindow } from 'electron';
import {
  POWERSYNC_CONNECT,
  POWERSYNC_DISCONNECT_AND_CLEAR,
  POWERSYNC_GET_STATUS,
  POWERSYNC_GET_SNAPSHOT,
  POWERSYNC_STATUS_PUSH,
  POWERSYNC_DATA_CHANGED_PUSH,
} from './powersync-service-channels';
import {
  connectPowerSync,
  disconnectAndClearPowerSync,
  getPowerSyncStatus,
  getPowerSyncSnapshot,
  subscribeToStatusChanges,
  subscribeToDataChanges,
  SYNCED_TABLES,
} from '@/lib/powersync/client';

function broadcast(channel: string, payload: unknown) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload);
  }
}

// Registadas uma só vez por processo (não por janela/login) — connect()
// pode ser chamado várias vezes na vida da app (login → logout → login de
// novo), mas as subscrições ao SDK continuam válidas enquanto _db existir;
// registar de novo a cada connect() só duplicaria os pushes.
let _pushSubscriptionsReady = false;
async function ensurePushSubscriptions() {
  if (_pushSubscriptionsReady) return;
  _pushSubscriptionsReady = true;
  await subscribeToStatusChanges((status) => broadcast(POWERSYNC_STATUS_PUSH, status));
  await subscribeToDataChanges((tables) => broadcast(POWERSYNC_DATA_CHANGED_PUSH, tables));
}

export function addServicePowerSyncEventListeners() {
  ipcMain.handle(POWERSYNC_CONNECT, async () => {
    await connectPowerSync();
    await ensurePushSubscriptions();

    // Achado real (2026-09-11): "às vezes ao entrar os dados não aparecem,
    // só saindo e voltando a entrar" — usePowerSyncDataChanged.ts só começa
    // a ouvir (ipcRenderer.on) quando o componente da página MONTA
    // (powersync-service-context.ts:onDataChanged). Electron não guarda
    // mensagens para um listener que ainda não existia — qualquer
    // POWERSYNC_DATA_CHANGED_PUSH disparado por subscribeToDataChanges()
    // entre este connect() e a página ainda a montar (ex. dados já
    // sincronizados de uma sessão anterior a ficarem "visíveis" para o SDK
    // quase de imediato, mais rápido que o React montar a página) perde-se
    // para sempre — a página fica com o resultado vazio da sua consulta
    // inicial e nunca mais é avisada. Um novo login força um novo mount, que
    // volta a consultar do zero e já encontra os dados — daí "resolver-se"
    // ao sair e entrar. Corrigido com um broadcast forçado, incondicional,
    // logo a seguir ao connect() — fecha a janela de corrida
    // independentemente do timing exacto, sem depender de nenhuma página já
    // estar a ouvir a tempo.
    broadcast(POWERSYNC_DATA_CHANGED_PUSH, [...SYNCED_TABLES]);
  });

  ipcMain.handle(POWERSYNC_DISCONNECT_AND_CLEAR, async () => {
    await disconnectAndClearPowerSync();
  });

  // Prompt 22.10 — ecrã de diagnóstico "Estado do PowerSync"
  ipcMain.handle(POWERSYNC_GET_STATUS, async () => {
    return await getPowerSyncStatus();
  });

  ipcMain.handle(POWERSYNC_GET_SNAPSHOT, async () => {
    return await getPowerSyncSnapshot();
  });
}
