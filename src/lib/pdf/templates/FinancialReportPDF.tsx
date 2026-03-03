// ========================================
// FILE: src/lib/pdf/templates/FinancialReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface FinancialReportProps { expenses: any[]; stats: any; dateRange: { start: string; end: string }; }

export const FinancialReportPDF: React.FC<FinancialReportProps> = ({ expenses, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.financial} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.total, value: expenses?.length ?? 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.financialSummary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.fuel,             value: formatCurrency(stats.fuel        ?? 0) },
              { label: t.stats.maintenances,     value: formatCurrency(stats.maintenance ?? 0) },
              { label: t.stats.generalExpenses,  value: formatCurrency(stats.expenses    ?? 0) },
              { label: t.stats.fines,            value: formatCurrency(stats.fines       ?? 0) },
              { label: t.stats.totalGeneral,     value: formatCurrency(stats.total       ?? 0), highlight: true },
            ]} />
          </View>
        )}
        {stats?.byCategory?.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.expensesByCategory}</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.value}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.percentage}</Text>
              </TableHeader>
              {stats.byCategory.map((cat: any, i: number) => (
                <View key={i} style={i === stats.byCategory.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{cat.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{cat.count}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatCurrency(cat.total)}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{cat.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.expenseDetails}</SectionTitle>
          {!expenses?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.description}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.value}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {expenses.map((exp, i) => (
                <View key={exp.id} style={i === expenses.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDate(exp.expense_date)}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{exp.category_name ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{exp.description ?? '-'}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{formatCurrency(exp.amount)}</Text>
                  <View style={cell}><StatusBadge status={exp.status} /></View>
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