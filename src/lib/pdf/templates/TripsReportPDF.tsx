// ========================================
// FILE: src/lib/pdf/templates/TripsReportPDF.tsx (COM TRADUÇÕES)
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
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

export const TripsReportPDF: React.FC<TripsReportProps> = ({ trips, stats, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.trips} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalTrips, value: trips?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalTrips, value: stats.total || 0 },
              { label: t.stats.completed, value: stats.completed || 0 },
              { label: t.stats.inProgress, value: stats.inProgress || 0 },
              { label: t.stats.cancelled, value: stats.cancelled || 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance || 0), highlight: true },
              { label: t.stats.avgDistance, value: formatDistance(stats.avgDistance || 0) },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.tripHistory}</SectionTitle>
          
          {!trips || trips.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.route}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.driver}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.status}</Text>
              </View>

              {trips.map((trip, index) => (
                <View 
                  key={trip.id} 
                  style={index === trips.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDate(trip.start_date)}
                  </Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                    {trip.origin} → {trip.destination}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {trip.driver_name || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>
                    {trip.vehicle_plate || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {trip.distance ? formatDistance(trip.distance) : '-'}
                  </Text>
                  <View style={styles.tableCell}>
                    <StatusBadge status={trip.status} />
                  </View>
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