// src/helpers/backup-helpers.ts
export async function exportBackup() {
  return window.backup.export();
}

export async function restoreBackup() {
  return window.backup.restore();
}

export async function getBackupConfig() {
  return window.backup.getConfig();
}

export async function updateBackupConfig(config: any) {
  return window.backup.updateConfig();
}