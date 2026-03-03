// ========================================
// FILE: src/lib/pdf/templates/MaintenanceReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, BarChart, HBarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatCurrency, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface MaintenanceReportProps { maintenances: any[]; stats: any; dateRange: { start: string; end: string }; }

export const MaintenanceReportPDF: React.FC<MaintenanceReportProps> = ({ maintenances, stats, dateRange }) => {
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
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.maintenance} subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} />

        <InfoSection items={[
          { label: t.period,                  value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalMaintenances, value: maintenances?.length ?? 0 },
          { label: t.generatedAt,             value: formatDate(new Date()) },
        ]} />

        <KPICards cards={[
          { label: t.stats.totalMaintenances, value: stats?.total      ?? 0 },
          { label: t.stats.preventive,        value: stats?.preventive ?? 0, color: s.primaryColor           },
          { label: t.stats.corrective,        value: stats?.corrective ?? 0, color: PDF_CONFIG.colors.warning},
          { label: t.stats.totalCost,         value: formatCurrency(stats?.totalCost ?? 0), color: PDF_CONFIG.colors.danger },
        ]} />

        {s.showCharts && (
          <TwoColLayout
            left={<DonutChart data={typeData} title={'Por Tipo'} size={120} />}
            right={<DonutChart data={statusData} title={t.sections.distributionByStatus} size={120} />}
          />
        )}

        {s.showCharts && byMonth.labels.length > 1 && (
          <View style={commonStyles.section}>
            <BarChart
              data={byMonth.labels.map((l, i) => ({ label: l, value: byMonth.costs[i] }))}
              title={'Custo por Mês (Kz×1000)'}
              height={110}
              formatValue={v => `${v}k`}
            />
          </View>
        )}

        {s.showCharts && topVehicles.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>Top Veículos por Custo</SectionTitle>
            <HBarChart data={topVehicles} formatValue={v => formatCurrency(v)} />
          </View>
        )}

        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalMaintenances, value: stats.total       ?? 0 },
              { label: t.stats.preventive,        value: stats.preventive  ?? 0 },
              { label: t.stats.corrective,        value: stats.corrective  ?? 0 },
              { label: t.stats.completed,         value: stats.completed   ?? 0 },
              { label: t.stats.inProgress,        value: stats.inProgress  ?? 0 },
              { label: t.stats.totalCost,         value: formatCurrency(stats.totalCost ?? 0), highlight: true },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.maintenanceHistory}</SectionTitle>
          {!maintenances?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.description}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.type}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.cost}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {maintenances.map((m, i) => (
                <View key={m.id} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDate(m.entry_date)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{m.vehicle_plate ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{m.description ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{m.type === 'preventive' ? t.maintenanceTypes.preventive : t.maintenanceTypes.corrective}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatCurrency(m.total_cost ?? 0)}</Text>
                  <View style={cell}><StatusBadge status={m.status} /></View>
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