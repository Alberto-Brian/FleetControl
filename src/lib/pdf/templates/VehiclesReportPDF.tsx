// ========================================
// FILE: src/lib/pdf/templates/VehiclesReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance, PDF_CONFIG } from '../pdf-config-react';

const styles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface VehiclesReportProps {
  vehicles: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const VehiclesReportPDF: React.FC<VehiclesReportProps> = ({ vehicles, stats, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO DE VEÍCULOS" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      {/* Info Section */}
      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Total de Veículos', value: vehicles?.length || 0 },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {/* Resumo */}
      {stats && (
        <View style={commonStyles.section}>
          <SectionTitle>Resumo</SectionTitle>
          <SummaryBox items={[
            { label: 'Total de Veículos', value: stats.total || 0 },
            { label: 'Disponíveis', value: stats.available || 0 },
            { label: 'Em Uso', value: stats.inUse || 0 },
            { label: 'Em Manutenção', value: stats.maintenance || 0 },
            { label: 'Inativos', value: stats.inactive || 0 },
            { label: 'Quilometragem Total', value: formatDistance(stats.totalMileage || 0), highlight: true },
          ]} />
        </View>
      )}

      {/* Lista de Veículos */}
      <View style={commonStyles.section}>
        <SectionTitle>Lista de Veículos</SectionTitle>
        
        {!vehicles || vehicles.length === 0 ? (
          <EmptyState message="Nenhum veículo encontrado no período selecionado" />
        ) : (
          <View style={commonStyles.table}>
            {/* Header */}
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Matrícula</Text>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Veículo</Text>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Categoria</Text>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Ano</Text>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Km</Text>
              <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>Status</Text>
            </View>

            {/* Rows */}
            {vehicles.map((vehicle, index) => (
              <View 
                key={vehicle.id} 
                style={index === vehicles.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCellBold, styles.tableCell]}>{vehicle.license_plate}</Text>
                <Text style={[commonStyles.tableCell, styles.tableCell]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={[commonStyles.tableCell, styles.tableCell]}>{vehicle.category_name || '-'}</Text>
                <Text style={[commonStyles.tableCell, styles.tableCell]}>{vehicle.year || '-'}</Text>
                <Text style={[commonStyles.tableCell, styles.tableCell]}>
                  {formatDistance(vehicle.current_mileage || 0)}
                </Text>
                <View style={styles.tableCell}>
                  <StatusBadge status={vehicle.status} />
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