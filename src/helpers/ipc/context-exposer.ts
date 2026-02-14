// src/helpers/ipc/context-exposer.ts
import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeSystemContext } from "./system/system-context";
import { exposeLicenseContext } from "./license/license-context";
import { exposeBackupContext } from "./backup/backup-context";
import { exposeServiceAuthContext } from "./services/auth/auth-service-context";
import { exposeClientsContext } from "./db/clients/clients-context";
import { exposeVehiclesContext } from "./db/vehicles/vehicles-context";
import { exposeVehicleCategoriesContext } from "./db/vehicle_categories/vehicle-categories-context";
import { exposeDriversContext } from "./db/drivers/drivers-context";
import { exposeTripsContext } from "./db/trips/trip-context";
import { exposeRefuelingsContext } from "./db/refuelings/refuelings-context";
import { exposeMaintenancesContext } from "./db/maintenances/maintenance-context";
import { exposeMaintenanceCategoriesContext } from "./db/maintenance_categories/maintenance-categories-context";
import { exposeWorkshopsContext } from "./db/workshops/workshops-context";
import { exposeRoutesContext } from "./db/routes/route-context";
import { exposeFinesContext } from "./db/fines/fine-context";
import { exposeFuelStationsContext } from "./db/fuel_stations/fuel-stations-context";
import { exposeExpensesContext } from "./db/expenses/expense-context";
import { exposeExpenseCategoriesContext } from "./db/expense_categories/expense_categories-context";
import { exposeDashboardContext } from "./db/dashboard/dashboard-context";

export default function exposeContexts() {
    exposeWindowContext();
    exposeSystemContext();
    exposeThemeContext();
    exposeLicenseContext();
    exposeBackupContext();
    exposeServiceAuthContext();
    exposeClientsContext();
    exposeVehiclesContext();
    exposeVehicleCategoriesContext();
    exposeDriversContext();
    exposeTripsContext();
    exposeRefuelingsContext();
    exposeMaintenancesContext();
    exposeMaintenanceCategoriesContext();
    exposeWorkshopsContext();
    exposeRoutesContext();
    exposeFinesContext();
    exposeFuelStationsContext();
    exposeExpensesContext();
    exposeExpenseCategoriesContext();
    exposeDashboardContext();
}
