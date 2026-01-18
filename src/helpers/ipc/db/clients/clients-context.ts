import { ICreateClient } from "@/lib/db/queries/clients.queries";
import { CREATE_CLIENT, DELETE_CLIENT, GET_ALL_CLIENTS } from "./clients-channels";

export function exposeClientsContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_clients", {
        createClient: (clientData: ICreateClient) => ipcRenderer.invoke(CREATE_CLIENT, clientData),
        getAllClients: () => ipcRenderer.invoke(GET_ALL_CLIENTS),
        deleteClient: (clientId: string) => ipcRenderer.invoke(DELETE_CLIENT, clientId),
    })
}