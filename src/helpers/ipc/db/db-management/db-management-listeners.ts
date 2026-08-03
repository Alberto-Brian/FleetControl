import { ipcMain, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { getDbManager } from '@/lib/db/db_client';
import {
    DB_MGMT_GET_CONFIG_CHANNEL,
    DB_MGMT_SAVE_CONFIG_CHANNEL,
    DB_MGMT_FORCE_ROTATE_CHANNEL,
    DB_MGMT_GET_STATUS_CHANNEL,
    DB_MGMT_APPLY_RETENTION_CHANNEL,
} from './db-management-channels';

const CONFIG_FILENAME = 'db_management.json';

function getConfigPath(): string {
    try {
        if (app && typeof app.getPath === 'function') {
            return path.join(app.getPath('userData'), CONFIG_FILENAME);
        }
    } catch {}
    return path.join(process.cwd(), CONFIG_FILENAME);
}

function loadConfig(): any {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        try { return JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch {}
    }
    return {
        mode: 'rotation',
        rotation: { maxSizeInMB: 256, maxAgeInDays: 365, transitionPeriodDays: 60 },
        retention: {
            tables: {
                trips:             { enabled: true,  retentionDays: 60, timestampColumn: 'created_at' },
                maintenances:      { enabled: true,  retentionDays: 30, timestampColumn: 'created_at' },
                maintenance_items: { enabled: true,  retentionDays: 30, timestampColumn: 'created_at' },
                expenses:          { enabled: true,  retentionDays: 60, timestampColumn: 'created_at' },
                refuelings:        { enabled: true,  retentionDays: 30, timestampColumn: 'created_at' },
                fines:             { enabled: false, retentionDays: 90, timestampColumn: 'created_at' },
            },
        },
    };
}

export function addDbManagementEventListeners() {
    ipcMain.handle(DB_MGMT_GET_CONFIG_CHANNEL, async () => {
        return loadConfig();
    });

    ipcMain.handle(DB_MGMT_SAVE_CONFIG_CHANNEL, async (_event, config: any) => {
        try {
            const configPath = getConfigPath();
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle(DB_MGMT_GET_STATUS_CHANNEL, async () => {
        try {
            const dbManager = getDbManager();
            const dbs = dbManager.listDatabases();
            const activeDb = dbs.find(d => d.isActive) ?? null;
            const config = loadConfig();
            const sizeInMB = activeDb ? activeDb.size / (1024 * 1024) : 0;
            const maxSizeInMB = config.rotation?.maxSizeInMB ?? 256;
            const needsRotation = config.mode === 'rotation' && activeDb
                ? dbManager.shouldRotate()
                : false;
            return {
                sizeInMB,
                maxSizeInMB,
                needsRotation,
                mode: config.mode,
                activeDb: activeDb ? { filename: activeDb.filename, size: activeDb.size } : null,
            };
        } catch (err: any) {
            return { error: err.message, sizeInMB: 0, maxSizeInMB: 256, needsRotation: false, mode: 'rotation', activeDb: null };
        }
    });

    ipcMain.handle(DB_MGMT_FORCE_ROTATE_CHANNEL, async () => {
        try {
            const dbManager = getDbManager();
            const result = await dbManager.rotate(true, true);
            return { success: true, result };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle(DB_MGMT_APPLY_RETENTION_CHANNEL, async (_event, tables: { tableName: string; retentionDays: number; timestampColumn: string }[]) => {
        try {
            const dbManager = getDbManager();
            const result = await dbManager.applyRetention(tables);
            return { success: true, result };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    });
}
