// ========================================
// FILE: src/lib/pdf/templates/FuelReportPDF.tsx (COM TRADUÇÕES)
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
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

export const FuelReportPDF: React.FC<FuelReportProps> = ({ refuelings, stats, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.fuel} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalRefuelings, value: refuelings?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalRefuelings, value: stats.total || 0 },
              { label: t.stats.totalLiters, value: `${(stats.totalLiters || 0).toFixed(2)} L` },
              { label: t.stats.totalCost, value: formatCurrency(stats.totalCost || 0), highlight: true },
              { label: t.stats.avgPricePerLiter, value: formatCurrency((stats.totalCost || 0) / (stats.totalLiters || 1)) },
              { label: t.stats.avgPerRefueling, value: `${((stats.totalLiters || 0) / (stats.total || 1)).toFixed(2)} L` },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.refuelingHistory}</SectionTitle>
          
          {!refuelings || refuelings.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.liters}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.pricePerLiter}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.total}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.mileage}</Text>
              </View>

              {refuelings.map((fuel, index) => (
                <View 
                  key={fuel.id} 
                  style={index === refuelings.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDate(fuel.refueling_date)}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>
                    {fuel.vehicle_plate || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {fuel.liters.toFixed(2)} L
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(fuel.price_per_liter)}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>
                    {formatCurrency(fuel.total_cost)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDistance(fuel.mileage || 0)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {stats?.topVehicles && stats.topVehicles.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topVehicles}</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.liters}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.cost}</Text>
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

        <Footer />
      </Page>
    </Document>
  );
};