// ========================================
// FILE: src/lib/pdf/templates/DriversReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, HBarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface DriversReportProps { drivers: any[]; stats: any; dateRange: { start: string; end: string }; }

export const DriversReportPDF: React.FC<DriversReportProps> = ({ drivers, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const statusData = [
    { label: t.stats.active,    value: stats?.active   ?? 0, color: PDF_CONFIG.colors.success  },
    { label: t.stats.onTrip,    value: stats?.onTrip   ?? 0, color: s.primaryColor             },
    { label: t.stats.onLeave,   value: stats?.onLeave  ?? 0, color: PDF_CONFIG.colors.warning  },
    { label: t.stats.inactive,  value: stats?.inactive ?? 0, color: PDF_CONFIG.colors.secondary},
  ].filter(d => d.value > 0);

  const topTrips = (stats?.topDrivers ?? [...(drivers ?? [])]
    .sort((a, b) => (b.total_trips ?? 0) - (a.total_trips ?? 0)))
    .slice(0, 6)
    .map((d: any) => ({ label: d.name ?? d.driver_name, value: d.totalTrips ?? d.total_trips ?? 0 }));

  const topDistance = [...(drivers ?? [])]
    .sort((a, b) => (b.total_distance ?? 0) - (a.total_distance ?? 0))
    .slice(0, 6)
    .map(d => ({ label: d.name, value: d.total_distance ?? 0 }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.drivers} subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} />

        <InfoSection items={[
          { label: t.period,             value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalDrivers, value: drivers?.length ?? 0 },
          { label: t.generatedAt,        value: formatDate(new Date()) },
        ]} />

        <KPICards cards={[
          { label: t.stats.totalDrivers, value: stats?.total    ?? 0 },
          { label: t.stats.active,       value: stats?.active   ?? 0, color: PDF_CONFIG.colors.success  },
          { label: t.stats.onTrip,       value: stats?.onTrip   ?? 0, color: s.primaryColor             },
          { label: t.stats.onLeave,      value: stats?.onLeave  ?? 0, color: PDF_CONFIG.colors.warning  },
        ]} />

        {s.showCharts && (
          <TwoColLayout
            left={<DonutChart data={statusData} title={t.sections.distributionByStatus} size={130} />}
            right={topTrips.length > 0
              ? <HBarChart data={topTrips} title={t.sections.topDrivers}
                  formatValue={v => `${v} ${t.table.trips.toLowerCase()}`} />
              : null
            }
          />
        )}

        {s.showCharts && topDistance.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topDistance ?? 'Top Distância Percorrida'}</SectionTitle>
            <HBarChart data={topDistance} formatValue={v => formatDistance(v)} />
          </View>
        )}

        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalDrivers,  value: stats.total        ?? 0 },
              { label: t.stats.active,         value: stats.active       ?? 0 },
              { label: t.stats.onTrip,         value: stats.onTrip       ?? 0 },
              { label: t.stats.onLeave,        value: stats.onLeave      ?? 0 },
              { label: t.stats.totalTrips,     value: stats.totalTrips   ?? 0 },
              { label: t.stats.totalDistance,  value: formatDistance(stats.totalDistance ?? 0), highlight: true },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.driverList}</SectionTitle>
          {!drivers?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.5 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.license}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.phone}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {drivers.map((d, i) => (
                <View key={d.id} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCellBold, { flex: 1.5 }]}>{d.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.license_number ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.phone ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.total_trips ?? 0}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatDistance(d.total_distance ?? 0)}</Text>
                  <View style={cell}><StatusBadge status={d.status} /></View>
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