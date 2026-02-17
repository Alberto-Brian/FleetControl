// ========================================
// FILE: src/helpers/reports-helpers.ts (COMPLETO COM HISTÓRICO)
// ========================================
import { reactPdfGenerator } from '@/lib/pdf/pdf-generator-react';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';
import type { DateRange } from '@/lib/types/reports';

// ==================== TÍTULOS DOS RELATÓRIOS ====================

const REPORT_TITLES: Record<ReportType, { pt: string; en: string }> = {
  vehicles:    { pt: 'Relatório de Veículos',    en: 'Vehicles Report'    },
  drivers:     { pt: 'Relatório de Motoristas',  en: 'Drivers Report'     },
  trips:       { pt: 'Relatório de Viagens',     en: 'Trips Report'       },
  fuel:        { pt: 'Relatório de Combustível', en: 'Fuel Report'        },
  maintenance: { pt: 'Relatório de Manutenções', en: 'Maintenance Report' },
  financial:   { pt: 'Relatório Financeiro',     en: 'Financial Report'   },
  general:     { pt: 'Relatório Geral',          en: 'General Report'     },
};

// ==================== HELPER INTERNO: DOWNLOAD + SAVE ====================

async function _downloadAndSave(
  options: { type: ReportType; dateRange: DateRange; data: any; fileName: string }
): Promise<any> {
  const language = localStorage.getItem('i18nextLng')?.startsWith('en') ? 'en' : 'pt';
  const base64   = await reactPdfGenerator.getReportAsBase64(options);
  const title    = REPORT_TITLES[options.type][language];

  // O relatório 'general' guarda os dados em data.dashboard em vez de data.stats
  const stats = options.data.stats ?? options.data.dashboard ?? {};

  const result = await window._reports.savePdf({
    base64,
    fileName:    options.fileName,
    reportType:  options.type,
    title,
    periodStart: options.dateRange.start,
    periodEnd:   options.dateRange.end,
    language,
    data:        options.data,
    stats,
  });

  if (!result.success) throw new Error('Falha ao salvar relatório');
  return result;
}

// ==================== FUNÇÕES INDIVIDUAIS ====================

export async function generateVehiclesReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getVehiclesData(dateRange);
    const options = { type: 'vehicles' as ReportType, dateRange, data, fileName: `relatorio-veiculos-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateDriversReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getDriversData(dateRange);
    const options = { type: 'drivers' as ReportType, dateRange, data, fileName: `relatorio-motoristas-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateTripsReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getTripsData(dateRange);
    const options = { type: 'trips' as ReportType, dateRange, data, fileName: `relatorio-viagens-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateFuelReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getFuelData(dateRange);
    const options = { type: 'fuel' as ReportType, dateRange, data, fileName: `relatorio-combustivel-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateMaintenanceReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getMaintenanceData(dateRange);
    const options = { type: 'maintenance' as ReportType, dateRange, data, fileName: `relatorio-manutencoes-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateFinancialReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getFinancialData(dateRange);
    const options = { type: 'financial' as ReportType, dateRange, data, fileName: `relatorio-financeiro-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateGeneralReport(
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  try {
    const data    = await window._reports.getGeneralData(dateRange);
    const options = { type: 'general' as ReportType, dateRange, data, fileName: `relatorio-geral-${dateRange.start}.pdf` };

    if (action === 'preview') return await reactPdfGenerator.previewReport(options);
    if (action === 'print')   return await reactPdfGenerator.printReport(options);
    return await _downloadAndSave(options);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ==================== HELPER GENÉRICO ====================

export async function generateReport(
  type: ReportType,
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  switch (type) {
    case 'vehicles':    return await generateVehiclesReport(dateRange, action);
    case 'drivers':     return await generateDriversReport(dateRange, action);
    case 'trips':       return await generateTripsReport(dateRange, action);
    case 'fuel':        return await generateFuelReport(dateRange, action);
    case 'maintenance': return await generateMaintenanceReport(dateRange, action);
    case 'financial':   return await generateFinancialReport(dateRange, action);
    case 'general':     return await generateGeneralReport(dateRange, action);
    default:            throw new Error(`Tipo de relatório desconhecido: ${type}`);
  }
}

// ==================== VALIDAÇÃO ====================

export function validateDateRange(dateRange: DateRange): boolean {
  const start = new Date(dateRange.start);
  const end   = new Date(dateRange.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error('Datas inválidas');
  if (start > end) throw new Error('Data de início deve ser anterior à data final');

  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 365) throw new Error('Período máximo de 365 dias');

  return true;
}

// ==================== PRESET DATE RANGES ====================

export function getPresetDateRanges() {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();

  return {
    today:      { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] },
    thisWeek:   { start: new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    thisMonth:  { start: new Date(year, month, 1).toISOString().split('T')[0],     end: new Date(year, month + 1, 0).toISOString().split('T')[0] },
    lastMonth:  { start: new Date(year, month - 1, 1).toISOString().split('T')[0], end: new Date(year, month, 0).toISOString().split('T')[0] },
    thisYear:   { start: new Date(year, 0, 1).toISOString().split('T')[0],         end: new Date(year, 11, 31).toISOString().split('T')[0] },
    last30Days: { start: new Date(new Date().setDate(today.getDate() - 30)).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    last90Days: { start: new Date(new Date().setDate(today.getDate() - 90)).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
  };
}