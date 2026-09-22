// ========================================
// FILE: src/lib/pdf/templates/ShiftPlanReportPDF.tsx
// ========================================
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { Footer, Watermark } from '@/components/PDFComponents';
import { formatDate, getPDFSettings } from '../pdf-config-react';
import { pdfT } from '../pdf-translations';
import {
  reportStyles as styles, ReportHeader, SectionHeader, KpiGrid, EmptyNote,
} from '../report-design';
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
      <Page size={s.paperSize} orientation={s.orientation} style={styles.pageContainer}>
        <Watermark />

        <ReportHeader
          title="PLANO DE TURNOS"
          subtitle={`${shifts.length} turnos · ${formatDate(new Date())}`}
          dateRange={dateRange}
        />

        <SectionHeader>Resumo</SectionHeader>
        <KpiGrid cards={[
          { label: 'Turnos Activos',    value: activeShifts,  icon: 'check', color: '#10b981' },
          { label: 'Rascunhos',         value: draftShifts,   icon: 'clock', color: '#64748b' },
          { label: 'Total Motoristas',  value: totalDrivers,  icon: 'users', color: '#3b82f6' },
          { label: 'Total de Turnos',   value: shifts.length, icon: 'route', color: '#8b5cf6' },
        ]} />

        <SectionHeader>Turnos</SectionHeader>
        {/* ── Listagem de turnos ─────────────────────────────────────── */}
        {shifts.length === 0 ? (
          <EmptyNote message="Nenhum turno encontrado para o período seleccionado." />
        ) : (
          shifts.map((shift, shiftIdx) => (
            <View
              key={shift.id}
              style={{
                marginBottom: 12,
                borderWidth:  1,
                borderColor:  '#e2e8f0',
                borderRadius: 6,
                overflow:     'hidden',
              }}
              wrap={false}
            >
              {/* Cabeçalho do turno */}
              <View style={{
                flexDirection:   'row',
                justifyContent:  'space-between',
                alignItems:      'center',
                backgroundColor: '#f8fafc',
                padding:         10,
                borderBottomWidth: 1,
                borderBottomColor: '#e2e8f0',
              }}>
                {/* Nome e horário */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>
                    {shift.name}
                  </Text>
                  {shift.description && (
                    <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>
                      {shift.description}
                    </Text>
                  )}
                </View>

                {/* Horário */}
                <View style={{
                  backgroundColor: '#ffffff',
                  borderWidth:     1,
                  borderColor:     '#e2e8f0',
                  borderRadius:    6,
                  padding:         6,
                  marginLeft:      8,
                  alignItems:      'center',
                  minWidth:        80,
                }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Courier-Bold', color: '#0f172a' }}>
                    {shift.start_time} – {shift.end_time}
                  </Text>
                  <Text style={{ fontSize: 6, color: '#64748b', marginTop: 1 }}>
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
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {statusLabel(shift.status, t)}
                  </Text>
                </View>
              </View>

              {/* Período */}
              <View style={{
                flexDirection:   'row',
                justifyContent:  'space-between',
                backgroundColor: '#ffffff',
                paddingHorizontal: 10,
                paddingVertical:   6,
                borderBottomWidth: 1,
                borderBottomColor: '#e2e8f0',
              }}>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>Período: </Text>
                  {formatDate(shift.start_date)} → {formatDate(shift.end_date)}
                </Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{shift.member_count} </Text>
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
                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', flex: 3 }}>
                      MOTORISTA
                    </Text>
                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', flex: 1, textAlign: 'center' }}>
                      HORÁRIO
                    </Text>
                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', flex: 1, textAlign: 'center' }}>
                      FUNÇÃO
                    </Text>
                    {/* Coluna de assinatura */}
                    <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#475569', flex: 2, textAlign: 'center' }}>
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
                            fontFamily: 'Helvetica-Bold',
                            color:      member.is_leader ? '#d97706' : '#3b82f6',
                          }}>
                            {(member.driver_name ?? '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>
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
                      <Text style={{ fontSize: 8, color: '#334155', flex: 1, textAlign: 'center', fontFamily: 'Courier' }}>
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
                            <Text style={{ fontSize: 6, fontFamily: 'Helvetica-Bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.3 }}>
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
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>Nota: </Text>
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