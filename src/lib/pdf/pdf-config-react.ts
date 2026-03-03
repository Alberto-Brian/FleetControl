// ========================================
// FILE: src/lib/pdf/pdf-config-react.ts
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
// DEFINIÇÕES DINÂMICAS DO PDF  ← NOVO
// Preenchido por setPDFSettings() no generator antes de gerar cada PDF.
// Reflecte os campos relevantes de system_settings.
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFSettingsData {
  primaryColor:     string;
  secondaryColor:   string;
  watermarkEnabled: boolean;
  watermarkUseLogo: boolean;  // true = usa logo da empresa; false = usa texto
  watermarkText:    string;
  watermarkOpacity: number;   // 0.0 – 1.0
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
// PDF_CONFIG — mantido para compatibilidade.
// Cores primary/secondary devem ser lidas via getPDFSettings() nos componentes.
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
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS GLOBAIS
// Apenas valores que NÃO dependem de cores dinâmicas ficam aqui.
// primary/secondary são aplicados inline nos componentes com getPDFSettings().
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

  // Header
  header:         { position: 'absolute', top: 20, left: 40, right: 40, flexDirection: 'column', paddingBottom: 10 },
  headerLogo:     { width: 36, height: 36, objectFit: 'contain' },
  companyName:    { fontSize: 14, fontWeight: 'bold', marginBottom: 1 },
  companyTagline: { fontSize: 7 },
  title:          { fontSize: 18, fontWeight: 'bold' },
  subtitle:       { fontSize: 9, marginTop: 2 },

  // Footer
  footer: {
    position:       'absolute',
    bottom:         20,
    left:           40,
    right:          40,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    fontSize:       7,
    paddingTop:     6,
  },

  // Sections
  section:      { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginBottom: 8, paddingBottom: 4 },

  // Info Section
  infoSection: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4, marginBottom: 12,
  },
  infoItem:    { flexDirection: 'column' },
  infoLabel:   { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  infoValue:   { fontSize: 9, color: '#1e293b', fontWeight: 'bold' },

  // Table
  table:           { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  tableHeader:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableRow:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tableRowAlt:     { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  tableRowLast:    { flexDirection: 'row' },
  tableCell:       { padding: 8, fontSize: 9, color: '#1e293b' },
  tableCellHeader: { padding: 8, fontSize: 9, fontWeight: 'bold', color: '#ffffff' },
  tableCellBold:   { padding: 8, fontSize: 9, fontWeight: 'bold', color: '#1e293b' },

  // Summary Box
  summaryBox:   { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 4, marginTop: 8 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0' },
  summaryLabel: { fontSize: 9, color: '#1e293b' },
  summaryValue: { fontSize: 9, fontWeight: 'bold', color: '#1e293b' },

  // Status Badges — cores de negócio fixas (independentes de primary/secondary)
  statusBadge:       { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, fontSize: 7, fontWeight: 'bold', color: '#ffffff', alignSelf: 'flex-start', margin: 6 },
  statusAvailable:   { backgroundColor: '#10b981' },
  statusMaintenance: { backgroundColor: '#f59e0b' },
  statusInactive:    { backgroundColor: '#64748b' },

  // Divider / Empty
  divider:    { borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', marginVertical: 8 },
  emptyState: { textAlign: 'center', fontSize: 10, paddingVertical: 30 },

  // Watermark — camada absoluta centrada
  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  watermarkText:      { fontSize: 72, fontWeight: 'bold', transform: 'rotate(-45deg)', letterSpacing: 8 },
});

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return `${(value / 1000).toFixed(2)} K Kz`;
}
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function formatDistance(km: number): string {
  return `${km.toLocaleString('pt-PT')} km`;
}
export function formatLiters(liters: number): string {
  return `${liters.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} L`;
}