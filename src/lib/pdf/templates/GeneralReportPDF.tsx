// ========================================
// FILE: src/lib/pdf/templates/GeneralReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, Divider } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance, PDF_CONFIG } from '../pdf-config-react';

const genStyles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface GeneralReportProps {
  dashboard: any;
  dateRange: { start: string; end: string };
}

export const GeneralReportPDF: React.FC<GeneralReportProps> = ({ dashboard, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO GERAL" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Tipo', value: 'Relatório Geral Consolidado' },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {dashboard && (
        <>
          {/* Resumo Executivo */}
          <View style={commonStyles.section}>
            <SectionTitle>Resumo Executivo</SectionTitle>
            <SummaryBox items={[
              { label: 'Total de Veículos', value: dashboard.totalVehicles || 0 },
              { label: 'Viagens Realizadas', value: dashboard.totalTrips || 0 },
              { label: 'Distância Percorrida', value: formatDistance(dashboard.totalDistance || 0) },
              { label: 'Custo Total', value: formatCurrency(dashboard.totalCost || 0), highlight: true },
            ]} />
          </View>

          <Divider />

          {/* Distribuição de Custos */}
          <View style={commonStyles.section}>
            <SectionTitle>Distribuição de Custos</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Categoria</Text>
                <Text style={[commonStyles.tableCellHeader, genStyles.tableCell]}>Valor</Text>
                <Text style={[commonStyles.tableCellHeader, genStyles.tableCell]}>%</Text>
              </View>

              <View style={commonStyles.tableRow}>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>Combustível</Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {formatCurrency(dashboard.fuelCost || 0)}
                </Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {(((dashboard.fuelCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>Manutenções</Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {formatCurrency(dashboard.maintenanceCost || 0)}
                </Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {(((dashboard.maintenanceCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>Despesas Gerais</Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {formatCurrency(dashboard.expensesCost || 0)}
                </Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {(((dashboard.expensesCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                </Text>
              </View>

              <View style={commonStyles.tableRowLast}>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>Multas</Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {formatCurrency(dashboard.finesCost || 0)}
                </Text>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {(((dashboard.finesCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <Divider />

          {/* Status da Frota */}
          <View style={commonStyles.section}>
            <SectionTitle>Status da Frota</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Status</Text>
                <Text style={[commonStyles.tableCellHeader, genStyles.tableCell]}>Quantidade</Text>
              </View>

              <View style={commonStyles.tableRow}>
                <View style={{ flex: 2 }}>
                  <StatusBadge status="available" />
                </View>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {dashboard.availableVehicles || 0}
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <View style={{ flex: 2 }}>
                  <StatusBadge status="in_use" />
                </View>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {dashboard.inUseVehicles || 0}
                </Text>
              </View>

              <View style={commonStyles.tableRow}>
                <View style={{ flex: 2 }}>
                  <StatusBadge status="maintenance" />
                </View>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {dashboard.maintenanceVehicles || 0}
                </Text>
              </View>

              <View style={commonStyles.tableRowLast}>
                <View style={{ flex: 2 }}>
                  <StatusBadge status="inactive" />
                </View>
                <Text style={[commonStyles.tableCell, genStyles.tableCell]}>
                  {dashboard.inactiveVehicles || 0}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      <Footer pageNumber={1} totalPages={1} />
    </Page>
  </Document>
);