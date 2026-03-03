// ========================================
// FILE: src/lib/pdf/pdf-generator-react.ts
// ========================================
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { setPDFLanguage, Language }       from './pdf-translations';
import { setPDFCompany, setPDFSettings }  from './pdf-config-react';
import { getCompanySettings, getCompanyLogoBase64 } from '@/helpers/company-helpers';
import { getSystemSettings }              from '@/helpers/system-settings-helpers';

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

  // ── Idioma ─────────────────────────────────────────────────────────────────

  private getLanguage(options: ReportOptions): Language {
    if (options.language) return options.language;
    try {
      const lang = localStorage.getItem(languageLocalStorageKey);
      if (lang?.startsWith('en')) return 'en';
    } catch { /* noop */ }
    return 'pt';
  }

  // ── Carregar empresa + definições PDF ──────────────────────────────────────
  //
  // Antes de cada geração, injeta:
  //   1. Dados da empresa (nome, logo, endereço) → setPDFCompany()
  //   2. Definições PDF do system_settings       → setPDFSettings()
  //      • cores primary/secondary
  //      • watermark (enabled, text, opacity)
  //      • showFooter, showSummary
  //      • paperSize, orientation

  private async loadAllSettings(): Promise<void> {
    try {
      const [company, logoBase64, sysSettings] = await Promise.all([
        getCompanySettings(),
        getCompanyLogoBase64(),
        getSystemSettings(),
      ]);

      // 1. Empresa
      setPDFCompany({
        name:    company?.company_name ?? 'FleetControl',
        tagline: 'Gestão de Frotas',
        address: [company?.city, company?.state].filter(Boolean).join(', ') || company?.address || undefined,
        phone:   company?.phone  ?? undefined,
        email:   company?.email  ?? undefined,
        logo:    logoBase64 ?? null,
      });

      // 2. Definições PDF
      setPDFSettings({
        primaryColor:     sysSettings.pdf_primary_color     ?? '#2563eb',
        secondaryColor:   sysSettings.pdf_secondary_color   ?? '#64748b',
        watermarkEnabled: sysSettings.pdf_watermark_enabled ?? false,
        watermarkUseLogo: sysSettings.pdf_watermark_use_logo ?? false,
        watermarkText:    sysSettings.pdf_watermark_text    ?? 'CONFIDENCIAL',
        watermarkOpacity: parseFloat(sysSettings.pdf_watermark_opacity ?? '0.10'),
        showFooter:       sysSettings.pdf_show_footer   ?? true,
        showSummary:      sysSettings.pdf_show_summary  ?? true,
        showCharts:       sysSettings.pdf_show_charts   ?? true,
        paperSize:        (sysSettings.pdf_paper_size as 'A4' | 'LETTER') ?? 'A4',
        orientation:      (sysSettings.pdf_orientation as 'portrait' | 'landscape') ?? 'portrait',
      });

    } catch (err) {
      console.warn('[PDFGenerator] Erro ao carregar definições:', err);
      // Fallback seguro — defaults
      setPDFCompany({ name: 'FleetControl', tagline: 'Gestão de Frotas' });
      setPDFSettings({
        primaryColor: '#2563eb', secondaryColor: '#64748b',
        watermarkEnabled: false, watermarkText: 'CONFIDENCIAL', watermarkOpacity: 0.10,
        showFooter: true, showSummary: true, paperSize: 'A4', orientation: 'portrait',
      });
    }
  }

  // ── Componente por tipo ────────────────────────────────────────────────────

  private getReportComponent(options: ReportOptions): React.ReactElement {
    const { type, dateRange, data } = options;
    setPDFLanguage(this.getLanguage(options));

    switch (type) {
      case 'vehicles':
        return React.createElement(VehiclesReportPDF,    { vehicles:     data.vehicles,     stats: data.stats, dateRange });
      case 'drivers':
        return React.createElement(DriversReportPDF,     { drivers:      data.drivers,      stats: data.stats, dateRange });
      case 'trips':
        return React.createElement(TripsReportPDF,       { trips:        data.trips,        stats: data.stats, dateRange });
      case 'fuel':
        return React.createElement(FuelReportPDF,        { refuelings:   data.refuelings,   stats: data.stats, dateRange });
      case 'maintenance':
        return React.createElement(MaintenanceReportPDF, { maintenances: data.maintenances, stats: data.stats, dateRange });
      case 'financial':
        return React.createElement(FinancialReportPDF,   { expenses:     data.expenses,     stats: data.stats, dateRange });
      case 'general':
        return React.createElement(GeneralReportPDF,     { dashboard:    data.dashboard,    dateRange });
      default:
        throw new Error(`Tipo de relatório desconhecido: ${type}`);
    }
  }

  // ── API pública ────────────────────────────────────────────────────────────

  async generateReport(options: ReportOptions): Promise<void> {
    await this.loadAllSettings();
    const blob = await pdf(this.getReportComponent(options) as any).toBlob();
    saveAs(blob, options.fileName ?? this.defaultFileName(options.type));
  }

  async previewReport(options: ReportOptions): Promise<void> {
    await this.loadAllSettings();
    const blob = await pdf(this.getReportComponent(options) as any).toBlob();
    window.open(URL.createObjectURL(blob), '_blank');
  }

  async printReport(options: ReportOptions): Promise<void> {
    await this.loadAllSettings();
    const blob   = await pdf(this.getReportComponent(options) as any).toBlob();
    const url    = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 100);
    };
  }

  async getReportAsBase64(options: ReportOptions): Promise<string> {
    await this.loadAllSettings();
    const blob = await pdf(this.getReportComponent(options) as any).toBlob();
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