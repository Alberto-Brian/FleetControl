// ========================================
// FILE: src/components/tracking/DeviceInfoPanel.tsx
// ========================================
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Gauge, Navigation, Clock, History, ChevronDown, ChevronUp, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed }        from '@/helpers/tracking-helpers';

interface Props {
  device:          TrackedDevice;
  position?:       Position;
  onClose:         () => void;
  onShowHistory:   (from: string, to: string) => void;
}

const PRESETS = [
  { label: '1h',  hours: 1  },
  { label: '6h',  hours: 6  },
  { label: '24h', hours: 24 },
  { label: '7d',  hours: 168 },
] as const;

function toLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type CommandFeedback = { type: 'success' | 'error'; message: string } | null;

const COMMAND_TYPES = ['engineStop', 'engineResume', 'positionSingle'] as const;
type CommandType = typeof COMMAND_TYPES[number];

// Dark glass design tokens — same palette as DeviceSidebar
const G = {
  bg:        'rgba(8,14,28,0.97)',
  border:    'rgba(255,255,255,0.08)',
  shadow:    '0 12px 48px rgba(0,0,0,0.6)',
  blur:      'blur(12px)',
  textPrimary:   'rgba(255,255,255,0.97)',
  textSecondary: 'rgba(255,255,255,0.82)',
  textMuted:     'rgba(255,255,255,0.4)',
  divider:       'rgba(255,255,255,0.06)',
  itemBg:        'rgba(255,255,255,0.05)',
  itemHover:     'rgba(255,255,255,0.08)',
  blue:      '#60a5fa',
  green:     '#22c55e',
  red:       '#ef4444',
  orange:    '#f59e0b',
  inputBg:   'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
} as const;

export function DeviceInfoPanel({ device, position, onClose, onShowHistory }: Props) {
  const { t } = useTranslation('tracking');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(24);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo  ] = useState('');
  const [useCustom,  setUseCustom ] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [commandsOpen,   setCommandsOpen  ] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<Set<string> | null>(null);
  const [typesLoading,   setTypesLoading  ] = useState(false);
  const [sendingCmd,     setSendingCmd    ] = useState<string | null>(null);
  const [cmdFeedback,    setCmdFeedback   ] = useState<CommandFeedback>(null);

  const commandLabels: Record<CommandType, string> = {
    engineStop:     t('device.engineStop'),
    engineResume:   t('device.engineResume'),
    positionSingle: t('device.positionSingle'),
  };

  async function handleCommandsOpen() {
    const next = !commandsOpen;
    setCommandsOpen(next);
    if (next && supportedTypes === null && !typesLoading) {
      setTypesLoading(true);
      try {
        const types: string[] = await (window as any)._tracking?.getCommandTypes(device.traccar_id);
        setSupportedTypes(new Set(types ?? []));
      } catch {
        setSupportedTypes(new Set());
      } finally {
        setTypesLoading(false);
      }
    }
  }

  async function handleSendCommand(type: string) {
    setSendingCmd(type);
    setCmdFeedback(null);
    try {
      await (window as any)._tracking?.sendCommand(device.traccar_id, type);
      setCmdFeedback({ type: 'success', message: t('device.commandSent') });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erro ao enviar comando';
      setCmdFeedback({ type: 'error', message: msg });
    } finally {
      setSendingCmd(null);
      setTimeout(() => setCmdFeedback(null), 4000);
    }
  }

  async function handleShowHistory() {
    let from: string;
    let to: string;

    if (useCustom && customFrom && customTo) {
      from = new Date(customFrom).toISOString();
      to   = new Date(customTo).toISOString();
    } else {
      to   = new Date().toISOString();
      from = new Date(Date.now() - selectedPreset * 3600 * 1000).toISOString();
    }

    setLoadingHistory(true);
    try {
      onShowHistory(from, to);
    } finally {
      // Small delay so the loading state is visible
      setTimeout(() => setLoadingHistory(false), 800);
    }
  }

  function handlePreset(hours: number) {
    setSelectedPreset(hours);
    setUseCustom(false);
  }

  function handleCustomToggle() {
    if (!useCustom) {
      const now = new Date();
      const ago = new Date(Date.now() - selectedPreset * 3600 * 1000);
      setCustomTo(toLocalDateTimeInput(now));
      setCustomFrom(toLocalDateTimeInput(ago));
    }
    setUseCustom(v => !v);
  }

  const isOnline = device.status === 'online';

  return (
    <div
      style={{
        position:       'absolute',
        bottom:         16,
        right:          16,
        zIndex:         10,
        width:          300,
        background:     G.bg,
        border:         `1px solid ${G.border}`,
        boxShadow:      G.shadow,
        backdropFilter: G.blur,
        WebkitBackdropFilter: G.blur,
        borderRadius:   16,
        overflow:       'hidden',
        pointerEvents:  'auto',
        color:          G.textSecondary,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        padding:        '14px 16px 12px',
        borderBottom:   `1px solid ${G.divider}`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: isOnline ? G.green : '#6b7280',
              boxShadow: isOnline ? `0 0 6px ${G.green}` : 'none',
            }} />
            <p style={{ color: G.textPrimary, fontWeight: 700, fontSize: 15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {device.name}
            </p>
          </div>
          <p style={{ color: G.textMuted, fontSize: 11, fontFamily: 'monospace', margin: '3px 0 0' }}>
            {device.uniqueId}
          </p>
          <p style={{ color: isOnline ? G.green : '#6b7280', fontSize: 11, fontWeight: 600, margin: '2px 0 0' }}>
            {isOnline ? t('sidebar.online') : t('sidebar.offline')}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 8, border: `1px solid ${G.border}`,
            background: G.itemBg, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = G.itemHover)}
          onMouseLeave={e => (e.currentTarget.style.background = G.itemBg)}
        >
          <X style={{ width: 14, height: 14, color: G.textMuted }} />
        </button>
      </div>

      {/* ── Position data ── */}
      {position ? (
        <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {/* Speed */}
          <div style={{ background: G.itemBg, borderRadius: 10, padding: '8px 10px', border: `1px solid ${G.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Gauge style={{ width: 12, height: 12, color: G.blue, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                {t('device.speed')}
              </span>
            </div>
            <p style={{ color: G.textPrimary, fontWeight: 700, fontSize: 14, margin: 0 }}>
              {formatSpeed(position.speed ?? 0)}
            </p>
          </div>

          {/* Course */}
          <div style={{ background: G.itemBg, borderRadius: 10, padding: '8px 10px', border: `1px solid ${G.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Navigation style={{ width: 12, height: 12, color: G.blue, flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                {t('device.course')}
              </span>
            </div>
            <p style={{ color: G.textPrimary, fontWeight: 700, fontSize: 14, margin: 0 }}>
              {Math.round(position.course ?? 0)}°
            </p>
          </div>

          {/* Location */}
          <div style={{ gridColumn: '1 / -1', background: G.itemBg, borderRadius: 10, padding: '8px 10px', border: `1px solid ${G.border}`, display: 'flex', gap: 8 }}>
            <MapPin style={{ width: 12, height: 12, color: G.blue, flexShrink: 0, marginTop: 2 }} />
            {position.address
              ? <p style={{ color: G.textSecondary, fontSize: 11, margin: 0, lineHeight: 1.5 }}>{position.address}</p>
              : <p style={{ color: G.textMuted, fontSize: 11, fontFamily: 'monospace', margin: 0 }}>
                  {(position.latitude ?? 0).toFixed(5)}, {(position.longitude ?? 0).toFixed(5)}
                </p>
            }
          </div>

          {/* Last update */}
          <div style={{ gridColumn: '1 / -1', background: G.itemBg, borderRadius: 10, padding: '8px 10px', border: `1px solid ${G.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Clock style={{ width: 12, height: 12, color: G.blue, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 9, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: 0 }}>
                {t('device.lastUpdate')}
              </p>
              <p style={{ color: G.textSecondary, fontSize: 11, fontWeight: 500, margin: '2px 0 0' }}>
                {new Date(position.timestamp ?? (position as any).fixTime ?? Date.now()).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', textAlign: 'center', color: G.textMuted, fontSize: 12 }}>
          {t('device.noPosition')}
        </div>
      )}

      {/* ── Commands section ── */}
      <div style={{ borderTop: `1px solid ${G.divider}` }}>
        <button
          onClick={handleCommandsOpen}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
            color: G.textSecondary,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = G.itemHover)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap style={{ width: 13, height: 13, color: G.blue }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('device.commands')}</span>
          </div>
          {commandsOpen
            ? <ChevronUp   style={{ width: 13, height: 13, color: G.textMuted }} />
            : <ChevronDown style={{ width: 13, height: 13, color: G.textMuted }} />
          }
        </button>

        {commandsOpen && (
          <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {typesLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', color: G.textMuted, fontSize: 12 }}>
                <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                {t('device.loadingCommands')}
              </div>
            ) : (
              COMMAND_TYPES.map(cmdType => {
                const supported = supportedTypes === null || supportedTypes.has(cmdType);
                const sending   = sendingCmd === cmdType;
                const isStop    = cmdType === 'engineStop';
                return (
                  <button
                    key={cmdType}
                    disabled={!supported || sending || sendingCmd !== null}
                    onClick={() => handleSendCommand(cmdType)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 8, border: `1px solid ${isStop ? 'rgba(239,68,68,0.3)' : G.border}`,
                      background: isStop ? 'rgba(239,68,68,0.1)' : G.itemBg,
                      cursor: supported && !sendingCmd ? 'pointer' : 'not-allowed',
                      opacity: !supported || (sendingCmd && sendingCmd !== cmdType) ? 0.45 : 1,
                      color: isStop ? G.red : G.textSecondary,
                      fontSize: 12, fontWeight: 600, textAlign: 'left', width: '100%',
                    }}
                    onMouseEnter={e => { if (supported && !sendingCmd) e.currentTarget.style.background = isStop ? 'rgba(239,68,68,0.18)' : G.itemHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isStop ? 'rgba(239,68,68,0.1)' : G.itemBg; }}
                  >
                    {sending
                      ? <Loader2 style={{ width: 12, height: 12, flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                      : <Zap style={{ width: 12, height: 12, flexShrink: 0 }} />
                    }
                    <span style={{ flex: 1 }}>{commandLabels[cmdType]}</span>
                    {!supported && <span style={{ fontSize: 10, color: G.textMuted }}>{t('device.notAvailable')}</span>}
                  </button>
                );
              })
            )}

            {cmdFeedback && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8,
                background: cmdFeedback.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${cmdFeedback.type === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                color: cmdFeedback.type === 'success' ? G.green : G.red,
                fontSize: 12, fontWeight: 500,
              }}>
                {cmdFeedback.type === 'success'
                  ? <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                  : <AlertCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                }
                {cmdFeedback.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── History section ── */}
      <div style={{ borderTop: `1px solid ${G.divider}` }}>
        <button
          onClick={() => setHistoryOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
            color: G.textSecondary,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = G.itemHover)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History style={{ width: 13, height: 13, color: G.blue }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('device.history')}</span>
          </div>
          {historyOpen
            ? <ChevronUp   style={{ width: 13, height: 13, color: G.textMuted }} />
            : <ChevronDown style={{ width: 13, height: 13, color: G.textMuted }} />
          }
        </button>

        {historyOpen && (
          <div style={{ padding: '0 12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Presets */}
            <div style={{ display: 'flex', gap: 6 }}>
              {PRESETS.map(p => {
                const active = !useCustom && selectedPreset === p.hours;
                return (
                  <button
                    key={p.hours}
                    onClick={() => handlePreset(p.hours)}
                    style={{
                      flex: 1, padding: '5px 0', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: `1px solid ${active ? G.blue : G.border}`,
                      background: active ? G.blue : G.itemBg,
                      color: active ? '#fff' : G.textMuted,
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Custom toggle */}
            <button
              onClick={handleCustomToggle}
              style={{
                padding: '6px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${useCustom ? G.blue : G.border}`,
                background: useCustom ? 'rgba(96,165,250,0.12)' : G.itemBg,
                color: useCustom ? G.blue : G.textMuted,
              }}
            >
              {t('device.customInterval')}
            </button>

            {useCustom && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: t('device.from'), value: customFrom, onChange: setCustomFrom },
                  { label: t('device.to'),   value: customTo,   onChange: setCustomTo   },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ fontSize: 9, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                      {field.label}
                    </label>
                    <input
                      type="datetime-local"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      style={{
                        width: '100%', marginTop: 3, padding: '6px 8px', borderRadius: 7, fontSize: 12,
                        border: `1px solid ${G.inputBorder}`,
                        background: G.inputBg, color: G.textSecondary,
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Show route button */}
            <button
              onClick={handleShowHistory}
              disabled={loadingHistory || (useCustom && (!customFrom || !customTo))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: 'none',
                background: loadingHistory ? G.itemBg : `linear-gradient(135deg, ${G.blue}, #3b82f6)`,
                color: loadingHistory ? G.textMuted : '#fff',
                opacity: (useCustom && (!customFrom || !customTo)) ? 0.45 : 1,
                boxShadow: loadingHistory ? 'none' : '0 2px 10px rgba(59,130,246,0.35)',
                transition: 'all 0.15s',
              }}
            >
              {loadingHistory
                ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                : <History style={{ width: 14, height: 14 }} />
              }
              {t('device.showRoute')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
