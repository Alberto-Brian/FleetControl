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
  /** Formato dos valores: 'compact' usa K/M, 'full' mostra o número completo */
  valueFormat:  'compact' | 'full';
  /** Mostrar símbolo da moeda (Kz) nos valores */
  showCurrency: boolean;
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
  valueFormat:      'full',
  showCurrency:     true,
};

let _pdfSettings: PDFSettingsData = { ...DEFAULT_PDF_SETTINGS };

export function setPDFSettings(data: Partial<PDFSettingsData>) {
  _pdfSettings = { ...DEFAULT_PDF_SETTINGS, ...data };
}
export function getPDFSettings(): PDFSettingsData { return _pdfSettings; }

// ─────────────────────────────────────────────────────────────────────────────
// VERSÃO DO APLICATIVO
// ─────────────────────────────────────────────────────────────────────────────

let _appVersion: string = '1.0.0';
export function setPDFAppVersion(version: string) { _appVersion = version; }
export function getPDFAppVersion(): string        { return _appVersion; }

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE TIPOGRAFIA
// ─────────────────────────────────────────────────────────────────────────────

/** Tamanho de fonte adaptativo para valores KPI baseado no comprimento da string */
export function kpiFontSize(formattedValue: string): number {
  const len = formattedValue.length;
  if (len <=  5) return 18;
  if (len <=  8) return 16;
  if (len <= 11) return 14;
  if (len <= 14) return 12;
  if (len <= 18) return 11;
  return 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF_CONFIG — cores e estilos estáticos
// ─────────────────────────────────────────────────────────────────────────────

export const PDF_CONFIG = {
  colors: {
    primary:    DEFAULT_PDF_SETTINGS.primaryColor,
    secondary:  DEFAULT_PDF_SETTINGS.secondaryColor,
    success:    '#10b981',
    warning:    '#f59e0b',
    danger:     '#ef4444',
    dark:       '#1e293b',
    light:      '#f1f5f9',
    border:     '#e2e8f0',
    white:      '#ffffff',
    background: '#f8fafc',
    text:       '#1f2937',
    textLight:  '#6b7280',
    textMuted:  '#94a3b8',
    cardBg:     '#ffffff',
    tableAlt:   '#f8fafc',
    gradient:   { start: '#3b82f6', end: '#1d4ed8' },
  },

  typography: {
    title:         { fontSize: 24, fontWeight: 'bold',   color: '#1f2937' },
    subtitle:      { fontSize: 12, color: '#6b7280',     marginTop: 4 },
    sectionTitle:  { fontSize: 14, fontWeight: 'bold',   color: '#1e40af', marginBottom: 12, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    tableHeader:   { fontSize: 10, fontWeight: 'bold',   color: '#374151', backgroundColor: '#f3f4f6', padding: 8 },
    tableCell:     { fontSize: 10, color: '#4b5563',     padding: 8 },
    tableCellBold: { fontSize: 10, fontWeight: 'bold',   color: '#1f2937', padding: 8 },
    kpiLabel:      { fontSize: 7,  color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
    kpiValue:      { fontSize: 18, fontWeight: 'bold',   color: '#ffffff' },
    kpiSub:        { fontSize: 7,  color: 'rgba(255,255,255,0.75)' },
    chartTitle:    { fontSize: 8,  fontWeight: 'bold',   color: '#1e293b', textTransform: 'uppercase', letterSpacing: 0.5 },
    infoLabel:     { fontSize: 7,  fontWeight: 'bold',   textTransform: 'uppercase', marginBottom: 2 },
    infoValue:     { fontSize: 9,  color: '#1e293b',     fontWeight: 'bold' },
  },

  spacing: {
    page:    { padding: 40, paddingTop: 80, paddingBottom: 50 },
    section: { marginTop: 12, marginBottom: 8 },
    card:    { padding: 12, borderRadius: 8, gap: 4 },
    table:   { cellPadding: 6, borderRadius: 4 },
  },

  effects: {
    borderRadius: { sm: 2, md: 4, lg: 6, xl: 8 },
    shadows: {
      sm: { shadowColor: '#000000', shadowOpacity: 0.05, shadowRadius: 2 },
      md: { shadowColor: '#000000', shadowOpacity: 0.1,  shadowRadius: 4 },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS GLOBAIS
// ─────────────────────────────────────────────────────────────────────────────

export const commonStyles = StyleSheet.create({
  page: {
    padding:         40,
    paddingTop:      90,   // espaço para o header fixo (altura ~70px + margem)
    paddingBottom:   50,   // espaço para o footer fixo
    backgroundColor: '#ffffff',
    fontFamily:      'Helvetica',
    fontSize:        10,
  },

  // Header fixo no topo de cada página
  header: {
    position:      'absolute',
    top:           20,
    left:          40,
    right:         40,
    flexDirection: 'column',
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  headerLogo:     { width: 32, height: 32, objectFit: 'contain' },
  companyName:    { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  companyTagline: { fontSize: 7, letterSpacing: 0.5 },
  title:          { fontSize: 16, fontWeight: 'bold' },
  subtitle:       { fontSize: 9, marginTop: 2, opacity: 0.8 },

  // Footer fixo no fundo de cada página
  footer: {
    position:       'absolute',
    bottom:         15,
    left:           40,
    right:          40,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    fontSize:       7,
    paddingTop:     6,
    borderTopWidth: 0.5,
  },

  // Sections
  section:      { marginTop: 12, marginBottom: 8 },
  sectionTitle: {
    fontSize:          11,
    fontWeight:        'bold',
    color:             '#1e293b',
    marginBottom:      8,
    paddingBottom:     4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    letterSpacing:     0.3,
  },

  // Info Section
  infoSection: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    padding:        10,
    backgroundColor:'#f8fafc',
    borderRadius:   6,
    marginBottom:   12,
    borderWidth:    0.5,
    borderColor:    '#e2e8f0',
  },
  infoItem:  { flexDirection: 'column', flex: 1 },
  infoLabel: { fontSize: 6, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2, color: '#64748b', letterSpacing: 0.5 },
  infoValue: { fontSize: 9, color: '#1e293b', fontWeight: 'bold' },

  // ── TABELA — CORRECÇÃO CRÍTICA ────────────────────────────────────────────
  // REMOVIDO: flex: 1
  // flex:1 fazia a tabela expandir para preencher todo o espaço disponível,
  // forçando-a para uma nova página quando o conteúdo anterior já ocupava
  // mais de ~60% da página, e depois deixava um bloco branco enorme.
  // SEM flex:1 a tabela ocupa apenas o espaço dos seus próprios conteúdos.
  table: {
    width:           'auto',
    borderStyle:     'solid',
    borderWidth:     1,
    borderColor:     '#e2e8f0',
    borderRadius:    6,
    overflow:        'hidden',
    backgroundColor: '#ffffff',
    // flex: 1  ← REMOVIDO: causava páginas brancas em todos os relatórios
  },
  tableHeader: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor:   '#f1f5f9',
  },
  tableRow: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor:   '#ffffff',
    minHeight:         24,
  },
  tableRowAlt: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor:   '#f8fafc',
    minHeight:         24,
  },
  tableRowLast:    { flexDirection: 'row', backgroundColor: '#ffffff', minHeight: 24 },
  tableCell:       { padding: 6, fontSize: 8, color: '#4b5563' },
  tableCellHeader: { padding: 6, fontSize: 8, fontWeight: 'bold', color: '#374151' },
  tableCellBold:   { padding: 6, fontSize: 8, fontWeight: 'bold', color: '#1f2937' },

  // Summary Box
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding:         12,
    borderRadius:    6,
    marginTop:       8,
    borderWidth:     0.5,
    borderColor:     '#e2e8f0',
  },
  summaryRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingVertical:   4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: { fontSize: 9, color: '#4b5563' },
  summaryValue: { fontSize: 9, fontWeight: 'bold', color: '#1f2937' },

  // Status Badges
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      3,
    fontSize:          6,
    width:             60,
    fontWeight:        'bold',
    color:             '#ffffff',
    alignSelf:         'flex-start',
    textTransform:     'uppercase',
    letterSpacing:     0.5,
  },
  statusAvailable:   { backgroundColor: '#10b981' },
  statusMaintenance: { backgroundColor: '#f59e0b' },
  statusInactive:    { backgroundColor: '#64748b' },

  // Divider / Empty
  divider:    { borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', marginVertical: 8 },
  emptyState: { textAlign: 'center', fontSize: 10, paddingVertical: 30, color: '#9ca3af', fontStyle: 'italic' },

  // ── WATERMARK — CORRECÇÃO ──────────────────────────────────────────────────
  // REMOVIDO: zIndex: -1  (não existe em @react-pdf/renderer)
  // O watermark usa position: absolute + fixed para sobrepor o conteúdo.
  // Em react-pdf, a ordem de renderização determina a camada — o Watermark
  // deve ser o PRIMEIRO elemento renderizado dentro do <Page> para ficar
  // abaixo do conteúdo (last-painter-wins no PDF spec).
  watermarkContainer: {
    position:       'absolute',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    alignItems:     'center',
    justifyContent: 'center',
    // zIndex: -1  ← REMOVIDO: não funciona em react-pdf, causa layout issues
  },
  watermarkText: {
    fontSize:    72,
    fontWeight:  'bold',
    transform:   'rotate(-45deg)',
    letterSpacing: 8,
    opacity:     0.08,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  const s      = getPDFSettings();
  const suffix = s.showCurrency ? ' Kz' : '';

  if (s.valueFormat === 'full') {
    return value.toLocaleString('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + suffix;
  }

  // Compact
  if (value === 0)          return `0${suffix}`;
  if (value >= 1_000_000)   return `${(value / 1_000_000).toFixed(2)} M${suffix}`;
  if (value >= 1_000)       return `${(value / 1_000).toFixed(2)} K${suffix}`;
  return `${value.toFixed(2)}${suffix}`;
}

export function formatCurrencyCompact(value: number): string {
  const s = getPDFSettings();

  if (s.valueFormat === 'full') {
    return value.toLocaleString('pt-PT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}k`;
  return `${value}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatDistance(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)} M km`;
  if (km >= 1_000)     return `${(km / 1_000).toFixed(1)} k km`;
  return `${km.toLocaleString('pt-PT')} km`;
}

export function formatDistanceCompact(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(1)}M`;
  if (km >= 1_000)     return `${(km / 1_000).toFixed(1)}k`;
  return `${km}`;
}

export function formatLiters(liters: number): string {
  if (liters >= 1_000_000) return `${(liters / 1_000_000).toFixed(2)} M L`;
  if (liters >= 1_000)     return `${(liters / 1_000).toFixed(1)} k L`;
  return `${liters.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} L`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}