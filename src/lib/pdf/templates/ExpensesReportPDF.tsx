import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatCurrency, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, EmptyNote, DonutBox, ColumnChart
} from '../report-design';

const DATE_FIELD_LABELS: Record<string, string> = {
  expense_date:  'Data da Despesa',
  due_date:      'Data de Vencimento',
  payment_date:  'Data de Pagamento',
  created_at:    'Data de Criação',
};

const STATUS_PT: Record<string, string> = {
  paid:      'Pago',
  pending:   'Pendente',
  overdue:   'Vencido',
  cancelled: 'Cancelado',
};

interface ExpensesReportProps {
  expenses:  any[];
  stats:     any;
  dateField: string;
  dateRange: { start: string; end: string };
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '—';
  return formatDate(val);
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export const ExpensesReportPDF: React.FC<ExpensesReportProps> = ({ expenses, stats, dateField, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const dateFieldLabel = DATE_FIELD_LABELS[dateField] ?? 'Data';

  // Agrupamento por mês usando o campo escolhido
  const byMonth = (() => {
    if (!expenses?.length) return { labels: [], values: [] };
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const raw = e[dateField] ?? e.expense_date;
      if (!raw) return;
      const d   = new Date(raw);
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
      map.set(key, (map.get(key) ?? 0) + (e.amount ?? 0));
    });
    const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
    return {
      labels: entries.map(e => e[0]),
      values: entries.map(e => Math.round(e[1] / 1000)),
    };
  })();

  const categoryData = (stats?.byCategory ?? []).slice(0, 8).map((c: any) => ({
    label: c.name,
    value: c.total ?? 0,
  }));

  const byStatus = stats?.byStatus ?? {};

  return (
    <Document>
      <Page size={s.paperSize} orientation="landscape" style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title="Relatório de Despesas"
          subtitle={`${dateFieldLabel} · ${stats?.count ?? 0} registos`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: 'Total',    value: formatCurrency(stats?.total ?? 0),     icon: 'dollar', color: PDF_CONFIG.colors.danger },
          { label: 'Pago',     value: formatCurrency(byStatus.paid ?? 0),    icon: 'check',  color: '#10b981' },
          { label: 'Pendente', value: formatCurrency(byStatus.pending ?? 0), icon: 'clock',  color: '#f59e0b' },
          { label: 'Vencido',  value: formatCurrency(byStatus.overdue ?? 0), icon: 'alert',  color: '#ef4444' },
        ]} />

        {s.showCharts && (categoryData.length > 0 || byMonth.labels.length > 1) && (
          <View style={styles.twoCol}>
            {categoryData.length > 0 && (
              <AnalysisBox title="Por Categoria">
                <DonutBox
                  centerLabel="categorias"
                  items={categoryData.map((c: any, i: number) => ({
                    label: c.label, value: c.value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    display: formatCurrency(c.value),
                  }))}
                />
              </AnalysisBox>
            )}
            {byMonth.labels.length > 1 && (
              <AnalysisBox title="Despesas por Mês (Kz×1000)">
                <ColumnChart
                  color="#06b6d4"
                  items={byMonth.labels.map((label, i) => ({ label, value: byMonth.values[i], display: `${byMonth.values[i]}k` }))}
                />
              </AnalysisBox>
            )}
          </View>
        )}

        {s.showSummary && (stats?.byCategory ?? []).length > 0 && (
          <>
            <SectionHeader>Sumário por Categoria</SectionHeader>
            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={[styles.th, { flex: 2.5 }]}>Categoria</Text>
                <Text style={[styles.th, { flex: 1 }]}>Qtd.</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Total</Text>
                <Text style={[styles.th, { flex: 1 }]}>%</Text>
              </View>
              {(stats.byCategory as any[]).map((cat, i) => (
                <View key={i} style={styles.tr} wrap={false}>
                  <Text style={[styles.tdBold, { flex: 2.5 }]}>{cat.name}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{cat.count}</Text>
                  <Text style={[styles.td, { flex: 1.5 }]}>{formatCurrency(cat.total)}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{cat.percentage?.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <SectionHeader>Detalhe das Despesas</SectionHeader>
        {!expenses?.length ? <EmptyNote message={t.empty.noData} /> : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1.8 }]}>Descrição</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Categoria</Text>
              <Text style={[styles.th, { flex: 0.85 }]}>Dt. Despesa</Text>
              <Text style={[styles.th, { flex: 0.85 }]}>Dt. Venc.</Text>
              <Text style={[styles.th, { flex: 0.85 }]}>Dt. Pgto.</Text>
              <Text style={[styles.th, { flex: 0.85 }]}>Dt. Criação</Text>
              <Text style={[styles.th, { flex: 1 }]}>Valor</Text>
              <Text style={[styles.th, { flex: 1 }]}>Status</Text>
            </View>
            {expenses.map((exp) => (
              <View key={exp.id} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { flex: 1.8 }]}>{exp.description ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{exp.category_name ?? '—'}</Text>
                <Text style={[styles.td, { flex: 0.85 }]}>{fmtDate(exp.expense_date)}</Text>
                <Text style={[styles.td, { flex: 0.85 }]}>{fmtDate(exp.due_date)}</Text>
                <Text style={[styles.td, { flex: 0.85 }]}>{fmtDate(exp.payment_date)}</Text>
                <Text style={[styles.td, { flex: 0.85 }]}>{fmtDate(exp.created_at)}</Text>
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
