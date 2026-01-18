// src/helpers/ipc/db/workshops/workshops-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_WORKSHOP,
    GET_ALL_WORKSHOPS,
    GET_WORKSHOP_BY_ID,
    UPDATE_WORKSHOP,
    DELETE_WORKSHOP,
} from "./workshops-channels";

import {
    createWorkshop,
    getAllWorkshops,
    getWorkshopById,
    updateWorkshop,
    deleteWorkshop,
} from "@/lib/db/queries/workshops.queries";

import { ICreateWorkshop, IUpdateWorkshop } from "@/lib/types/workshop";

export function addWorkshopsEventListeners() {
    ipcMain.handle(CREATE_WORKSHOP, async (_, data: ICreateWorkshop) => await createWorkshop(data));
    ipcMain.handle(GET_ALL_WORKSHOPS, async (_) => await getAllWorkshops());
    ipcMain.handle(GET_WORKSHOP_BY_ID, async (_, id: string) => await getWorkshopById(id));
    ipcMain.handle(UPDATE_WORKSHOP, async (_, id: string, data: IUpdateWorkshop) => await updateWorkshop(id, data));
    ipcMain.handle(DELETE_WORKSHOP, async (_, id: string) => await deleteWorkshop(id));
}