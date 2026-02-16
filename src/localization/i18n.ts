import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { vehicleTranslations } from "./vehicles_translations";
import { authTranslations } from "./auth_translations";

import { ptCommon } from "./locales/pt/common";
import { enCommon } from "./locales/en/common";
import { ptVehicles } from "./locales/pt/vehicles";
import { enVehicles } from "./locales/en/vehicles";
import { ptDrivers } from "./locales/pt/drivers";
import { enDrivers } from "./locales/en/drivers";
import { ptTrips } from "./locales/pt/trips";
import { enTrips } from "./locales/en/trips";
import { ptMaintenances } from "./locales/pt/maintenances";
import { enMaintenances } from "./locales/en/maintenances";
import { ptRefuelings } from "./locales/pt/refuelings";
import { enRefuelings } from "./locales/en/refuelings";
import { ptExpenses } from "./locales/pt/expenses";
import { enExpenses } from "./locales/en/expenses";
import { ptFines } from "./locales/pt/fines";
import { enFines } from "./locales/en/fines";
import { ptDashboard } from './locales/pt/dashboard';
import { enDashboard } from './locales/en/dashboard';
import { ptNavigation } from "./locales/pt/navigation";
import { enNavigation } from "./locales/en/navigation";
import { ptReport } from "./locales/pt/reports";
import { enReport } from "./locales/en/reports";

i18n.use(initReactI18next).init({
    fallbackLng: "en",
    resources: {
        en: {
            vehicles: enVehicles,
            drivers: enDrivers,
            trips: enTrips,
            maintenances: enMaintenances,
            refuelings: enRefuelings,
            expenses: enExpenses,
            fines: enFines,
            dashboard: enDashboard,
            navigation: enNavigation,
            reports: enReport,
            // vehicles: vehicleTranslations.en.vehicles,
            auth: authTranslations.en.auth,
            common: enCommon,
            homePage: {
                registerNewClientButton: "Register new client",
                idTableColumn: "ID",
                nameTableColumn: "Name",
                emailTableColumn: "Email",
                actionTableColumn: "Action",
                registeredClients: "Registered clients: {{count}}",
            },
            registerClientDialog: {
                registerClient: "Register client",
                nameField: "Name",
                emailField: "Email",
                nameFieldDescription: "Client's name",
                emailFieldDescription: "Client's email",
                cancelButton: "Cancel",
                submitButton: "Register",
                submitButtonLoading: "Registering...",
            },
            toast: {
                clientDeletedTitle: "Client deleted",
                clientRegisteredTitle: "Client registered",
                clientDeletedDescription: "The client was successfully removed.",
                clientRegisteredDescription: "The client {{name}} was successfully registered."
            }
        },
        "pt-BR": {
            vehicles: ptVehicles,
            drivers: ptDrivers,
            trips: ptTrips,
            maintenances: ptMaintenances,
            refuelings: ptRefuelings,
            expenses: ptExpenses,
            fines: ptFines,
            dashboard: ptDashboard,
            navigation: ptNavigation,
            reports: ptReport,
            // vehicles: vehicleTranslations.pt.vehicles,
            auth: authTranslations.pt.auth,
            common: ptCommon,
            homePage: {
                registerNewClientButton: "Cadastrar novo cliente",
                idTableColumn: "ID",
                nameTableColumn: "Nome",
                emailTableColumn: "Email",
                actionTableColumn: "Ação",
                registeredClients: "Clientes cadastrados: {{count}}",
            },
            registerClientDialog: {
                registerClient: "Cadastrar cliente",
                nameField: "Nome",
                emailField: "Email",
                nameFieldDescription: "Nome do cliente",
                emailFieldDescription: "Email do cliente",
                cancelButton: "Cancelar",
                submitButton: "Cadastrar",
                submitButtonLoading: "Cadastrando...",
            },
            toast: {
                clientDeletedTitle: "Cliente deletado",
                clientRegisteredTitle: "Cliente cadastrado",
                clientDeletedDescription: "O cliente foi removido com sucesso.",
                clientRegisteredDescription: "O cliente {{name}} foi cadastrado com sucesso."
            }
        },
    },
});
