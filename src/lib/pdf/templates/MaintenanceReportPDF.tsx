// ========================================
// FILE: src/lib/pdf/templates/MaintenanceReportPDF.tsx (COM TRADUÇÕES)
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface MaintenanceReportProps {
  maintenances: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const MaintenanceReportPDF: React.FC<MaintenanceReportProps> = ({ maintenances, stats, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.maintenance} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalMaintenances, value: maintenances?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalMaintenances, value: stats.total || 0 },
              { label: t.stats.preventive, value: stats.preventive || 0 },
              { label: t.stats.corrective, value: stats.corrective || 0 },
              { label: t.stats.completed, value: stats.completed || 0 },
              { label: t.stats.inProgress, value: stats.inProgress || 0 },
              { label: t.stats.totalCost, value: formatCurrency(stats.totalCost || 0), highlight: true },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.maintenanceHistory}</SectionTitle>
          
          {!maintenances || maintenances.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.date}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.description}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.type}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.cost}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.status}</Text>
              </View>

              {maintenances.map((m, index) => (
                <View 
                  key={m.id} 
                  style={index === maintenances.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDate(m.entry_date)}
                  </Text>
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>
                    {m.vehicle_plate || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>
                    {m.description || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {m.type === 'preventive' ? t.maintenanceTypes.preventive : t.maintenanceTypes.corrective}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(m.total_cost || 0)}
                  </Text>
                  <View style={styles.tableCell}>
                    <StatusBadge status={m.status} />
                  </View>
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