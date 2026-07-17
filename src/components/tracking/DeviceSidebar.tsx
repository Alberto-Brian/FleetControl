// ========================================
// FILE: src/components/tracking/DeviceSidebar.tsx
// ========================================
import React, { useRef, useState } from 'react';
import { ScrollArea }  from '@/components/ui/scroll-area';
import {
  Search, Truck, Navigation2, RefreshCw,
  PanelLeftClose, Radio, MapPin, Gauge, X,
} from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed }        from '@/helpers/tracking-helpers';
import { useTracking }        from '@/contexts/TrackingContext';
import { useTranslation }     from 'react-i18next';

interface Props {
  devices:            TrackedDevice[];
  positions:          Position[];
  selectedDevice:     TrackedDevice | null;
  filteredStatus:     'all' | 'online' | 'offline';
  followingDeviceId?: number | null;
  onSelect:           (device: TrackedDevice) => void;
  onFollowDevice?:    (device: TrackedDevice) => void;
  onCenterDevice?:    (device: TrackedDevice) => void;
  isConnected:        boolean;
  isLoading?:         boolean;
  onRefresh:          () => void;
  onFilterStatus?:    (status: 'all' | 'online' | 'offline') => void;
  onToggleSidebar?:   () => void;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5)     return 'agora';
  if (diff < 60)    return `${diff}s atrás`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export function DeviceSidebar({
  devices, positions, selectedDevice, filteredStatus, followingDeviceId,
  onSelect, onFollowDevice, onCenterDevice,
  isConnected, isLoading = false, onRefresh, onFilterStatus, onToggleSidebar,
}: Props) {
  const { t } = useTranslation('tracking');
  const { activeImeis } = useTracking();
  const [search, setSearch] = useState('');

  const clickTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickedRef = useRef<number | null>(null);

  function handleItemClick(device: TrackedDevice) {
    onSelect(device);
    if (clickTimerRef.current && lastClickedRef.current === device.traccar_id) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      onFollowDevice?.(device);
    } else {
      lastClickedRef.current = device.traccar_id;
      clickTimerRef.current = setTimeout(() => { clickTimerRef.current = null; }, 300);
    }
  }

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uniqueId?.toLowerCase().includes(search.toLowerCase());
    // 'offline' inclui qualquer estado que não seja 'online' (ex: 'unknown', null)
    const matchStatus = filteredStatus === 'all' ||
      (filteredStatus === 'online' ? d.status === 'online' : d.status !== 'online');
    return matchSearch && matchStatus;
  });

  const onlineCount  = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.length - onlineCount;

  function getPosition(device: TrackedDevice): Position | undefined {
    return positions.find(p => p.deviceId === device.traccar_id);
  }

  function IconBtn({ title, onClick, disabled = false, active = false, children }: {
    title: string; onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode;
  }) {
    return (
      <button
        type="button" title={title} onClick={onClick} disabled={disabled}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
        style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.4)', background: active ? 'rgba(59,130,246,0.15)' : 'transparent' }}
        onMouseEnter={e => { if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        {children}
      </button>
    );
  }

  const FILTER_TABS: { key: 'all' | 'online' | 'offline'; label: string; count: number }[] = [
    { key: 'all',     label: 'Todos',   count: devices.length },
    { key: 'online',  label: 'Online',  count: onlineCount    },
    { key: 'offline', label: 'Offline', count: offlineCount   },
  ];

  return (
    <aside
      className="absolute left-3 top-8 bottom-3 z-10 flex flex-col rounded-xl overflow-hidden pointer-events-auto"
      style={{
        width:          300,
        background:     'rgba(8, 14, 28, 0.97)',
        border:         '1px solid rgba(255,255,255,0.08)',
        boxShadow:      '0 12px 48px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Cabeçalho ── */}
      <div className="px-3 pt-3 pb-0 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          {/* Título */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <Truck className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Dispositivos
            </span>
            {/* Dot conexão */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isConnected ? '#4ade80' : 'rgba(255,255,255,0.2)',
                boxShadow:  isConnected ? '0 0 6px #4ade80' : 'none',
              }}
              title={isConnected ? 'Ligado em tempo real' : 'Desligado'}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-0.5">
            <IconBtn title="Actualizar" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </IconBtn>
            {onToggleSidebar && (
              <IconBtn title="Fechar painel" onClick={onToggleSidebar}>
                <PanelLeftClose className="w-3.5 h-3.5" />
              </IconBtn>
            )}
          </div>
        </div>

        {/* Filtros em tabs */}
        {onFilterStatus && (
          <div
            className="flex gap-1 p-1 rounded-lg mb-3"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => onFilterStatus(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md text-xs font-medium transition-all"
                style={{
                  color:      filteredStatus === tab.key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  background: filteredStatus === tab.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (filteredStatus !== tab.key)
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                }}
                onMouseLeave={e => {
                  if (filteredStatus !== tab.key)
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: tab.key === 'online'
                      ? '#4ade80'
                      : tab.key === 'offline'
                        ? 'rgba(255,255,255,0.2)'
                        : '#60a5fa',
                  }}
                />
                {tab.label}
                <span
                  className="px-1 py-0.5 rounded text-[10px] leading-none"
                  style={{
                    background: filteredStatus === tab.key ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                    color:      filteredStatus === tab.key ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Pesquisa */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          />
          <input
            placeholder="Procurar dispositivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color:      'rgba(255,255,255,0.85)',
              border:     '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={e  => { (e.target as HTMLInputElement).style.borderColor = 'rgba(96,165,250,0.4)'; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.09)'; }}
            onBlur={e   => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.06)'; }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Divisor + contagem */}
      <div
        className="px-3 pb-1.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {filtered.length} de {devices.length} dispositivo{devices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Lista ── */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map(device => {
            const pos               = getPosition(device);
            const isSelected        = selectedDevice?.traccar_id === device.traccar_id;
            const isFollowing       = followingDeviceId === device.traccar_id;
            const isOnline          = device.status === 'online';
            const isMoving          = (pos?.speed ?? 0) > 2; // > 2 km/h = em movimento
            const speed             = pos?.speed ?? 0;
            const battery           = (pos as any)?.batteryLevel ?? (pos?.attributes as any)?.batteryLevel;
            const isTrackingPaused  = device.uniqueId ? !activeImeis.has(device.uniqueId) : false;

            return (
              <button
                key={device.id}
                onClick={() => handleItemClick(device)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all group relative"
                style={{
                  background:   isSelected
                    ? isFollowing ? 'rgba(167,139,250,0.1)' : 'rgba(59,130,246,0.12)'
                    : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft:   isFollowing
                    ? '3px solid #a78bfa'
                    : isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.035)';
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                title="Clique para centrar · Duplo clique para seguir"
              >
                {/* Avatar com indicador de estado */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: isFollowing
                        ? 'rgba(167,139,250,0.2)'
                        : isOnline
                          ? isMoving ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.1)'
                          : 'rgba(255,255,255,0.05)',
                      border: isFollowing
                        ? '1px solid rgba(167,139,250,0.3)'
                        : isOnline
                          ? '1px solid rgba(52,211,153,0.2)'
                          : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {isFollowing
                      ? <Radio className="w-4.5 h-4.5 animate-pulse" style={{ color: '#a78bfa' }} />
                      : isMoving
                        ? <Navigation2
                            className="w-4 h-4"
                            style={{ color: '#34d399', transform: `rotate(${pos?.course ?? 0}deg)` }}
                          />
                        : <Truck
                            className="w-4 h-4"
                            style={{ color: isOnline ? '#34d399' : 'rgba(255,255,255,0.2)' }}
                          />
                    }
                  </div>
                  {/* Indicador de estado sobreposto */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                    style={{
                      background:  isOnline ? '#22c55e' : 'rgba(100,116,139,0.8)',
                      borderColor: 'rgba(8,14,28,1)',
                      boxShadow:   isOnline ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
                    }}
                  />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {/* Linha 1: Nome + velocidade/follow */}
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{
                          color: isSelected ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.82)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {device.name}
                      </p>
                      {isTrackingPaused && activeImeis.size > 0 && (
                        <span
                          className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-sm leading-none"
                          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
                        >
                          {t('sidebar.trackingPaused')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                      {isMoving && (
                        <span
                          className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none"
                          style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)' }}
                        >
                          <Gauge className="w-2.5 h-2.5" />
                          {formatSpeed(speed)}
                        </span>
                      )}
                      {isFollowing && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md leading-none"
                          style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.15)' }}
                        >
                          ●
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha 2: Estado + tempo */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.28)' }}
                    >
                      {isOnline ? (isMoving ? 'Em movimento' : 'Online') : 'Offline'}
                    </span>
                    {device.lastUpdate && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {formatRelativeTime(device.lastUpdate)}
                        </span>
                      </>
                    )}
                    {typeof battery === 'number' && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
                        <span
                          className="text-[10px]"
                          style={{ color: battery > 20 ? 'rgba(255,255,255,0.3)' : '#f87171' }}
                        >
                          🔋{Math.round(battery)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Linha 3: Endereço, ou coordenadas+velocidade, ou estado */}
                  {pos ? (
                    pos.address ? (
                      <div className="flex items-start gap-1">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0 mt-px" style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <p className="text-[10px] leading-tight truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          {pos.address}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tabular-nums" style={{ color: 'rgba(255,255,255,0.22)' }}>
                          {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
                        </span>
                        {!isMoving && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                            <Gauge className="w-2.5 h-2.5" />{formatSpeed(speed)}
                          </span>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                      {isOnline ? 'A aguardar posição...' : 'Sem posição disponível'}
                    </p>
                  )}
                </div>

                {/* Botão centrar — hover */}
                {onCenterDevice && (
                  <button
                    onClick={e => { e.stopPropagation(); onCenterDevice(device); }}
                    className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)' }}
                    title="Zoom de rua"
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                    </svg>
                  </button>
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Truck className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.15)' }} />
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {search ? `Sem resultados para "${search}"` : 'Sem dispositivos'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
