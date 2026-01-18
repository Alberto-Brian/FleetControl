// src/helpers/ipc/db/workshops/workshops-context.ts
import {
    CREATE_WORKSHOP,
    GET_ALL_WORKSHOPS,
    GET_WORKSHOP_BY_ID,
    UPDATE_WORKSHOP,
    DELETE_WORKSHOP,
} from "./workshops-channels";

import { ICreateWorkshop, IUpdateWorkshop } from '@/lib/types/workshop';

export function exposeWorkshopsContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_workshops", {
        create: (data: ICreateWorkshop) => ipcRenderer.invoke(CREATE_WORKSHOP, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_WORKSHOPS),
        getById: (id: string) => ipcRenderer.invoke(GET_WORKSHOP_BY_ID, id),
        update: (id: string, data: IUpdateWorkshop) => ipcRenderer.invoke(UPDATE_WORKSHOP, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_WORKSHOP, id),
    });
}