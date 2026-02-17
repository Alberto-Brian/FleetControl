// ========================================
// FILE: src/helpers/ipc/reports/reports-listeners.ts (CORRIGIDO)
// ========================================
import { ipcMain, dialog } from "electron";
import { writeFileSync } from "fs";
import { REPORTS_CHANNELS } from "./reports-channels";
import {
  getVehiclesReportData,
  getDriversReportData,
  getTripsReportData,
  getFuelReportData,
  getMaintenanceReportData,
  getFinancialReportData,
  getGeneralReportData,
} from "@/lib/db/queries/reports.queries";

import {
  saveGeneratedReport,
  listGeneratedReports,
  getGeneratedReport,
  deleteGeneratedReport,
  getGeneratedReportsStats,
} from '@/lib/db/queries/generated-reports.queries';

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

  // Motoristas
  ipcMain.handle(REPORTS_CHANNELS.GET_DRIVERS_DATA, async (_, dateRange) => {
    try {
      return await getDriversReportData(dateRange.start, dateRange.end);
    } catch (error) {
      console.error("Erro ao buscar dados de motoristas:", error);
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

  // Listar relatórios gerados
  ipcMain.handle(REPORTS_CHANNELS.LIST_GENERATED, async (_, filters) => {
    return await listGeneratedReports(filters);
  });

  // Buscar relatório gerado pelo ID
  ipcMain.handle(REPORTS_CHANNELS.GET_GENERATED, async (_, id: string) => {
    return await getGeneratedReport(id);
  });

  // Deletar relatório gerado
  ipcMain.handle(REPORTS_CHANNELS.DELETE_GENERATED, async (_, id: string) => {
    return await deleteGeneratedReport(id);
  });

  // Stats dos relatórios gerados
  ipcMain.handle(REPORTS_CHANNELS.STATS_GENERATED, async () => {
    return await getGeneratedReportsStats();
  });

  // Regerar PDF de um relatório já salvo (sem nova query ao DB)
  ipcMain.handle(REPORTS_CHANNELS.REDOWNLOAD, async (_, id: string) => {
    try {
      const report = await getGeneratedReport(id);
      if (!report) return { success: false, error: 'Relatório não encontrado' };

      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: report.file_name,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (canceled || !filePath) return { success: false };

      // Dados já salvos - pode regerar o PDF via renderer
      // Retornar os dados para o renderer gerar o PDF
      return {
        success: true,
        report: {
          id:      report.id,
          type:    report.type,
          data:    report.data,
          stats:   report.stats,
          dateRange: { start: report.period_start, end: report.period_end },
          language:  report.language,
          fileName:  report.file_name,
        },
        savePath: filePath,
      };
    } catch (error) {
      console.error('Erro ao regerar PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  });


  // ==================== SALVAR PDF ====================

  ipcMain.handle(REPORTS_CHANNELS.SAVE_PDF, async (_, {
    base64,
    fileName,
    reportType,
    title,
    periodStart,
    periodEnd,
    language,
    data,
    stats,
    createdBy,
  }) => {
    try {
      // Abrir dialog para salvar
      const { filePath, canceled } = await dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (canceled || !filePath) return { success: false };

      // Salvar arquivo no disco
      const buffer = Buffer.from(base64, 'base64');
      writeFileSync(filePath, buffer);

      // ✅ Salvar registro no banco de dados
      const id = await saveGeneratedReport({
        type:        reportType,
        title,
        periodStart,
        periodEnd,
        language,
        fileName,
        fileSize:    buffer.length,
        data,
        stats,
        createdBy,
      });

      return { success: true, path: filePath, id };
    } catch (error) {
      console.error('Erro ao salvar PDF:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}