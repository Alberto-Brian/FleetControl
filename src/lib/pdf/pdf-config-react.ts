// ========================================
// FILE: src/lib/pdf/pdf-config-react.ts
// ========================================
import { StyleSheet } from '@react-pdf/renderer';

// ==================== CONFIGURAÇÕES GLOBAIS ====================

export const PDF_CONFIG = {
  company: {
    name: 'FleetControl',
    tagline: 'Gestão de Frotas',
    address: 'Luanda, Angola',
    phone: '+244 xxx xxx xxx',
    email: 'contato@fleetcontrol.ao',
    website: 'www.fleetcontrol.ao',
  },
  
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    dark: '#1e293b',
    light: '#f1f5f9',
    border: '#e2e8f0',
    white: '#ffffff',
  },
};

// ==================== ESTILOS GLOBAIS ====================

export const commonStyles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    paddingTop: 80,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  
  // Header
  header: {
    position: 'absolute',
    top: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottom: `2pt solid ${PDF_CONFIG.colors.primary}`,
  },
  
  headerLeft: {
    flexDirection: 'column',
  },
  
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.primary,
    marginBottom: 2,
  },
  
  companyTagline: {
    fontSize: 8,
    color: PDF_CONFIG.colors.secondary,
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.primary,
  },
  
  subtitle: {
    fontSize: 12,
    color: PDF_CONFIG.colors.secondary,
    marginTop: 2,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: PDF_CONFIG.colors.secondary,
  },
  
  // Sections
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.dark,
    marginBottom: 10,
  },
  
  // Info Section
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: PDF_CONFIG.colors.light,
    borderRadius: 4,
    marginBottom: 15,
  },
  
  infoItem: {
    flexDirection: 'column',
  },
  
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 10,
    color: PDF_CONFIG.colors.dark,
    fontWeight: 'bold',
  },
  
  // Table
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: PDF_CONFIG.colors.border,
    borderRadius: 4,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_CONFIG.colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
  },
  
  tableRowLast: {
    flexDirection: 'row',
  },
  
  tableCell: {
    padding: 8,
    fontSize: 9,
    color: PDF_CONFIG.colors.dark,
  },
  
  tableCellHeader: {
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.white,
  },
  
  tableCellBold: {
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.dark,
  },
  
  // Summary Box
  summaryBox: {
    backgroundColor: PDF_CONFIG.colors.light,
    padding: 15,
    borderRadius: 4,
    marginTop: 10,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_CONFIG.colors.border,
  },
  
  summaryLabel: {
    fontSize: 10,
    color: PDF_CONFIG.colors.dark,
  },
  
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.dark,
  },
  
  summaryHighlight: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.primary,
  },
  
  // Status Badges
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 'bold',
    color: PDF_CONFIG.colors.white,
  },
  
  statusAvailable: {
    backgroundColor: PDF_CONFIG.colors.success,
  },
  
  statusInUse: {
    backgroundColor: PDF_CONFIG.colors.primary,
  },
  
  statusMaintenance: {
    backgroundColor: PDF_CONFIG.colors.warning,
  },
  
  statusInactive: {
    backgroundColor: PDF_CONFIG.colors.secondary,
  },
  
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_CONFIG.colors.border,
    marginVertical: 10,
  },
  
  // Empty State
  emptyState: {
    textAlign: 'center',
    color: PDF_CONFIG.colors.secondary,
    fontSize: 10,
    paddingVertical: 30,
  },
});

// ==================== FORMATTERS ====================

export function formatCurrency(value: number): string {
  return `${(value / 1000).toFixed(2)} K Kz`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDistance(km: number): string {
  return `${km.toLocaleString('pt-PT')} km`;
}

export function formatLiters(liters: number): string {
  return `${liters.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} L`;
}