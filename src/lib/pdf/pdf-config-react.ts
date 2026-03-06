// ========================================
// FILE: src/lib/pdf/pdf-config-react.ts (MELHORADO)
// ========================================
import { StyleSheet } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────────────────────
// DADOS DINÂMICOS DA EMPRESA
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFCompanyData {
  name:     string;
  tagline?: string;
  address?: string;
  phone?:   string;
  email?:   string;
  logo?:    string | null;
}

let _company: PDFCompanyData = { name: 'FleetControl', tagline: 'Gestão de Frotas' };

export function setPDFCompany(data: PDFCompanyData) { _company = { ...data }; }
export function getPDFCompany(): PDFCompanyData     { return _company; }

// ─────────────────────────────────────────────────────────────────────────────
// DEFINIÇÕES DINÂMICAS DO PDF
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFSettingsData {
  primaryColor:     string;
  secondaryColor:   string;
  watermarkEnabled: boolean;
  watermarkUseLogo: boolean;
  watermarkText:    string;
  watermarkOpacity: number;
  showFooter:       boolean;
  showSummary:      boolean;
  showCharts:       boolean;
  paperSize:        'A4' | 'LETTER';
  orientation:      'portrait' | 'landscape';
}

const DEFAULT_PDF_SETTINGS: PDFSettingsData = {
  primaryColor:     '#2563eb',
  secondaryColor:   '#64748b',
  watermarkEnabled: false,
  watermarkUseLogo: false,
  watermarkText:    'CONFIDENCIAL',
  watermarkOpacity: 0.10,
  showFooter:       true,
  showSummary:      true,
  showCharts:       true,
  paperSize:        'A4',
  orientation:      'portrait',
};

let _pdfSettings: PDFSettingsData = { ...DEFAULT_PDF_SETTINGS };

export function setPDFSettings(data: Partial<PDFSettingsData>) {
  _pdfSettings = { ...DEFAULT_PDF_SETTINGS, ...data };
}
export function getPDFSettings(): PDFSettingsData { return _pdfSettings; }

// ─────────────────────────────────────────────────────────────────────────────
// VERSÃO DO APLICATIVO (injetada pelo processo main antes de gerar PDF)
// ─────────────────────────────────────────────────────────────────────────────
let _appVersion: string = '1.0.0';  // Default fallback
export function setPDFAppVersion(version: string) {
  _appVersion = version;
}

export function getPDFAppVersion(): string {
  return _appVersion;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF_CONFIG — mantido para compatibilidade
// ─────────────────────────────────────────────────────────────────────────────

export const PDF_CONFIG = {
  colors: {
    primary:   DEFAULT_PDF_SETTINGS.primaryColor,
    secondary: DEFAULT_PDF_SETTINGS.secondaryColor,
    success:   '#10b981',
    warning:   '#f59e0b',
    danger:    '#ef4444',
    dark:      '#1e293b',
    light:     '#f1f5f9',
    border:    '#e2e8f0',
    white:     '#ffffff',
    // Novas cores para melhorias visuais
    background: '#f8fafc',
    text:       '#1f2937',
    textLight:  '#6b7280',
    textMuted:  '#94a3b8',
    cardBg:     '#ffffff',
    tableAlt:   '#f8fafc',
    gradient: {
      start: '#3b82f6',
      end:   '#1d4ed8',
    },
  },
  
  // Tipografia melhorada
  typography: {
    title:        { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    subtitle:     { fontSize: 12, color: '#6b7280', marginTop: 4 },
    sectionTitle: { 
      fontSize: 14, 
      fontWeight: 'bold', 
      color: '#1e40af',
      marginBottom: 12,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    tableHeader: { 
      fontSize: 10, 
      fontWeight: 'bold', 
      color: '#374151',
      backgroundColor: '#f3f4f6',
      padding: 8,
    },
    tableCell:    { fontSize: 10, color: '#4b5563', padding: 8 },
    tableCellBold:{ fontSize: 10, fontWeight: 'bold', color: '#1f2937', padding: 8 },
    kpiLabel:     { fontSize: 7, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
    kpiValue:     { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
    kpiSub:       { fontSize: 7, color: 'rgba(255,255,255,0.75)' },
    chartTitle:   { fontSize: 8, fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoLabel:    { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    infoValue:    { fontSize: 9, color: '#1e293b', fontWeight: 'bold' },
  },

  // Espaçamento consistente
  spacing: {
    page:      { padding: 40, paddingTop: 105, paddingBottom: 60 },
    section:   { marginTop: 16, marginBottom: 8 },
    card:      { padding: 16, borderRadius: 8, gap: 6 },
    table:     { cellPadding: 8, borderRadius: 4 },
  },
  
  // Bordas e sombras sutis
  effects: {
    borderRadius: {
      sm: 2,
      md: 4,
      lg: 6,
      xl: 8,
    },
    shadows: {
      sm: { shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 2 },
      md: { shadowColor: '#000000', shadowOpacity: 0.1, shadowRadius: 4 },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS GLOBAIS MELHORADOS
// ─────────────────────────────────────────────────────────────────────────────

export const commonStyles = StyleSheet.create({
  page: {
    padding:         40,
    paddingTop:      105,
    paddingBottom:   60,
    backgroundColor: '#ffffff',
    fontFamily:      'Helvetica',
    fontSize:        10,
  },

  // Header melhorado
  header: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'column',
    paddingBottom: 12,
    borderBottomWidth: 2,
  },
  headerLogo:     { width: 40, height: 40, objectFit: 'contain' },
  companyName:    { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  companyTagline: { fontSize: 8, letterSpacing: 0.5 },
  title:          { fontSize: 20, fontWeight: 'bold' },
  subtitle:       { fontSize: 10, marginTop: 3, opacity: 0.8 },

  // Footer melhorado
  footer: {
    position:       'absolute',
    bottom:         20,
    left:           40,
    right:          40,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    fontSize:       8,
    paddingTop:     8,
    borderTopWidth: 0.5,
  },

  // Sections com hierarquia visual
  section:      { marginTop: 20, marginBottom: 12 },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 10, 
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    letterSpacing: 0.3,
  },

  // Info Section com design de cards
  infoSection: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    padding: 12, 
    backgroundColor: '#f8fafc', 
    borderRadius: 6, 
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  infoItem:    { flexDirection: 'column', flex: 1 },
  infoLabel:   { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 3, color: '#64748b', letterSpacing: 0.5 },
  infoValue:   { fontSize: 10, color: '#1e293b', fontWeight: 'bold' },

  // Tabela com design aprimorado
  table: { 
    width: 'auto', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 6, 
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  tableHeader: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tableRowAlt: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  tableRowLast:    { flexDirection: 'row', backgroundColor: '#ffffff' },
  tableCell:       { padding: 10, fontSize: 9, color: '#4b5563' },
  tableCellHeader: { padding: 10, fontSize: 9, fontWeight: 'bold', color: '#374151' },
  tableCellBold:   { padding: 10, fontSize: 9, fontWeight: 'bold', color: '#1f2937' },

  // Summary Box com design premium
  summaryBox:   { 
    backgroundColor: '#f8fafc', 
    padding: 16, 
    borderRadius: 6, 
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  summaryRow:   { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 6, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: { fontSize: 10, color: '#4b5563', fontWeight: 'medium' },
  summaryValue: { fontSize: 10, fontWeight: 'bold', color: '#1f2937' },

  // Status Badges com design moderno
  statusBadge:       { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 4, 
    fontSize: 7, 
    width: 70,
    fontWeight: 'bold', 
    color: '#ffffff', 
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusAvailable:   { backgroundColor: '#10b981' },
  statusMaintenance: { backgroundColor: '#f59e0b' },
  statusInactive:    { backgroundColor: '#64748b' },

  // Divider / Empty
  divider:    { 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#e2e8f0', 
    marginVertical: 12,
  },
  emptyState: { 
    textAlign: 'center', 
    fontSize: 11, 
    paddingVertical: 40,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Watermark — camada absoluta centrada
  watermarkContainer: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    alignItems: 'center', 
    justifyContent: 'center',
    zIndex: -1,
  },
  watermarkText:      { 
    fontSize: 72, 
    fontWeight: 'bold', 
    transform: 'rotate(-45deg)', 
    letterSpacing: 8,
    opacity: 0.08,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS MELHORADOS
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value === 0) return '0 Kz';
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)} M Kz`;
  if (value >= 1000) return `${(value / 1000).toFixed(2)} K Kz`;
  return `${value.toFixed(2)} Kz`;
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function formatDistance(km: number): string {
  if (km >= 1000000) return `${(km / 1000000).toFixed(2)} M km`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)} k km`;
  return `${km.toLocaleString('pt-PT')} km`;
}

export function formatDistanceCompact(km: number): string {
  if (km >= 1000000) return `${(km / 1000000).toFixed(1)}M`;
  if (km >= 1000) return `${(km / 1000).toFixed(1)}k`;
  return `${km}`;
}

export function formatLiters(liters: number): string {
  if (liters >= 1000000) return `${(liters / 1000000).toFixed(2)} M L`;
  if (liters >= 1000) return `${(liters / 1000).toFixed(1)} k L`;
  return `${liters.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} L`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('pt-PT', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}