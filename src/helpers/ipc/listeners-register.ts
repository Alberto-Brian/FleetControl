import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addClientsEventListeners } from "./db/clients/clients-listeners";
import { addSystemEventListeners } from "./system/system-listeners";
import { addLicenseEventListeners } from "./license/license-listeners";
import { addBackupEventListeners } from "./backup/backup-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
    addWindowEventListeners(mainWindow);
    addClientsEventListeners();
    addThemeEventListeners();
    addSystemEventListeners();
    addLicenseEventListeners();
    addBackupEventListeners();
}
