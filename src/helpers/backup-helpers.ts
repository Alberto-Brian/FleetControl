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

export function onBackupProgress(callback: (progress: any) => void) {
  window.backup.onProgress(callback);
}

export function onRestoreProgress(callback: (progress: any) => void) {
  window.backup.onRestoreProgress(callback);
}

// Também adicione funções para remover listeners (cleanup)
export function removeBackupProgressListener() {
  window.backup.removeProgressListener();
}

export function removeRestoreProgressListener() {
  window.backup.removeRestoreProgressListener();
}