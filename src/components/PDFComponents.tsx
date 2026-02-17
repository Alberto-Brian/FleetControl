// ========================================
// FILE: src/lib/pdf/components/PDFComponents.tsx
// ========================================
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { commonStyles, formatDateTime } from '@/lib/pdf/pdf-config-react';
import { pdfT } from '@/lib/pdf/pdf-translations';

// ==================== HEADER ====================

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const t = pdfT();

  return (
    <View style={commonStyles.header} fixed>
      <View style={commonStyles.headerLeft}>
        <Text style={commonStyles.companyName}>{t.companyName}</Text>
        <Text style={commonStyles.companyTagline}>{t.companyTagline}</Text>
      </View>
      <View style={commonStyles.headerRight}>
        <Text style={commonStyles.title}>{title}</Text>
        {subtitle && <Text style={commonStyles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

// ==================== FOOTER (PAGINAÇÃO DINÂMICA) ====================

export const Footer: React.FC = () => {
  const t = pdfT();

  return (
    <View style={commonStyles.footer} fixed>
      <Text>{t.companyName} - {t.companyTagline}</Text>
      <Text>{t.generatedAt}: {formatDateTime(new Date())}</Text>

      {/* ✅ render prop do React-PDF para paginação dinâmica */}
      <Text
        render={({ pageNumber, totalPages }) =>
          `${t.page} ${pageNumber} ${t.of} ${totalPages}`
        }
      />
    </View>
  );
};

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
  const t = pdfT();

  const statusMap: Record<string, { label: string; style: any }> = {
    available:   { label: t.status.available,   style: commonStyles.statusAvailable   },
    in_use:      { label: t.status.in_use,      style: commonStyles.statusInUse       },
    maintenance: { label: t.status.maintenance, style: commonStyles.statusMaintenance },
    inactive:    { label: t.status.inactive,    style: commonStyles.statusInactive    },
    active:      { label: t.status.active,      style: commonStyles.statusAvailable   },
    on_leave:    { label: t.status.on_leave,    style: commonStyles.statusMaintenance },
    terminated:  { label: t.status.terminated,  style: commonStyles.statusInactive    },
    pending:     { label: t.status.pending,     style: commonStyles.statusMaintenance },
    completed:   { label: t.status.completed,   style: commonStyles.statusAvailable   },
    cancelled:   { label: t.status.cancelled,   style: commonStyles.statusInactive    },
    paid:        { label: t.status.paid,        style: commonStyles.statusAvailable   },
    scheduled:   { label: t.status.scheduled,   style: commonStyles.statusInUse       },
    in_progress: { label: t.status.in_progress, style: commonStyles.statusInUse       },
  };

  const statusInfo = statusMap[status] ?? { label: status.toUpperCase(), style: {} };

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