// ========================================
// FILE: src/lib/pdf/templates/FinancialReportPDF.tsx (COM TRADUÇÕES)
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface FinancialReportProps {
  expenses: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const FinancialReportPDF: React.FC<FinancialReportProps> = ({ expenses, stats, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.financial} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.total, value: expenses?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.financialSummary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.fuel, value: formatCurrency(stats.fuel || 0) },
              { label: t.stats.maintenances, value: formatCurrency(stats.maintenance || 0) },
              { label: t.stats.generalExpenses, value: formatCurrency(stats.expenses || 0) },
              { label: t.stats.fines, value: formatCurrency(stats.fines || 0) },
              { label: t.stats.totalGeneral, value: formatCurrency(stats.total || 0), highlight: true },
            ]} />
          </View>
        )}

        {stats?.byCategory && stats.byCategory.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.expensesByCategory}</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.value}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.percentage}</Text>
              </View>

              {stats.byCategory.map((cat: any, index: number) => (
                <View 
                  key={index} 
                  style={index === stats.byCategory.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{cat.name}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{cat.count}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{formatCurrency(cat.total)}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{cat.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.expenseDetails}</SectionTitle>
          
          {!expenses || expenses.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.description}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.value}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.status}</Text>
              </View>

              {expenses.map((exp, index) => (
                <View 
                  key={exp.id} 
                  style={index === expenses.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDate(exp.expense_date)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {exp.category_name || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                    {exp.description || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>
                    {formatCurrency(exp.amount)}
                  </Text>
                  <View style={styles.tableCell}>
                    <StatusBadge status={exp.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer pageNumber={1} totalPages={1} />
      </Page>
    </Document>
  );
};