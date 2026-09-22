// ========================================
// FILE: src/lib/pdf/templates/TripsReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, StatusPills, KeyValueRows, EmptyNote, DonutBox, AreaChart
} from '../report-design';

interface TripsReportProps { 
  trips: any[]; 
  stats: any; 
  dateRange: { start: string; end: string }; 
}

export const TripsReportPDF: React.FC<TripsReportProps> = ({ 
  trips, 
  stats, 
  dateRange 
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  // Evolução por mês — agrupar viagens por mês
  const tripsByMonth = (() => {
    if (!trips?.length) return { labels: [], counts: [], distances: [] };
    const map = new Map<string, { count: number; dist: number }>();
    
    trips.forEach(trip => {
      const d = new Date(trip.start_date);
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      const cur = map.get(key) ?? { count: 0, dist: 0 };
      map.set(key, { 
        count: cur.count + 1, 
        dist: cur.dist + (trip.distance ?? 0) 
      });
    });
    
    const entries = Array.from(map.entries()).slice(-8);
    return {
      labels:    entries.map(e => e[0]),
      counts:    entries.map(e => e[1].count),
      distances: entries.map(e => Math.round(e[1].dist)),
    };
  })();

  // Top veículos por nº de viagens
  const topVehicles = (() => {
    if (!trips?.length) return [];
    const map = new Map<string, number>();
    
    trips.forEach(t => {
      const k = t.vehicle_plate ?? t.vehicle_name ?? '—';
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value }));
  })();

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title={t.reports.trips}
          subtitle={`${trips?.length ?? 0} ${t.stats.totalTrips.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalTrips,    value: stats?.total ?? 0,                            icon: 'route',  color: '#3b82f6' },
          { label: t.stats.completed,     value: stats?.completed ?? 0,                        icon: 'check',  color: '#10b981' },
          { label: t.stats.inProgress,    value: stats?.inProgress ?? 0,                       icon: 'clock',  color: '#f59e0b' },
          { label: t.stats.totalDistance, value: formatDistance(stats?.totalDistance ?? 0),    icon: 'route',  color: '#8b5cf6' },
        ]} />

        {s.showCharts && (
          <>
            <SectionHeader>{t.sections.distributionByStatus}</SectionHeader>
            <View style={styles.twoCol}>
              <AnalysisBox title={t.sections.distributionByStatus}>
                <DonutBox centerLabel={t.stats.totalTrips} items={[
                  { label: t.stats.completed,  value: stats?.completed  ?? 0, color: '#10b981' },
                  { label: t.stats.inProgress, value: stats?.inProgress ?? 0, color: '#3b82f6' },
                  { label: t.stats.cancelled,  value: stats?.cancelled  ?? 0, color: '#ef4444' },
                ]} />
              </AnalysisBox>
              <AnalysisBox title={t.sections.topVehicles}>
                {topVehicles.length > 0 ? (
                  <ProgressList
                    items={topVehicles.map(v => ({
                      label: v.label, value: v.value, color: '#3b82f6', display: `${v.value} viagens`,
                    }))}
                    total={Math.max(...topVehicles.map(v => v.value), 1)}
                  />
                ) : <Text style={styles.statusText}>—</Text>}
              </AnalysisBox>
            </View>

            {tripsByMonth.labels.length > 1 && (
              <AnalysisBox title={t.charts.tripsEvolution} full>
                <AreaChart
                  color="#06b6d4"
                  items={tripsByMonth.labels.map((label, i) => ({ label, value: tripsByMonth.counts[i], display: `${tripsByMonth.counts[i]}` }))}
                />
              </AnalysisBox>
            )}
          </>
        )}

        {s.showSummary && stats && (
          <AnalysisBox title={t.summary} full>
            <KeyValueRows rows={[
              { label: t.stats.totalTrips,    value: stats.total ?? 0 },
              { label: t.stats.completed,     value: stats.completed ?? 0 },
              { label: t.stats.inProgress,    value: stats.inProgress ?? 0 },
              { label: t.stats.cancelled,     value: stats.cancelled ?? 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance ?? 0) },
              { label: t.stats.avgDistance,   value: formatDistance(stats.avgDistance ?? 0), highlight: true },
            ]} />
          </AnalysisBox>
        )}

        <SectionHeader>{t.sections.tripHistory}</SectionHeader>
        {!trips?.length ? (
          <EmptyNote message={t.empty.noTrips} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.date}</Text>
              <Text style={[styles.th, { flex: 2 }]}>{t.table.route}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.driver}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.vehicle}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.distance}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.status}</Text>
            </View>
            {trips.map((trip) => (
              <View key={trip.id} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { flex: 1 }]}>{formatDate(trip.start_date)}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{trip.origin} → {trip.destination}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{trip.driver_name ?? '—'}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{trip.vehicle_plate ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{trip.distance ? formatDistance(trip.distance) : '—'}</Text>
                <View style={{ flex: 1 }}>
                  <StatusBadge status={trip.status} />
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
