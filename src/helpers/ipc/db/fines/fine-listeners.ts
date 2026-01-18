// src/helpers/ipc/db/fines/fine-listeners.ts
import { ipcMain } from "electron";
import {
    CREATE_FINE,
    GET_ALL_FINES,
    GET_FINE_BY_ID,
    UPDATE_FINE,
    MARK_FINE_AS_PAID,
    DELETE_FINE,
    GET_PENDING_FINES,
} from "./fines-channels";

import {
    createFine,
    getAllFines,
    getFineById,
    updateFine,
    markFineAsPaid,
    deleteFine,
    getPendingFines,
} from "@/lib/db/queries/fines.queries";

import { ICreateFine, IUpdateFine, PayFineData } from "@/lib/types/fine";

export function addFinesEventListeners() {
    ipcMain.handle(CREATE_FINE, async (_, data: ICreateFine) => await createFine(data));
    ipcMain.handle(GET_ALL_FINES, async (_) => await getAllFines());
    ipcMain.handle(GET_FINE_BY_ID, async (_, id: string) => await getFineById(id));
    ipcMain.handle(UPDATE_FINE, async (_, id: string, data: IUpdateFine) => await updateFine(id, data));
    ipcMain.handle(MARK_FINE_AS_PAID, async (_, id: string, data: PayFineData) => await markFineAsPaid(id, data));
    ipcMain.handle(DELETE_FINE, async (_, id: string) => await deleteFine(id));
    ipcMain.handle(GET_PENDING_FINES, async (_) => await getPendingFines());
}