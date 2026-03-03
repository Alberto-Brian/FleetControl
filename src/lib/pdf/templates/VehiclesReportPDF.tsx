// ========================================
// FILE: src/lib/pdf/templates/VehiclesReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import {
  KPICards, DonutChart, BarChart, HBarChart, TwoColLayout,
} from '@/components/PDFCharts';
import {
  commonStyles, formatDate, formatDistance, getPDFSettings,
  PDF_CONFIG,
} from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface VehiclesReportProps {
  vehicles:  any[];
  stats:     any;
  dateRange: { start: string; end: string };
}

export const VehiclesReportPDF: React.FC<VehiclesReportProps> = ({ vehicles, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  // ── Dados para gráficos ──────────────────────────────────────────────────
  const statusData = [
    { label: t.stats.available,   value: stats?.available   ?? 0, color: PDF_CONFIG.colors.success  },
    { label: t.stats.inUse,       value: stats?.inUse       ?? 0, color: s.primaryColor             },
    { label: t.stats.maintenance, value: stats?.maintenance ?? 0, color: PDF_CONFIG.colors.warning  },
    { label: t.stats.inactive,    value: stats?.inactive    ?? 0, color: PDF_CONFIG.colors.secondary },
  ].filter(d => d.value > 0);

  const categoryData = (stats?.byCategory ?? []).slice(0, 7).map((c: any, i: number) => ({
    label: c.name,
    value: c.count,
  }));

  const topMileage = [...(vehicles ?? [])]
    .sort((a, b) => (b.current_mileage ?? 0) - (a.current_mileage ?? 0))
    .slice(0, 6)
    .map(v => ({ label: v.license_plate, value: v.current_mileage ?? 0 }));

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header
          title={t.reports.vehicles}
          subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period,              value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalVehicles, value: vehicles?.length ?? 0 },
          { label: t.generatedAt,         value: formatDate(new Date()) },
        ]} />

        {/* KPI Cards */}
        <KPICards cards={[
          { label: t.stats.totalVehicles, value: stats?.total       ?? 0 },
          { label: t.stats.available,     value: stats?.available   ?? 0, color: PDF_CONFIG.colors.success  },
          { label: t.stats.inUse,         value: stats?.inUse       ?? 0, color: s.primaryColor             },
          { label: t.stats.maintenance,   value: stats?.maintenance ?? 0, color: PDF_CONFIG.colors.warning  },
          { label: t.stats.inactive,      value: stats?.inactive    ?? 0, color: PDF_CONFIG.colors.secondary },
        ]} />

        {/* Gráficos */}
        {s.showCharts && (
          <TwoColLayout
            left={
              <DonutChart
                data={statusData}
                title={t.sections.distributionByStatus}
                size={130}
              />
            }
            right={
              categoryData.length > 0
                ? <BarChart data={categoryData} title={t.sections.distributionByCategory} height={145} />
                : null
            }
          />
        )}

        {/* Ranking por quilometragem */}
        {s.showCharts && topMileage.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topMileage ?? 'Top Quilometragem'}</SectionTitle>
            <HBarChart
              data={topMileage}
              formatValue={v => formatDistance(v)}
            />
          </View>
        )}

        {/* Resumo executivo */}
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalVehicles, value: stats.total       ?? 0 },
              { label: t.stats.available,     value: stats.available   ?? 0 },
              { label: t.stats.inUse,         value: stats.inUse       ?? 0 },
              { label: t.stats.maintenance,   value: stats.maintenance ?? 0 },
              { label: t.stats.inactive,      value: stats.inactive    ?? 0 },
              { label: t.stats.totalMileage,  value: formatDistance(stats.totalMileage ?? 0), highlight: true },
            ]} />
          </View>
        )}

        {/* Lista detalhada */}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.vehicleList}</SectionTitle>
          {!vehicles?.length ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.licensePlate}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.5 }]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.year}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.mileage}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {vehicles.map((v, i) => (
                <View key={v.id} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                  <Text style={[commonStyles.tableCellBold, cell]}>{v.license_plate}</Text>
                  <Text style={[commonStyles.tableCell, { flex: 1.5 }]}>{v.brand} {v.model}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{v.category_name ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{v.year ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{formatDistance(v.current_mileage ?? 0)}</Text>
                  <View style={cell}><StatusBadge status={v.status} /></View>
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