// src/helpers/ipc/listeners-register.ts
import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addSystemEventListeners } from "./system/system-listeners";
import { addLicenseEventListeners } from "./license/license-listeners";
import { addBackupEventListeners } from "./backup/backup-listeners";
import { addServiceAuthEventListeners } from "./services/auth/auth-service-listeners";
import { addClientsEventListeners } from "./db/clients/clients-listeners";
import { addVehiclesEventListeners } from "./db/vehicles/vehicles-listeners";
import { addVehicleCategoriesEventListeners } from "./db/vehicle_categories/vehicle-categories-listeners";
import { addDriversEventListeners } from "./db/drivers/drivers-listeners";
import { addTripsEventListeners } from "./db/trips/trip-listeners";
import { addRefuelingsEventListeners } from "./db/refuelings/refuelings-listeners";
import { addMaintenancesEventListeners } from "./db/maintenances/maintenance-listeners";
import { addMaintenanceCategoriesEventListeners } from "./db/maintenance_categories/maintenance-categories-listeners";
import { addWorkshopsEventListeners } from "./db/workshops/workshops-listeners";
import { addRoutesEventListeners } from "./db/routes/route-listeners";
import { addFinesEventListeners } from "./db/fines/fine-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
    addWindowEventListeners(mainWindow);
    addThemeEventListeners();
    addSystemEventListeners();
    addLicenseEventListeners();
    addBackupEventListeners();
    addServiceAuthEventListeners();
    addClientsEventListeners();
    addVehiclesEventListeners();
    addVehicleCategoriesEventListeners();
    addDriversEventListeners();
    addTripsEventListeners();
    addRefuelingsEventListeners();
    addMaintenancesEventListeners();
    addMaintenanceCategoriesEventListeners();
    addWorkshopsEventListeners();
    addRoutesEventListeners();
    addFinesEventListeners();
}
