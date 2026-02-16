// ========================================
// FILE: src/helpers/reports-helpers.ts (ATUALIZADO PARA REACT-PDF)
// ========================================
import { reactPdfGenerator } from '@/lib/pdf/pdf-generator-react';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';
import {
  getVehiclesReportData,
  getTripsReportData,
  getFuelReportData,
  getMaintenanceReportData,
  getFinancialReportData,
  getGeneralReportData,
} from '@/lib/db/queries/reports.queries';

export interface DateRange {
  start: string;
  end: string;
}

// ==================== GERAR RELATÓRIOS ====================

export async function generateVehiclesReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getVehiclesReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'vehicles' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-veiculos-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

export async function generateTripsReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getTripsReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'trips' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-viagens-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

export async function generateFuelReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getFuelReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'fuel' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-combustivel-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

export async function generateMaintenanceReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getMaintenanceReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'maintenance' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-manutencoes-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

export async function generateFinancialReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getFinancialReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'financial' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-financeiro-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

export async function generateGeneralReport(
  dateRange: DateRange, 
  action: 'download' | 'preview' | 'print' = 'download'
) {
  const data = await getGeneralReportData(dateRange.start, dateRange.end);
  
  const options = {
    type: 'general' as ReportType,
    dateRange,
    data,
    fileName: `relatorio-geral-${dateRange.start}.pdf`,
  };

  if (action === 'preview') {
    return await reactPdfGenerator.previewReport(options);
  } else if (action === 'print') {
    return await reactPdfGenerator.printReport(options);
  } else {
    return await reactPdfGenerator.generateReport(options);
  }
}

// ==================== HELPER GENÉRICO ====================

export async function generateReport(
  type: ReportType,
  dateRange: DateRange,
  action: 'download' | 'preview' | 'print' = 'download'
) {
  switch (type) {
    case 'vehicles':
      return await generateVehiclesReport(dateRange, action);
    case 'trips':
      return await generateTripsReport(dateRange, action);
    case 'fuel':
      return await generateFuelReport(dateRange, action);
    case 'maintenance':
      return await generateMaintenanceReport(dateRange, action);
    case 'financial':
      return await generateFinancialReport(dateRange, action);
    case 'general':
      return await generateGeneralReport(dateRange, action);
    default:
      throw new Error(`Tipo de relatório desconhecido: ${type}`);
  }
}

// ==================== VALIDAÇÃO ====================

export function validateDateRange(dateRange: DateRange): boolean {
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Datas inválidas');
  }
  
  if (start > end) {
    throw new Error('Data de início deve ser anterior à data final');
  }
  
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 365) {
    throw new Error('Período máximo de 365 dias');
  }
  
  return true;
}

// ==================== PRESET DATE RANGES ====================

export function getPresetDateRanges() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  return {
    today: {
      start: today.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
    
    thisWeek: {
      start: new Date(today.setDate(today.getDate() - today.getDay())).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    
    thisMonth: {
      start: new Date(year, month, 1).toISOString().split('T')[0],
      end: new Date(year, month + 1, 0).toISOString().split('T')[0],
    },
    
    lastMonth: {
      start: new Date(year, month - 1, 1).toISOString().split('T')[0],
      end: new Date(year, month, 0).toISOString().split('T')[0],
    },
    
    thisYear: {
      start: new Date(year, 0, 1).toISOString().split('T')[0],
      end: new Date(year, 11, 31).toISOString().split('T')[0],
    },
    
    last30Days: {
      start: new Date(new Date().setDate(today.getDate() - 30)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    
    last90Days: {
      start: new Date(new Date().setDate(today.getDate() - 90)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  };
}