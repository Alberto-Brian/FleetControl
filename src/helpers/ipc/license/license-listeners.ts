import { BrowserWindow, ipcMain } from "electron";
import { LicenseManager } from "@/system/license_manager";
import { 
    LICENSE_CHECK_CHANNEL, 
    LICENSE_GET_MACHINE_ID_CHANNEL, 
    LICENSE_REMOVE_CHANNEL, 
    LICENSE_VALIDATE_CHANNEL
 } from "./license-channels";

export async function addLicenseEventListeners() {
    const licenceManager = new LicenseManager();
    ipcMain.handle(LICENSE_GET_MACHINE_ID_CHANNEL, async() => {
        return licenceManager.generateMachineId();
    });
    ipcMain.handle(LICENSE_VALIDATE_CHANNEL, async(_, licence: string) => {
        return await licenceManager.validateLicense(licence);
    });
    ipcMain.handle(LICENSE_CHECK_CHANNEL, async() => {
        return await licenceManager.checkExistingLicense()
    })
    ipcMain.handle(LICENSE_REMOVE_CHANNEL, async() => {
        return licenceManager.removeLicense()
    })

}
