// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/ipc/license/license-listeners.ts
// ========================================
import { ipcMain, app } from 'electron';
import * as fs   from 'fs';
import * as path from 'path';
import { LicenseManager } from '@/system/license_manager';
import {
  LICENSE_CHECK_CHANNEL,
  LICENSE_GET_RAW_CHANNEL,
  LICENSE_REMOVE_CHANNEL,
  LICENSE_VALIDATE_CHANNEL,
} from './license-channels';

export async function addLicenseEventListeners() {
  const manager = new LicenseManager();

  ipcMain.handle(LICENSE_VALIDATE_CHANNEL, async (_event, key: string) => {
    return manager.validateLicense(key);
  });

  ipcMain.handle(LICENSE_CHECK_CHANNEL, async () => {
    return manager.checkExistingLicense();
  });

  ipcMain.handle(LICENSE_GET_RAW_CHANNEL, () => {
    const file = path.join(app.getPath('userData'), 'license.dat');
    if (!fs.existsSync(file)) return null;
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')).key ?? null;
    } catch { return null; }
  });

  ipcMain.handle(LICENSE_REMOVE_CHANNEL, () => {
    manager.removeLicense();
  });
}