// ========================================
// FILE: src/components/tracking/TrackingToolbar.tsx
// ========================================
import React, { useEffect, useRef, useState } from 'react';
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
  unreadAlerts:       number;
  isAlertPanelOpen:   boolean;
  onToggleAlerts:     () => void;
  isGeoPanelOpen:     boolean;
  onToggleGeoPanel:   () => void;
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
        color:      active ? '#60a5fa' : 'var(--ui-t55)',
        background: active ? 'rgba(59,130,246,0.18)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b10)';
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
  const [cooldownOpen,          setCooldownOpen]          = useState(false);
  const [cooldownIgnitionOpen,  setCooldownIgnitionOpen]  = useState(false);
  const [cooldownMovingOpen,    setCooldownMovingOpen]    = useState(false);
  const { labelType, animateMarkers, pulseMarkers, setLabelType, setAnimateMarkers, setPulseMarkers } = useMapSettings();
  const settingsRef = useRef<HTMLDivElement>(null);
  const layerRef    = useRef<HTMLDivElement>(null);

  type AlertSettings = {
    notifyNativeEnter:   boolean;
    notifyNativeExit:    boolean;
    notifyNativeSpeed:   boolean;
    notifyIgnitionOn:    boolean;
    notifyIgnitionOff:   boolean;
    notifyDeviceMoving:  boolean;
    notifyDeviceStopped: boolean;
    cooldownSpeedMs?:    number;
    cooldownIgnitionMs?: number;
    cooldownMovingMs?:   number;
  };
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);

  useEffect(() => {
    // Só carrega se ainda não temos settings locais — evita sobrescrever toggles do utilizador
    if (!mapSettingsOpen || alertSettings !== null) return;
    let cancelled = false;
    (window as any)._tracking?.getAlertSettings()
      ?.then((s: any) => {
        if (!cancelled && s) {
          // Aplica só se o utilizador ainda não fez alterações (prev ainda é null)
          setAlertSettings(prev => prev === null ? s : prev);
        }
      })
      ?.catch(console.error);
    return () => { cancelled = true; };
  }, [mapSettingsOpen, alertSettings]);

  // Close popups when clicking outside their containers
  useEffect(() => {
    if (!mapSettingsOpen && !layerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (mapSettingsOpen && settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setMapSettingsOpen(false);
        setCooldownOpen(false);
        setCooldownIgnitionOpen(false);
        setCooldownMovingOpen(false);
      }
      if (layerOpen && layerRef.current && !layerRef.current.contains(e.target as Node)) {
        setLayerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mapSettingsOpen, layerOpen]);

  const DEFAULT_SETTINGS: AlertSettings = {
    notifyNativeEnter: true, notifyNativeExit: true, notifyNativeSpeed: true,
    notifyIgnitionOn: false, notifyIgnitionOff: false,
    notifyDeviceMoving: false, notifyDeviceStopped: false,
    cooldownSpeedMs: 60000, cooldownIgnitionMs: 0, cooldownMovingMs: 0,
  };

  function updateAlertSetting<K extends keyof AlertSettings>(key: K, val: AlertSettings[K]) {
    const base: AlertSettings = alertSettings ?? DEFAULT_SETTINGS;
    const next = { ...base, [key]: val };
    setAlertSettings(next);
    // Dispatch with detail so TrackingContext applies the new values instantly (no API roundtrip race)
    window.dispatchEvent(new CustomEvent('alertSettingsChanged', { detail: next }));
    (window as any)._tracking?.updateAlertSettings(next)?.catch(console.error);
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
            background: 'var(--ui-nav-bg)',
            border:     '1px solid var(--ui-b07)',
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
          background: 'var(--ui-nav-bg)',
          border:     '1px solid var(--ui-b07)',
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
            <WifiOff className="w-3 h-3" style={{ color: 'var(--ui-t35)' }} />
          )}
          <span
            className="text-xs font-semibold"
            style={{ color: isConnected ? '#34d399' : 'var(--ui-t35)' }}
          >
            {isConnected ? t('toolbar.realtime') : t('toolbar.offline')}
          </span>
        </div>

        <div className="w-px h-3.5" style={{ background: 'var(--ui-b08)' }} />

        {/* Contadores */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>
              {onlineDevices}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ui-t20)' }} />
            <span className="text-xs" style={{ color: 'var(--ui-t35)' }}>
              {offlineDevices}
            </span>
          </span>
          <span
            className="text-xs pl-1.5"
            style={{ color: 'var(--ui-t25)', borderLeft: '1px solid var(--ui-b08)' }}
          >
            {totalDevices} {t('toolbar.totalSuffix')}
          </span>
        </div>

        {/* Última actualização */}
        {lastUpdate && (
          <>
            <div className="w-px h-3.5" style={{ background: 'var(--ui-b08)' }} />
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ui-t20)' }}>
              <Clock className="w-3 h-3" />
              {formatLastUpdate(lastUpdate)}
            </span>
          </>
        )}

        {/* Follow mode */}
        {followMode && (
          <>
            <div className="w-px h-3.5" style={{ background: 'var(--ui-b08)' }} />
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                {followDeviceName ? followDeviceName : t('toolbar.followActive')}
              </span>
              {onStopFollow && (
                <button
                  onClick={onStopFollow}
                  className="w-4 h-4 flex items-center justify-center rounded transition-colors"
                  style={{ color: 'rgba(167,139,250,0.6)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(167,139,250,0.6)'; }}
                  title={t('toolbar.stopFollow')}
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
            <div className="w-px h-3.5" style={{ background: 'var(--ui-b08)' }} />
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
          background: 'var(--ui-nav-bg)',
          border:     '1px solid var(--ui-b07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Fit all */}
        {onFitAll && (
          <MapBtn title={t('toolbar.fitAll')} onClick={onFitAll}>
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
        <div className="relative" ref={layerRef}>
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
                background: 'var(--ui-nav-bg)',
                border:     '1px solid var(--ui-b10)',
                boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ui-t30)' }}>
                {t('toolbar.layersTitle')}
              </p>
              {LAYERS.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => { onLayerChange?.(layer.id); setLayerOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs transition-colors"
                  style={{
                    color:      currentLayer === layer.id ? '#60a5fa' : 'var(--ui-t65)',
                    background: currentLayer === layer.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (currentLayer !== layer.id)
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b07)';
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
          background: 'var(--ui-nav-bg)',
          border:     '1px solid var(--ui-b07)',
          boxShadow:  '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Geofences */}
        <MapBtn
          title={t('toolbar.geofences')}
          active={isGeoPanelOpen}
          onClick={onToggleGeoPanel}
        >
          <Pentagon className="w-4 h-4" />
        </MapBtn>

        {/* Alertas */}
        <div className="relative">
          <MapBtn
            title={t('toolbar.alerts')}
            active={isAlertPanelOpen}
            onClick={onToggleAlerts}
          >
            <Bell className="w-4 h-4" />
          </MapBtn>
          {unreadAlerts > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[18px] h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center px-0.5 pointer-events-none"
              style={{ background: '#ef4444', color: 'white' }}
            >
              {unreadAlerts > 99 ? '99+' : unreadAlerts}
            </span>
          )}
        </div>

        {/* Definições do mapa */}
        <div className="relative" ref={settingsRef}>
          <MapBtn
            title={t('toolbar.mapSettings')}
            active={mapSettingsOpen}
            onClick={() => setMapSettingsOpen(v => !v)}
          >
            <Settings className="w-4 h-4" />
          </MapBtn>

          {mapSettingsOpen && (
            <div
              className="absolute top-full right-0 mt-2 rounded-xl z-50 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{
                background: 'var(--ui-nav-bg)',
                border:     '1px solid var(--ui-b10)',
                boxShadow:  '0 8px 32px rgba(0,0,0,0.6)',
                maxHeight:  'calc(100vh - 80px)',
                padding:    12,
                minWidth:   210,
              }}
            >
              <p className="pb-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ui-t30)' }}>
                {t('toolbar.mapSettings')}
              </p>

              {/* Etiqueta dos marcadores */}
              <p className="text-[10px] mb-1.5" style={{ color: 'var(--ui-t40)' }}>
                {t('toolbar.markerLabel')}
              </p>
              <div className="flex gap-1 mb-3">
                {([
                  { id: 'plate' as const,       label: t('toolbar.labelPlate') },
                  { id: 'brand_model' as const, label: t('toolbar.labelBrand') },
                  { id: 'both' as const,        label: t('toolbar.labelBoth')  },
                ]).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLabelType(item.id)}
                    className="flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      color:      labelType === item.id ? '#60a5fa' : 'var(--ui-t55)',
                      background: labelType === item.id ? 'rgba(59,130,246,0.2)' : 'var(--ui-b05)',
                      border:     labelType === item.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="h-px mb-3" style={{ background: 'var(--ui-b08)' }} />

              {/* Animar marcadores */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.animateMarkers')}
                </span>
                <MapMiniToggle checked={animateMarkers} onChange={() => setAnimateMarkers(!animateMarkers)} />
              </div>

              {/* Pulsação */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.pulseMarkers')}
                </span>
                <MapMiniToggle checked={pulseMarkers} onChange={() => setPulseMarkers(!pulseMarkers)} />
              </div>

              <div className="h-px mt-3 mb-2.5" style={{ background: 'var(--ui-b08)' }} />

              <p className="pb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--ui-t30)' }}>
                {t('toolbar.alertNotifications')}
              </p>

              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyEnter')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeEnter ?? true}
                  onChange={() => updateAlertSetting('notifyNativeEnter', !(alertSettings?.notifyNativeEnter ?? true))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyExit')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeExit ?? true}
                  onChange={() => updateAlertSetting('notifyNativeExit', !(alertSettings?.notifyNativeExit ?? true))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifySpeed')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyNativeSpeed ?? true}
                  onChange={() => updateAlertSetting('notifyNativeSpeed', !(alertSettings?.notifyNativeSpeed ?? true))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyIgnitionOn')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyIgnitionOn ?? false}
                  onChange={() => updateAlertSetting('notifyIgnitionOn', !(alertSettings?.notifyIgnitionOn ?? false))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyIgnitionOff')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyIgnitionOff ?? false}
                  onChange={() => updateAlertSetting('notifyIgnitionOff', !(alertSettings?.notifyIgnitionOff ?? false))}
                />
              </div>
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyDeviceMoving')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyDeviceMoving ?? false}
                  onChange={() => updateAlertSetting('notifyDeviceMoving', !(alertSettings?.notifyDeviceMoving ?? false))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                  {t('toolbar.notifyDeviceStopped')}
                </span>
                <MapMiniToggle
                  checked={alertSettings?.notifyDeviceStopped ?? false}
                  onChange={() => updateAlertSetting('notifyDeviceStopped', !(alertSettings?.notifyDeviceStopped ?? false))}
                />
              </div>

              {/* Intervalos mínimos entre alertas */}
              {(() => {
                const OPTS = [
                  { ms: 0,       label: t('toolbar.noInterval') },
                  { ms: 30000,   label: t('toolbar.opt30s') },
                  { ms: 60000,   label: t('toolbar.opt1m') },
                  { ms: 300000,  label: t('toolbar.opt5m') },
                  { ms: 900000,  label: t('toolbar.opt15m') },
                  { ms: 1800000, label: t('toolbar.opt30m') },
                ];

                type CooldownField = 'cooldownSpeedMs' | 'cooldownIgnitionMs' | 'cooldownMovingMs';
                const COOLDOWNS: { label: string; field: CooldownField; open: boolean; setOpen: (v: boolean) => void; default: number }[] = [
                  { label: t('toolbar.cooldownSpeedLabel'),    field: 'cooldownSpeedMs',    open: cooldownOpen,         setOpen: setCooldownOpen,         default: 60000 },
                  { label: t('toolbar.cooldownIgnitionLabel'), field: 'cooldownIgnitionMs', open: cooldownIgnitionOpen, setOpen: setCooldownIgnitionOpen, default: 0 },
                  { label: t('toolbar.cooldownMovementLabel'), field: 'cooldownMovingMs',   open: cooldownMovingOpen,   setOpen: setCooldownMovingOpen,   default: 0 },
                ];

                return (
                  <>
                    {COOLDOWNS.map(cd => {
                      const current = (alertSettings as any)?.[cd.field] ?? cd.default;
                      const currentLabel = OPTS.find(o => o.ms === current)?.label ?? t('toolbar.noInterval');
                      return (
                        <div key={cd.field} className="flex items-center justify-between gap-3 mt-2.5">
                          <span className="text-xs" style={{ color: 'var(--ui-t65)' }}>
                            {cd.label}
                          </span>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => cd.setOpen(!cd.open)}
                              className="flex items-center gap-1 text-xs rounded-md px-2"
                              style={{
                                height:         22,
                                background:     'var(--ui-b12)',
                                color:          'var(--ui-t85)',
                                minWidth:       80,
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{currentLabel}</span>
                              <span style={{ opacity: 0.5, fontSize: 9 }}>▼</span>
                            </button>
                            {cd.open && (
                              <div
                                className="absolute right-0 rounded-lg overflow-hidden z-50"
                                style={{
                                  bottom:     26,
                                  minWidth:   100,
                                  background: 'var(--ui-nav-bg)',
                                  border:     '1px solid var(--ui-b12)',
                                  boxShadow:  '0 4px 20px rgba(0,0,0,0.5)',
                                }}
                              >
                                {OPTS.map(o => (
                                  <button
                                    key={o.ms}
                                    type="button"
                                    onClick={() => { updateAlertSetting(cd.field, o.ms); cd.setOpen(false); }}
                                    className="w-full text-left text-xs px-3 py-1.5 transition-colors"
                                    style={{
                                      color:      o.ms === current ? 'rgba(96,165,250,1)' : 'var(--ui-t75)',
                                      background: o.ms === current ? 'rgba(59,130,246,0.12)' : 'transparent',
                                    }}
                                    onMouseEnter={e => { if (o.ms !== current) (e.currentTarget as HTMLElement).style.background = 'var(--ui-b07)'; }}
                                    onMouseLeave={e => { if (o.ms !== current) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                  >
                                    {o.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
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
      className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
      style={{
        width:      36,
        height:     20,
        background: checked ? 'rgba(59,130,246,0.9)' : 'var(--ui-b12)',
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          top:       2,
          left:      2,
          width:     16,
          height:    16,
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
        }}
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
