// ========================================
// FILE: src/lib/pdf/templates/DriversReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle,
  StatusBadge, SummaryBox, EmptyState, Watermark, TableHeader,
} from '@/components/PDFComponents';
import { KPICards, DonutChart, HBarChart, TwoColLayout } from '@/components/PDFCharts';
import { commonStyles, formatDate, formatDistance, getPDFSettings, PDF_CONFIG } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';

const cell = { ...commonStyles.tableCell, flex: 1 };

interface DriversReportProps { 
  drivers: any[]; 
  stats: any; 
  dateRange: { start: string; end: string }; 
}

export const DriversReportPDF: React.FC<DriversReportProps> = ({ 
  drivers, 
  stats, 
  dateRange 
}) => {
  const t = pdfT();
  const s = getPDFSettings();

  // ─────────────────────────────────────────────────────────────────────────
  // DADOS PARA GRÁFICOS
  // ─────────────────────────────────────────────────────────────────────────

  // Status CONTRATUAL (todos os motoristas do sistema)
  const contractStatusData = [
    { label: t.stats.active,      value: stats?.active      ?? 0, color: '#10b981' },  // Verde
    { label: t.stats.onLeave,     value: stats?.onLeave     ?? 0, color: '#f59e0b' },  // Âmbar
    { label: t.stats.terminated,  value: stats?.terminated  ?? 0, color: '#64748b' },  // Cinza
  ].filter(d => d.value > 0);

  // AVAILABILITY (apenas motoristas com contrato ativo)
  const availabilityData = stats?.active > 0 ? [
    { label: t.stats.available,  value: stats?.available  ?? 0, color: '#22c55e' },  // Verde claro
    { label: t.stats.onTrip,     value: stats?.onTrip     ?? 0, color: '#3b82f6' },  // Azul
    { label: t.stats.offline,    value: stats?.offline    ?? 0, color: '#94a3b8' },  // Cinza claro
  ].filter(d => d.value > 0) : [];

  // Top motoristas por viagens
  const topTrips = (stats?.topDrivers ?? [...(drivers ?? [])]
    .sort((a, b) => (b.total_trips ?? 0) - (a.total_trips ?? 0)))
    .slice(0, 6)
    .map((d: any) => ({ 
      label: d.name ?? d.driver_name, 
      value: d.totalTrips ?? d.total_trips ?? 0 
    }));

  // Top motoristas por distância
  const topDistance = [...(drivers ?? [])]
    .filter(d => d.total_distance > 0)
    .sort((a, b) => (b.total_distance ?? 0) - (a.total_distance ?? 0))
    .slice(0, 6)
    .map(d => ({ 
      label: d.name, 
      value: d.total_distance ?? 0 
    }));

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        
        {/* HEADER */}
        <Header 
          title={t.reports.drivers} 
          subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`} 
        />

        {/* INFO SECTION */}
        <InfoSection items={[
          { label: t.period,             value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: t.stats.totalDrivers, value: drivers?.length ?? 0 },
          { label: t.generatedAt,        value: formatDate(new Date()) },
        ]} />

        {/* ── KPI CARDS: STATUS CONTRATUAL ── */}
        <KPICards cards={[
          { 
            label: t.stats.totalDrivers, 
            value: stats?.total ?? 0,
            sub: 'Total no sistema'
          },
          { 
            label: t.stats.active,       
            value: stats?.active ?? 0, 
            color: '#10b981',
            sub: 'Contratos em vigor'
          },
          { 
            label: t.stats.onLeave,      
            value: stats?.onLeave ?? 0, 
            color: '#f59e0b',
            sub: 'Afastados temporariamente'
          },
          { 
            label: t.stats.terminated,   
            value: stats?.terminated ?? 0, 
            color: '#64748b',
            sub: 'Vínculos encerrados'
          },
        ]} />

        {/* ── KPI CARDS: AVAILABILITY (apenas ativos) ── */}
        {stats?.active > 0 && (
          <KPICards cards={[
            { 
              label: t.stats.available, 
              value: stats?.available ?? 0, 
              color: '#22c55e',
              sub: 'Prontos para viagem'
            },
            { 
              label: t.stats.onTrip, 
              value: stats?.onTrip ?? 0, 
              color: '#3b82f6',
              sub: 'Em rota atualmente'
            },
            { 
              label: t.stats.offline, 
              value: stats?.offline ?? 0, 
              color: '#94a3b8',
              sub: 'Indisponíveis no momento'
            },
          ]} />
        )}

        {/* ── GRÁFICOS ── */}
        {s.showCharts && (
          <TwoColLayout
            left={
              contractStatusData.length > 0 ? (
                <DonutChart 
                  data={contractStatusData} 
                  title={t.sections.distributionByStatus}  // Distribuição contratual
                  size={130} 
                />
              ) : null
            }
            right={
              availabilityData.length > 0 ? (
                <DonutChart 
                  data={availabilityData} 
                  title={t.sections.distributionByAvailability ?? 'Disponibilidade (Ativos)'} 
                  size={130} 
                />
              ) : topTrips.length > 0 ? (
                <HBarChart 
                  data={topTrips} 
                  title={t.sections.topDrivers}
                  formatValue={v => `${v} ${t.table.trips.toLowerCase()}`} 
                />
              ) : null
            }
          />
        )}

        {/* ── TOP DISTÂNCIA ── */}
        {s.showCharts && topDistance.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topDistance}</SectionTitle>
            <HBarChart 
              data={topDistance} 
              formatValue={v => formatDistance(v)} 
            />
          </View>
        )}

        {/* ── TOP VIAGENS (se não mostrou no TwoColLayout) ── */}
        {s.showCharts && availabilityData.length > 0 && topTrips.length > 0 && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.sections.topDrivers}</SectionTitle>
            <HBarChart 
              data={topTrips} 
              formatValue={v => `${v} ${t.table.trips.toLowerCase()}`} 
            />
          </View>
        )}

        {/* ── RESUMO EXECUTIVO ── */}
        {s.showSummary && stats && (
          <View style={commonStyles.section}>
            <SectionTitle>{t.summary}</SectionTitle>
            <SummaryBox items={[
              // Contratuais
              { label: t.stats.totalDrivers,  value: stats.total        ?? 0 },
              { label: t.stats.active,         value: stats.active       ?? 0 },
              { label: t.stats.onLeave,        value: stats.onLeave      ?? 0 },
              { label: t.stats.terminated,     value: stats.terminated   ?? 0 },
              // Operacionais (apenas ativos)
              { label: t.stats.onTrip,         value: stats.onTrip       ?? 0, highlight: true },
              // Métricas
              { label: t.stats.totalTrips,     value: stats.totalTrips   ?? 0 },
              { 
                label: t.stats.totalDistance,  
                value: formatDistance(stats.totalDistance ?? 0)
              },
            ]} />
          </View>
        )}

        {/* ── LISTA DE MOTORISTAS ── */}
        <View style={commonStyles.section}>
          <SectionTitle>{t.sections.driverList}</SectionTitle>
          {!drivers?.length ? (
            <EmptyState message={t.empty.noDrivers} icon={true} />
          ) : (
            <View style={commonStyles.table}>
              <TableHeader>
                <Text style={[commonStyles.tableCellHeader, { flex: 1.5 }]}>{t.table.name}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.license}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.phone}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.trips}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.distance}</Text>
                <Text style={[commonStyles.tableCellHeader, cell]}>{t.table.status}</Text>
              </TableHeader>
              {drivers.map((d, i) => (
                <View 
                  key={d.id} 
                  style={i % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <Text style={[commonStyles.tableCellBold, { flex: 1.5 }]}>{d.name}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.license_number ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.phone ?? '—'}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>{d.total_trips ?? 0}</Text>
                  <Text style={[commonStyles.tableCell, cell]}>
                    {formatDistance(d.total_distance ?? 0)}
                  </Text>
                  <View style={{...cell }}>
                    {/* Mostra availability se activo, senão mostra status contratual */}
                    <StatusBadge 
                      status={d.status === 'active' ? d.availability : d.status} 
                      size={'sm'}
                    />
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