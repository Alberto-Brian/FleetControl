// ========================================
// FILE: src/lib/pdf/templates/FuelReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, LineChart, BarChart, HBarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatCurrency, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface FuelReportProps { refuelings: any[]; stats: any; dateRange: { start: string; end: string }; }

export const FuelReportPDF: React.FC<FuelReportProps> = ({ refuelings, stats, dateRange }) => {
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
      map.set(key, { liters: cur.liters + (r.liters ?? 0), cost: cur.cost + (r.total_cost ?? 0) });
    });
    const entries = Array.from(map.entries()).slice(-8);
    return {
      labels: entries.map(e => e[0]),
      liters: entries.map(e => Math.round(e[1].liters)),
      costs:  entries.map(e => Math.round(e[1].cost / 1000)), // em Kz x1000
    };
  })();

  const topVehicles = (stats?.topVehicles ?? []).slice(0, 6).map((v: any) => ({
    label: v.vehicle_plate,
    value: v.totalLiters ?? 0,
  }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.fuel} subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} />

        <InfoSection items={[
          { label: t.period,                value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalRefuelings, value: refuelings?.length ?? 0 },
          { label: t.generatedAt,           value: formatDate(new Date()) },
        ]} />

        <KPICards cards={[
          { label: t.stats.totalRefuelings, value: stats?.total       ?? 0 },
          { label: t.stats.totalLiters,     value: `${((stats?.totalLiters ?? 0)).toFixed(0)} L`, color: '#06b6d4' },
          { label: t.stats.totalCost,       value: formatCurrency(stats?.totalCost ?? 0), color: PDF_CONFIG.colors.warning },
          { label: t.stats.avgPricePerLiter ?? 'Preço Médio/L', value: formatCurrency((stats?.totalCost ?? 0) / (stats?.totalLiters || 1)), color: '#8b5cf6' },
        ]} />

        {s.showCharts && byMonth.labels.length > 1 && (
          <View style={commonStyles.section}>
            <LineChart
              title={t.charts?.fuelEvolution ?? 'Consumo Mensal'}
              labels={byMonth.labels}
              series={[
                { label: 'Litros', data: byMonth.liters, color: '#06b6d4' },
                { label: 'Custo (Kz×1000)', data: byMonth.costs, color: PDF_CONFIG.colors.warning },
              ]}
              height={115}
            />
          </View>
        )}

        {s.showCharts && topVehicles.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topVehicles}</SectionTitle>
            <HBarChart
              data={topVehicles}
              formatValue={v => `${v.toFixed(0)} L`}
            />
          </View>
        )}

        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalRefuelings,   value: stats.total ?? 0 },
              { label: t.stats.totalLiters,        value: `${(stats.totalLiters ?? 0).toFixed(2)} L` },
              { label: t.stats.totalCost,          value: formatCurrency(stats.totalCost ?? 0), highlight: true },
              { label: 'Custo médio por abastecimento', value: formatCurrency((stats.totalCost ?? 0) / (stats.total || 1)) },
              { label: 'Média litros por abastecimento',value: `${((stats.totalLiters ?? 0) / (stats.total || 1)).toFixed(2)} L` },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.refuelingHistory}</SectionTitle>
          {!refuelings?.length ? <EmptyState message={t.empty.noData} /> : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.liters}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.pricePerLiter}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.total}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.mileage}</Text>
              </TableHeader>
              {refuelings.map((f, i) => (
                <View key={f.id} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDate(f.refueling_date)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{f.vehicle_plate ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{f.liters.toFixed(2)} L</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatCurrency(f.price_per_liter)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{formatCurrency(f.total_cost)}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDistance(f.mileage ?? 0)}</Text>
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