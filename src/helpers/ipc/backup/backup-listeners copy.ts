import { app, ipcMain, dialog } from "electron";
import { BackupManager } from "@/system/backup_manager";
import { 
    BACKUP_EXPORT_CHANNEL, 
    BACKUP_PROGRESS_CHANNEL,
    BACKUP_RESTORE_CHANNEL, 
    BACKUP_RESTORE_PROGRESS_CHANNEL,
    BACKUP_GET_CONFIG_CHANNEL, 
    BACKUP_UPDATE_CONFIG_CHANNEL
 } from "./backup-channels";

export async function addBackupEventListeners() {
    const backup_manager = new BackupManager();
    ipcMain.handle(BACKUP_EXPORT_CHANNEL, async(event, outputPath?: string) => {
         // Configurar callback de progresso
        // backup_manager.setProgressCallback((progress) => {
        //     // Enviar progresso para o frontend
        //     event.sender.send(BACKUP_PROGRESS_CHANNEL, progress);
        // });
        return backup_manager.createManualBackup(outputPath)
    });

   ipcMain.handle(BACKUP_RESTORE_CHANNEL, async(event) => { 
    // backup_manager.setProgressCallback((progress) => {
    //     event.sender.send(BACKUP_RESTORE_PROGRESS_CHANNEL, progress);
    // });

    // Abrir diálogo de seleção
    const { filePaths } = await dialog.showOpenDialog({
        title: 'Selecionar Backup',  // ← ADICIONAR
        filters: [{ name: 'Backup ZIP', extensions: ['zip'] }]
    });

    if (filePaths.length === 0) {
        return { success: false, error: 'Cancelado pelo usuario' };  // ← CORRIGIR
    }

    const result = await backup_manager.restoreBackup(filePaths[0]);
    return result;
});

    ipcMain.handle(BACKUP_GET_CONFIG_CHANNEL, async() => {
        return await backup_manager.listAutoBackups()
    })
    ipcMain.handle(BACKUP_UPDATE_CONFIG_CHANNEL, async(_, config: any) => {
        return backup_manager.saveConfig(config)
    })

}
