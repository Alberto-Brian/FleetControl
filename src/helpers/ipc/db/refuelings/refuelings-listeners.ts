// ========================================
// FILE: src/helpers/ipc/db/refuelings/refuelings-listeners.ts
// ========================================
import { ipcMain } from "electron";
import {
    GET_ALL_REFUELINGS,
    CREATE_REFUELING,
    GET_REFUELINGS_BY_VEHICLES,
} from "./refuelings-channels";

import {
    getAllRefuelings,
    createRefueling,
    getRefuelingsByVehicle,
} from '@/lib/db/queries/refuelings.queries';

import { ICreateRefueling } from '@/lib/types/refueling';

export function addRefuelingsEventListeners() {
    ipcMain.handle(GET_ALL_REFUELINGS, async (_) => await getAllRefuelings());
    ipcMain.handle(CREATE_REFUELING, async (_, data: ICreateRefueling) => await createRefueling(data));
    ipcMain.handle(GET_REFUELINGS_BY_VEHICLES, async (_, id) => await getRefuelingsByVehicle(id));
}