// ========================================
// FILE: src/helpers/system-settings-helpers.ts
// ========================================
import { ISystemSettings, IUpdateSystemSettings } from '@/lib/types/system-settings';

export async function getSystemSettings(): Promise<ISystemSettings> {
  return window._system_settings.get();
}

export async function updateSystemSettings(
  data: IUpdateSystemSettings
): Promise<ISystemSettings> {
  return window._system_settings.update(data);
}

export async function resetSystemSettings(): Promise<ISystemSettings> {
  return window._system_settings.reset();
}