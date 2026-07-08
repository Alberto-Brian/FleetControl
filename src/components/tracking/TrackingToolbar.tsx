// ========================================
// FILE: src/components/tracking/TrackingToolbar.tsx
// ========================================
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  WifiOff, History, Layers, Link2, PlusCircle, PanelLeft, Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  isConnected:     boolean;
  isSidebarOpen:   boolean;
  onToggleSidebar: () => void;
  showingHistory:  boolean;
  onExitHistory:   () => void;
  onlineDevices:   number;
  offlineDevices:  number;
  totalDevices:    number;
  isLoading?:      boolean;
  lastUpdate?:     Date | null;
  onLinkDevices?:  () => void;
  onCreateDevice?: () => void;
}

function MapBtn({ title, onClick, children, className = '' }: {
  title: string; onClick?: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${className}`}
      style={{ color: 'rgba(255,255,255,0.55)', background: 'transparent' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

export function TrackingToolbar({
  isConnected,
  isSidebarOpen,
  onToggleSidebar,
  showingHistory,
  onExitHistory,
  onlineDevices,
  offlineDevices,
  totalDevices,
  isLoading = false,
  lastUpdate,
  onLinkDevices,
  onCreateDevice,
}: Props) {
  const { t } = useTranslation('tracking');

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">

      {/* Toggle sidebar — só aparece quando sidebar está fechada */}
      {!isSidebarOpen && (
        <div
          className="pointer-events-auto flex items-center rounded-xl overflow-hidden"
          style={{
            background: 'rgba(10,17,32,0.92)',
            border:     '1px solid rgba(255,255,255,0.07)',
            boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <MapBtn title="Abrir painel" onClick={onToggleSidebar}>
            <PanelLeft className="w-4 h-4" />
          </MapBtn>
        </div>
      )}

      {/* Status pill */}
      <div
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{
          background: 'rgba(10,17,32,0.92)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          ) : (
            <WifiOff className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.35)' }} />
          )}
          <span
            className="text-xs font-semibold"
            style={{ color: isConnected ? '#34d399' : 'rgba(255,255,255,0.35)' }}
          >
            {isConnected ? t('toolbar.realtime') : t('toolbar.offline')}
          </span>
        </div>

        <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Counters */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>
              {onlineDevices}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {offlineDevices}
            </span>
          </span>
          <span className="text-xs pl-1.5" style={{
            color: 'rgba(255,255,255,0.25)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          }}>
            {totalDevices} disp.
          </span>
        </div>

        {/* Last update */}
        {lastUpdate && (
          <>
            <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Clock className="w-3 h-3" />
              {formatLastUpdate(lastUpdate)}
            </span>
          </>
        )}

        {/* Exit history */}
        {showingHistory && (
          <>
            <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={onExitHistory}
              className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md transition-colors"
              style={{
                color:      '#fbbf24',
                background: 'rgba(251,191,36,0.12)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.12)'; }}
            >
              <History className="w-3.5 h-3.5" />
              {t('toolbar.exitHistory')}
            </button>
          </>
        )}
      </div>

      {/* Action buttons group */}
      <div
        className="pointer-events-auto flex items-center rounded-xl overflow-hidden"
        style={{
          background: 'rgba(10,17,32,0.92)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {onCreateDevice && isConnected && (
          <MapBtn title="Cadastrar dispositivo Traccar" onClick={onCreateDevice}>
            <PlusCircle className="w-4 h-4" />
          </MapBtn>
        )}
        {onLinkDevices && isConnected && (
          <MapBtn title="Associar veículos a dispositivos" onClick={onLinkDevices}>
            <Link2 className="w-4 h-4" />
          </MapBtn>
        )}
        <MapBtn title={t('toolbar.layers')}>
          <Layers className="w-4 h-4" />
        </MapBtn>
      </div>
    </div>
  );
}

function formatLastUpdate(date: Date): string {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}
