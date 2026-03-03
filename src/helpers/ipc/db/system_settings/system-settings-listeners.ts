// ========================================
// FILE: src/helpers/ipc/db/system_settings/system-settings-listeners.ts
// ========================================
import { ipcMain } from 'electron';
import {
  SYSTEM_SETTINGS_GET,
  SYSTEM_SETTINGS_UPDATE,
  SYSTEM_SETTINGS_RESET,
} from './system-settings-channels';
import {
  getSystemSettings,
  updateSystemSettings,
  resetSystemSettings,
} from '@/lib/db/queries/system_settings.queries';
import { IUpdateSystemSettings } from '@/lib/types/system-settings';

export function addSystemSettingsEventListeners() {
  ipcMain.handle(SYSTEM_SETTINGS_GET, async () => {
    return getSystemSettings();
  });

  ipcMain.handle(SYSTEM_SETTINGS_UPDATE, async (_, data: IUpdateSystemSettings) => {
    // Validações básicas
    if (data.pdf_primary_color && !/^#[0-9a-fA-F]{6}$/.test(data.pdf_primary_color)) {
      throw new Error('Cor primária inválida. Use formato hex (#rrggbb).');
    }
    if (data.pdf_secondary_color && !/^#[0-9a-fA-F]{6}$/.test(data.pdf_secondary_color)) {
      throw new Error('Cor secundária inválida. Use formato hex (#rrggbb).');
    }
    if (data.pdf_watermark_opacity !== undefined) {
      const opacity = parseFloat(data.pdf_watermark_opacity);
      if (isNaN(opacity) || opacity < 0 || opacity > 1) {
        throw new Error('Opacidade da marca de água deve ser entre 0 e 1.');
      }
    }
    return updateSystemSettings(data);
  });

  ipcMain.handle(SYSTEM_SETTINGS_RESET, async () => {
    return resetSystemSettings();
  });
}