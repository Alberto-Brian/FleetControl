// ========================================
// FILE: src/lib/pdf/templates/VehiclesReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance, getPDFSettings } from '../pdf-config-react';
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

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header title={t.reports.vehicles} subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`} />

        <InfoSection items={[
          { label: t.period,               value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalVehicles,  value: vehicles?.length ?? 0 },
          { label: t.generatedAt,          value: formatDate(new Date()) },
        ]} />

        {/* Resumo — apenas se showSummary estiver activo */}
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

        {/* Lista */}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.vehicleList}</SectionTitle>
          {!vehicles?.length ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.licensePlate}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.year}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.mileage}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 1 }]}>{t.table.status}</Text>
              </TableHeader>
              {vehicles.map((v, i) => (
                <View key={v.id} style={i === vehicles.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, cell]}>{v.license_plate}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{v.brand} {v.model}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{v.category_name ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{v.year ?? '-'}</Text>
                  <Text style={[commonStyles.tableCell,     cell]}>{formatDistance(v.current_mileage ?? 0)}</Text>
                  <View style={cell}><StatusBadge status={v.status} /></View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Por categoria */}
        {stats?.byCategory?.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.distributionByCategory}</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.percentage}</Text>
              </TableHeader>
              {stats.byCategory.map((cat: any, i: number) => (
                <View key={i} style={i === stats.byCategory.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{cat.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{cat.count}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{cat.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Por status */}
        {stats?.byStatus?.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.distributionByStatus}</SectionTitle>
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.status}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.percentage}</Text>
              </TableHeader>
              {stats.byStatus.map((s: any, i: number) => (
                <View key={i} style={i === stats.byStatus.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}>
                  <View style={{ flex: 2 }}><StatusBadge status={s.status} /></View>
                  <Text style={[commonStyles.tableCell, cell]}>{s.count}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{s.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  );
};