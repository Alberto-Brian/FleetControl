import { ipcMain } from "electron";
import {
  GET_DASHBOARD_STATS,
  GET_RECENT_ACTIVITIES,
  GET_CHART_DATA,
} from "./dashboard-channels";

// Reescrito depois dos 7 dominios prioritarios (Prompts 6.1-6.8) estarem
// todos em powersync.db — dashboard.queries.ts fica so como backup.
import {
  getDashboardStats,
  getRecentActivities,
  getChartData,
} from "@/lib/db/queries/dashboard.queries.powersync";

export function addDashboardEventListeners() {
  ipcMain.handle(GET_DASHBOARD_STATS, async () => await getDashboardStats());
  ipcMain.handle(GET_RECENT_ACTIVITIES, async (_, limit: number) => await getRecentActivities(limit));
  ipcMain.handle(GET_CHART_DATA, async () => await getChartData());
}