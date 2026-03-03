// ========================================
// FILE: src/components/PDFComponents.tsx
// ========================================
// Header agora mostra logo + nome da empresa dinamicamente.
// Os dados vêm de getPDFCompany() (preenchido antes de gerar o PDF).
// ========================================
import React from 'react';
import { Text, View, Image } from '@react-pdf/renderer';
import { commonStyles, PDF_CONFIG, getPDFCompany } from '@/lib/pdf/pdf-config-react';
import { pdfT } from '@/lib/pdf/pdf-translations';

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title:    string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const company = getPDFCompany();

  return (
    <View style={commonStyles.header} fixed>
      {/* Linha 1: logo + nome empresa (esquerda) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {company.logo ? (
          <Image src={company.logo} style={commonStyles.headerLogo} />
        ) : (
          <View style={{
            width: 36, height: 36,
            backgroundColor: PDF_CONFIG.colors.primary,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: PDF_CONFIG.colors.white, fontSize: 16, fontWeight: 'bold' }}>
              {company.name?.charAt(0)?.toUpperCase() ?? 'F'}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: 8 }}>
          <Text style={commonStyles.companyName}>{company.name}</Text>
          {company.tagline && (
            <Text style={commonStyles.companyTagline}>{company.tagline}</Text>
          )}
        </View>
      </View>

      {/* Linha 2: título do relatório (direita) */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={commonStyles.title}>{title}</Text>
        {subtitle && <Text style={commonStyles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const t       = pdfT();
  const company = getPDFCompany();

  return (
    <View
      style={commonStyles.footer}
      fixed
      // @ts-ignore — react-pdf injeta pageNumber/totalPages no render prop em runtime
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
// Restantes componentes (sem alterações)
// ─────────────────────────────────────────────────────────────────────────────

interface InfoSectionProps {
  items: { label: string; value: string }[];
}

export const InfoSection: React.FC<InfoSectionProps> = ({ items }) => (
  <View style={commonStyles.infoSection}>
    {items.map((item, i) => (
      <View key={i} style={commonStyles.infoItem}>
        <Text style={commonStyles.infoLabel}>{item.label}</Text>
        <Text style={commonStyles.infoValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
  <Text style={commonStyles.sectionTitle}>{children}</Text>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const t = pdfT();

  const config: Record<string, { style: any; label: string }> = {
    available:   { style: commonStyles.statusAvailable,   label: t.status.available   },
    in_use:      { style: commonStyles.statusInUse,       label: t.status.in_use      },
    maintenance: { style: commonStyles.statusMaintenance, label: t.status.maintenance },
    inactive:    { style: commonStyles.statusInactive,    label: t.status.inactive    },
  };

  const cfg = config[status] ?? config.inactive;
  return (
    <Text style={[commonStyles.statusBadge, cfg.style]}>{cfg.label}</Text>
  );
};

interface SummaryBoxProps {
  items: { label: string; value: string | number; highlight?: boolean }[];
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ items }) => (
  <View style={commonStyles.summaryBox}>
    {items.map((item, i) => (
      <View key={i} style={commonStyles.summaryRow}>
        <Text style={commonStyles.summaryLabel}>{item.label}</Text>
        <Text style={item.highlight ? commonStyles.summaryHighlight : commonStyles.summaryValue}>
          {String(item.value)}
        </Text>
      </View>
    ))}
  </View>
);

export const Divider: React.FC = () => (
  <View style={commonStyles.divider} />
);

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <Text style={commonStyles.emptyState}>{message ?? 'Nenhum dado encontrado.'}</Text>
);