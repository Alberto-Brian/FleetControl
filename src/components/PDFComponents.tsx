// ========================================
// FILE: src/components/PDFComponents.tsx (MELHORADO)
// ========================================
import React from 'react';
import { Text, View, Image, Svg, Rect } from '@react-pdf/renderer';
import {
  commonStyles,
  PDF_CONFIG,
  getPDFCompany,
  getPDFSettings,
  getPDFAppVersion
} from '@/lib/pdf/pdf-config-react';
import { pdfT } from '@/lib/pdf/pdf-translations';

// ─────────────────────────────────────────────────────────────────────────────
// Watermark — camada fixa sobre toda a página
// ─────────────────────────────────────────────────────────────────────────────

export const Watermark: React.FC = () => {
  const s       = getPDFSettings();
  const company = getPDFCompany();
  if (!s.watermarkEnabled) return null;

  if (s.watermarkUseLogo && company.logo) {
    return (
      <View style={commonStyles.watermarkContainer} fixed>
        <Image
          src={company.logo}
          style={{
            width:   220,
            height:  220,
            opacity: s.watermarkOpacity,
          }}
        />
      </View>
    );
  }

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
// Header — design aprimorado com hierarquia visual
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
        { borderBottomColor: s.primaryColor },
      ]}
      fixed
    >
      {/* Linha 1: logo + nome da empresa */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {company.logo ? (
          <Image src={company.logo} style={commonStyles.headerLogo} />
        ) : (
          <View style={{
            width: 40, height: 40, borderRadius: 6,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: s.primaryColor,
            shadowColor: '#000000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
              {company.name?.charAt(0)?.toUpperCase() ?? 'F'}
            </Text>
          </View>
        )}

        <View style={{ marginLeft: 12 }}>
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
// Footer — condicional com design melhorado
// ─────────────────────────────────────────────────────────────────────────────

export const Footer: React.FC = () => {
  const s       = getPDFSettings();
  const t       = pdfT();
  const company = getPDFCompany();
  const version = getPDFAppVersion();

  if (!s.showFooter) return null;

  return (
    <View
      style={[
        commonStyles.footer,
        {
          borderTopColor: PDF_CONFIG.colors.border,
          color:          s.secondaryColor,
        },
      ]}
      fixed
      // @ts-ignore
      render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: s.primaryColor }}>
              {company.name}
            </Text>
            <Text style={{ fontSize: 7, color: s.secondaryColor }}>•</Text>
            <Text style={{ fontSize: 7, color: s.secondaryColor }}>
              {t.footer.generatedBy} v{version}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 7, color: s.secondaryColor }}>
              {t.footer.confidential}
            </Text>
            <Text style={{ fontSize: 7, color: s.secondaryColor }}>|</Text>
            <Text style={{ fontSize: 7, color: s.secondaryColor }}>
              {t.page} {pageNumber} {t.of} {totalPages}
            </Text>
          </View>
        </View>
      )}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoSection — design de cards aprimorado
// ─────────────────────────────────────────────────────────────────────────────

interface InfoSectionProps {
  items: { label: string; value: string | number; icon?: string }[];
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
// SectionTitle — com design de hierarquia visual
// ─────────────────────────────────────────────────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode;
  icon?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children, icon }) => {
  const s = getPDFSettings();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: PDF_CONFIG.colors.border, paddingBottom: 6 }}>
      {icon && (
        <View style={{ 
          width: 20, 
          height: 20, 
          borderRadius: 4, 
          backgroundColor: s.primaryColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
        }}>
          <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>{icon}</Text>
        </View>
      )}
      <Text
        style={[
          commonStyles.sectionTitle,
          { color: s.primaryColor },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — com design moderno e ícones
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const sizes = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 6, borderRadius: 2 },
    md: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 7, borderRadius: 4 },
    lg: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 8, borderRadius: 4 },
  };

  const config: Record<string, { bgColor: string; label: string; textColor?: string }> = {
    available:   { bgColor: PDF_CONFIG.colors.success,  label: t.status.available, textColor: '#ffffff' },
    in_use:      { bgColor: s.primaryColor,             label: t.status.in_use, textColor: '#ffffff' },
    maintenance: { bgColor: PDF_CONFIG.colors.warning,  label: t.status.maintenance, textColor: '#ffffff' },
    inactive:    { bgColor: PDF_CONFIG.colors.secondary,label: t.status.inactive, textColor: '#ffffff' },
    active:      { bgColor: PDF_CONFIG.colors.success,  label: t.status.active, textColor: '#ffffff' },
    on_leave:    { bgColor: PDF_CONFIG.colors.warning,  label: t.status.on_leave, textColor: '#ffffff' },
    on_trip:     { bgColor: s.primaryColor,             label: t.status.on_trip, textColor: '#ffffff' },
    completed:   { bgColor: PDF_CONFIG.colors.success,  label: t.status.completed, textColor: '#ffffff' },
    in_progress: { bgColor: s.primaryColor,             label: t.status.in_progress, textColor: '#ffffff' },
    cancelled:   { bgColor: PDF_CONFIG.colors.danger,   label: t.status.cancelled, textColor: '#ffffff' },
    pending:     { bgColor: PDF_CONFIG.colors.warning,  label: t.status.pending, textColor: '#ffffff' },
    paid:        { bgColor: PDF_CONFIG.colors.success,  label: t.status.paid, textColor: '#ffffff' },
    scheduled:   { bgColor: PDF_CONFIG.colors.secondary, label: t.status.scheduled, textColor: '#ffffff' },
    overdue:     { bgColor: PDF_CONFIG.colors.danger,   label: 'ATRASADO', textColor: '#ffffff' },
    offline:     { bgColor: PDF_CONFIG.colors.danger, label: t.status.offline, textColor: '#ffffff' },
    terminated:  { bgColor: PDF_CONFIG.colors.danger, label: t.status.terminated, textColor: '#ffffff' },
  };

  const cfg = config[status] ?? { bgColor: PDF_CONFIG.colors.secondary, label: status.toUpperCase(), textColor: '#ffffff' };
  const sizeStyles = sizes[size];

  return (
    <Text 
      style={[
        commonStyles.statusBadge, 
        { 
          backgroundColor: cfg.bgColor,
          color: cfg.textColor,
          ...sizeStyles,
        }
      ]}
    >
      {cfg.label}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SummaryBox — design premium com highlight
// ─────────────────────────────────────────────────────────────────────────────

interface SummaryBoxProps {
  items: { label: string; value: string | number; highlight?: boolean; trend?: 'up' | 'down' | 'neutral' }[];
  layout?: 'horizontal' | 'vertical';
}

export const SummaryBox: React.FC<SummaryBoxProps> = ({ items, layout = 'vertical' }) => {
  const s = getPDFSettings();
  
  if (layout === 'horizontal') {
    return (
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: '#f8fafc', 
        borderRadius: 6, 
        padding: 12,
        borderWidth: 0.5,
        borderColor: '#e2e8f0',
        gap: 12,
      }}>
        {items.map((item, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' }}>
              {item.label}
            </Text>
            <Text style={{ 
              fontSize: item.highlight ? 14 : 12, 
              fontWeight: 'bold', 
              color: item.highlight ? s.primaryColor : '#1f2937' 
            }}>
              {String(item.value)}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={commonStyles.summaryBox}>
      {items.map((item, i) => (
        <View key={i} style={[
          commonStyles.summaryRow,
          item.highlight && { backgroundColor: '#eff6ff', marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 4 }
        ]}>
          <Text style={[
            commonStyles.summaryLabel,
            item.highlight && { color: s.primaryColor, fontWeight: 'bold' }
          ]}>{item.label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {item.trend && (
              <Text style={{ 
                fontSize: 8, 
                color: item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#6b7280'
              }}>
                {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
              </Text>
            )}
            <Text
              style={
                item.highlight
                  ? { fontSize: 10, fontWeight: 'bold', color: s.primaryColor }
                  : commonStyles.summaryValue
              }
            >
              {String(item.value)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TableHeader — com cor dinâmica e design aprimorado
// ─────────────────────────────────────────────────────────────────────────────

interface TableHeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'dark';
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, variant = 'default' }) => {
  const s = getPDFSettings();
  
  const variants = {
    default: { backgroundColor: s.primaryColor },
    light: { backgroundColor: '#f1f5f9' },
    dark: { backgroundColor: '#1e293b' },
  };

  return (
    <View style={[
      commonStyles.tableHeader, 
      variants[variant],
      variant !== 'default' && { borderBottomWidth: 2, borderBottomColor: '#e2e8f0' }
    ]}>
      {children}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Divider / EmptyState — melhorados
// ─────────────────────────────────────────────────────────────────────────────

export const Divider: React.FC = () => (
  <View style={commonStyles.divider} />
);

interface EmptyStateProps {
  message?: string;
  icon?: string;
  suggestion?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon = '∅',
  suggestion 
}) => {
  const s = getPDFSettings();
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 40,
      backgroundColor: '#f8fafc',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderStyle: 'dashed',
    }}>
      <Text style={{ 
        fontSize: 24, 
        color: s.secondaryColor, 
        marginBottom: 8,
        opacity: 0.5,
      }}>
        {icon}
      </Text>
      <Text style={[commonStyles.emptyState, { color: s.secondaryColor }]}>
        {message ?? 'Nenhum dado encontrado.'}
      </Text>
      {suggestion && (
        <Text style={{ 
          fontSize: 9, 
          color: '#9ca3af', 
          marginTop: 4,
          fontStyle: 'italic',
        }}>
          {suggestion}
        </Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Card — novo componente para agrupar conteúdo
// ─────────────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  title?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, title, noPadding = false }) => {
  const s = getPDFSettings();
  return (
    <View style={{
      backgroundColor: '#ffffff',
      borderRadius: 6,
      borderWidth: 0.5,
      borderColor: '#e2e8f0',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      {title && (
        <View style={{
          backgroundColor: '#f8fafc',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 0.5,
          borderBottomColor: '#e2e8f0',
        }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', color: s.primaryColor }}>
            {title}
          </Text>
        </View>
      )}
      <View style={{ padding: noPadding ? 0 : 12 }}>
        {children}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HighlightBox — destaque para informações importantes
// ─────────────────────────────────────────────────────────────────────────────

interface HighlightBoxProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
}

export const HighlightBox: React.FC<HighlightBoxProps> = ({ children, variant = 'info' }) => {
  const s = getPDFSettings();
  
  const variants = {
    info: { backgroundColor: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' },
    success: { backgroundColor: '#ecfdf5', borderColor: '#10b981', color: '#065f46' },
    warning: { backgroundColor: '#fffbeb', borderColor: '#f59e0b', color: '#92400e' },
    danger: { backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#991b1b' },
  };

  const style = variants[variant];

  return (
    <View style={{
      backgroundColor: style.backgroundColor,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: style.borderColor,
      padding: 12,
      marginVertical: 8,
    }}>
      {children}
    </View>
  );
};