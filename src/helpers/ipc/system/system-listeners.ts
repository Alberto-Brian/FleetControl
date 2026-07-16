import { BrowserWindow, ipcMain, Notification } from "electron";
import { VersionManager } from "@/system/version_manager";
import { DatabaseManager } from "@/system/db_manager";
import { GET_SYSTEM_VERSION, GET_DB_VERSION, FORCE_DB_ROTATION, GET_SERVER_URL, SET_SERVER_URL, SHOW_NOTIFICATION, LIST_DATABASES, GET_DATABASE_STATS } from "./system-channels";
import { getApiUrl, setApiUrl } from "@/helpers/server-config";
import { getDbManager } from "@/lib/db/db_client";
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
        try {
            return getDbManager().listDatabases().map(db => ({
                ...db,
                createdAt: db.createdAt.toISOString(),
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
