// ========================================
// FILE: src/components/tracking/TrackingToolbar.tsx
// ========================================
import React, { useEffect, useState } from 'react';
import {
  WifiOff, History, Layers, PanelLeft, Clock, Settings,
  ZoomIn, ZoomOut, Map, Satellite, Maximize2, Radio, X,
  Bell, Pentagon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import UserMenu from '@/components/UserMenu';
import { useMapSettings } from '@/hooks/useMapSettings';

type TileLayer = 'osm' | 'satellite' | 'hybrid' | 'terrain' | 'carto';

interface Props {
  isConnected:     boolean;
  isSidebarOpen:   boolean;
  onToggleSidebar: () => void;
  showingHistory:  boolean;
  onExitHistory:   () => void;
  onlineDevices:   number;
  offlineDevices:  number;
  totalDevices:    number;
  lastUpdate?:     Date | null;
  mapRef?:          React.MutableRefObject<any>;
  currentLayer?:    TileLayer;
  onLayerChange?:   (layer: TileLayer) => void;
  followMode?:      boolean;
  followDeviceName?: string | null;
  onFitAll?:        () => void;
  onStopFollow?:    () => void;
  unreadAlerts:     number;
  isAlertPanelOpen: boolean;
  onToggleAlerts:   () => void;
  isGeoPanelOpen:   boolean;
  onToggleGeoPanel: () => void;
}

function MapBtn({ title, onClick, active = false, children }: {
  title: string; onClick?: () => void; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{
        color:      active ? '#60a5fa' : 'rgba(255,255,255,0.55)',
        background: active ? 'rgba(59,130,246,0.18)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
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
  lastUpdate,
  mapRef,
  currentLayer = 'osm',
  onLayerChange,
  followMode = false,
  followDeviceName,
  onFitAll,
  onStopFollow,
  unreadAlerts,
  isAlertPanelOpen,
  onToggleAlerts,
  isGeoPanelOpen,
  onToggleGeoPanel,
}: Props) {
  const { t } = useTranslation('tracking');
  const [layerOpen,        setLayerOpen]        = useState(false);
  const [mapSettingsOpen,  setMapSettingsOpen]  = useState(false);
  const { labelType, animateMarkers, pulseMarkers, setLabelType, setAnimateMarkers, setPulseMarkers } = useMapSettings();

  type AlertSettings = { notifyNativeEnter: boolean; notifyNativeExit: boolean; notifyNativeSpeed: boolean };
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);

  useEffect(() => {
    if (!mapSettingsOpen) return;
    (window as any)._tracking?.getAlertSettings()
      ?.then((s: any) => { if (s) setAlertSettings(s); })
      ?.catch(console.error);
  }, [mapSettingsOpen]);

  function updateAlertSetting(key: keyof AlertSettings, val: boolean) {
    const base: AlertSettings = alertSettings ?? { notifyNativeEnter: true, notifyNativeExit: true, notifyNativeSpeed: true };
    const next = { ...base, [key]: val };
    setAlertSettings(next);
    (window as any)._tracking?.updateAlertSettings(next)?.catch(console.error);
    window.dispatchEvent(new CustomEvent('alertSettingsChanged'));
  }

  const LAYERS: { id: TileLayer; label: string; icon: React.ReactNode }[] = [
    { id: 'osm',       label: t('toolbar.layerOSM'),       icon: <Map       className="w-3.5 h-3.5" /> },
    { id: 'satellite', label: t('toolbar.layerSatellite'), icon: <Satellite className="w-3.5 h-3.5" /> },
    {
      id: 'hybrid',
      label: t('toolbar.layerHybrid', 'Híbrido'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      id: 'terrain',
      label: t('toolbar.layerTerrain', 'Terreno'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
        </svg>
      ),
    },
    {
      id: 'carto',
      label: t('toolbar.layerCarto', 'Carto'),
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">

      {/* Botão abrir sidebar — só quando sidebar está fechada */}
      {!isSidebarOpen && (
        <div
          className="pointer-events-auto flex items-center rounded-xl overflow-hidden"
          style={{
            background: 'rgba(10,17,32,0.92)',
            border:     '1px solid rgba(255,255,255,0.07)',
            boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <MapBtn title={t('toolbar.openSidebar')} onClick={onToggleSidebar}>
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
        {/* Ligação */}
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

        {/* Contadores */}
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
          <span
            className="text-xs pl-1.5"
            style={{ color: 'rgba(255,255,255,0.25)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
          >
            {totalDevices} {t('toolbar.totalSuffix')}
          </span>
        </div>

        {/* Última actualização */}
        {lastUpdate && (
          <>
            <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Clock className="w-3 h-3" />
              {formatLastUpdate(lastUpdate)}
            </span>
          </>
        )}

        {/* Follow mode */}
        {followMode && (
          <>
            <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                {followDeviceName ? followDeviceName : t('toolbar.followActive', 'A seguir...')}
              </span>
              {onStopFollow && (
                <button
                  onClick={onStopFollow}
                  className="w-4 h-4 flex items-center justify-center rounded transition-colors"
                  style={{ color: 'rgba(167,139,250,0.6)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(167,139,250,0.6)'; }}
                  title={t('toolbar.stopFollow', 'Parar seguimento')}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </>
        )}

        {/* Sair do histórico */}
        {showingHistory && (
          <>
            <div className="w-px h-3.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={onExitHistory}
              className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md transition-colors"
              style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.12)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(251,191,36,0.12)'; }}
            >
              <History className="w-3.5 h-3.5" />
              {t('toolbar.exitHistory')}
            </button>
          </>
        )}
      </div>

      {/* Botões de zoom + camadas */}
      <div
        className="pointer-events-auto flex items-center rounded-xl overflow-visible relative"
        style={{
          background: 'rgba(10,17,32,0.92)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Fit all */}
        {onFitAll && (
          <MapBtn title={t('toolbar.fitAll', 'Ver todos')} onClick={onFitAll}>
            <Maximize2 className="w-4 h-4" />
          </MapBtn>
        )}

        {/* Zoom in */}
        <MapBtn title={t('toolbar.zoomIn')} onClick={() => mapRef?.current?.zoomIn()}>
          <ZoomIn className="w-4 h-4" />
        </MapBtn>

        {/* Zoom out */}
        <MapBtn title={t('toolbar.zoomOut')} onClick={() => mapRef?.current?.zoomOut()}>
          <ZoomOut className="w-4 h-4" />
        </MapBtn>

        {/* Camadas */}
        <div className="relative">
          <MapBtn
            title={t('toolbar.layers')}
            active={layerOpen}
            onClick={() => setLayerOpen(v => !v)}
          >
            <Layers className="w-4 h-4" />
          </MapBtn>

          {layerOpen && (
            <div
              className="absolute top-full right-0 mt-2 rounded-xl p-1.5 min-w-[160px] z-50"
              style={{
                background: 'rgba(10,17,32,0.98)',
                border:     '1px solid rgba(255,255,255,0.1)',
                boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('toolbar.layersTitle')}
              </p>
              {LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => { onLayerChange?.(layer.id); setLayerOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    color:      currentLayer === layer.id ? '#60a5fa' : 'rgba(255,255,255,0.65)',
                    background: currentLayer === layer.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (currentLayer !== layer.id)
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                  }}
                  onMouseLeave={e => {
                    if (currentLayer !== layer.id)
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {layer.icon}
                  {layer.label}
                  {currentLayer === layer.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Definições + Perfil */}
      <div
        className="pointer-events-auto flex items-center gap-0.5 rounded-xl px-1"
        style={{
          background: 'rgba(10,17,32,0.92)',
          border:     '1px solid rgba(255,255,255,0.07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Geofences */}
        <MapBtn
          title={t('toolbar.geofences', 'Zonas')}
          active={isGeoPanelOpen}
          onClick={onToggleGeoPanel}
        >
          <Pentagon className="w-4 h-4" />
        </MapBtn>

        {/* Alertas */}
        <div className="relative">
          <MapBtn
            title={t('toolbar.alerts', 'Alertas')}
            active={isAlertPanelOpen}
            onClick={onToggleAlerts}
          >
            <Bell className="w-4 h-4" />
          </MapBtn>
          {unreadAlerts > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center pointer-events-none"
              style={{ background: '#ef4444', color: 'white' }}
            >
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </div>

        {/* Definições do mapa */}
        <div className="relative">
          <MapBtn
            title={t('toolbar.mapSettings', 'Definições do mapa')}
            active={mapSettingsOpen}
            onClick={() => setMapSettingsOpen(v => !v)}
          >
            <Settings className="w-4 h-4" />
          </MapBtn>

          {mapSettingsOpen && (
            <div
              className="absolute top-full right-0 mt-2 rounded-xl p-3 z-50"
              style={{
                background: 'rgba(10,17,32,0.98)',
                border:     '1px solid rgba(255,255,255,0.1)',
                boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
                minWidth:   210,
              }}
            >
              <p className="pb-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('toolbar.mapSettings', 'Definições do mapa')}
              </p>

              {/* Etiqueta dos marcadores */}
              <p className="text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {t('toolbar.markerLabel', 'Etiqueta dos marcadores')}
              </p>
              <div className="flex gap-1 mb-3">
                {([
                  { id: 'plate' as const,       label: t('toolbar.labelPlate',      'Matrícula') },
                  { id: 'brand_model' as const, label: t('toolbar.labelBrand',      'Marca')     },
                  { id: 'both' as const,        label: t('toolbar.labelBoth',       'Ambos')     },
                ]).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLabelType(item.id)}
                    className="flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      color:      labelType === item.id ? '#60a5fa' : 'rgba(255,255,255,0.55)',
                      background: labelType === item.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                      border:     labelType === item.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

              {/* Animar marcadores */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('toolbar.animateMarkers', 'Animar marcadores')}
                </span>
                <MapMiniToggle checked={animateMarkers} onChange={() => setAnimateMarkers(!animateMarkers)} />
              </div>

              {/* Pulsação */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('toolbar.pulseMarkers', 'Pulsação')}
                </span>
                <MapMiniToggle checked={pulseMarkers} onChange={() => setPulseMarkers(!pulseMarkers)} />
              </div>

              <div className="h-px mt-3 mb-2.5" style={{ background: 'rgba(255,255,255,0.08)' }} />

              <p className="pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {t('toolbar.alertNotifications', 'Notificações GPS')}
              </p>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('toolbar.notifyEnter', 'Entrada em zona')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeEnter ?? true}
                  onChange={() => updateAlertSetting('notifyNativeEnter', !(alertSettings?.notifyNativeEnter ?? true))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('toolbar.notifyExit', 'Saída de zona')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeExit ?? true}
                  onChange={() => updateAlertSetting('notifyNativeExit', !(alertSettings?.notifyNativeExit ?? true))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('toolbar.notifySpeed', 'Excesso de velocidade')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeSpeed ?? true}
                  onChange={() => updateAlertSetting('notifyNativeSpeed', !(alertSettings?.notifyNativeSpeed ?? true))}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-8 h-8 flex items-center justify-center">
          <UserMenu compact />
        </div>
      </div>
    </div>
  );
}

function MapMiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200"
      style={{
        width:      32,
        height:     18,
        background: checked ? 'rgba(59,130,246,0.85)' : 'rgba(255,255,255,0.18)',
      }}
    >
      <span
        className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200"
        style={{ transform: checked ? 'translateX(15px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

function formatLastUpdate(date: Date): string {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}
