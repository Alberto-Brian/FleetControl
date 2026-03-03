// ========================================
// FILE: src/lib/pdf/pdf-generator-react.ts
// ========================================
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { setPDFLanguage, Language } from './pdf-translations';
import { setPDFCompany } from './pdf-config-react';
import { getCompanySettings, getCompanyLogoBase64 } from '@/helpers/company-helpers';

// Templates
import { VehiclesReportPDF }    from './templates/VehiclesReportPDF';
import { DriversReportPDF }     from './templates/DriversReportPDF';
import { TripsReportPDF }       from './templates/TripsReportPDF';
import { FuelReportPDF }        from './templates/FuelReportPDF';
import { MaintenanceReportPDF } from './templates/MaintenanceReportPDF';
import { FinancialReportPDF }   from './templates/FinancialReportPDF';
import { GeneralReportPDF }     from './templates/GeneralReportPDF';
import { languageLocalStorageKey } from '@/helpers/language-helpers';

export type ReportType =
  | 'vehicles' | 'drivers' | 'trips' | 'fuel'
  | 'maintenance' | 'financial' | 'general';

export interface ReportOptions {
  type:      ReportType;
  dateRange: { start: string; end: string };
  data:      any;
  fileName?: string;
  language?: Language;
}

// ─────────────────────────────────────────────────────────────────────────────

export class ReactPDFGenerator {
  private static instance: ReactPDFGenerator;

  private constructor() {}

  static getInstance(): ReactPDFGenerator {
    if (!ReactPDFGenerator.instance) {
      ReactPDFGenerator.instance = new ReactPDFGenerator();
    }
    return ReactPDFGenerator.instance;
  }

  // ── Idioma ───────────────────────────────────────────────────────────────

  private getLanguage(options: ReportOptions): Language {
    if (options.language) return options.language;
    try {
      const lang = localStorage.getItem(languageLocalStorageKey);
      if (lang?.startsWith('en')) return 'en';
    } catch { /* noop */ }
    return 'pt';
  }

  // ── Dados da empresa ─────────────────────────────────────────────────────
  // Carrega as configurações da empresa e o logo (base64) antes de gerar o PDF.
  // Injecta tudo em setPDFCompany() para o Header e Footer terem acesso.

  private async loadCompanyData(): Promise<void> {
    try {
      const [settings, logoBase64] = await Promise.all([
        getCompanySettings(),
        getCompanyLogoBase64(),
      ]);

      setPDFCompany({
        name:    settings?.company_name ?? 'FleetControl',
        tagline: 'Gestão de Frotas',
        address: [settings?.city, settings?.state].filter(Boolean).join(', ') || settings?.address || undefined,
        phone:   settings?.phone   ?? undefined,
        email:   settings?.email   ?? undefined,
        logo:    logoBase64 ?? null,
      });
    } catch (err) {
      console.warn('[PDFGenerator] Não foi possível carregar dados da empresa:', err);
      // Fallback — valores padrão
      setPDFCompany({ name: 'FleetControl', tagline: 'Gestão de Frotas' });
    }
  }

  // ── Componente por tipo ───────────────────────────────────────────────────

  private getReportComponent(options: ReportOptions): React.ReactElement {
    const { type, dateRange, data } = options;
    setPDFLanguage(this.getLanguage(options));

    switch (type) {
      case 'vehicles':
        return React.createElement(VehiclesReportPDF, { vehicles: data.vehicles, stats: data.stats, dateRange });
      case 'drivers':
        return React.createElement(DriversReportPDF, { drivers: data.drivers, stats: data.stats, dateRange });
      case 'trips':
        return React.createElement(TripsReportPDF, { trips: data.trips, stats: data.stats, dateRange });
      case 'fuel':
        return React.createElement(FuelReportPDF, { refuelings: data.refuelings, stats: data.stats, dateRange });
      case 'maintenance':
        return React.createElement(MaintenanceReportPDF, { maintenances: data.maintenances, stats: data.stats, dateRange });
      case 'financial':
        return React.createElement(FinancialReportPDF, { expenses: data.expenses, stats: data.stats, dateRange });
      case 'general':
        return React.createElement(GeneralReportPDF, { dashboard: data.dashboard, dateRange });
      default:
        throw new Error(`Tipo de relatório desconhecido: ${type}`);
    }
  }

  // ── API pública ───────────────────────────────────────────────────────────

  async generateReport(options: ReportOptions): Promise<void> {
    await this.loadCompanyData(); // ← carrega empresa + logo
    const component = this.getReportComponent(options);
    // @ts-ignore
    const blob = await pdf(component).toBlob();
    saveAs(blob, options.fileName ?? this.defaultFileName(options.type));
  }

  async previewReport(options: ReportOptions): Promise<void> {
    await this.loadCompanyData();
    const component = this.getReportComponent(options);
    // @ts-ignore
    const blob = await pdf(component).toBlob();
    window.open(URL.createObjectURL(blob), '_blank');
  }

  async printReport(options: ReportOptions): Promise<void> {
    await this.loadCompanyData();
    const component = this.getReportComponent(options);
    // @ts-ignore
    const blob = await pdf(component).toBlob();
    const url  = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  }

  async getReportAsBase64(options: ReportOptions): Promise<string> {
    await this.loadCompanyData();
    const component = this.getReportComponent(options);
    // @ts-ignore
    const blob = await pdf(component).toBlob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror   = reject;
      reader.readAsDataURL(blob);
    });
  }

  private defaultFileName(type: ReportType): string {
    return `relatorio-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export const reactPdfGenerator = ReactPDFGenerator.getInstance();

export const generatePDFReport = (o: ReportOptions) => reactPdfGenerator.generateReport(o);
export const previewPDFReport  = (o: ReportOptions) => reactPdfGenerator.previewReport(o);
export const printPDFReport    = (o: ReportOptions) => reactPdfGenerator.printReport(o);