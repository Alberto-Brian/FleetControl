// ========================================
// FILE: src/lib/pdf/templates/ShiftPlanReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View, Svg, Rect, Circle, Path, G } from '@react-pdf/renderer';
import {
  Header, Footer, InfoSection, SectionTitle, Watermark,
} from '@/components/PDFComponents';
import { KPICards } from '@/components/PDFCharts';
import {
  commonStyles, formatDate, formatDateLong, getPDFSettings, PDF_CONFIG,
} from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import { IDriverShift } from '@/lib/types/driver-shift';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShiftPlanReportProps {
  shifts:    IDriverShift[];
  dateRange: { start: string; end: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: string): string {
  if (status === 'active')   return '#10b981';
  if (status === 'draft')    return '#64748b';
  if (status === 'archived') return '#f59e0b';
  return '#64748b';
}

function statusLabel(status: string, t: any): string {
  if (status === 'active')   return t.status.active   ?? 'Activo';
  if (status === 'draft')    return t.status.draft    ?? 'Rascunho';
  if (status === 'archived') return t.status.archived ?? 'Arquivado';
  return status;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export const ShiftPlanReportPDF: React.FC<ShiftPlanReportProps> = ({ shifts, dateRange }) => {
  const t = pdfT();
  const s = getPDFSettings();

  // Contagens por status
  const totalDrivers = shifts.reduce((acc, sh) => acc + sh.member_count, 0);
  const activeShifts = shifts.filter(sh => sh.status === 'active').length;
  const draftShifts  = shifts.filter(sh => sh.status === 'draft').length;

  return (
    <Document>
      <Page size={s.paperSize} orientation={s.orientation} style={commonStyles.page}>
        <Watermark />
        <Header
          title="PLANO DE TURNOS"
          subtitle={`${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`}
        />

        <InfoSection items={[
          { label: 'Período',      value: `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}` },
          { label: 'Total Turnos', value: shifts.length },
          { label: 'Gerado em',   value: formatDate(new Date()) },
        ]} />

        <KPICards cards={[
          { label: 'Turnos Activos',    value: activeShifts,  color: '#10b981'       },
          { label: 'Rascunhos',         value: draftShifts,   color: '#64748b'       },
          { label: 'Total Motoristas',  value: totalDrivers,  color: s.primaryColor  },
          { label: 'Total de Turnos',   value: shifts.length, color: '#8b5cf6'       },
        ]} />

        {/* ── Listagem de turnos ─────────────────────────────────────── */}
        {shifts.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
              Nenhum turno encontrado para o período seleccionado.
            </Text>
          </View>
        ) : (
          shifts.map((shift, shiftIdx) => (
            <View
              key={shift.id}
              style={{
                marginBottom: 16,
                borderWidth:  1,
                borderColor:  '#e2e8f0',
                borderRadius: 8,
                overflow:     'hidden',
              }}
              wrap={false}
            >
              {/* Cabeçalho do turno */}
              <View style={{
                flexDirection:   'row',
                justifyContent:  'space-between',
                alignItems:      'center',
                backgroundColor: s.primaryColor,
                padding:         10,
              }}>
                {/* Nome e horário */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#ffffff' }}>
                    {shift.name}
                  </Text>
                  {shift.description && (
                    <Text style={{ fontSize: 7, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      {shift.description}
                    </Text>
                  )}
                </View>

                {/* Horário */}
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius:    6,
                  padding:         6,
                  marginLeft:      8,
                  alignItems:      'center',
                  minWidth:        80,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#ffffff', fontFamily: 'Courier' }}>
                    {shift.start_time} – {shift.end_time}
                  </Text>
                  <Text style={{ fontSize: 6, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>
                    HORÁRIO
                  </Text>
                </View>

                {/* Status badge */}
                <View style={{
                  backgroundColor: statusColor(shift.status),
                  borderRadius:    4,
                  paddingHorizontal: 8,
                  paddingVertical:   4,
                  marginLeft:      8,
                }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {statusLabel(shift.status, t)}
                  </Text>
                </View>
              </View>

              {/* Período */}
              <View style={{
                flexDirection:   'row',
                justifyContent:  'space-between',
                backgroundColor: '#f8fafc',
                paddingHorizontal: 10,
                paddingVertical:   6,
                borderBottomWidth: 1,
                borderBottomColor: '#e2e8f0',
              }}>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  <Text style={{ fontWeight: 'bold' }}>Período: </Text>
                  {formatDate(shift.start_date)} → {formatDate(shift.end_date)}
                </Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  <Text style={{ fontWeight: 'bold' }}>{shift.member_count} </Text>
                  {shift.member_count === 1 ? 'motorista' : 'motoristas'}
                  {shift.leader_name && (
                    <Text style={{ color: '#f59e0b' }}>  · Líder: {shift.leader_name}</Text>
                  )}
                </Text>
              </View>

              {/* Tabela de membros */}
              {shift.members.length === 0 ? (
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 8, color: '#94a3b8', fontStyle: 'italic' }}>
                    Nenhum motorista atribuído a este turno.
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Cabeçalho da tabela de membros */}
                  <View style={{
                    flexDirection:     'row',
                    backgroundColor:   '#f1f5f9',
                    paddingHorizontal: 10,
                    paddingVertical:   5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0',
                  }}>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#374151', flex: 3 }}>
                      MOTORISTA
                    </Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#374151', flex: 1, textAlign: 'center' }}>
                      HORÁRIO
                    </Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#374151', flex: 1, textAlign: 'center' }}>
                      FUNÇÃO
                    </Text>
                    {/* Coluna de assinatura */}
                    <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#374151', flex: 2, textAlign: 'center' }}>
                      ASSINATURA
                    </Text>
                  </View>

                  {/* Linhas de membros */}
                  {shift.members.map((member, memberIdx) => (
                    <View
                      key={member.id}
                      style={{
                        flexDirection:     'row',
                        alignItems:        'center',
                        paddingHorizontal: 10,
                        paddingVertical:   7,
                        borderBottomWidth: memberIdx < shift.members.length - 1 ? 0.5 : 0,
                        borderBottomColor: '#f1f5f9',
                        backgroundColor:   memberIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        minHeight:         32,
                      }}
                      wrap={false}
                    >
                      {/* Nome do motorista */}
                      <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {/* Avatar inicial */}
                        <View style={{
                          width:           20,
                          height:          20,
                          borderRadius:    10,
                          backgroundColor: member.is_leader ? '#fef3c7' : '#eff6ff',
                          alignItems:      'center',
                          justifyContent:  'center',
                          marginRight:     6,
                        }}>
                          <Text style={{
                            fontSize:   8,
                            fontWeight: 'bold',
                            color:      member.is_leader ? '#d97706' : s.primaryColor,
                          }}>
                            {(member.driver_name ?? '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e293b' }}>
                            {member.driver_name}
                          </Text>
                          {member.notes && (
                            <Text style={{ fontSize: 6, color: '#94a3b8', marginTop: 1 }}>
                              {member.notes}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Horário */}
                      <Text style={{ fontSize: 8, color: '#4b5563', flex: 1, textAlign: 'center', fontFamily: 'Courier' }}>
                        {shift.start_time}–{shift.end_time}
                      </Text>

                      {/* Função (Líder / Membro) */}
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        {member.is_leader ? (
                          <View style={{
                            backgroundColor:   '#fef3c7',
                            borderRadius:      4,
                            paddingHorizontal: 6,
                            paddingVertical:   2,
                            borderWidth:       0.5,
                            borderColor:       '#fcd34d',
                          }}>
                            <Text style={{ fontSize: 6, fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                              ★ Líder
                            </Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 7, color: '#94a3b8' }}>Membro</Text>
                        )}
                      </View>

                      {/* Campo de assinatura */}
                      <View style={{
                        flex:            2,
                        borderBottomWidth: 0.5,
                        borderBottomColor: '#cbd5e1',
                        marginHorizontal:  8,
                        height:            20,
                      }} />
                    </View>
                  ))}
                </View>
              )}

              {/* Notas do turno (se existirem) */}
              {shift.notes && (
                <View style={{
                  paddingHorizontal: 10,
                  paddingVertical:   6,
                  backgroundColor:   '#fffbeb',
                  borderTopWidth:    0.5,
                  borderTopColor:    '#fde68a',
                }}>
                  <Text style={{ fontSize: 7, color: '#92400e' }}>
                    <Text style={{ fontWeight: 'bold' }}>Nota: </Text>
                    {shift.notes}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        <Footer />
      </Page>
    </Document>
  );
};