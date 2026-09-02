//src/helpers/ipc/services/powersync/powersync-service-listeners.ts
// Fase 12, Prompt 22.8
import { ipcMain } from 'electron';
import { POWERSYNC_CONNECT, POWERSYNC_DISCONNECT_AND_CLEAR } from './powersync-service-channels';
import { connectPowerSync, disconnectAndClearPowerSync } from '@/lib/powersync/client';

export function addServicePowerSyncEventListeners() {
  ipcMain.handle(POWERSYNC_CONNECT, async () => {
    await connectPowerSync();
  });

  ipcMain.handle(POWERSYNC_DISCONNECT_AND_CLEAR, async () => {
    await disconnectAndClearPowerSync();
  });
}
