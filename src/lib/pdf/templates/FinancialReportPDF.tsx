// ========================================
// FILE: src/lib/pdf/templates/FinancialReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatCurrency, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, KeyValueRows, EmptyNote, DonutBox, AreaChart
} from '../report-design';

interface FinancialReportProps { expenses: any[]; stats: any; dateRange: { start: string; end: string }; }

export const FinancialReportPDF: React.FC<FinancialReportProps> = ({ expenses, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const costBreakdown = [
    { label: t.stats.fuel,            value: stats?.fuel        ?? 0, color: '#06b6d4'                    },
    { label: t.stats.maintenances,    value: stats?.maintenance ?? 0, color: PDF_CONFIG.colors.warning    },
    { label: t.stats.generalExpenses, value: stats?.expenses    ?? 0, color: s.primaryColor               },
    { label: t.stats.fines,           value: stats?.fines       ?? 0, color: PDF_CONFIG.colors.danger     },
  ].filter(d => d.value > 0);

  // Despesas por mês
  const byMonth = (() => {
    if (!expenses?.length) return { labels: [], values: [] };
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const d   = new Date(e.expense_date);
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      map.set(key, (map.get(key) ?? 0) + (e.amount ?? 0));
    });
    const entries = Array.from(map.entries()).slice(-7);
    return {
      labels: entries.map(e => e[0]),
      values: entries.map(e => Math.round(e[1] / 1000)),
    };
  })();

  const categoryBreakdown = (stats?.byCategory ?? []).slice(0, 8).map((c: any) => ({
    label: c.name,
    value: c.total ?? 0,
  }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title={t.reports.financial}
          subtitle={`${expenses?.length ?? 0} ${t.total.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalGeneral,    value: formatCurrency(stats?.total ?? 0),       icon: 'dollar', color: PDF_CONFIG.colors.danger  },
          { label: t.stats.fuel,            value: formatCurrency(stats?.fuel ?? 0),        icon: 'fuel',   color: '#06b6d4'                 },
          { label: t.stats.maintenances,    value: formatCurrency(stats?.maintenance ?? 0), icon: 'wrench', color: PDF_CONFIG.colors.warning },
          { label: t.stats.generalExpenses, value: formatCurrency(stats?.expenses ?? 0),    icon: 'dollar', color: s.primaryColor            },
        ]} />

        {s.showCharts && (costBreakdown.length > 0 || byMonth.labels.length > 1) && (
          <View style={styles.twoCol}>
            <AnalysisBox title={t.sections.expensesByCategory}>
              {costBreakdown.length > 0 ? (
                <DonutBox
                  centerLabel="custos"
                  items={costBreakdown.map(d => ({ ...d, display: formatCurrency(d.value) }))}
                />
              ) : <Text style={styles.statusText}>—</Text>}
            </AnalysisBox>
            {byMonth.labels.length > 1 && (
              <AnalysisBox title="Despesas por Mês (Kz×1000)">
                <AreaChart
                  color="#3b82f6"
                  items={byMonth.labels.map((label, i) => ({ label, value: byMonth.values[i], display: `${byMonth.values[i]}k` }))}
                />
              </AnalysisBox>
            )}
          </View>
        )}

        {s.showSummary && stats && (
          <AnalysisBox title={t.sections.financialSummary} full>
            <KeyValueRows rows={[
              { label: t.stats.fuel,            value: formatCurrency(stats.fuel        ?? 0) },
              { label: t.stats.maintenances,    value: formatCurrency(stats.maintenance ?? 0) },
              { label: t.stats.generalExpenses, value: formatCurrency(stats.expenses    ?? 0) },
              { label: t.stats.fines,           value: formatCurrency(stats.fines       ?? 0) },
              { label: t.stats.totalGeneral,    value: formatCurrency(stats.total       ?? 0), highlight: true },
            ]} />
          </AnalysisBox>
        )}

        {categoryBreakdown.length > 0 && (
          <>
            <SectionHeader>{t.sections.expensesByCategory}</SectionHeader>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { flex: 2 }]}>{t.table.category}</Text>
                <Text style={[styles.th, { flex: 1 }]}>{t.table.quantity}</Text>
                <Text style={[styles.th, { flex: 1 }]}>{t.table.value}</Text>
                <Text style={[styles.th, { flex: 1 }]}>{t.table.percentage}</Text>
              </View>
              {(stats?.byCategory ?? []).map((cat: any, i: number) => (
                <View key={i} style={styles.tr} wrap={false}>
                  <Text style={[styles.tdBold, { flex: 2 }]}>{cat.name}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{cat.count}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{formatCurrency(cat.total)}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{cat.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <SectionHeader>{t.sections.expenseDetails}</SectionHeader>
        {!expenses?.length ? <EmptyNote message={t.empty.noData} /> : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.date}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.category}</Text>
              <Text style={[styles.th, { flex: 2 }]}>{t.table.description}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.value}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.status}</Text>
            </View>
            {expenses.map((exp) => (
              <View key={exp.id} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { flex: 1 }]}>{formatDate(exp.expense_date)}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{exp.category_name ?? '—'}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{exp.description ?? '—'}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{formatCurrency(exp.amount)}</Text>
                <View style={{ flex: 1 }}><StatusBadge status={exp.status} /></View>
              </View>
            ))}
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
};
