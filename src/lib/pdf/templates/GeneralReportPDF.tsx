// ========================================
// FILE: src/lib/pdf/templates/GeneralReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, Divider, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, BarChart, LineChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatCurrency, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface GeneralReportProps { dashboard: any; dateRange: { start: string; end: string }; }

export const GeneralReportPDF: React.FC<GeneralReportProps> = ({ dashboard, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  const costBreakdown = [
    { label: t.stats.fuel,            value: dashboard?.fuelCost        ?? 0, color: '#06b6d4'                 },
    { label: t.stats.maintenances,    value: dashboard?.maintenanceCost ?? 0, color: PDF_CONFIG.colors.warning },
    { label: t.stats.generalExpenses, value: dashboard?.expensesCost    ?? 0, color: s.primaryColor            },
    { label: t.stats.fines,           value: dashboard?.finesCost       ?? 0, color: PDF_CONFIG.colors.danger  },
  ].filter(d => d.value > 0);

  const fleetStatus = [
    { label: t.stats.available,   value: dashboard?.availableVehicles   ?? 0, color: PDF_CONFIG.colors.success  },
    { label: t.stats.inUse,       value: dashboard?.inUseVehicles       ?? 0, color: s.primaryColor             },
    { label: t.stats.maintenance, value: dashboard?.maintenanceVehicles ?? 0, color: PDF_CONFIG.colors.warning  },
    { label: t.stats.inactive,    value: dashboard?.inactiveVehicles    ?? 0, color: PDF_CONFIG.colors.secondary},
  ].filter(d => d.value > 0);

  // Evolução mensal de custos (se disponível)
  const monthlyTrend = dashboard?.monthlyTrend ?? [];
  const hasMonthly   = monthlyTrend.length > 1;

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.general} subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} />

        <InfoSection items={[
          { label: t.period,      value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.table.type,  value: t.reports.general },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {dashboard && (
          <>
            {/* KPI Frota */}
            <KPICards cards={[
              { label: t.stats.totalVehicles,  value: dashboard.totalVehicles  ?? 0 },
              { label: t.stats.totalDrivers,   value: dashboard.totalDrivers   ?? 0, color: '#8b5cf6' },
              { label: t.stats.totalTrips,     value: dashboard.totalTrips     ?? 0, color: '#06b6d4' },
              { label: t.stats.distanceTraveled, value: `${Math.round((dashboard.totalDistance ?? 0) / 1000)} Km`, color: PDF_CONFIG.colors.success },
            ]} />

            {/* KPI Financeiro */}
            <KPICards cards={[
              { label: t.stats.totalCost,        value: formatCurrency(dashboard.totalCost ?? 0),  color: PDF_CONFIG.colors.danger   },
              { label: t.stats.fuel,             value: formatCurrency(dashboard.fuelCost ?? 0),   color: '#06b6d4' },
              { label: t.stats.maintenances,     value: formatCurrency(dashboard.maintenanceCost ?? 0), color: PDF_CONFIG.colors.warning },
              { label: t.stats.generalExpenses,  value: formatCurrency(dashboard.expensesCost ?? 0),   color: s.primaryColor },
            ]} />

            {/* Gráficos */}
            {s.showCharts && (
              <TwoColLayout
                left={
                  <DonutChart
                    data={fleetStatus}
                    title={t.sections.fleetStatus}
                    size={130}
                  />
                }
                right={
                  <DonutChart
                    data={costBreakdown}
                    title={t.sections.costDistribution}
                    size={130}
                  />
                }
              />
            )}

            {s.showCharts && hasMonthly && (
              <View style={commonStyles.section}>
                <LineChart
                  title={'Evolução de Custos por Mês (Kz×1000)'}
                  labels={monthlyTrend.map((m: any) => m.month)}
                  series={[
                    { label: 'Combustível',  data: monthlyTrend.map((m: any) => Math.round((m.fuel ?? 0) / 1000)),        color: '#06b6d4'                  },
                    { label: 'Manutenção',   data: monthlyTrend.map((m: any) => Math.round((m.maintenance ?? 0) / 1000)), color: PDF_CONFIG.colors.warning  },
                    { label: 'Despesas',     data: monthlyTrend.map((m: any) => Math.round((m.expenses ?? 0) / 1000)),    color: s.primaryColor             },
                  ]}
                  height={120}
                />
              </View>
            )}

            <Divider />

            {/* Resumo executivo */}
            {s.showSummary && (
              <View style={commonStyles.section}>
                <SectionTitle>{t.executiveSummary}</SectionTitle>
                <SummaryBox items={[
                  { label: t.stats.totalVehicles,   value: dashboard.totalVehicles  ?? 0 },
                  { label: t.stats.totalDrivers,    value: dashboard.totalDrivers   ?? 0 },
                  { label: t.stats.totalTrips,      value: dashboard.totalTrips     ?? 0 },
                  { label: t.stats.distanceTraveled,value: formatDistance(dashboard.totalDistance ?? 0) },
                  { label: t.stats.totalCost,        value: formatCurrency(dashboard.totalCost ?? 0), highlight: true },
                ]} />
              </View>
            )}

            <Divider />

            {/* Distribuição de custos — tabela */}
            <View style={commonStyles.section}>
              <SectionTitle>{t.sections.costDistribution}</SectionTitle>
              <View style={commonStyles.table}>
                <TableHeader>
                  <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                  <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.value}</Text>
                  <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.percentage}</Text>
                </TableHeader>
                {[
                  [t.stats.fuel,            dashboard.fuelCost        ?? 0],
                  [t.stats.maintenances,    dashboard.maintenanceCost ?? 0],
                  [t.stats.generalExpenses, dashboard.expensesCost    ?? 0],
                  [t.stats.fines,           dashboard.finesCost       ?? 0],
                ].map(([label, val], i) => (
                  <View key={i} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                    <Text style={[commonStyles.tableCell, { flex: 2 }]}>{label}</Text>
                    <Text style={[commonStyles.tableCell, cell]}>{formatCurrency(val as number)}</Text>
                    <Text style={[commonStyles.tableCell, cell]}>
                      {(((val as number) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Divider />

            {/* Status da frota — tabela */}
            <View style={commonStyles.section}>
              <SectionTitle>{t.sections.fleetStatus}</SectionTitle>
              <View style={commonStyles.table}>
                <TableHeader>
                  <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.status}</Text>
                  <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.quantity}</Text>
                  <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.percentage}</Text>
                </TableHeader>
                {[
                  ['available',   dashboard.availableVehicles   ?? 0],
                  ['in_use',      dashboard.inUseVehicles       ?? 0],
                  ['maintenance', dashboard.maintenanceVehicles ?? 0],
                  ['inactive',    dashboard.inactiveVehicles    ?? 0],
                ].map(([status, count], i) => (
                  <View key={i} style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}>
                    <View style={{ flex: 2 }}><StatusBadge status={status as string} /></View>
                    <Text style={[commonStyles.tableCell, cell]}>{count as number}</Text>
                    <Text style={[commonStyles.tableCell, cell]}>
                      {(((count as number) / (dashboard.totalVehicles || 1)) * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <Footer />
      </Page>
    </Document>
  );
};