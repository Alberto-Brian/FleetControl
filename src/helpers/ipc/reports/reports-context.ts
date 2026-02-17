// ========================================
// FILE: src/helpers/ipc/reports/reports-context.ts (CORRIGIDO)
// ========================================
import { REPORTS_CHANNELS } from './reports-channels';

export interface DateRange {
  start: string;
  end: string;
}

export function exposeReportsContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  
  contextBridge.exposeInMainWorld("_reports", {
    // Buscar dados dos relatórios
    getVehiclesData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_VEHICLES_DATA, dateRange),

    getDriversData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_DRIVERS_DATA, dateRange),
    
    getTripsData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_TRIPS_DATA, dateRange),
    
    getFuelData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_FUEL_DATA, dateRange),
    
    getMaintenanceData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_MAINTENANCE_DATA, dateRange),
    
    getFinancialData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_FINANCIAL_DATA, dateRange),
    
    getGeneralData: (dateRange: DateRange) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.GET_GENERAL_DATA, dateRange),

    listGenerated:   (filters?: any)  => ipcRenderer.invoke(REPORTS_CHANNELS.LIST_GENERATED, filters),
    getGenerated:    (id: string)     => ipcRenderer.invoke(REPORTS_CHANNELS.GET_GENERATED, id),
    deleteGenerated: (id: string)     => ipcRenderer.invoke(REPORTS_CHANNELS.DELETE_GENERATED, id),
    statsGenerated:  ()               => ipcRenderer.invoke(REPORTS_CHANNELS.STATS_GENERATED),
    redownload:      (id: string)     => ipcRenderer.invoke(REPORTS_CHANNELS.REDOWNLOAD, id),

    
    // Salvar PDF no sistema de arquivos
    savePdf: (params: { base64: string; fileName: string }) => 
      ipcRenderer.invoke(REPORTS_CHANNELS.SAVE_PDF, params),
  });
}