// src/helpers/ipc/db/fines/fine-context.ts
import {
    CREATE_FINE,
    GET_ALL_FINES,
    GET_FINE_BY_ID,
    UPDATE_FINE,
    MARK_FINE_AS_PAID,
    DELETE_FINE,
    GET_PENDING_FINES,
} from "./fines-channels";

import { ICreateFine, IUpdateFine, PayFineData } from '@/lib/types/fine';

export function exposeFinesContext() {
    const { contextBridge, ipcRenderer } = window.require("electron");
    contextBridge.exposeInMainWorld("_fines", {
        create: (data: ICreateFine) => ipcRenderer.invoke(CREATE_FINE, data),
        getAll: () => ipcRenderer.invoke(GET_ALL_FINES),
        getById: (id: string) => ipcRenderer.invoke(GET_FINE_BY_ID, id),
        update: (id: string, data: IUpdateFine) => ipcRenderer.invoke(UPDATE_FINE, id, data),
        markAsPaid: (id: string, data: PayFineData) => ipcRenderer.invoke(MARK_FINE_AS_PAID, id, data),
        delete: (id: string) => ipcRenderer.invoke(DELETE_FINE, id),
        getPending: () => ipcRenderer.invoke(GET_PENDING_FINES),
    });
}