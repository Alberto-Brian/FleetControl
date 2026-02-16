// ========================================
// FILE: src/lib/pdf/components/PDFComponents.tsx
// ========================================
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { commonStyles, PDF_CONFIG, formatDateTime } from '@/lib/pdf/pdf-config-react';

// ==================== HEADER ====================

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <View style={commonStyles.header} fixed>
    <View style={commonStyles.headerLeft}>
      <Text style={commonStyles.companyName}>{PDF_CONFIG.company.name}</Text>
      <Text style={commonStyles.companyTagline}>{PDF_CONFIG.company.tagline}</Text>
    </View>
    <View style={commonStyles.headerRight}>
      <Text style={commonStyles.title}>{title}</Text>
      {subtitle && <Text style={commonStyles.subtitle}>{subtitle}</Text>}
    </View>
  </View>
);

// ==================== FOOTER ====================

interface FooterProps {
  pageNumber: number;
  totalPages: number;
}

export const Footer: React.FC<FooterProps> = ({ pageNumber, totalPages }) => (
  <View style={commonStyles.footer} fixed>
    <Text>{PDF_CONFIG.company.name} - {PDF_CONFIG.company.tagline}</Text>
    <Text>Gerado em: {formatDateTime(new Date())}</Text>
    <Text>Página {pageNumber} de {totalPages}</Text>
  </View>
);

// ==================== INFO SECTION ====================

interface InfoItem {
  label: string;
  value: string | number;
}

interface InfoSectionProps {
  items: InfoItem[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ items }) => (
  <View style={commonStyles.infoSection}>
    {items.map((item, index) => (
      <View key={index} style={commonStyles.infoItem}>
        <Text style={commonStyles.infoLabel}>{item.label}</Text>
        <Text style={commonStyles.infoValue}>{item.value || '-'}</Text>
      </View>
    ))}
  </View>
);

// ==================== SECTION TITLE ====================

interface SectionTitleProps {
  children: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <Text style={commonStyles.sectionTitle}>{children}</Text>
);

// ==================== STATUS BADGE ====================

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusMap: Record<string, { label: string; style: any }> = {
    available: { label: 'DISPONÍVEL', style: commonStyles.statusAvailable },
    in_use: { label: 'EM USO', style: commonStyles.statusInUse },
    maintenance: { label: 'MANUTENÇÃO', style: commonStyles.statusMaintenance },
    inactive: { label: 'INATIVO', style: commonStyles.statusInactive },
    pending: { label: 'PENDENTE', style: commonStyles.statusMaintenance },
    completed: { label: 'CONCLUÍDO', style: commonStyles.statusAvailable },
    cancelled: { label: 'CANCELADO', style: commonStyles.statusInactive },
    paid: { label: 'PAGO', style: commonStyles.statusAvailable },
    scheduled: { label: 'AGENDADO', style: commonStyles.statusInUse },
    in_progress: { label: 'EM ANDAMENTO', style: commonStyles.statusInUse },
  };

  const statusInfo = statusMap[status] || { label: status.toUpperCase(), style: {} };

  return (
    <View style={[commonStyles.statusBadge, statusInfo.style]}>
      <Text>{statusInfo.label}</Text>
    </View>
  );
};

// ==================== SUMMARY BOX ====================

interface SummaryItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface SummaryBoxProps {
  items: SummaryItem[];
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ items }) => (
  <View style={commonStyles.summaryBox}>
    {items.map((item, index) => (
      <View key={index} style={commonStyles.summaryRow}>
        <Text style={commonStyles.summaryLabel}>{item.label}</Text>
        <Text style={item.highlight ? commonStyles.summaryHighlight : commonStyles.summaryValue}>
          {item.value}
        </Text>
      </View>
    ))}
  </View>
);

// ==================== DIVIDER ====================

export const Divider: React.FC = () => (
  <View style={commonStyles.divider} />
);

// ==================== EMPTY STATE ====================

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <Text style={commonStyles.emptyState}>{message}</Text>
);