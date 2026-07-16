import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, BarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatCurrency, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

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
  const cellFlex = { ...commonStyles.tableCell, flex: 1 };
  const cellSm   = { ...commonStyles.tableCell, flex: 0.85, fontSize: 7 };

  return (
    <Document>
      <Page size={s.paperSize} orientation="landscape" style={commonStyles.page}>
        <Watermark />
        <Header
          title="Relatório de Despesas"
          subtitle={`${dateFieldLabel}: ${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: 'Período',          value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: 'Filtro de data',   value: dateFieldLabel },
          { label: 'Total de registos', value: stats?.count ?? 0 },
          { label: t.generatedAt,      value: formatDate(new Date()) },
        ]} />

        {/* KPIs por status */}
        <KPICards cards={[
          { label: 'Total',     value: formatCurrency(stats?.total ?? 0),         color: PDF_CONFIG.colors.danger   },
          { label: 'Pago',      value: formatCurrency(byStatus.paid ?? 0),         color: PDF_CONFIG.colors.success  },
          { label: 'Pendente',  value: formatCurrency(byStatus.pending ?? 0),      color: PDF_CONFIG.colors.warning  },
          { label: 'Vencido',   value: formatCurrency(byStatus.overdue ?? 0),      color: PDF_CONFIG.colors.danger   },
        ]} />

        {s.showCharts && (
          <TwoColLayout
            left={categoryData.length > 0
              ? <DonutChart data={categoryData} title="Por Categoria" size={120} />
              : null}
            right={byMonth.labels.length > 1
              ? <BarChart
                  data={byMonth.labels.map((l, i) => ({ label: l, value: byMonth.values[i] }))}
                  title="Despesas por Mês (Kz×1000)"
                  height={135}
                  formatValue={v => `${v}k`}
                />
              : null}
          />
        )}

        {/* Sumário por categoria */}
        {s.showSummary && (stats?.byCategory ?? []).length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>Sumário por Categoria</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2.5 }]}>Categoria</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>Qtd.</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.5 }]}>Total</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>%</Text>
              </TableHeader>
              {(stats.byCategory as any[]).map((cat, i) => (
                <View key={i} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2.5 }]}>{cat.name}</Text>
                  <Text style={[commonStyles.tableCell,     { flex: 1   }]}>{cat.count}</Text>
                  <Text style={[commonStyles.tableCell,     { flex: 1.5 }]}>{formatCurrency(cat.total)}</Text>
                  <Text style={[commonStyles.tableCell,     { flex: 1   }]}>{cat.percentage?.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 60 }} minPresenceAhead={0} />

        {/* Tabela detalhada com todas as datas */}
        <View style={commonStyles.section}>
          <SectionTitle>Detalhe das Despesas</SectionTitle>
          {!expenses?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.8 }]}>Descrição</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.2 }]}>Categoria</Text>
                <Text style={[commonStyles.tableCellHeader, cellSm]}>Dt. Despesa</Text>
                <Text style={[commonStyles.tableCellHeader, cellSm]}>Dt. Venc.</Text>
                <Text style={[commonStyles.tableCellHeader, cellSm]}>Dt. Pgto.</Text>
                <Text style={[commonStyles.tableCellHeader, cellSm]}>Dt. Criação</Text>
                <Text style={[commonStyles.tableCellHeader, cellFlex]}>Valor</Text>
                <Text style={[commonStyles.tableCellHeader, cellFlex]}>Status</Text>
              </TableHeader>
              {expenses.map((exp, i) => (
                <View key={exp.id} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCell,     { flex: 1.8, fontSize: 7 }]}>{exp.description ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell,     { flex: 1.2, fontSize: 7 }]}>{exp.category_name ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell,     cellSm]}>{fmtDate(exp.expense_date)}</Text>
                  <Text style={[commonStyles.tableCell,     cellSm]}>{fmtDate(exp.due_date)}</Text>
                  <Text style={[commonStyles.tableCell,     cellSm]}>{fmtDate(exp.payment_date)}</Text>
                  <Text style={[commonStyles.tableCell,     cellSm]}>{fmtDate(exp.created_at)}</Text>
                  <Text style={[commonStyles.tableCellBold, cellFlex]}>{formatCurrency(exp.amount)}</Text>
                  <View style={cellFlex}><StatusBadge status={exp.status} /></View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer />
      </Page>
    </Document>
  );
};
