// ========================================
// FILE: src/lib/pdf/templates/FuelReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, SummaryBox, EmptyState, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface FuelReportProps { refuelings: any[]; stats: any; dateRange: { start: string; end: string }; }

export const FuelReportPDF: React.FC<FuelReportProps> = ({ refuelings, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.fuel} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalRefuelings, value: refuelings?.length ?? 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalRefuelings, value: stats.total ?? 0 },
              { label: t.stats.totalLiters,     value: `${(stats.totalLiters ?? 0).toFixed(2)} L` },
              { label: t.stats.totalCost,        value: formatCurrency(stats.totalCost ?? 0), highlight: true },
              { label: t.stats.avgPricePerLiter, value: formatCurrency((stats.totalCost ?? 0) / (stats.totalLiters || 1)) },
              { label: t.stats.avgPerRefueling,  value: `${((stats.totalLiters ?? 0) / (stats.total || 1)).toFixed(2)} L` },
            ]} />
          </View>
        )}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.refuelingHistory}</SectionTitle>
          {!refuelings?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.liters}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.pricePerLiter}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.total}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.mileage}</Text>
              </TableHeader>
              {refuelings.map((f, i) => (
                <View key={f.id} style={i === refuelings.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDate(f.refueling_date)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{f.vehicle_plate ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{f.liters.toFixed(2)} L</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatCurrency(f.price_per_liter)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{formatCurrency(f.total_cost)}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDistance(f.mileage ?? 0)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {stats?.topVehicles?.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topVehicles}</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.liters}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.cost}</Text>
              </TableHeader>
              {stats.topVehicles.slice(0,5).map((v: any, i: number) => (
                <View key={i} style={i === Math.min(stats.topVehicles.length,5)-1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{v.vehicle_plate}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{v.totalLiters.toFixed(2)} L</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatCurrency(v.totalCost)}</Text>
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