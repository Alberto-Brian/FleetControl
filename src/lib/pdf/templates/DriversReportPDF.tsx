// ========================================
// FILE: src/lib/pdf/templates/DriversReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, StatusPills, KeyValueRows, EmptyNote, DonutBox, ColumnChart
} from '../report-design';

interface DriversReportProps {
  drivers: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const DriversReportPDF: React.FC<DriversReportProps> = ({
  drivers,
  stats,
  dateRange
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  const contractStatusData = [
    { label: t.stats.active,      count: stats?.active      ?? 0, color: '#10b981' },
    { label: t.stats.onLeave,     count: stats?.onLeave     ?? 0, color: '#f59e0b' },
    { label: t.stats.terminated,  count: stats?.terminated  ?? 0, color: '#64748b' },
  ].filter(d => d.count > 0);

  const availabilityData = stats?.active > 0 ? [
    { label: t.stats.available,  count: stats?.available  ?? 0, color: '#22c55e' },
    { label: t.stats.onTrip,     count: stats?.onTrip     ?? 0, color: '#3b82f6' },
    { label: t.stats.offline,    count: stats?.offline    ?? 0, color: '#94a3b8' },
  ].filter(d => d.count > 0) : [];

  const topTrips = (stats?.topDrivers ?? [...(drivers ?? [])]
    .sort((a, b) => (b.total_trips ?? 0) - (a.total_trips ?? 0)))
    .slice(0, 6)
    .map((d: any) => ({
      label: d.name ?? d.driver_name,
      value: d.totalTrips ?? d.total_trips ?? 0
    }));

  const topDistance = [...(drivers ?? [])]
    .filter(d => d.total_distance > 0)
    .sort((a, b) => (b.total_distance ?? 0) - (a.total_distance ?? 0))
    .slice(0, 6)
    .map(d => ({
      label: d.name,
      value: d.total_distance ?? 0
    }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title={t.reports.drivers}
          subtitle={`${drivers?.length ?? 0} ${t.stats.totalDrivers.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalDrivers, value: stats?.total ?? 0,      icon: 'users', color: '#3b82f6' },
          { label: t.stats.active,       value: stats?.active ?? 0,     icon: 'check', color: '#10b981' },
          { label: t.stats.onLeave,      value: stats?.onLeave ?? 0,    icon: 'clock', color: '#f59e0b' },
          { label: t.stats.terminated,   value: stats?.terminated ?? 0, icon: 'alert', color: '#64748b' },
        ]} />

        {stats?.active > 0 && (
          <KpiGrid cards={[
            { label: t.stats.available, value: stats?.available ?? 0, icon: 'check', color: '#22c55e' },
            { label: t.stats.onTrip,    value: stats?.onTrip ?? 0,    icon: 'route', color: '#3b82f6' },
            { label: t.stats.offline,   value: stats?.offline ?? 0,   icon: 'clock', color: '#94a3b8' },
          ]} />
        )}

        {s.showCharts && (
          <>
            <SectionHeader>{t.sections.distributionByStatus}</SectionHeader>
            <View style={styles.twoCol}>
              {contractStatusData.length > 0 && (
                <AnalysisBox title={t.sections.distributionByStatus}>
                  <DonutBox centerLabel={t.stats.totalDrivers} items={contractStatusData.map((d: any) => ({ label: d.label, value: d.count, color: d.color }))} />
                </AnalysisBox>
              )}
              {availabilityData.length > 0 ? (
                <AnalysisBox title={t.sections.distributionByAvailability ?? 'Disponibilidade (Ativos)'}>
                  <StatusPills items={availabilityData} />
                </AnalysisBox>
              ) : topTrips.length > 0 ? (
                <AnalysisBox title={t.sections.topDrivers}>
                  <ProgressList
                    items={topTrips.map((d: any) => ({
                      label: d.label, value: d.value, color: '#3b82f6',
                      display: `${d.value} ${t.table.trips.toLowerCase()}`,
                    }))}
                    total={Math.max(...topTrips.map((d: any) => d.value), 1)}
                  />
                </AnalysisBox>
              ) : null}
            </View>

            {topDistance.length > 0 && (
              <AnalysisBox title={t.sections.topDistance} full>
                <ColumnChart
                  color="#06b6d4"
                  items={topDistance.map(d => ({ label: d.label.length > 10 ? d.label.slice(0, 9) + '…' : d.label, value: d.value, display: formatDistance(d.value) }))}
                />
              </AnalysisBox>
            )}

            {availabilityData.length > 0 && topTrips.length > 0 && (
              <AnalysisBox title={t.sections.topDrivers} full>
                <ProgressList
                  items={topTrips.map((d: any) => ({
                    label: d.label, value: d.value, color: '#3b82f6',
                    display: `${d.value} ${t.table.trips.toLowerCase()}`,
                  }))}
                  total={Math.max(...topTrips.map((d: any) => d.value), 1)}
                />
              </AnalysisBox>
            )}
          </>
        )}

        {s.showSummary && stats && (
          <AnalysisBox title={t.summary} full>
            <KeyValueRows rows={[
              { label: t.stats.totalDrivers,  value: stats.total        ?? 0 },
              { label: t.stats.active,        value: stats.active       ?? 0 },
              { label: t.stats.onLeave,       value: stats.onLeave      ?? 0 },
              { label: t.stats.terminated,    value: stats.terminated   ?? 0 },
              { label: t.stats.onTrip,        value: stats.onTrip       ?? 0, highlight: true },
              { label: t.stats.totalTrips,    value: stats.totalTrips   ?? 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance ?? 0) },
            ]} />
          </AnalysisBox>
        )}

        <SectionHeader>{t.sections.driverList}</SectionHeader>
        {!drivers?.length ? (
          <EmptyNote message={t.empty.noDrivers} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1.5 }]}>{t.table.name}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.license}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.phone}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.trips}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.distance}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.status}</Text>
            </View>
            {drivers.map((d) => (
              <View key={d.id} style={styles.tr} wrap={false}>
                <Text style={[styles.tdBold, { flex: 1.5 }]}>{d.name}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{d.license_number ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{d.phone ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{d.total_trips ?? 0}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{formatDistance(d.total_distance ?? 0)}</Text>
                <View style={{ flex: 1 }}>
                  <StatusBadge
                    status={d.status === 'active' ? d.availability : d.status}
                    size={'sm'}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
};
