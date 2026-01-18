// src/helpers/ipc/db/routes/route-context.ts
import {
    CREATE_ROUTE,
    GET_ALL_ROUTES,
    GET_ROUTE_BY_ID,
    UPDATE_ROUTE,
    DELETE_ROUTE,
    GET_ACTIVE_ROUTES,
} from "./routes-channels";

import { ICreateRoute, IUpdateRoute } from '@/lib/types/route';

export function exposeRoutesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_routes", {
        create: (data: ICreateRoute) => ipcRenderer.invoke(CREATE_ROUTE, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_ROUTES),
        getById: (id: string) => ipcRenderer.invoke(GET_ROUTE_BY_ID, id),
        update: (id: string, data: IUpdateRoute) => ipcRenderer.invoke(UPDATE_ROUTE, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_ROUTE, id),
        getActive: () => ipcRenderer.invoke(GET_ACTIVE_ROUTES),
    });
}