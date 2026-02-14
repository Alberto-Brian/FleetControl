import { ipcMain } from "electron";
import {
  GET_DASHBOARD_STATS,
  GET_RECENT_ACTIVITIES,
  GET_CHART_DATA,
} from "./dashboard-channels";

import {
  getDashboardStats,
  getRecentActivities,
  getChartData,
} from "@/lib/db/queries/dashboard.queries";

export function addDashboardEventListeners() {
  ipcMain.handle(GET_DASHBOARD_STATS, async () => await getDashboardStats());
  ipcMain.handle(GET_RECENT_ACTIVITIES, async (_, limit: number) => await getRecentActivities(limit));
  ipcMain.handle(GET_CHART_DATA, async () => await getChartData());
}