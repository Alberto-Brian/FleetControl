// ========================================
// FILE: src/lib/pdf/templates/FinancialReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, PDF_CONFIG } from '../pdf-config-react';

const finStyles = StyleSheet.create({
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

export const FinancialReportPDF: React.FC<FinancialReportProps> = ({ expenses, stats, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO FINANCEIRO" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Total de Despesas', value: expenses?.length || 0 },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {stats && (
        <View style={commonStyles.section}>
          <SectionTitle>Resumo Financeiro</SectionTitle>
          <SummaryBox items={[
            { label: 'Combustível', value: formatCurrency(stats.fuel || 0) },
            { label: 'Manutenções', value: formatCurrency(stats.maintenance || 0) },
            { label: 'Despesas Gerais', value: formatCurrency(stats.expenses || 0) },
            { label: 'Multas', value: formatCurrency(stats.fines || 0) },
            { label: 'TOTAL GERAL', value: formatCurrency(stats.total || 0), highlight: true },
          ]} />
        </View>
      )}

      {stats?.byCategory && stats.byCategory.length > 0 && (
        <View style={commonStyles.section}>
          <SectionTitle>Despesas por Categoria</SectionTitle>
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Categoria</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Quantidade</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Valor</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>%</Text>
            </View>

            {stats.byCategory.map((cat: any, index: number) => (
              <View 
                key={index} 
                style={index === stats.byCategory.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{cat.name}</Text>
                <Text style={[commonStyles.tableCell, finStyles.tableCell]}>{cat.count}</Text>
                <Text style={[commonStyles.tableCell, finStyles.tableCell]}>{formatCurrency(cat.total)}</Text>
                <Text style={[commonStyles.tableCell, finStyles.tableCell]}>{cat.percentage.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={commonStyles.section}>
        <SectionTitle>Detalhamento de Despesas</SectionTitle>
        
        {!expenses || expenses.length === 0 ? (
          <EmptyState message="Nenhuma despesa encontrada no período selecionado" />
        ) : (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Data</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Categoria</Text>
              <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Descrição</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Valor</Text>
              <Text style={[commonStyles.tableCellHeader, finStyles.tableCell]}>Status</Text>
            </View>

            {expenses.map((exp, index) => (
              <View 
                key={exp.id} 
                style={index === expenses.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCell, finStyles.tableCell]}>
                  {formatDate(exp.expense_date)}
                </Text>
                <Text style={[commonStyles.tableCell, finStyles.tableCell]}>
                  {exp.category_name || '-'}
                </Text>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                  {exp.description || '-'}
                </Text>
                <Text style={[commonStyles.tableCellBold, finStyles.tableCell]}>
                  {formatCurrency(exp.amount)}
                </Text>
                <View style={finStyles.tableCell}>
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