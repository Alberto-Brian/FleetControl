// ========================================
// FILE: src/lib/pdf/templates/TripsReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface TripsReportProps { trips: any[]; stats: any; dateRange: { start: string; end: string }; }

export const TripsReportPDF: React.FC<TripsReportProps> = ({ trips, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.trips} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalTrips, value: trips?.length ?? 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalTrips,    value: stats.total         ?? 0 },
              { label: t.stats.completed,     value: stats.completed     ?? 0 },
              { label: t.stats.inProgress,    value: stats.inProgress    ?? 0 },
              { label: t.stats.cancelled,     value: stats.cancelled     ?? 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance ?? 0), highlight: true },
              { label: t.stats.avgDistance,   value: formatDistance(stats.avgDistance ?? 0) },
            ]} />
          </View>
        )}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.tripHistory}</SectionTitle>
          {!trips?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.route}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.driver}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {trips.map((trip, i) => (
                <View key={trip.id} style={i === trips.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell, cell]}>{formatDate(trip.start_date)}</Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{trip.origin} → {trip.destination}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{trip.driver_name ?? '-'}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{trip.vehicle_plate ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{trip.distance ? formatDistance(trip.distance) : '-'}</Text>
                  <View style={cell}><StatusBadge status={trip.status} /></View>
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