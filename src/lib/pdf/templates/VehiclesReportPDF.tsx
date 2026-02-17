// ========================================
// FILE: src/lib/pdf/templates/VehiclesReportPDF.tsx (COM TRADUÇÕES)
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

interface VehiclesReportProps {
  vehicles: any[];
  stats: any;
  dateRange: { start: string; end: string };
}

export const VehiclesReportPDF: React.FC<VehiclesReportProps> = ({ vehicles, stats, dateRange }) => {
  const t = pdfT(); // ✅ Obter traduções

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <Header 
          title={t.reports.vehicles} 
          subtitle={`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`}
        />

        {/* Info Section */}
        <InfoSection items={[
          { label: t.period, value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` },
          { label: t.stats.totalVehicles, value: vehicles?.length || 0 },
          { label: t.generatedAt, value: formatDate(new Date()) },
        ]} />

        {/* Resumo */}
        {stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              { label: t.stats.totalVehicles, value: stats.total || 0 },
              { label: t.stats.available, value: stats.available || 0 },
              { label: t.stats.inUse, value: stats.inUse || 0 },
              { label: t.stats.maintenance, value: stats.maintenance || 0 },
              { label: t.stats.inactive, value: stats.inactive || 0 },
              { label: t.stats.totalMileage, value: formatDistance(stats.totalMileage || 0), highlight: true },
            ]} />
          </View>
        )}

        {/* Lista de Veículos */}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.vehicleList}</SectionTitle>
          
          {!vehicles || vehicles.length === 0 ? (
            <EmptyState message={t.empty.noData} />
          ) : (
            <View style={commonStyles.table}>
              {/* Header */}
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.licensePlate}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.vehicle}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.year}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.mileage}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.status}</Text>
              </View>

              {/* Rows */}
              {vehicles.map((vehicle, index) => (
                <View 
                  key={vehicle.id} 
                  style={index === vehicles.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCellBold, styles.tableCell]}>{vehicle.license_plate}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{vehicle.category_name || '-'}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{vehicle.year || '-'}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>
                    {formatDistance(vehicle.current_mileage || 0)}
                  </Text>
                  <View style={styles.tableCell}>
                    <StatusBadge status={vehicle.status} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Distribuição por Categoria */}
        {stats?.byCategory && stats.byCategory.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.distributionByCategory}</SectionTitle>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={[commonStyles.tableCellHeader, { flex: 2 }]}>{t.table.category}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.quantity}</Text>
                <Text style={[commonStyles.tableCellHeader, styles.tableCell]}>{t.table.percentage}</Text>
              </View>

              {stats.byCategory.map((cat: any, index: number) => (
                <View 
                  key={index} 
                  style={index === stats.byCategory.length - 1 ? commonStyles.tableRowLast : commonStyles.tableRow}
                >
                  <Text style={[commonStyles.tableCellBold, { flex: 2 }]}>{cat.name}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{cat.count}</Text>
                  <Text style={[commonStyles.tableCell, styles.tableCell]}>{cat.percentage.toFixed(1)}%</Text>
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

        <Footer />
      </Page>
    </Document>
  );
};