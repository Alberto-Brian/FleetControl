// ========================================
// FILE: src/lib/pdf/templates/GeneralReportPDF.tsx (COM TRADUÇÕES)
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, Divider } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatCurrency, formatDistance } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface GeneralReportProps {
  dashboard: any;
  dateRange: { start: string; end: string };
}

export const GeneralReportPDF: React.FC<GeneralReportProps> = ({ dashboard, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.general} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.table.type, value: t.reports.general },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {dashboard && (
          <>
            {/* Resumo Executivo */}
            <View style={commonStyles.section}>
              <SectionTitle>{t.executiveSummary}</SectionTitle>
              <SummaryBox items={[
                { label: t.stats.totalVehicles, value: dashboard.totalVehicles || 0 },
                { label: t.stats.totalTrips, value: dashboard.totalTrips || 0 },
                { label: t.stats.distanceTraveled, value: formatDistance(dashboard.totalDistance || 0) },
                { label: t.stats.totalCost, value: formatCurrency(dashboard.totalCost || 0), highlight: true },
              ]} />
            </View>

            <Divider />

            {/* Distribuição de Custos */}
            <View style={commonStyles.section}>
              <SectionTitle>{t.sections.costDistribution}</SectionTitle>
              <View style={commonStyles.table}>
                <View style={commonStyles.tableHeader}>
                  <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                  <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.value}</Text>
                  <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.percentage}</Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{t.stats.fuel}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(dashboard.fuelCost || 0)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {(((dashboard.fuelCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{t.stats.maintenances}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(dashboard.maintenanceCost || 0)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {(((dashboard.maintenanceCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{t.stats.generalExpenses}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(dashboard.expensesCost || 0)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {(((dashboard.expensesCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={commonStyles.tableRowLast}>
                  <Text style={[commonStyles.tableCell, { flex: 2 }]}>{t.stats.fines}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatCurrency(dashboard.finesCost || 0)}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {(((dashboard.finesCost || 0) / (dashboard.totalCost || 1)) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            <Divider />

            {/* Status da Frota */}
            <View style={commonStyles.section}>
              <SectionTitle>{t.sections.fleetStatus}</SectionTitle>
              <View style={commonStyles.table}>
                <View style={commonStyles.tableHeader}>
                  <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.status}</Text>
                  <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.quantity}</Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <StatusBadge status="available" />
                  </View>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {dashboard.availableVehicles || 0}
                  </Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <StatusBadge status="in_use" />
                  </View>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {dashboard.inUseVehicles || 0}
                  </Text>
                </View>

                <View style={commonStyles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <StatusBadge status="maintenance" />
                  </View>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {dashboard.maintenanceVehicles || 0}
                  </Text>
                </View>

                <View style={commonStyles.tableRowLast}>
                  <View style={{ flex: 2 }}>
                    <StatusBadge status="inactive" />
                  </View>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {dashboard.inactiveVehicles || 0}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <Footer pageNumber={1} totalPages={1} />
      </Page>
    </Document>
  );
};