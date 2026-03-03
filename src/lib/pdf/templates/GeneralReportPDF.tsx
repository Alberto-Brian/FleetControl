// ========================================
// FILE: src/lib/pdf/templates/GeneralReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, Divider, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface GeneralReportProps { dashboard: any; dateRange: { start: string; end: string }; }

export const GeneralReportPDF: React.FC<GeneralReportProps> = ({ dashboard, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.general} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.table.type, value: t.reports.general },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
        {dashboard && (
          <>
            {s.showSummary && (
              <View style={commonStyles.section}>
                <SectionTitle>{t.executiveSummary}</SectionTitle>
                <SummaryBox items={[
                  { label: t.stats.totalVehicles,   value: dashboard.totalVehicles  ?? 0 },
                  { label: t.stats.totalTrips,      value: dashboard.totalTrips     ?? 0 },
                  { label: t.stats.distanceTraveled,value: formatDistance(dashboard.totalDistance ?? 0) },
                  { label: t.stats.totalCost,        value: formatCurrency(dashboard.totalCost ?? 0), highlight: true },
                ]} />
              </View>
            )}
            <Divider />
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
                  <View key={i} style={i === 3 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                    <Text style={[commonStyles.tableCell, { flex: 2 }]}>{label}</Text>
                    <Text style={[commonStyles.tableCell, cell]}>{formatCurrency(val as number)}</Text>
                    <Text style={[commonStyles.tableCell, cell]}>{(((val as number) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            </View>
            <Divider />
            <View style={commonStyles.section}>
              <SectionTitle>{t.sections.fleetStatus}</SectionTitle>
              <View style={commonStyles.table}>
                <TableHeader>
                  <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.status}</Text>
                  <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.quantity}</Text>
                </TableHeader>
                {[
                  ['available',   dashboard.availableVehicles   ?? 0],
                  ['in_use',      dashboard.inUseVehicles       ?? 0],
                  ['maintenance', dashboard.maintenanceVehicles ?? 0],
                  ['inactive',    dashboard.inactiveVehicles    ?? 0],
                ].map(([status, count], i) => (
                  <View key={i} style={i === 3 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                    <View style={{ flex: 2 }}><StatusBadge status={status as string} /></View>
                    <Text style={[commonStyles.tableCell, cell]}>{count as number}</Text>
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