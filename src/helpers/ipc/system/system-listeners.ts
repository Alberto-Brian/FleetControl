import { BrowserWindow, ipcMain } from "electron";
import { VersionManager } from "@/system/version_manager";
import { DatabaseManager } from "@/system/db_manager";
import { GET_SYSTEM_VERSION, GET_DB_VERSION, FORCE_DB_ROTATION } from "./system-channels";

export function addSystemEventListeners() {
    const db_manager = new DatabaseManager();
    ipcMain.handle(GET_SYSTEM_VERSION, () => {
        return VersionManager.getCurrentVersion();
    });
    ipcMain.handle(GET_DB_VERSION, () => {
        // return VersionManager.getSchemaVersion();
    });
    ipcMain.on(FORCE_DB_ROTATION, () => db_manager.rotate(true, true))
}
