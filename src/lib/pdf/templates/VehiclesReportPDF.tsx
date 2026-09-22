// ========================================
// FILE: src/lib/pdf/templates/VehiclesReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, StatusPills, EmptyNote, DonutBox, ColumnChart
} from '../report-design';

interface VehiclesReportProps {
  vehicles:  any[];
  stats:     any;
  dateRange: { start: string; end: string };
}

export const VehiclesReportPDF: React.FC<VehiclesReportProps> = ({
  vehicles,
  stats,
  dateRange
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  const statusData = [
    { label: t.stats.available,   count: stats?.available   ?? 0, color: '#10b981' },
    { label: t.stats.inUse,       count: stats?.inUse       ?? 0, color: '#3b82f6' },
    { label: t.stats.maintenance, count: stats?.maintenance ?? 0, color: '#f59e0b' },
    { label: t.stats.inactive,    count: stats?.inactive    ?? 0, color: '#64748b' },
  ].filter(d => d.count > 0);

  const categoryData = (stats?.byCategory ?? [])
    .slice(0, 5)
    .map((c: any) => ({
      label: c.name,
      value: c.count,
    }));

  const topMileage = [...(vehicles ?? [])]
    .sort((a, b) => (b.current_mileage ?? 0) - (a.current_mileage ?? 0))
    .slice(0, 6)
    .map(v => ({
      label: v.license_plate,
      value: v.current_mileage ?? 0
    }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title={t.reports.vehicles}
          subtitle={`${vehicles?.length ?? 0} ${t.stats.totalVehicles.toLowerCase()} · ${formatDistance(stats?.totalMileage ?? 0)} ${t.stats.totalMileage.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalVehicles, value: stats?.total       ?? 0, icon: 'truck',  color: '#3b82f6' },
          { label: t.stats.available,     value: stats?.available   ?? 0, icon: 'check',  color: '#10b981' },
          { label: t.stats.inUse,         value: stats?.inUse       ?? 0, icon: 'route',  color: '#3b82f6' },
          { label: t.stats.maintenance,   value: stats?.maintenance ?? 0, icon: 'wrench', color: '#f59e0b' },
          { label: t.stats.inactive,      value: stats?.inactive    ?? 0, icon: 'clock',  color: '#64748b' },
        ]} />

        {s.showCharts && (
          <>
            <SectionHeader>{t.sections.distributionByStatus}</SectionHeader>
            <View style={styles.twoCol}>
              <AnalysisBox title={t.sections.distributionByStatus}>
                <DonutBox centerLabel={t.stats.totalVehicles} items={statusData.map((d: any) => ({ label: d.label, value: d.count, color: d.color }))} />
              </AnalysisBox>
              {categoryData.length > 0 && (
                <AnalysisBox title={t.sections.distributionByCategory}>
                  <ProgressList
                    items={categoryData.map((c: any) => ({ label: c.label, value: c.value, color: '#8b5cf6' }))}
                  />
                </AnalysisBox>
              )}
            </View>

            {topMileage.length > 0 && (
              <AnalysisBox title={t.sections.topMileage} full>
                <ColumnChart
                  color="#06b6d4"
                  items={topMileage.map(v => ({ label: v.label.length > 10 ? v.label.slice(0, 9) + '…' : v.label, value: v.value, display: formatDistance(v.value) }))}
                />
              </AnalysisBox>
            )}
          </>
        )}

        <SectionHeader>{t.sections.vehicleList}</SectionHeader>
        {!vehicles?.length ? (
          <EmptyNote message={t.empty.noVehicles} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.licensePlate}</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>{t.table.vehicle}</Text>
              <Text style={[styles.th, { flex: 1.3 }]}>{t.table.category}</Text>
              <Text style={[styles.th, { flex: 0.6 }]}>{t.table.year}</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>{t.table.mileage}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.status}</Text>
            </View>
            {vehicles.map((v) => (
              <View key={v.id} style={styles.tr} wrap={false}>
                <Text style={[styles.tdBold, { flex: 1 }]}>{v.license_plate}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{v.brand} {v.model}</Text>
                <Text style={[styles.td, { flex: 1.3 }]}>{v.category_name ?? '—'}</Text>
                <Text style={[styles.td, { flex: 0.6 }]}>{v.year ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1.1 }]}>{formatDistance(v.current_mileage ?? 0)}</Text>
                <View style={{ flex: 1 }}>
                  <StatusBadge status={v.status} />
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
