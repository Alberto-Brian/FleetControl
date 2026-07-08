// ========================================
// FILE: src/components/tracking/DeviceSidebar.tsx
// ========================================
import React, { useState } from 'react';
import { ScrollArea }  from '@/components/ui/scroll-area';
import { Search, Truck, Navigation2 } from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed }        from '@/helpers/tracking-helpers';

interface Props {
  devices:        TrackedDevice[];
  positions:      Position[];
  selectedDevice: TrackedDevice | null;
  filteredStatus: 'all' | 'online' | 'offline';
  onSelect:       (device: TrackedDevice) => void;
  onCenterDevice?: (device: TrackedDevice) => void;
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5)    return 'agora';
  if (diff < 60)   return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export function DeviceSidebar({
  devices, positions, selectedDevice, filteredStatus, onSelect, onCenterDevice,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = devices.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.uniqueId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filteredStatus === 'all' || d.status === filteredStatus;
    return matchSearch && matchStatus;
  });

  const onlineCount  = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.length - onlineCount;

  function getPosition(device: TrackedDevice): Position | undefined {
    return positions.find(p => p.deviceId === device.traccar_id);
  }

  return (
    <aside
      className="absolute left-3 top-[60px] bottom-4 z-10 w-72 flex flex-col rounded-xl overflow-hidden pointer-events-auto"
      style={{
        background:  'rgba(10, 17, 32, 0.97)',
        border:      '1px solid rgba(255,255,255,0.07)',
        boxShadow:   '0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* ── Cabeçalho com pesquisa ── */}
      <div className="px-3 pt-3 pb-2.5 flex-shrink-0"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            placeholder="Procurar dispositivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-colors"
            style={{
              background:  'rgba(255,255,255,0.07)',
              color:       'rgba(255,255,255,0.85)',
              border:      '1px solid rgba(255,255,255,0.09)',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.11)'; }}
            onBlur={e  => { (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.07)'; }}
          />
        </div>
      </div>

      {/* ── Contadores ── */}
      <div className="px-3 py-2 flex items-center gap-2 text-xs flex-shrink-0"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>
          {devices.length} dispositivo{devices.length !== 1 ? 's' : ''}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span style={{ color: '#34d399' }} className="font-medium">{onlineCount} online</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{offlineCount} offline</span>
          </span>
        </div>
      </div>

      {/* ── Lista de dispositivos ── */}
      <ScrollArea className="flex-1">
        <div>
          {filtered.map(device => {
            const pos        = getPosition(device);
            const isSelected = selectedDevice?.traccar_id === device.traccar_id;
            const isOnline   = device.status === 'online';
            const isMoving   = (pos?.speed ?? 0) > 0;

            return (
              <button
                key={device.id}
                onClick={() => onSelect(device)}
                className="w-full flex items-start gap-3 px-3 py-3 text-left transition-all group"
                style={{
                  background:   isSelected ? 'rgba(59,130,246,0.15)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft:   isSelected
                    ? '3px solid #3b82f6'
                    : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  if (!isSelected)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {/* Ícone do veículo */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                  style={{
                    background: isOnline
                      ? 'rgba(52,211,153,0.12)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {isMoving
                    ? <Navigation2 className="w-4 h-4"
                        style={{ color: '#34d399', transform: `rotate(${pos?.course ?? 0}deg)` }} />
                    : <Truck className="w-4 h-4"
                        style={{ color: isOnline ? '#34d399' : 'rgba(255,255,255,0.25)' }} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold truncate"
                       style={{ color: 'rgba(255,255,255,0.88)' }}>
                      {device.name}
                    </p>
                    {onCenterDevice && (
                      <button
                        onClick={e => { e.stopPropagation(); onCenterDevice(device); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-0.5 rounded"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        title="Centrar no mapa"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: isOnline
                          ? '#4ade80'
                          : 'rgba(255,255,255,0.2)',
                        boxShadow: isOnline ? '0 0 4px #4ade80' : 'none',
                      }}
                    />
                    <span className="text-xs"
                          style={{ color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                    {pos && pos.speed > 0 && (
                      <span className="text-xs ml-auto"
                            style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {formatSpeed(pos.speed)}
                      </span>
                    )}
                  </div>

                  {pos?.address && (
                    <p className="text-xs mt-1 truncate"
                       style={{ color: 'rgba(255,255,255,0.28)' }}>
                      {pos.address}
                    </p>
                  )}

                  {device.lastUpdate && (
                    <p className="text-[10px] mt-0.5"
                       style={{ color: 'rgba(255,255,255,0.18)' }}>
                      {formatRelativeTime(device.lastUpdate)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm"
                 style={{ color: 'rgba(255,255,255,0.25)' }}>
              {search ? 'Nenhum resultado para a pesquisa' : 'Sem dispositivos'}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
