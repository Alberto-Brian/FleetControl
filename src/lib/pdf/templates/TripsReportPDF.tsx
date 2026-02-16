// ========================================
// FILE: src/lib/pdf/templates/TripsReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance, PDF_CONFIG } from '../pdf-config-react';

const tripStyles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface TripsReportProps {
  trips: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const TripsReportPDF: React.FC<TripsReportProps> = ({ trips, stats, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO DE VIAGENS" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Total de Viagens', value: trips?.length || 0 },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {stats && (
        <View style={commonStyles.section}>
          <SectionTitle>Resumo</SectionTitle>
          <SummaryBox items={[
            { label: 'Total de Viagens', value: stats.total || 0 },
            { label: 'Concluídas', value: stats.completed || 0 },
            { label: 'Em Andamento', value: stats.inProgress || 0 },
            { label: 'Canceladas', value: stats.cancelled || 0 },
            { label: 'Distância Total', value: formatDistance(stats.totalDistance || 0), highlight: true },
            { label: 'Distância Média', value: formatDistance(stats.avgDistance || 0) },
          ]} />
        </View>
      )}

      <View style={commonStyles.section}>
        <SectionTitle>Histórico de Viagens</SectionTitle>
        
        {!trips || trips.length === 0 ? (
          <EmptyState message="Nenhuma viagem encontrada no período selecionado" />
        ) : (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, tripStyles.tableCell]}>Data</Text>
              <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Rota</Text>
              <Text style={[commonStyles.tableCellHeader, tripStyles.tableCell]}>Motorista</Text>
              <Text style={[commonStyles.tableCellHeader, tripStyles.tableCell]}>Veículo</Text>
              <Text style={[commonStyles.tableCellHeader, tripStyles.tableCell]}>Distância</Text>
              <Text style={[commonStyles.tableCellHeader, tripStyles.tableCell]}>Status</Text>
            </View>

            {trips.map((trip, index) => (
              <View 
                key={trip.id} 
                style={index === trips.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCell, tripStyles.tableCell]}>
                  {formatDate(trip.start_date)}
                </Text>
                <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                  {trip.origin} → {trip.destination}
                </Text>
                <Text style={[commonStyles.tableCell, tripStyles.tableCell]}>
                  {trip.driver_name || '-'}
                </Text>
                <Text style={[commonStyles.tableCellBold, tripStyles.tableCell]}>
                  {trip.vehicle_plate || '-'}
                </Text>
                <Text style={[commonStyles.tableCell, tripStyles.tableCell]}>
                  {trip.distance ? formatDistance(trip.distance) : '-'}
                </Text>
                <View style={tripStyles.tableCell}>
                  <StatusBadge status={trip.status} />
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