// ========================================
// FILE: src/lib/pdf/templates/FuelReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance, PDF_CONFIG } from '../pdf-config-react';

const fuelStyles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface FuelReportProps {
  refuelings: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const FuelReportPDF: React.FC<FuelReportProps> = ({ refuelings, stats, dateRange }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      <Header 
        title="RELATÓRIO DE COMBUSTÍVEL" 
        subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
      />

      <InfoSection items={[
        { label: 'Período', value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
        { label: 'Total de Abastecimentos', value: refuelings?.length || 0 },
        { label: 'Gerado em', value: formatDate(new Date()) },
      ]} />

      {stats && (
        <View style={commonStyles.section}>
          <SectionTitle>Resumo</SectionTitle>
          <SummaryBox items={[
            { label: 'Total de Abastecimentos', value: stats.total || 0 },
            { label: 'Litros Totais', value: `${(stats.totalLiters || 0).toFixed(2)} L` },
            { label: 'Custo Total', value: formatCurrency(stats.totalCost || 0), highlight: true },
            { label: 'Preço Médio/Litro', value: formatCurrency((stats.totalCost || 0) / (stats.totalLiters || 1)) },
            { label: 'Média por Abastecimento', value: `${((stats.totalLiters || 0) / (stats.total || 1)).toFixed(2)} L` },
          ]} />
        </View>
      )}

      <View style={commonStyles.section}>
        <SectionTitle>Histórico de Abastecimentos</SectionTitle>
        
        {!refuelings || refuelings.length === 0 ? (
          <EmptyState message="Nenhum abastecimento encontrado no período selecionado" />
        ) : (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Data</Text>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Veículo</Text>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Litros</Text>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Preço/L</Text>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Total</Text>
              <Text style={[commonStyles.tableCellHeader, fuelStyles.tableCell]}>Km</Text>
            </View>

            {refuelings.map((fuel, index) => (
              <View 
                key={fuel.id} 
                style={index === refuelings.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCell, fuelStyles.tableCell]}>
                  {formatDate(fuel.refueling_date)}
                </Text>
                <Text style={[commonStyles.tableCellBold, fuelStyles.tableCell]}>
                  {fuel.vehicle_plate || '-'}
                </Text>
                <Text style={[commonStyles.tableCell, fuelStyles.tableCell]}>
                  {fuel.liters.toFixed(2)} L
                </Text>
                <Text style={[commonStyles.tableCell, fuelStyles.tableCell]}>
                  {formatCurrency(fuel.price_per_liter)}
                </Text>
                <Text style={[commonStyles.tableCellBold, fuelStyles.tableCell]}>
                  {formatCurrency(fuel.total_cost)}
                </Text>
                <Text style={[commonStyles.tableCell, fuelStyles.tableCell]}>
                  {formatDistance(fuel.mileage || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {stats?.topVehicles && stats.topVehicles.length > 0 && (
        <View style={commonStyles.section}>
          <SectionTitle>Top 5 Veículos por Consumo</SectionTitle>
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>Veículo</Text>
              <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>Litros</Text>
              <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>Custo</Text>
            </View>

            {stats.topVehicles.slice(0, 5).map((v: any, index: number) => (
              <View 
                key={index} 
                style={index === 4 ? commonStyles.tableRowLast : commonStyles.tableRow}
              >
                <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{v.vehicle_plate}</Text>
                <Text style={[commonStyles.tableCell, { flex: 1 }]}>{v.totalLiters.toFixed(2)} L</Text>
                <Text style={[commonStyles.tableCell, { flex: 1 }]}>{formatCurrency(v.totalCost)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Footer pageNumber={1} totalPages={1} />
    </Page>
  </Document>
);