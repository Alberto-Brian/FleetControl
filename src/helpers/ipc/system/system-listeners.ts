import { BrowserWindow, ipcMain, Notification } from "electron";
import * as fs from "fs";
import { VersionManager } from "@/system/version_manager";
import { DatabaseManager } from "@/system/db_manager";
import { BackupManager } from "@/system/backup_manager";
import { GET_SYSTEM_VERSION, GET_DB_VERSION, FORCE_DB_ROTATION, GET_SERVER_URL, SET_SERVER_URL, SHOW_NOTIFICATION, LIST_DATABASES, GET_DATABASE_STATS, SET_HISTORICAL_DB, GET_HISTORICAL_DB, DELETE_DATABASE, LIST_BACKUP_DATABASES } from "./system-channels";
import { getApiUrl, setApiUrl } from "@/helpers/server-config";
import { getDb, getDbManager } from "@/lib/db/db_client";
import { AuthService } from "@/lib/services/auth.service";
import { users } from "@/lib/db/schemas";
import { isNull } from "drizzle-orm";
import Database from "better-sqlite3";

export function addSystemEventListeners() {
    const db_manager = new DatabaseManager();
    ipcMain.handle(GET_SYSTEM_VERSION, () => {
        return VersionManager.getCurrentVersion();
    });
    ipcMain.handle(GET_DB_VERSION, () => {
        // return VersionManager.getSchemaVersion();
    });
    ipcMain.on(FORCE_DB_ROTATION, () => db_manager.rotate(true, true));
    ipcMain.handle(GET_SERVER_URL, () => getApiUrl());
    ipcMain.handle(SET_SERVER_URL, (_event, url: string) => { setApiUrl(url); return true; });
    ipcMain.on(SHOW_NOTIFICATION, (_event, title: string, body: string) => {
        if (Notification.isSupported()) {
            new Notification({ title, body, silent: false }).show();
        }
    });

    ipcMain.handle(LIST_DATABASES, () => {
        const TABLES = ['vehicles','drivers','trips','refuelings','maintenances','expenses','fines','users','routes'];
        try {
            return getDbManager().listDatabases().map(db => {
                let recordCount = 0;
                try {
                    const conn = new Database(db.filepath, { readonly: true });
                    for (const table of TABLES) {
                        try {
                            const row = conn.prepare(`SELECT COUNT(*) as n FROM ${table}`).get() as any;
                            recordCount += row?.n ?? 0;
                        } catch { /* table absent in older schema */ }
                    }
                    conn.close();
                } catch { /* DB might be locked or inaccessible */ }
                return { ...db, createdAt: db.createdAt.toISOString(), recordCount };
            });
        } catch {
            return [];
        }
    });

    ipcMain.handle(SET_HISTORICAL_DB, (_event, filepath: string | null) => {
        getDbManager().setHistoricalDatabase(filepath);
        return true;
    });

    ipcMain.handle(GET_HISTORICAL_DB, () => {
        return getDbManager().getHistoricalDbPath();
    });

    ipcMain.handle(DELETE_DATABASE, async (_event, { filepath, password }: { filepath: string; password: string }) => {
        if (!fs.existsSync(filepath)) return { success: false, error: 'not-found' };

        // Cannot delete the currently active DB
        const metaPath = filepath.replace('.db', '.meta.json');
        if (fs.existsSync(metaPath)) {
            try {
                const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                if (meta.isActive) return { success: false, error: 'active-db' };
            } catch {}
        }

        // Cannot delete the database currently open as historical
        if (getDbManager().getHistoricalDbPath() === filepath) {
            return { success: false, error: 'active-db' };
        }

        // Verify password against any non-deleted user in the active DB
        try {
            const db = getDb();
            const allUsers = await db.select().from(users).where(isNull(users.deleted_at));
            let authenticated = false;
            for (const user of allUsers) {
                if (await AuthService.verifyPassword(password, user.password_hash)) {
                    authenticated = true;
                    break;
                }
            }
            if (!authenticated) return { success: false, error: 'invalid-password' };
        } catch {
            return { success: false, error: 'db-error' };
        }

        try {
            fs.unlinkSync(filepath);
            if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle(LIST_BACKUP_DATABASES, () => {
        try {
            const backup_manager = new BackupManager();
            return backup_manager.listBackupDatabases().map(b => ({
                ...b,
                backupDate: b.backupDate.toISOString(),
            }));
        } catch {
            return [];
        }
    });

    ipcMain.handle(GET_DATABASE_STATS, (_event, filepath: string) => {
        const TABLES = [
            'vehicles', 'drivers', 'trips', 'refuelings',
            'maintenances', 'expenses', 'fines', 'users', 'routes',
        ];
        try {
            const db = new Database(filepath, { readonly: true });
            const stats: Record<string, number> = {};
            for (const table of TABLES) {
                try {
                    const row = db.prepare(`SELECT COUNT(*) as n FROM ${table}`).get() as any;
                    stats[table] = row?.n ?? 0;
                } catch { /* table absent in older DBs */ }
            }
            db.close();
            return stats;
        } catch (e: any) {
            return { error: String(e.message) };
        }
    });
}
