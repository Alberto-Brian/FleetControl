
import {
    GET_DASHBOARD_STATS,
    GET_RECENT_ACTIVITIES,
    GET_CHART_DATA,
} from './dashboard-channels'

export function exposeDashboardContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("_dashboard", {
    getStats: () => ipcRenderer.invoke(GET_DASHBOARD_STATS),
    getActivities: (limit: number) => ipcRenderer.invoke(GET_RECENT_ACTIVITIES, limit),
    getChartData: () => ipcRenderer.invoke(GET_CHART_DATA),
  });
}