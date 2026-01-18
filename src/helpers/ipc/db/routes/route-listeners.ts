// src/helpers/ipc/db/routes/routes-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_ROUTE,
    GET_ALL_ROUTES,
    GET_ROUTE_BY_ID,
    UPDATE_ROUTE,
    DELETE_ROUTE,
    GET_ACTIVE_ROUTES,
} from "./routes-channels";

import {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    deleteRoute,
    getActiveRoutes,
} from "@/lib/db/queries/routes.queries";

import { ICreateRoute, IUpdateRoute } from "@/lib/types/route";

export function addRoutesEventListeners() {
    ipcMain.handle(CREATE_ROUTE, async (_, data: ICreateRoute) => await createRoute(data));
    ipcMain.handle(GET_ALL_ROUTES, async (_) => await getAllRoutes());
    ipcMain.handle(GET_ROUTE_BY_ID, async (_, id: string) => await getRouteById(id));
    ipcMain.handle(UPDATE_ROUTE, async (_, id: string, data: IUpdateRoute) => await updateRoute(id, data));
    ipcMain.handle(DELETE_ROUTE, async (_, id: string) => await deleteRoute(id));
    ipcMain.handle(GET_ACTIVE_ROUTES, async (_) => await getActiveRoutes());
}