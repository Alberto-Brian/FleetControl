import { ipcMain, dialog } from "electron";
import { BackupManager } from "@/system/backup_manager";
import { getDbManager, reinitializeDatabase } from "@/lib/db/db_client";
import { AuthService } from "@/lib/services/auth.service";
import {
    BACKUP_EXPORT_CHANNEL,
    BACKUP_PROGRESS_CHANNEL,
    BACKUP_RESTORE_CHANNEL,
    BACKUP_RESTORE_PROGRESS_CHANNEL,
    BACKUP_GET_CONFIG_CHANNEL,
    BACKUP_UPDATE_CONFIG_CHANNEL,
    BACKUP_LIST_CHANNEL,
    BACKUP_RESTORE_FROM_DIR_CHANNEL
 } from "./backup-channels";

export async function addBackupEventListeners() {
    const backup_manager = new BackupManager();

    ipcMain.handle(BACKUP_EXPORT_CHANNEL, async (event) => {
        backup_manager.setProgressCallback((progress) => {
            event.sender.send(BACKUP_PROGRESS_CHANNEL, progress);
        });
        return backup_manager.createManualBackup();
    });

    ipcMain.handle(BACKUP_RESTORE_CHANNEL, async (event) => {
        backup_manager.setProgressCallback((progress) => {
            event.sender.send(BACKUP_RESTORE_PROGRESS_CHANNEL, progress);
        });

        // 1. Seleccionar ficheiro
        const { filePaths } = await dialog.showOpenDialog({
            filters: [{ name: 'Backup ZIP', extensions: ['zip'] }]
        });
        if (filePaths.length === 0) return { success: false, error: 'Cancelado pelo usuário' };
        const backupPath = filePaths[0];

        // 2. Validar
        const validation = await backup_manager.validateBackup(backupPath);
        if (!validation.isValid) {
            return { success: false, error: 'Backup inválido: ' + validation.errors.join(', ') };
        }

        try {
            // 3. Backup de segurança
            backup_manager.emitProgress('safety-backup', 5, 100, 'A criar backup de segurança...');
            await backup_manager.createAutoBackup();

            // 4. Fechar DB
            backup_manager.emitProgress('closing', 30, 100, 'A fechar base de dados...');
            getDbManager().close();

            // 5. Restaurar ficheiros
            backup_manager.emitProgress('extract', 45, 100, 'A restaurar ficheiros...');
            await backup_manager.performFileRestore(backupPath);

            // 6. Reinicializar DB
            backup_manager.emitProgress('reinit', 80, 100, 'A inicializar base de dados...');
            reinitializeDatabase();

            // 7. Limpar sessões
            backup_manager.emitProgress('cleanup', 92, 100, 'A limpar sessões...');
            await AuthService.logoutAllUsers();

            backup_manager.emitProgress('complete', 100, 100, 'Restauro concluído com sucesso');
            return { success: true, requiresRestart: false };
        } catch (err: any) {
            backup_manager.emitProgress('error', 0, 100, err.message);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle(BACKUP_RESTORE_FROM_DIR_CHANNEL, async (event, folderPath: string) => {
        backup_manager.setProgressCallback((progress) => {
            event.sender.send(BACKUP_RESTORE_PROGRESS_CHANNEL, progress);
        });

        try {
            // 1. Backup de segurança dos dados actuais
            backup_manager.emitProgress('safety-backup', 5, 100, 'A criar backup de segurança...');
            await backup_manager.createAutoBackup();

            // 2. Fechar DB
            backup_manager.emitProgress('closing', 30, 100, 'A fechar base de dados...');
            getDbManager().close();

            // 3. Copiar ficheiros da pasta de backup
            backup_manager.emitProgress('extract', 45, 100, 'A restaurar ficheiros...');
            await backup_manager.performDirectoryRestore(folderPath);

            // 4. Reinicializar DB
            backup_manager.emitProgress('reinit', 80, 100, 'A inicializar base de dados...');
            reinitializeDatabase();

            // 5. Limpar sessões
            backup_manager.emitProgress('cleanup', 92, 100, 'A limpar sessões...');
            await AuthService.logoutAllUsers();

            backup_manager.emitProgress('complete', 100, 100, 'Restauro concluído com sucesso');
            return { success: true, requiresRestart: false };
        } catch (err: any) {
            backup_manager.emitProgress('error', 0, 100, err.message);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle(BACKUP_GET_CONFIG_CHANNEL, async () => {
        return backup_manager.loadConfig();
    });
    ipcMain.handle(BACKUP_UPDATE_CONFIG_CHANNEL, async (_, config: any) => {
        return backup_manager.saveConfig(config);
    });
    ipcMain.handle(BACKUP_LIST_CHANNEL, async () => {
        return backup_manager.listAutoBackups();
    });
}
