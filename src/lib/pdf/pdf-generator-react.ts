// ========================================
// FILE: src/lib/pdf/pdf-generator-react.ts (TIPAGEM CORRIGIDA)
// ========================================
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Import templates
import { VehiclesReportPDF } from './templates/VehiclesReportPDF';
import { TripsReportPDF } from './templates/TripsReportPDF';
import { FuelReportPDF } from './templates/FuelReportPDF';
import { MaintenanceReportPDF } from './templates/MaintenanceReportPDF';
import { FinancialReportPDF } from './templates/FinancialReportPDF';
import { GeneralReportPDF } from './templates/GeneralReportPDF';

export type ReportType = 'vehicles' | 'trips' | 'fuel' | 'maintenance' | 'financial' | 'general';

export interface ReportOptions {
  type: ReportType;
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  fileName?: string;
}

// ==================== GERADOR PRINCIPAL ====================

export class ReactPDFGenerator {
  private static instance: ReactPDFGenerator;

  private constructor() {}

  static getInstance(): ReactPDFGenerator {
    if (!ReactPDFGenerator.instance) {
      ReactPDFGenerator.instance = new ReactPDFGenerator();
    }
    return ReactPDFGenerator.instance;
  }

  /**
   * Gera o componente React-PDF baseado no tipo de relatório
   */
  private getReportComponent(options: ReportOptions): React.ReactElement {
    const { type, dateRange, data } = options;

    switch (type) {
      case 'vehicles':
        return React.createElement(VehiclesReportPDF, {
          vehicles: data.vehicles,
          stats: data.stats,
          dateRange: dateRange,
        });
      
      case 'trips':
        return React.createElement(TripsReportPDF, {
          trips: data.trips,
          stats: data.stats,
          dateRange: dateRange,
        });
      
      case 'fuel':
        return React.createElement(FuelReportPDF, {
          refuelings: data.refuelings,
          stats: data.stats,
          dateRange: dateRange,
        });
      
      case 'maintenance':
        return React.createElement(MaintenanceReportPDF, {
          maintenances: data.maintenances,
          stats: data.stats,
          dateRange: dateRange,
        });
      
      case 'financial':
        return React.createElement(FinancialReportPDF, {
          expenses: data.expenses,
          stats: data.stats,
          dateRange: dateRange,
        });
      
      case 'general':
        return React.createElement(GeneralReportPDF, {
          dashboard: data.dashboard,
          dateRange: dateRange,
        });
      
      default:
        throw new Error(`Tipo de relatório desconhecido: ${type}`);
    }
  }

  /**
   * Gera e baixa o PDF
   */
  async generateReport(options: ReportOptions): Promise<void> {
    try {
      const component = this.getReportComponent(options);
      // @ts-ignore - React-PDF tem problemas de tipagem com React.createElement
      const blob = await pdf(component).toBlob();
      const fileName = options.fileName || this.getDefaultFileName(options.type);
      
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar relatório PDF');
    }
  }

  /**
   * Abre preview do PDF em nova aba
   */
  async previewReport(options: ReportOptions): Promise<void> {
    try {
      const component = this.getReportComponent(options);
      // @ts-ignore - React-PDF tem problemas de tipagem com React.createElement
      const blob = await pdf(component).toBlob();
      const url = URL.createObjectURL(blob);
      
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw new Error('Falha ao gerar preview do relatório');
    }
  }

  /**
   * Imprime o PDF diretamente
   */
  async printReport(options: ReportOptions): Promise<void> {
    try {
      const component = this.getReportComponent(options);
      // @ts-ignore - React-PDF tem problemas de tipagem com React.createElement
      const blob = await pdf(component).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Criar iframe invisível para impressão
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        // Remover iframe após impressão
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 100);
      };
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      throw new Error('Falha ao imprimir relatório');
    }
  }

  /**
   * Retorna o PDF como base64 (útil para salvar no Electron)
   */
  async getReportAsBase64(options: ReportOptions): Promise<string> {
    try {
      const component = this.getReportComponent(options);
      // @ts-ignore - React-PDF tem problemas de tipagem com React.createElement
      const blob = await pdf(component).toBlob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove o prefixo "data:application/pdf;base64,"
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao gerar base64:', error);
      throw new Error('Falha ao gerar PDF em base64');
    }
  }

  /**
   * Nome padrão do arquivo
   */
  private getDefaultFileName(type: ReportType): string {
    const date = new Date().toISOString().split('T')[0];
    return `relatorio-${type}-${date}.pdf`;
  }
}

// ==================== EXPORTS ====================

export const reactPdfGenerator = ReactPDFGenerator.getInstance();

// Helper functions
export async function generatePDFReport(options: ReportOptions): Promise<void> {
  await reactPdfGenerator.generateReport(options);
}

export async function previewPDFReport(options: ReportOptions): Promise<void> {
  await reactPdfGenerator.previewReport(options);
}

export async function printPDFReport(options: ReportOptions): Promise<void> {
  await reactPdfGenerator.printReport(options);
}