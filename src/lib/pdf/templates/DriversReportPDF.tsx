// ========================================
// FILE: src/lib/pdf/templates/DriversReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface DriversReportProps { drivers: any[]; stats: any; dateRange: { start: string; end: string }; }

export const DriversReportPDF: React.FC<DriversReportProps> = ({ drivers, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.drivers} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalDrivers, value: drivers?.length ?? 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalDrivers,   value: stats.total         ?? 0 },
              { label: t.stats.active,          value: stats.active        ?? 0 },
              { label: t.stats.inactive,        value: stats.inactive      ?? 0 },
              { label: t.stats.onLeave,         value: stats.onLeave       ?? 0 },
              { label: t.stats.totalTrips,      value: stats.totalTrips    ?? 0 },
              { label: t.stats.totalDistance,   value: formatDistance(stats.totalDistance ?? 0), highlight: true },
            ]} />
          </View>
        )}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.driverList}</SectionTitle>
          {!drivers?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.license}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.phone}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {drivers.map((d, i) => (
                <View key={d.id} style={i === drivers.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{d.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.license_number ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.phone ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.total_trips ?? 0}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatDistance(d.total_distance ?? 0)}</Text>
                  <View style={cell}><StatusBadge status={d.status} /></View>
                </View>
              ))}
            </View>
          )}
        </View>
        {stats?.topDrivers?.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topDrivers}</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.distance}</Text>
              </TableHeader>
              {stats.topDrivers.slice(0,5).map((d: any, i: number) => (
                <View key={i} style={i === Math.min(stats.topDrivers.length,5)-1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{d.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.totalTrips}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatDistance(d.totalDistance)}</Text>
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