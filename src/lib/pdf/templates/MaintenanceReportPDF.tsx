// ========================================
// FILE: src/lib/pdf/templates/MaintenanceReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface MaintenanceReportProps { maintenances: any[]; stats: any; dateRange: { start: string; end: string }; }

export const MaintenanceReportPDF: React.FC<MaintenanceReportProps> = ({ maintenances, stats, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();
  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.maintenance} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalMaintenances, value: maintenances?.length ?? 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />
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
                <View key={m.id} style={i === maintenances.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDate(m.entry_date)}</Text>
                  <Text style={[commonStyles.tableCellBold, cell]}>{m.vehicle_plate ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{m.description ?? '-'}</Text>
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