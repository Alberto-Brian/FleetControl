// ========================================
// FILE: src/components/tracking/DeviceSidebar.tsx
// ========================================
import React, { useRef, useState } from 'react';
import { ScrollArea }  from '@/components/ui/scroll-area';
import {
  Search, Truck, Navigation2, RefreshCw,
  PanelLeftClose, Radio, MapPin, Gauge, X, Cpu, PauseCircle,
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
  filteredStatus:     'all' | 'online' | 'offline' | 'inactive';
  followingDeviceId?: number | null;
  onSelect:           (device: TrackedDevice) => void;
  onFollowDevice?:    (device: TrackedDevice) => void;
  onCenterDevice?:    (device: TrackedDevice) => void;
  isConnected:        boolean;
  isLoading?:         boolean;
  onRefresh:            () => void;
  onFilterStatus?:      (status: 'all' | 'online' | 'offline' | 'inactive') => void;
  onToggleSidebar?:     () => void;
  onOpenDevicesPanel?:  () => void;
}

function formatRelativeTime(dateStr: string | undefined, t: (k: string) => string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const ago = t('sidebar.relativeAgo');
  if (diff < 5)     return t('sidebar.relativeNow');
  if (diff < 60)    return `${diff}s ${ago}`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ${ago}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${ago}`;
  return `${Math.floor(diff / 86400)}d ${ago}`;
}

export function DeviceSidebar({
  devices, positions, selectedDevice, filteredStatus, followingDeviceId,
  onSelect, onFollowDevice, onCenterDevice,
  isConnected, isLoading = false, onRefresh, onFilterStatus, onToggleSidebar, onOpenDevicesPanel,
}: Props) {
  const { t } = useTranslation('tracking');
  const { activeImeis, linkedImeis, linkedImeisLoaded } = useTracking();
  const [search, setSearch] = useState('');

  // Filtra para mostrar apenas devices cujo IMEI está registado na nossa BD
  // Só aplica o filtro depois de linkedImeis ter sido carregado (para evitar sidebar vazio durante boot)
  const sidebarDevices = linkedImeisLoaded
    ? devices.filter(d => d.uniqueId ? linkedImeis.has(d.uniqueId) : false)
    : devices;

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

  const filtered = sidebarDevices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uniqueId?.toLowerCase().includes(search.toLowerCase());
    const isInactive  = d.uniqueId ? linkedImeis.has(d.uniqueId) && !activeImeis.has(d.uniqueId) : false;
    if (filteredStatus === 'inactive') return matchSearch && isInactive;
    if (filteredStatus === 'online')   return matchSearch && d.status === 'online'  && !isInactive;
    if (filteredStatus === 'offline')  return matchSearch && d.status !== 'online'  && !isInactive;
    return matchSearch; // 'all'
  });

  const inactiveCount = sidebarDevices.filter(d =>
    d.uniqueId ? linkedImeis.has(d.uniqueId) && !activeImeis.has(d.uniqueId) : false
  ).length;
  const onlineCount  = sidebarDevices.filter(d => d.status === 'online' && !( d.uniqueId ? linkedImeis.has(d.uniqueId) && !activeImeis.has(d.uniqueId) : false )).length;
  const offlineCount = sidebarDevices.length - onlineCount - inactiveCount;

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
        style={{ color: active ? '#60a5fa' : 'var(--ui-t40)', background: active ? 'rgba(59,130,246,0.15)' : 'transparent' }}
        onMouseEnter={e => { if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        {children}
      </button>
    );
  }

  const FILTER_TABS: { key: 'all' | 'online' | 'offline' | 'inactive'; label: string; count: number }[] = [
    { key: 'all',      label: t('sidebar.allDevices'),     count: sidebarDevices.length },
    { key: 'online',   label: t('sidebar.statusOnline'),   count: onlineCount           },
    { key: 'offline',  label: t('sidebar.statusOffline'),  count: offlineCount          },
    { key: 'inactive', label: t('sidebar.inactive'),       count: inactiveCount         },
  ];

  return (
    <aside
      className="absolute left-3 top-8 bottom-3 z-10 flex flex-col rounded-xl overflow-hidden pointer-events-auto"
      style={{
        width:          300,
        background:     'var(--ui-nav-bg)',
        border:         '1px solid var(--ui-b08)',
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
            <span className="text-sm font-semibold" style={{ color: 'var(--ui-t90)' }}>
              {t('sidebar.title')}
            </span>
            {/* Dot conexão */}
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isConnected ? '#4ade80' : 'var(--ui-t20)',
                boxShadow:  isConnected ? '0 0 6px #4ade80' : 'none',
              }}
              title={isConnected ? t('sidebar.connected') : t('sidebar.disconnected')}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-0.5">
            {isConnected && onOpenDevicesPanel && (
              <IconBtn title={t('devicesPanel.openPanel')} onClick={onOpenDevicesPanel}>
                <Cpu className="w-3.5 h-3.5" />
              </IconBtn>
            )}
            <IconBtn title={t('toolbar.refresh')} onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </IconBtn>
            {onToggleSidebar && (
              <IconBtn title={t('toolbar.closeSidebar')} onClick={onToggleSidebar}>
                <PanelLeftClose className="w-3.5 h-3.5" />
              </IconBtn>
            )}
          </div>
        </div>

        {/* Filtros em tabs */}
        {onFilterStatus && (
          <div
            className="flex gap-1 p-1 rounded-lg mb-3"
            style={{ background: 'var(--ui-b05)' }}
          >
            {FILTER_TABS.map(tab => {
              const isActive = filteredStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  title={tab.label}
                  onClick={() => onFilterStatus(tab.key)}
                  className={`${isActive ? 'flex-[1.8]' : 'flex-[0.8]'} flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-[10px] font-medium transition-all overflow-hidden`}
                  style={{
                    color:      isActive ? 'var(--ui-t90)' : 'var(--ui-t35)',
                    background: isActive ? 'var(--ui-b10)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t58)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t35)';
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: tab.key === 'online'
                        ? '#4ade80'
                        : tab.key === 'offline'
                          ? 'var(--ui-t20)'
                          : tab.key === 'inactive'
                            ? '#fbbf24'
                            : '#60a5fa',
                    }}
                  />
                  {isActive && (
                    <span className="truncate" style={{ color: 'var(--ui-t80)' }}>
                      {tab.label}
                    </span>
                  )}
                  <span
                    className="font-semibold flex-shrink-0"
                    style={{ color: isActive ? 'var(--ui-t80)' : 'var(--ui-t40)' }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pesquisa */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: 'var(--ui-t25)' }}
          />
          <input
            placeholder={t('sidebar.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg outline-none transition-all"
            style={{
              background: 'var(--ui-b06)',
              color:      'var(--ui-t85)',
              border:     '1px solid var(--ui-b08)',
            }}
            onFocus={e  => { (e.target as HTMLInputElement).style.borderColor = 'rgba(96,165,250,0.4)'; (e.target as HTMLInputElement).style.background = 'var(--ui-b08)'; }}
            onBlur={e   => { (e.target as HTMLInputElement).style.borderColor = 'var(--ui-b08)'; (e.target as HTMLInputElement).style.background = 'var(--ui-b06)'; }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'var(--ui-t30)', background: 'var(--ui-b08)' }}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Divisor + contagem */}
      <div
        className="px-3 pb-1.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--ui-b05)' }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--ui-t20)' }}>
          {t('sidebar.countOf', { filtered: filtered.length, total: sidebarDevices.length })}
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
            // Only show "Tracking Paused" for devices linked to a local vehicle (in linkedImeis)
            // that have tracking disabled (not in activeImeis). Unlinked Traccar devices are skipped.
            const isTrackingPaused  = device.uniqueId
              ? linkedImeis.has(device.uniqueId) && !activeImeis.has(device.uniqueId)
              : false;

            return (
              <button
                key={device.id}
                onClick={() => handleItemClick(device)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all group relative"
                style={{
                  background:   isSelected
                    ? isFollowing ? 'rgba(167,139,250,0.1)' : 'rgba(59,130,246,0.12)'
                    : 'transparent',
                  borderBottom: '1px solid var(--ui-b04)',
                  borderLeft:   isFollowing
                    ? '3px solid #a78bfa'
                    : isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b04)';
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                title={t('sidebar.clickHint')}
              >
                {/* Avatar com indicador de estado */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: isFollowing
                        ? 'rgba(167,139,250,0.2)'
                        : isTrackingPaused
                          ? 'rgba(251,191,36,0.12)'
                          : isOnline
                            ? isMoving ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.1)'
                            : 'var(--ui-b05)',
                      border: isFollowing
                        ? '1px solid rgba(167,139,250,0.3)'
                        : isTrackingPaused
                          ? '1px solid rgba(251,191,36,0.22)'
                          : isOnline
                            ? '1px solid rgba(52,211,153,0.2)'
                            : '1px solid var(--ui-b07)',
                    }}
                  >
                    {isFollowing
                      ? <Radio className="w-4.5 h-4.5 animate-pulse" style={{ color: '#a78bfa' }} />
                      : isTrackingPaused
                        ? <PauseCircle className="w-4 h-4" style={{ color: '#fbbf24' }} />
                        : isMoving
                          ? <Navigation2
                              className="w-4 h-4"
                              style={{ color: '#34d399', transform: `rotate(${pos?.course ?? 0}deg)` }}
                            />
                          : <Truck
                              className="w-4 h-4"
                              style={{ color: isOnline ? '#34d399' : 'var(--ui-t20)' }}
                            />
                    }
                  </div>
                  {/* Indicador de estado sobreposto */}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                    style={{
                      background:  isTrackingPaused ? '#fbbf24' : isOnline ? '#22c55e' : 'rgba(100,116,139,0.8)',
                      borderColor: 'var(--ui-nav-bg)',
                      boxShadow:   isTrackingPaused ? '0 0 5px rgba(251,191,36,0.5)' : isOnline ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
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
                          color: isSelected ? 'var(--ui-t90)' : 'var(--ui-t82)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {device.name}
                      </p>
                      {isTrackingPaused && (
                        <span
                          className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded-sm leading-none"
                          style={{ color: 'var(--ui-t40)', background: 'var(--ui-b08)' }}
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
                      style={{ color: isTrackingPaused ? '#fbbf24' : isOnline ? '#4ade80' : 'var(--ui-t28)' }}
                    >
                      {isTrackingPaused
                        ? t('sidebar.statusInactive')
                        : isOnline
                          ? (isMoving ? t('sidebar.statusMoving') : t('sidebar.statusOnline'))
                          : t('sidebar.statusOffline')}
                    </span>
                    {device.lastUpdate && (
                      <>
                        <span style={{ color: 'var(--ui-t15)' }}>·</span>
                        <span className="text-[10px]" style={{ color: 'var(--ui-t20)' }}>
                          {formatRelativeTime(device.lastUpdate, t)}
                        </span>
                      </>
                    )}
                    {typeof battery === 'number' && (
                      <>
                        <span style={{ color: 'var(--ui-t15)' }}>·</span>
                        <span
                          className="text-[10px]"
                          style={{ color: battery > 20 ? 'var(--ui-t30)' : '#f87171' }}
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
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0 mt-px" style={{ color: 'var(--ui-t20)' }} />
                        <p className="text-[10px] leading-tight truncate" style={{ color: 'var(--ui-t28)' }}>
                          {pos.address}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--ui-t20)' }}>
                          {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}
                        </span>
                        {!isMoving && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--ui-t20)' }}>
                            <Gauge className="w-2.5 h-2.5" />{formatSpeed(speed)}
                          </span>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="text-[10px]" style={{ color: 'var(--ui-t15)' }}>
                      {isOnline ? t('sidebar.awaitingPosition') : t('device.noPosition')}
                    </p>
                  )}
                </div>

                {/* Botão centrar — hover */}
                {onCenterDevice && (
                  <button
                    onClick={e => { e.stopPropagation(); onCenterDevice(device); }}
                    className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ color: 'var(--ui-t40)', background: 'var(--ui-b08)' }}
                    title={t('sidebar.zoomStreet')}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ui-t40)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b08)'; }}
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--ui-b05)' }}>
                <Truck className="w-5 h-5" style={{ color: 'var(--ui-t15)' }} />
              </div>
              <p className="text-xs text-center" style={{ color: 'var(--ui-t25)' }}>
                {search
                  ? t('sidebar.noResults', { query: search })
                  : t('sidebar.noDevices')}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
