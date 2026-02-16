// ========================================
// FILE: src/helpers/ipc/reports/reports-listeners.ts (CORRIGIDO)
// ========================================
import { ipcMain, dialog } from "electron";
import { writeFileSync } from "fs";
import { REPORTS_CHANNELS } from "./reports-channels";
import {
  getVehiclesReportData,
  getTripsReportData,
  getFuelReportData,
  getMaintenanceReportData,
  getFinancialReportData,
  getGeneralReportData,
} from "@/lib/db/queries/reports.queries";

export async function addReportsEventListeners() {
  // ==================== BUSCAR DADOS DOS RELATÓRIOS ====================

  // Veículos
  ipcMain.handle(REPORTS_CHANNELS.GET_VEHICLES_DATA, async (_, dateRange) => {
    try {
      return await getVehiclesReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados de veículos:", error);
      throw error;
    }
  });

  // Viagens
  ipcMain.handle(REPORTS_CHANNELS.GET_TRIPS_DATA, async (_, dateRange) => {
    try {
      return await getTripsReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados de viagens:", error);
      throw error;
    }
  });

  // Combustível
  ipcMain.handle(REPORTS_CHANNELS.GET_FUEL_DATA, async (_, dateRange) => {
    try {
      return await getFuelReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados de combustível:", error);
      throw error;
    }
  });

  // Manutenções
  ipcMain.handle(REPORTS_CHANNELS.GET_MAINTENANCE_DATA, async (_, dateRange) => {
    try {
      return await getMaintenanceReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados de manutenções:", error);
      throw error;
    }
  });

  // Financeiro
  ipcMain.handle(REPORTS_CHANNELS.GET_FINANCIAL_DATA, async (_, dateRange) => {
    try {
      return await getFinancialReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
      throw error;
    }
  });

  // Geral
  ipcMain.handle(REPORTS_CHANNELS.GET_GENERAL_DATA, async (_, dateRange) => {
    try {
      return await getGeneralReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados gerais:", error);
      throw error;
    }
  });

  // ==================== SALVAR PDF ====================

  ipcMain.handle(REPORTS_CHANNELS.SAVE_PDF, async (_, { base64, fileName }) => {
    try {
      // Abrir dialog para usuário escolher onde salvar
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: "PDF Files", extensions: ["pdf"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (canceled || !filePath) {
        return { success: false };
      }

      // Converter base64 para buffer e salvar
      const buffer = Buffer.from(base64, "base64");
      writeFileSync(filePath, buffer);

      return { success: true, path: filePath };
    } catch (error) {
      console.error("Erro ao salvar PDF:", error);
      return { success: false, error: (error as Error).message };
    }
  });
}