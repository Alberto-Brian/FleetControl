import { BrowserWindow, ipcMain } from "electron";
import { VersionManager } from "@/system/version_manager";
import { GET_SYSTEM_VERSION, GET_DB_VERSION } from "./system-channels";

export function addSystemEventListeners() {
    ipcMain.handle(GET_SYSTEM_VERSION, () => {
        return VersionManager.getCurrentVersion();
    });
    ipcMain.handle(GET_DB_VERSION, () => {
        // return VersionManager.getSchemaVersion();
    });
}
