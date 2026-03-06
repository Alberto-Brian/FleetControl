// ========================================
// FILE: src/lib/pdf/templates/TripsReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, LineChart, HBarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

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

  const statusData = [
    { label: t.stats.completed,  value: stats?.completed  ?? 0, color: PDF_CONFIG.colors.success  },
    { label: t.stats.inProgress, value: stats?.inProgress ?? 0, color: s.primaryColor             },
    { label: t.stats.cancelled,  value: stats?.cancelled  ?? 0, color: PDF_CONFIG.colors.danger   },
  ].filter(d => d.value > 0);

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
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header 
          title={t.reports.trips} 
          subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} 
        />

        <InfoSection items={[
          { label: t.period,           value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalTrips, value: trips?.length ?? 0 },
          { label: t.generatedAt,      value: formatDate(new Date()) },
        ]} />

        <KPICards cards={[
          { label: t.stats.totalTrips,    value: stats?.total        ?? 0 },
          { 
            label: t.stats.completed,     
            value: stats?.completed    ?? 0, 
            color: PDF_CONFIG.colors.success 
          },
          { 
            label: t.stats.inProgress,    
            value: stats?.inProgress   ?? 0, 
            color: s.primaryColor           
          },
          { 
            label: t.stats.totalDistance, 
            value: formatDistance(stats?.totalDistance ?? 0), 
            color: '#8b5cf6' 
          },
        ]} />

        {/* Evolução mensal de viagens */}
        {s.showCharts && tripsByMonth.labels.length > 1 && (
          <View style={commonStyles.section}>
            <LineChart
              title={t.charts.tripsEvolution}
              labels={tripsByMonth.labels}
              series={[{ label: t.stats.totalTrips, data: tripsByMonth.counts }]}
              height={110}
            />
          </View>
        )}

        {s.showCharts && (
          <TwoColLayout
            left={
              <DonutChart 
                data={statusData} 
                title={t.sections.distributionByStatus} 
                size={120} 
              />
            }
            right={
              topVehicles.length > 0 ? (
                <HBarChart 
                  data={topVehicles} 
                  title={t.sections.topVehicles}
                  formatValue={v => `${v} viagens`} 
                />
              ) : null
            }
          />
        )}

        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalTrips,    value: stats.total         ?? 0 },
              { label: t.stats.completed,     value: stats.completed     ?? 0 },
              { label: t.stats.inProgress,    value: stats.inProgress    ?? 0 },
              { label: t.stats.cancelled,     value: stats.cancelled     ?? 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance ?? 0) },
              { 
                label: t.stats.avgDistance,   
                value: formatDistance(stats.avgDistance   ?? 0), 
                highlight: true 
              },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.tripHistory}</SectionTitle>
          {!trips?.length ? (
            <EmptyState message={t.empty.noTrips} icon={true} />
          ) : (
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
                <View 
                  key={trip.id} 
                  style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <Text style={[commonStyles.tableCell, cell]}>
                    {formatDate(trip.start_date)}
                  </Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                    {trip.origin} → {trip.destination}
                  </Text>
                  <Text style={[commonStyles.tableCell, cell]}>
                    {trip.driver_name ?? '—'}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>
                    {trip.vehicle_plate ?? '—'}
                  </Text>
                  <Text style={[commonStyles.tableCell, cell]}>
                    {trip.distance ? formatDistance(trip.distance) : '—'}
                  </Text>
                  <View style={cell}>
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