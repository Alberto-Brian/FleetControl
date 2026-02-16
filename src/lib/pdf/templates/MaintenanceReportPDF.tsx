// ========================================
// FILE: src/lib/pdf/templates/MaintenanceReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, PDF_CONFIG } from '../pdf-config-react';

const maintStyles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface MaintenanceReportProps {
  maintenances: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const MaintenanceReportPDF: React.FC<MaintenanceReportProps> = ({ maintenances, stats, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO DE MANUTENÇÕES" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Total de Manutenções', value: maintenances?.length || 0 },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {stats && (
        <View style={commonStyles.section}>
          <SectionTitle>Resumo</SectionTitle>
          <SummaryBox items={[
            { label: 'Total de Manutenções', value: stats.total || 0 },
            { label: 'Preventivas', value: stats.preventive || 0 },
            { label: 'Corretivas', value: stats.corrective || 0 },
            { label: 'Concluídas', value: stats.completed || 0 },
            { label: 'Em Andamento', value: stats.inProgress || 0 },
            { label: 'Custo Total', value: formatCurrency(stats.totalCost || 0), highlight: true },
          ]} />
        </View>
      )}

      <View style={commonStyles.section}>
        <SectionTitle>Histórico de Manutenções</SectionTitle>
        
        {!maintenances || maintenances.length === 0 ? (
          <EmptyState message="Nenhuma manutenção encontrada no período selecionado" />
        ) : (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, maintStyles.tableCell]}>Data</Text>
              <Text style={[commonStyles.tableCellHeader, maintStyles.tableCell]}>Veículo</Text>
              <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Descrição</Text>
              <Text style={[commonStyles.tableCellHeader, maintStyles.tableCell]}>Tipo</Text>
              <Text style={[commonStyles.tableCellHeader, maintStyles.tableCell]}>Custo</Text>
              <Text style={[commonStyles.tableCellHeader, maintStyles.tableCell]}>Status</Text>
            </View>

            {maintenances.map((m, index) => (
              <View 
                key={m.id} 
                style={index === maintenances.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCell, maintStyles.tableCell]}>
                  {formatDate(m.entry_date)}
                </Text>
                <Text style={[commonStyles.tableCellBold, maintStyles.tableCell]}>
                  {m.vehicle_plate || '-'}
                </Text>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                  {m.description || '-'}
                </Text>
                <Text style={[commonStyles.tableCell, maintStyles.tableCell]}>
                  {m.type === 'preventive' ? 'Preventiva' : 'Corretiva'}
                </Text>
                <Text style={[commonStyles.tableCell, maintStyles.tableCell]}>
                  {formatCurrency(m.total_cost || 0)}
                </Text>
                <View style={maintStyles.tableCell}>
                  <StatusBadge status={m.status} />
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
