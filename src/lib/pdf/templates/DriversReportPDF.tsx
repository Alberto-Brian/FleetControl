// ========================================
// FILE: src/lib/pdf/templates/DriversReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Header, Footer, InfoSection, SectionTitle, StatusBadge, SummaryBox, EmptyState } from '@/components/PDFComponents';
import { commonStyles, formatDate, formatDistance } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const styles = StyleSheet.create({
  tableCell: {
    ...commonStyles.tableCell,
    flex: 1,
  },
});

interface DriversReportProps {
  drivers: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const DriversReportPDF: React.FC<DriversReportProps> = ({ drivers, stats, dateRange }) => {
  const t = pdfT();

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.drivers} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalDrivers, value: drivers?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalDrivers, value: stats.total || 0 },
              { label: t.stats.active, value: stats.active || 0 },
              { label: t.stats.inactive, value: stats.inactive || 0 },
              { label: t.stats.onLeave, value: stats.onLeave || 0 },
              { label: t.stats.totalTrips, value: stats.totalTrips || 0 },
              { label: t.stats.totalDistance, value: formatDistance(stats.totalDistance || 0), highlight: true },
            ]} />
          </View>
        )}

        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.driverList}</SectionTitle>
          
          {!drivers || drivers.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.license}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.phone}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.status}</Text>
              </View>

              {drivers.map((driver, index) => (
                <View 
                  key={driver.id} 
                  style={index === drivers.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>
                    {driver.name}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {driver.license_number || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {driver.phone || '-'}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {driver.total_trips || 0}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDistance(driver.total_distance || 0)}
                  </Text>
                  <View style={styles.tableCell}>
                    <StatusBadge status={driver.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Top 5 Motoristas por Distância */}
        {stats?.topDrivers && stats.topDrivers.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topDrivers}</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.distance}</Text>
              </View>

              {stats.topDrivers.slice(0, 5).map((driver: any, index: number) => (
                <View 
                  key={index} 
                  style={index === 4 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{driver.name}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{driver.totalTrips}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDistance(driver.totalDistance)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Distribuição por Status */}
        {stats?.byStatus && stats.byStatus.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.distributionByStatus}</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.status}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.percentage}</Text>
              </View>

              {stats.byStatus.map((s: any, index: number) => (
                <View 
                  key={index} 
                  style={index === stats.byStatus.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <View style={{ flex: 2 }}>
                    <StatusBadge status={s.status} />
                  </View>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{s.count}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{s.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer pageNumber={1} totalPages={1} />
      </Page>
    </Document>
  );
};