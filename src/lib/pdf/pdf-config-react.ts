// ========================================
// FILE: src/lib/pdf/pdf-config-react.ts
// ========================================
import { StyleSheet } from '@react-pdf/renderer';

// ==================== DADOS DINÂMICOS DA EMPRESA ====================
// Estes dados são preenchidos antes de gerar cada PDF
// via setPDFCompany() chamado no pdf-generator-react.ts

export interface PDFCompanyData {
  name:     string;
  tagline?: string;
  address?: string;
  phone?:   string;
  email?:   string;
  /** Base64 data URI do logo — lido do disco pelo processo main */
  logo?:    string | null;
}

let _company: PDFCompanyData = {
  name:    'FleetControl',
  tagline: 'Gestão de Frotas',
};

export function setPDFCompany(data: PDFCompanyData) {
  _company = { ...data };
}

export function getPDFCompany(): PDFCompanyData {
  return _company;
}

// ==================== CONFIGURAÇÕES GLOBAIS ====================

export const PDF_CONFIG = {
  colors: {
    primary:   '#2563eb',
    secondary: '#64748b',
    success:   '#10b981',
    warning:   '#f59e0b',
    danger:    '#ef4444',
    dark:      '#1e293b',
    light:     '#f1f5f9',
    border:    '#e2e8f0',
    white:     '#ffffff',
  },
};

// ==================== ESTILOS GLOBAIS ====================

export const commonStyles = StyleSheet.create({
  page: {
    padding:         40,
    paddingTop:      105, // header com 2 linhas: empresa + título
    paddingBottom:   60,
    backgroundColor: '#ffffff',
    fontFamily:      'Helvetica',
    fontSize:        10,
  },

  // ── Header ────────────────────────────────────────────────────────────
  header: {
    position:       'absolute',
    top:            20,
    left:           40,
    right:          40,
    flexDirection:  'column',   // empresa em cima, título em baixo
    paddingBottom:  10,
    borderBottom:   `2pt solid ${PDF_CONFIG.colors.primary}`,
  },

  // Lado esquerdo: logo + nome da empresa
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    flex:          1,
  },

  headerLogo: {
    width:        44,
    height:       44,
    objectFit:    'contain',
  },

  headerCompanyInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },

  companyName: {
    fontSize:    14,
    fontWeight:  'bold',
    color:       PDF_CONFIG.colors.primary,
    marginBottom: 1,
  },

  companyTagline: {
    fontSize: 7,
    color:    PDF_CONFIG.colors.secondary,
  },

  // Lado direito: título do relatório
  headerRight: {
    flexDirection: 'column',
    alignItems:    'flex-end',
  },

  title: {
    fontSize:   18,
    fontWeight: 'bold',
    color:      PDF_CONFIG.colors.primary,
  },

  subtitle: {
    fontSize:  9,
    color:     PDF_CONFIG.colors.secondary,
    marginTop: 2,
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    position:        'absolute',
    bottom:          20,
    left:            40,
    right:           40,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    fontSize:        7,
    color:           PDF_CONFIG.colors.secondary,
    borderTop:       `0.5pt solid ${PDF_CONFIG.colors.border}`,
    paddingTop:      6,
  },

  // ── Sections ──────────────────────────────────────────────────────────
  section: {
    marginTop:    16,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize:     12,
    fontWeight:   'bold',
    color:        PDF_CONFIG.colors.dark,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1pt solid ${PDF_CONFIG.colors.border}`,
  },

  // ── Info Section ──────────────────────────────────────────────────────
  infoSection: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    padding:         10,
    backgroundColor: PDF_CONFIG.colors.light,
    borderRadius:    4,
    marginBottom:    12,
  },

  infoItem: {
    flexDirection: 'column',
  },

  infoLabel: {
    fontSize:      7,
    fontWeight:    'bold',
    color:         PDF_CONFIG.colors.secondary,
    textTransform: 'uppercase',
    marginBottom:  2,
  },

  infoValue: {
    fontSize:   9,
    color:      PDF_CONFIG.colors.dark,
    fontWeight: 'bold',
  },

  // ── Table ─────────────────────────────────────────────────────────────
  table: {
    width:        'auto',
    borderStyle:  'solid',
    borderWidth:  1,
    borderColor:  PDF_CONFIG.colors.border,
    borderRadius: 4,
    overflow:     'hidden',
  },

  tableHeader: {
    flexDirection:     'row',
    backgroundColor:   PDF_CONFIG.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
  },

  tableRow: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
  },

  tableRowAlt: {
    flexDirection:     'row',
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
    backgroundColor:   '#f8fafc',
  },

  tableRowLast: {
    flexDirection: 'row',
  },

  tableCell: {
    padding:  8,
    fontSize: 9,
    color:    PDF_CONFIG.colors.dark,
  },

  tableCellHeader: {
    padding:    8,
    fontSize:   9,
    fontWeight: 'bold',
    color:      PDF_CONFIG.colors.white,
  },

  tableCellBold: {
    padding:    8,
    fontSize:   9,
    fontWeight: 'bold',
    color:      PDF_CONFIG.colors.dark,
  },

  // ── Summary Box ───────────────────────────────────────────────────────
  summaryBox: {
    backgroundColor: PDF_CONFIG.colors.light,
    padding:         12,
    borderRadius:    4,
    marginTop:       8,
  },

  summaryRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingVertical:   4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_CONFIG.colors.border,
  },

  summaryLabel:     { fontSize: 9, color: PDF_CONFIG.colors.dark },
  summaryValue:     { fontSize: 9, fontWeight: 'bold', color: PDF_CONFIG.colors.dark },
  summaryHighlight: { fontSize: 9, fontWeight: 'bold', color: PDF_CONFIG.colors.primary },

  // ── Status Badges ─────────────────────────────────────────────────────
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      2,
    fontSize:          7,
    fontWeight:        'bold',
    color:             PDF_CONFIG.colors.white,
    alignSelf:         'flex-start',
    margin:            6,
  },

  statusAvailable:  { backgroundColor: PDF_CONFIG.colors.success },
  statusInUse:      { backgroundColor: PDF_CONFIG.colors.primary },
  statusMaintenance:{ backgroundColor: PDF_CONFIG.colors.warning },
  statusInactive:   { backgroundColor: PDF_CONFIG.colors.secondary },

  // ── Divider ───────────────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_CONFIG.colors.border,
    marginVertical:    8,
  },

  // ── Empty State ───────────────────────────────────────────────────────
  emptyState: {
    textAlign:     'center',
    color:         PDF_CONFIG.colors.secondary,
    fontSize:      10,
    paddingVertical: 30,
  },
});

// ==================== FORMATTERS ====================

export function formatCurrency(value: number): string {
  return `${(value / 1000).toFixed(2)} K Kz`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDistance(km: number): string {
  return `${km.toLocaleString('pt-PT')} km`;
}

export function formatLiters(liters: number): string {
  return `${liters.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} L`;
}