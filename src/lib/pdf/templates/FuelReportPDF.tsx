// ========================================
// FILE: src/lib/pdf/templates/FuelReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, Watermark } from '@/components/PDFComponents';
import { formatDate, formatCurrency, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, AnalysisBox,
  ProgressList, KeyValueRows, EmptyNote, ColumnChart, AreaChart
} from '../report-design';

interface FuelReportProps {
  refuelings: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const FuelReportPDF: React.FC<FuelReportProps> = ({
  refuelings,
  stats,
  dateRange
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  // Agregar por mês
  const byMonth = (() => {
    if (!refuelings?.length) return { labels: [], liters: [], costs: [] };
    const map = new Map<string, { liters: number; cost: number }>();

    refuelings.forEach(r => {
      const d = new Date(r.refueling_date);
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      const cur = map.get(key) ?? { liters: 0, cost: 0 };
      map.set(key, {
        liters: cur.liters + (r.liters ?? 0),
        cost: cur.cost + (r.total_cost ?? 0)
      });
    });

    const entries = Array.from(map.entries()).slice(-8);
    return {
      labels: entries.map(e => e[0]),
      liters: entries.map(e => Math.round(e[1].liters)),
      costs:  entries.map(e => Math.round(e[1].cost / 1000)),
    };
  })();

  const topVehicles = (stats?.topVehicles ?? [])
    .slice(0, 6)
    .map((v: any) => ({
      label: v.vehicle_plate,
      value: v.totalLiters ?? 0,
    }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title={t.reports.fuel}
          subtitle={`${refuelings?.length ?? 0} ${t.stats.totalRefuelings.toLowerCase()}`}
          dateRange={dateRange}
        />

        <SectionHeader>{t.summary}</SectionHeader>
        <KpiGrid cards={[
          { label: t.stats.totalRefuelings, value: stats?.total ?? 0, icon: 'fuel', color: '#3b82f6' },
          { label: t.stats.totalLiters, value: `${((stats?.totalLiters ?? 0)).toFixed(0)} L`, icon: 'fuel', color: '#06b6d4' },
          { label: t.stats.totalCost, value: formatCurrency(stats?.totalCost ?? 0), icon: 'dollar', color: PDF_CONFIG.colors.warning },
          {
            label: t.stats.avgPricePerLiter,
            value: formatCurrency((stats?.totalCost ?? 0) / (stats?.totalLiters || 1)),
            icon: 'dollar', color: '#8b5cf6',
          },
        ]} />

        {s.showCharts && (byMonth.labels.length > 1 || topVehicles.length > 0) && (
          <>
            <SectionHeader>{t.charts.fuelEvolution}</SectionHeader>
            {byMonth.labels.length > 1 && (
              <View style={styles.twoCol}>
                <AnalysisBox title="Litros">
                  <ColumnChart
                    color="#06b6d4"
                    items={byMonth.labels.map((label, i) => ({ label, value: byMonth.liters[i], display: `${byMonth.liters[i]}` }))}
                  />
                </AnalysisBox>
                <AnalysisBox title="Custo (Kz×1000)">
                  <AreaChart
                    color={PDF_CONFIG.colors.warning}
                    items={byMonth.labels.map((label, i) => ({ label, value: byMonth.costs[i], display: `${byMonth.costs[i]}k` }))}
                  />
                </AnalysisBox>
              </View>
            )}

            {topVehicles.length > 0 && (
              <AnalysisBox title={t.sections.topVehicles} full>
                <ProgressList
                  items={topVehicles.map((v: any) => ({
                    label: v.label, value: v.value, color: '#3b82f6', display: `${v.value.toFixed(0)} L`,
                  }))}
                  total={Math.max(...topVehicles.map((v: any) => v.value), 1)}
                />
              </AnalysisBox>
            )}
          </>
        )}

        {s.showSummary && stats && (
          <AnalysisBox title={t.summary} full>
            <KeyValueRows rows={[
              { label: t.stats.totalRefuelings, value: stats.total ?? 0 },
              { label: t.stats.totalLiters, value: `${(stats.totalLiters ?? 0).toFixed(2)} L` },
              { label: t.stats.totalCost, value: formatCurrency(stats.totalCost ?? 0), highlight: true },
              { label: 'Custo médio por abastecimento', value: formatCurrency((stats.totalCost ?? 0) / (stats.total || 1)) },
              { label: 'Média litros por abastecimento', value: `${((stats.totalLiters ?? 0) / (stats.total || 1)).toFixed(2)} L` },
            ]} />
          </AnalysisBox>
        )}

        <SectionHeader>{t.sections.refuelingHistory}</SectionHeader>
        {!refuelings?.length ? (
          <EmptyNote message={t.empty.noRefuelings} />
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.date}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.vehicle}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.liters}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.pricePerLiter}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.total}</Text>
              <Text style={[styles.th, { flex: 1 }]}>{t.table.mileage}</Text>
            </View>
            {refuelings.map((f) => (
              <View key={f.id} style={styles.tr} wrap={false}>
                <Text style={[styles.td, { flex: 1 }]}>{formatDate(f.refueling_date)}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{f.vehicle_plate ?? '—'}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{f.liters.toFixed(2)} L</Text>
                <Text style={[styles.td, { flex: 1 }]}>{formatCurrency(f.price_per_liter)}</Text>
                <Text style={[styles.tdBold, { flex: 1 }]}>{formatCurrency(f.total_cost)}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{formatDistance(f.mileage ?? 0)}</Text>
              </View>
            ))}
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
};
