import { app, ipcMain, dialog } from "electron";
import { BackupManager } from "@/system/backup_manager";
import { 
    BACKUP_EXPORT_CHANNEL, 
    BACKUP_RESTORE_CHANNEL, 
    BACKUP_GET_CONFIG_CHANNEL, 
    BACKUP_UPDATE_CONFIG_CHANNEL
 } from "./backup-channels";

export async function addBackupEventListeners() {
    const backup_manager = new BackupManager();
    ipcMain.handle(BACKUP_EXPORT_CHANNEL, async() => {
        return backup_manager.createManualBackup()
    });
    ipcMain.handle(BACKUP_RESTORE_CHANNEL, async() => {
        const { filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'Backup ZIP', extensions: ['zip'] }]
        });
  
        if (filePaths.length === 0) return { success: false };
        const result = await backup_manager.restoreBackup(filePaths[0]);
        // const result = await backup_manager.scheduleRestore(filePaths[0]);
  
            if (result.success && result.requiresRestart) {
                // Reiniciar a aplicação
                app.relaunch();
                app.exit(0);
            } else {
                 return result
            }
    });

    ipcMain.handle(BACKUP_GET_CONFIG_CHANNEL, async() => {
        return await backup_manager.listAutoBackups()
    })
    ipcMain.handle(BACKUP_UPDATE_CONFIG_CHANNEL, async(_, config: any) => {
        return backup_manager.saveConfig(config)
    })

}
