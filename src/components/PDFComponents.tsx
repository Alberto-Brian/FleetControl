// ========================================
// FILE: src/components/PDFComponents.tsx
// ========================================
import React from 'react';
import { Text, View, Image, Page } from '@react-pdf/renderer';
import {
  commonStyles,
  PDF_CONFIG,
  getPDFCompany,
  getPDFSettings,
} from '@/lib/pdf/pdf-config-react';
import { pdfT } from '@/lib/pdf/pdf-translations';

// ─────────────────────────────────────────────────────────────────────────────
// Watermark — camada fixa sobre toda a página
// Activada por getPDFSettings().watermarkEnabled
// ─────────────────────────────────────────────────────────────────────────────

export const Watermark: React.FC = () => {
  const s = getPDFSettings();
  if (!s.watermarkEnabled) return null;

  return (
    <View style={commonStyles.watermarkContainer} fixed>
      <Text
        style={[
          commonStyles.watermarkText,
          {
            color:   s.primaryColor,
            opacity: s.watermarkOpacity,
          },
        ]}
      >
        {s.watermarkText}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Header — empresa em cima, título do relatório em baixo
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title:     string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const company = getPDFCompany();
  const s       = getPDFSettings();

  return (
    <View
      style={[
        commonStyles.header,
        { borderBottomWidth: 2, borderBottomColor: s.primaryColor },
      ]}
      fixed
    >
      {/* Linha 1: logo + nome da empresa */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {company.logo ? (
          <Image src={company.logo} style={commonStyles.headerLogo} />
        ) : (
          <View style={{
            width: 36, height: 36, borderRadius: 4,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: s.primaryColor,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              {company.name?.charAt(0)?.toUpperCase() ?? 'F'}
            </Text>
          </View>
        )}

        <View style={{ marginLeft: 8 }}>
          <Text style={[commonStyles.companyName, { color: s.primaryColor }]}>
            {company.name}
          </Text>
          {company.tagline && (
            <Text style={[commonStyles.companyTagline, { color: s.secondaryColor }]}>
              {company.tagline}
            </Text>
          )}
        </View>
      </View>

      {/* Linha 2: título do relatório alinhado à direita */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[commonStyles.title, { color: s.primaryColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[commonStyles.subtitle, { color: s.secondaryColor }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Footer — condicional: só renderiza se getPDFSettings().showFooter === true
// ─────────────────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const s       = getPDFSettings();
  const t       = pdfT();
  const company = getPDFCompany();

  if (!s.showFooter) return null;

  return (
    <View
      style={[
        commonStyles.footer,
        {
          borderTopWidth: 0.5,
          borderTopColor: PDF_CONFIG.colors.border,
          color:          s.secondaryColor,
        },
      ]}
      fixed
      // @ts-ignore — react-pdf injeta pageNumber/totalPages em runtime
      render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
        <>
          <Text>{company.name} — {new Date().toLocaleDateString('pt-PT')}</Text>
          <Text>{t.page} {pageNumber} {t.of} {totalPages}</Text>
        </>
      )}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoSection
// ─────────────────────────────────────────────────────────────────────────────

interface InfoSectionProps {
  items: { label: string; value: string | number }[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ items }) => {
  const s = getPDFSettings();
  return (
    <View style={commonStyles.infoSection}>
      {items.map((item, i) => (
        <View key={i} style={commonStyles.infoItem}>
          <Text style={[commonStyles.infoLabel, { color: s.secondaryColor }]}>
            {item.label}
          </Text>
          <Text style={commonStyles.infoValue}>{String(item.value)}</Text>
        </View>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SectionTitle
// ─────────────────────────────────────────────────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
  const s = getPDFSettings();
  return (
    <Text
      style={[
        commonStyles.sectionTitle,
        { borderBottomWidth: 1, borderBottomColor: PDF_CONFIG.colors.border },
      ]}
    >
      {children}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const config: Record<string, { bgColor: string; label: string }> = {
    available:   { bgColor: PDF_CONFIG.colors.success,  label: t.status.available   },
    in_use:      { bgColor: s.primaryColor,             label: t.status.in_use      },
    maintenance: { bgColor: PDF_CONFIG.colors.warning,  label: t.status.maintenance },
    inactive:    { bgColor: PDF_CONFIG.colors.secondary,label: t.status.inactive    },
    // Drivers
    active:      { bgColor: PDF_CONFIG.colors.success,  label: t.status.available   },
    on_leave:    { bgColor: PDF_CONFIG.colors.warning,  label: t.status.maintenance },
    // Trips
    completed:   { bgColor: PDF_CONFIG.colors.success,  label: t.status.available   },
    in_progress: { bgColor: s.primaryColor,             label: t.status.in_use      },
    cancelled:   { bgColor: PDF_CONFIG.colors.danger,   label: t.status.inactive    },
    // Maintenance / Expenses
    pending:     { bgColor: PDF_CONFIG.colors.warning,  label: t.status.maintenance },
    paid:        { bgColor: PDF_CONFIG.colors.success,  label: t.status.available   },
    overdue:     { bgColor: PDF_CONFIG.colors.danger,   label: t.status.inactive    },
  };

  const cfg = config[status] ?? { bgColor: PDF_CONFIG.colors.secondary, label: status };

  return (
    <Text style={[commonStyles.statusBadge, { backgroundColor: cfg.bgColor }]}>
      {cfg.label}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SummaryBox — condicional: respeitado por getPDFSettings().showSummary
// O controlo showSummary é feito nos templates (passam null quando desactivado)
// ─────────────────────────────────────────────────────────────────────────────

interface SummaryBoxProps {
  items: { label: string; value: string | number; highlight?: boolean }[];
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ items }) => {
  const s = getPDFSettings();
  return (
    <View style={commonStyles.summaryBox}>
      {items.map((item, i) => (
        <View key={i} style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>{item.label}</Text>
          <Text
            style={
              item.highlight
                ? { fontSize: 9, fontWeight: 'bold', color: s.primaryColor }
                : commonStyles.summaryValue
            }
          >
            {String(item.value)}
          </Text>
        </View>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TableHeader — linha de cabeçalho da tabela com cor dinâmica
// ─────────────────────────────────────────────────────────────────────────────

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  const s = getPDFSettings();
  return (
    <View style={[commonStyles.tableHeader, { backgroundColor: s.primaryColor }]}>
      {children}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Divider / EmptyState
// ─────────────────────────────────────────────────────────────────────────────

export const Divider: React.FC = () => (
  <View style={commonStyles.divider} />
);

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  const s = getPDFSettings();
  return (
    <Text style={[commonStyles.emptyState, { color: s.secondaryColor }]}>
      {message ?? 'Nenhum dado encontrado.'}
    </Text>
  );
};