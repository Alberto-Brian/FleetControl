// ========================================
// FILE: src/lib/pdf/templates/MaintenanceReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, StatusBadge, Watermark } from '@/components/PDFComponents';
import { formatDate, formatCurrency, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, StatusPills, KeyValueRows, EmptyNote, DonutBox, ColumnChart
} from '../report-design';

interface MaintenanceReportProps {
  maintenances: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const MaintenanceReportPDF: React.FC<MaintenanceReportProps> = ({
  maintenances,
  stats,
  dateRange
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  const typeData = [
    { label: t.stats.preventive, value: stats?.preventive ?? 0, color: s.primaryColor            },
    { label: t.stats.corrective, value: stats?.corrective ?? 0, color: PDF_CONFIG.colors.warning  },
  ].filter(d => d.value > 0);

  const statusData = [
    { label: t.stats.completed,  value: stats?.completed  ?? 0, color: PDF_CONFIG.colors.success  },
    { label: t.stats.inProgress, value: stats?.inProgress ?? 0, color: s.primaryColor             },
    { label: t.stats.pending,    value: stats?.pending    ?? 0, color: PDF_CONFIG.colors.warning  },
  ].filter(d => d.value > 0);

  // Custo por mês
  const byMonth = (() => {
    if (!maintenances?.length) return { labels: [], costs: [] };
    const map = new Map<string, number>();

    maintenances.forEach(m => {
      const d   = new Date(m.entry_date);
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      map.set(key, (map.get(key) ?? 0) + (m.total_cost ?? 0));
    });

    const entries = Array.from(map.entries()).slice(-7);
    return {
      labels: entries.map(e => e[0]),
      costs:  entries.map(e => Math.round(e[1] / 1000)), // Kz×1000
    };
  })();

  // Top veículos por custo
  const topVehicles = (() => {
    if (!maintenances?.length) return [];
    const map = new Map<string, number>();

    maintenances.forEach(m => {
      const k = m.vehicle_plate ?? '—';
      map.set(k, (map.get(k) ?? 0) + (m.total_cost ?? 0));
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
          title={t.reports.maintenance}
          subtitle={`${maintenances?.length ?? 0} ${t.stats.totalMaintenances.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalMaintenances, value: stats?.total ?? 0, icon: 'wrench', color: '#3b82f6' },
          { label: t.stats.preventive, value: stats?.preventive ?? 0, icon: 'check', color: s.primaryColor },
          { label: t.stats.corrective, value: stats?.corrective ?? 0, icon: 'alert', color: PDF_CONFIG.colors.warning },
          { label: t.stats.totalCost, value: formatCurrency(stats?.totalCost ?? 0), icon: 'dollar', color: PDF_CONFIG.colors.danger },
        ]} />

        {s.showCharts && (
          <>
            <SectionHeader>{t.sections.distributionByStatus}</SectionHeader>
            <View style={styles.twoCol}>
              <AnalysisBox title="Por Tipo">
                {typeData.length > 0
                  ? <DonutBox centerLabel="tipos" items={typeData.map(d => ({ label: d.label, value: d.value, color: d.color }))} />
                  : <Text style={styles.statusText}>—</Text>}
              </AnalysisBox>
              <AnalysisBox title={t.sections.distributionByStatus}>
                {statusData.length > 0
                  ? <StatusPills items={statusData.map(d => ({ label: d.label, count: d.value, color: d.color }))} />
                  : <Text style={styles.statusText}>—</Text>}
              </AnalysisBox>
            </View>

            {byMonth.labels.length > 1 && (
              <AnalysisBox title="Custo por Mês (Kz×1000)" full>
                <ColumnChart
                  color="#f59e0b"
                  items={byMonth.labels.map((label, i) => ({ label, value: byMonth.costs[i], display: `${byMonth.costs[i]}k` }))}
                />
              </AnalysisBox>
            )}

            {topVehicles.length > 0 && (
              <AnalysisBox title={t.sections.topVehicles} full>
                <ProgressList
                  items={topVehicles.map(v => ({
                    label: v.label, value: v.value, color: '#3b82f6', display: formatCurrency(v.value),
                  }))}
                  total={Math.max(...topVehicles.map(v => v.value), 1)}
                />
              </AnalysisBox>
            )}
          </>
        )}

        {s.showSummary && stats && (
          <AnalysisBox title={t.summary} full>
            <KeyValueRows rows={[
              { label: t.stats.totalMaintenances, value: stats.total ?? 0 },
              { label: t.stats.preventive, value: stats.preventive ?? 0 },
              { label: t.stats.corrective, value: stats.corrective ?? 0 },
              { label: t.stats.completed, value: stats.completed ?? 0 },
              { label: t.stats.inProgress, value: stats.inProgress ?? 0 },
              { label: t.stats.totalCost, value: formatCurrency(stats.totalCost ?? 0), highlight: true },
            ]} />
          </AnalysisBox>
        )}

        <SectionHeader>{t.sections.maintenanceHistory}</SectionHeader>
        {!maintenances?.length ? (
          <EmptyNote message={t.empty.noMaintenances} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.date}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.vehicle}</Text>
              <Text style={[styles.th, { flex: 2 }]}>{t.table.description}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.type}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.cost}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.status}</Text>
            </View>
            {maintenances.map((m) => (
              <View key={m.id} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { flex: 1 }]}>{formatDate(m.entry_date)}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{m.vehicle_plate ?? '—'}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{m.description ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>
                  {m.type === 'preventive' ? t.maintenanceTypes.preventive : t.maintenanceTypes.corrective}
                </Text>
                <Text style={[styles.td, { flex: 1 }]}>{formatCurrency(m.total_cost ?? 0)}</Text>
                <View style={{ flex: 1 }}>
                  <StatusBadge status={m.status} />
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
