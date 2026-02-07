import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { vehicleTranslations } from "./vehicles_translations";
import { authTranslations } from "./auth_translations";

import { ptVehicles } from "./locales/pt/vehicles";
import { enVehicles } from "./locales/en/vehicles";
import { ptDrivers } from "./locales/pt/drivers";
import { enDrivers } from "./locales/en/drivers";
import { ptTrips } from "./locales/pt/trips";
import { enTrips } from "./locales/en/trips";

i18n.use(initReactI18next).init({
    fallbackLng: "en",
    resources: {
        en: {
            vehicles: enVehicles,
            drivers: enDrivers,
            trips: enTrips,
            // vehicles: vehicleTranslations.en.vehicles,
            auth: authTranslations.en.auth,
            common: {
                confirmDelete: {
                    title: "Are you sure?",
                    default: "This action cannot be undone. This record will be marked as deleted.",
                    defaultWithItem: 'This action cannot be undone. The record "{{itemName}}" will be marked as deleted.'
                },
                actions: {
                    cancel: "Cancel",
                    delete: "Delete",
                    deleting: "Deleting..."
                },
                warnigns: {
                    categoryRequired: "Please select a category",
                    licensePlateRequired: "Please enter a vehicle license plate",
                },
                errors: {
                    errorLoading: "Error loading",
                    errorLoadingCategories: "Error loading categories",
                    notFound:{
                        vehicle: "Vehicle not found",
                        vehicleCategory: "Vehicle category not found"
                    }
                }

            },
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
            // vehicles: vehicleTranslations.pt.vehicles,
            auth: authTranslations.pt.auth,
            common: {
                confirmDelete: {
                    title: "Tem certeza?",
                    default: "Esta acção não pode ser desfeita. Este registo será marcado como excluído.",
                    defaultWithItem: 'Esta acção não pode ser desfeita. O registo "{{itemName}}" será marcado como excluído.'
                },
                actions: {
                    cancel: "Cancelar",
                    delete: "Excluir",
                    deleting: "Excluindo..."
                },
                warnigns: {
                    licensePlateRequired: "Por favor, insira uma placa de veículo",
                    categoryRequired: "Por favor, selecione uma categoria",
                },
                errors: {
                    errorLoading: "Erro ao carregar",
                    errorLoadingCategories: "Erro ao carregar categorias",
                    notFound:{
                        vehicle: "Veículo não encontrado",
                        vehicleCategory: "Categoria de veículo não encontrada"
                    }
                }
            },
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
