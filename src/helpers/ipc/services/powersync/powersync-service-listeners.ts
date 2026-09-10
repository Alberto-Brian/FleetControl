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
