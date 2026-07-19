// ========================================
// FILE: src/pages/provider/TrackingPageContent.tsx
// ========================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation }    from 'react-i18next';
import { useTracking }       from '@/contexts/TrackingContext';
import { useApiConnection }  from '@/hooks/useApiConnection';
import {
  getTrackedDevices,
  getLivePositions,
  getPositionHistory,
  syncDevices,
} from '@/helpers/tracking-helpers';
import { TrackingMap, TileLayerId } from '@/components/tracking/TrackingMap';
import { DeviceSidebar }            from '@/components/tracking/DeviceSidebar';
import { TrackingToolbar }          from '@/components/tracking/TrackingToolbar';
import { DeviceInfoPanel }          from '@/components/tracking/DeviceInfoPanel';
import { GeofencePanel }            from '@/components/tracking/GeofencePanel';
import { AlertPanel }               from '@/components/tracking/AlertPanel';
import { GeofenceFormModal }        from '@/components/tracking/GeofenceFormModal';
import { TraccarDevicesPanel }      from '@/components/tracking/TraccarDevicesPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useMapSettings }           from '@/hooks/useMapSettings';

interface TrackingPageContentProps {
  showControls?: boolean;
  leftOffset?:   number;
  onOpenSettings?: () => void;
}

export function TrackingPageContent({ showControls = true, leftOffset = 0, onOpenSettings }: TrackingPageContentProps) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch, isConnected, reconnectCount, reconciliationWarning, dismissReconciliationWarning } = useTracking();
  const { labelType, animateMarkers, pulseMarkers } = useMapSettings();
  const mapRef             = useRef<any>(null);
  const zoomCycleRef       = useRef<0 | 1 | 2>(0); // 0=bairro(14) 1=rua(18) 2=todos
  const initialViewDoneRef = useRef(false);
  const alertsLoadedRef    = useRef(false);
  const [tileLayer, setTileLayer] = useState<TileLayerId>('osm');

  const [alertPanelOpen,   setAlertPanelOpen]   = useState(false);
  const [geoPanelOpen,     setGeoPanelOpen]      = useState(false);
  const [drawMode,         setDrawMode]          = useState<'circle' | 'polygon' | null>(null);
  const [pendingWkt,       setPendingWkt]        = useState<string | null>(null);
  const [geoFormOpen,      setGeoFormOpen]       = useState(false);
  const [devicesPanelOpen, setDevicesPanelOpen]  = useState(false);

  useEffect(() => { loadInitial(); }, []);
  // Recarrega dados após reconexão Socket.IO (reconnectCount começa em 0, skip no mount)
  useEffect(() => { if (reconnectCount > 0) loadInitial(); }, [reconnectCount]);

  // Ao carregar as primeiras posições, encaixa todos no ecrã (uma vez)
  useEffect(() => {
    if (!initialViewDoneRef.current && state.positions.length > 0 && mapRef.current) {
      initialViewDoneRef.current = true;
      fitAllDevices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.positions.length]);

  // Follow mode: recentra ao receber novas posições
  useEffect(() => {
    if (!state.followMode || !state.selectedDevice || !mapRef.current) return;
    const pos = state.positions.find(p => p.deviceId === state.selectedDevice!.traccar_id);
    if (pos) {
      mapRef.current.setView([pos.latitude, pos.longitude], mapRef.current.getZoom(), { animate: true, duration: 0.8 });
    }
  }, [state.positions, state.followMode]);

  // Load alerts once on first connection (guard prevents duplicates on reconnect)
  useEffect(() => {
    if (!isConnected || alertsLoadedRef.current) return;
    alertsLoadedRef.current = true;
    (window as any)._tracking.getAlerts({ limit: 100 })
      .then((res: any) => {
        if (res?.data) dispatch({ type: 'ALERTS_RECEIVED', payload: res.data });
      })
      .catch(console.error);
  }, [isConnected]);

  async function loadInitial() {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isConnected) await syncDevices();
      const [devs, rawPos] = await Promise.all([
        getTrackedDevices(),
        getLivePositions(),
      ]);
      // Normaliza posições para o mesmo formato que o WebSocket emite
      const pos = (rawPos as any[]).map(p => ({
        deviceId:     p.deviceId,
        latitude:     p.latitude,
        longitude:    p.longitude,
        altitude:     p.altitude,
        speed:        p.speed,
        course:       p.course,
        accuracy:     p.accuracy,
        address:      p.address    ?? null,
        batteryLevel: p.attributes?.batteryLevel ?? null,
        timestamp:    p.fixTime || p.serverTime || p.deviceTime || new Date().toISOString(),
        attributes:   p.attributes,
      }));
      dispatch({ type: 'SET_DEVICES',   payload: devs });
      dispatch({ type: 'SET_POSITIONS', payload: pos  });
    } catch (err) {
      console.error('[Tracking] Erro ao carregar:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  const fitAllDevices = useCallback(() => {
    if (!mapRef.current) return;
    const pts = state.positions;
    if (pts.length === 0) return;
    if (pts.length === 1) {
      mapRef.current.setView([pts[0].latitude, pts[0].longitude], 14, { animate: true });
    } else {
      const bounds = pts.map(p => [p.latitude, p.longitude] as [number, number]);
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
  }, [state.positions]);

  function getDevicePos(device: typeof state.devices[0]) {
    return state.positions.find(p => p.deviceId === device.traccar_id);
  }

  function handleDeviceSelect(device: typeof state.devices[0]) {
    const isAlreadySelected = state.selectedDevice?.traccar_id === device.traccar_id;
    dispatch({ type: 'SELECT_DEVICE', payload: device });
    dispatch({ type: 'TOGGLE_HISTORY', payload: false });

    if (isAlreadySelected) {
      // Ciclo de zoom: 0(bairro) → 1(rua) → 2(todos) → 0
      const next = ((zoomCycleRef.current + 1) % 3) as 0 | 1 | 2;
      zoomCycleRef.current = next;
      const pos = getDevicePos(device);
      if (next === 1 && pos) {
        mapRef.current?.setView([pos.latitude, pos.longitude], 18, { animate: true });
      } else if (next === 2) {
        fitAllDevices();
      } else if (pos) {
        mapRef.current?.setView([pos.latitude, pos.longitude], 14, { animate: true });
      }
    } else {
      zoomCycleRef.current = 0;
      const pos = getDevicePos(device);
      if (pos) mapRef.current?.setView([pos.latitude, pos.longitude], 14, { animate: true });
    }
  }

  function handleFollowDevice(device: typeof state.devices[0]) {
    const isFollowing = state.followMode && state.followDeviceId === device.traccar_id;
    dispatch({ type: 'SET_FOLLOW', payload: isFollowing ? null : device.traccar_id });
    // Centrar no dispositivo ao activar follow
    if (!isFollowing) {
      const pos = getDevicePos(device);
      if (pos) mapRef.current?.setView([pos.latitude, pos.longitude], 16, { animate: true });
    }
  }

  async function handleShowHistory(from: string, to: string) {
    if (!state.selectedDevice) return;
    dispatch({ type: 'TOGGLE_HISTORY', payload: true });
    try {
      const raw = await getPositionHistory(state.selectedDevice.traccar_id, from, to);
      // Normalize timeseries DB field names to match Position shape expected by TrackingMap
      const hist = raw.map((p: any) => ({
        ...p,
        deviceId:  p.deviceId  ?? p.traccarDeviceId,
        timestamp: p.timestamp ?? (typeof p.fixTime === 'string'
          ? p.fixTime.replace(' ', 'T')
          : p.fixTime instanceof Date ? p.fixTime.toISOString() : null),
      }));
      dispatch({ type: 'SET_HISTORY', payload: hist as any });
    } catch (err) {
      console.error('[Tracking] Erro ao carregar histórico:', err);
      dispatch({ type: 'TOGGLE_HISTORY', payload: false });
    }
  }

  if (showControls && state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('map.loading', 'A carregar...')}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      {/* Mapa */}
      <TrackingMap
        mapRef={mapRef}
        positions={state.positions}
        historyPositions={state.historyPositions}
        devices={state.devices}
        selectedDevice={state.selectedDevice}
        showHistory={state.showHistory}
        trail={state.trail}
        tileLayerId={tileLayer}
        labelType={labelType}
        animateMarkers={animateMarkers}
        pulseMarkers={pulseMarkers}
        onSelectDevice={(device) => dispatch({ type: 'SELECT_DEVICE', payload: device })}
        geofences={state.geofences}
        drawMode={drawMode}
        onDrawConfirm={(wkt) => { setPendingWkt(wkt); setDrawMode(null); setGeoFormOpen(true); }}
        onDrawCancel={() => setDrawMode(null)}
      />

      {/* Controlos */}
      {showControls && (
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{ left: leftOffset, pointerEvents: 'none' }}
        >
          <div className="relative h-full" style={{ pointerEvents: 'none' }}>
            {/* Backdrop — fecha painéis ao clicar fora */}
            {(geoPanelOpen || alertPanelOpen) && (
              <div
                className="absolute inset-0 z-20"
                style={{ pointerEvents: 'auto' }}
                onClick={() => { setGeoPanelOpen(false); setAlertPanelOpen(false); }}
              />
            )}

            {/* Painel de geofences — lado direito (mesmo lado das alertas), sempre montado */}
            <div
              className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col bg-background border-l"
              style={{
                transform:     geoPanelOpen ? 'translateX(0)' : 'translateX(100%)',
                transition:    'transform 280ms cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: geoPanelOpen ? 'auto' : 'none',
              }}
            >
              <GeofencePanel
                onStartDraw={(mode) => { setGeoPanelOpen(false); setDrawMode(mode); }}
                onClose={() => setGeoPanelOpen(false)}
                onFocusGeofence={(g) => {
                  // Parse center from WKT and fly to it
                  const circleMatch = g.area.match(/CIRCLE\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/i);
                  if (circleMatch) {
                    mapRef.current?.setView([parseFloat(circleMatch[1]), parseFloat(circleMatch[2])], 16, { animate: true });
                    return;
                  }
                  const polyMatch = g.area.match(/POLYGON\s*\(\s*\((.+)\)\s*\)/i);
                  if (polyMatch) {
                    const pts = polyMatch[1].split(',').map((p: string) => p.trim().split(/\s+/).map(Number));
                    const lat = pts.reduce((s: number, p: number[]) => s + p[0], 0) / pts.length;
                    const lon = pts.reduce((s: number, p: number[]) => s + p[1], 0) / pts.length;
                    mapRef.current?.setView([lat, lon], 15, { animate: true });
                  }
                }}
              />
            </div>

            {/* Painel de alertas — lado direito, sempre montado */}
            <div
              className="absolute right-0 top-0 bottom-0 w-80 z-30 flex flex-col bg-background border-l"
              style={{
                transform:     alertPanelOpen ? 'translateX(0)' : 'translateX(100%)',
                transition:    'transform 280ms cubic-bezier(0.4,0,0.2,1)',
                pointerEvents: alertPanelOpen ? 'auto' : 'none',
              }}
            >
              <AlertPanel
                onClose={() => setAlertPanelOpen(false)}
                onFocusCoords={(lat, lon) => {
                  mapRef.current?.setView([lat, lon], 17, { animate: true });
                  setAlertPanelOpen(false);
                }}
              />
            </div>

            {/* Modal de formulário de geofence (após desenho) */}
            <GeofenceFormModal
              open={geoFormOpen}
              pendingWkt={pendingWkt ?? undefined}
              onClose={() => { setGeoFormOpen(false); setPendingWkt(null); setDrawMode(null); }}
              onCreated={(g) => { dispatch({ type: 'GEOFENCE_ADDED', payload: g }); setGeoFormOpen(false); setPendingWkt(null); }}
              onUpdated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
            />

            {/* Painel de dispositivos Traccar */}
            {isConnected && (
              <Dialog open={devicesPanelOpen} onOpenChange={setDevicesPanelOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('devicesPanel.title')}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    {devicesPanelOpen && <TraccarDevicesPanel />}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* DeviceSidebar — sempre montado, animada */}
            <div
              className="absolute inset-0"
              style={{
                visibility: state.isSidebarOpen ? 'visible' : 'hidden',
                opacity:    state.isSidebarOpen ? 1 : 0,
                transform:  state.isSidebarOpen ? 'translateX(0)' : 'translateX(-16px)',
                transition: state.isSidebarOpen
                  ? 'opacity 250ms ease, transform 250ms ease'
                  : 'opacity 250ms ease, transform 250ms ease, visibility 0s 250ms',
              }}
            >
              <DeviceSidebar
                devices={state.devices}
                positions={state.positions}
                selectedDevice={state.selectedDevice}
                filteredStatus={state.filteredStatus}
                followingDeviceId={state.followMode ? state.followDeviceId : null}
                onSelect={handleDeviceSelect}
                onFollowDevice={handleFollowDevice}
                onCenterDevice={(device) => {
                  const pos = getDevicePos(device);
                  if (pos) mapRef.current?.setView([pos.latitude, pos.longitude], 18, { animate: true });
                  zoomCycleRef.current = 1;
                }}
                isConnected={isConnected}
                isLoading={state.isLoading}
                onRefresh={loadInitial}
                onFilterStatus={(status) => dispatch({ type: 'FILTER_STATUS', payload: status })}
                onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              />
            </div>

            <TrackingToolbar
              isConnected={isConnected}
              isSidebarOpen={state.isSidebarOpen}
              onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              totalDevices={state.devices.length}
              onlineDevices={state.devices.filter(d => d.status === 'online').length}
              offlineDevices={state.devices.filter(d => d.status !== 'online').length}
              showingHistory={state.showHistory}
              onExitHistory={() => dispatch({ type: 'TOGGLE_HISTORY', payload: false })}
              lastUpdate={state.lastUpdate}
              mapRef={mapRef}
              currentLayer={tileLayer}
              onLayerChange={setTileLayer}
              followMode={state.followMode}
              followDeviceName={state.followMode && state.selectedDevice ? state.selectedDevice.name : null}
              onFitAll={fitAllDevices}
              onStopFollow={() => dispatch({ type: 'SET_FOLLOW', payload: null })}
              unreadAlerts={state.unreadAlerts}
              isAlertPanelOpen={alertPanelOpen}
              onToggleAlerts={() => { setAlertPanelOpen(v => !v); setGeoPanelOpen(false); }}
              isGeoPanelOpen={geoPanelOpen}
              onToggleGeoPanel={() => { setGeoPanelOpen(v => !v); setAlertPanelOpen(false); }}
              onOpenDevicesPanel={() => setDevicesPanelOpen(true)}
            />

            {/* Reconciliation Warning Banner */}
            {reconciliationWarning.length > 0 && (
              <div
                className="absolute top-14 left-0 right-0 z-40 flex justify-center px-4"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm shadow-lg max-w-md w-full">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      {t('reconciliation.title', { count: reconciliationWarning.length })}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      {t('reconciliation.subtitle')}
                    </p>
                    <ul className="mt-1 text-xs text-amber-700 dark:text-amber-400 list-disc list-inside">
                      {reconciliationWarning.map(v => (
                        <li key={v.id}>{v.brand} {v.model} · {v.license_plate} (IMEI: {v.traccar_unique_id})</li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={dismissReconciliationWarning} className="text-amber-600 dark:text-amber-400 hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {state.selectedDevice && (
              <DeviceInfoPanel
                device={state.selectedDevice}
                position={state.positions.find(p => p.deviceId === state.selectedDevice?.traccar_id)}
                onClose={() => {
                  dispatch({ type: 'SELECT_DEVICE', payload: null });
                  dispatch({ type: 'TOGGLE_HISTORY', payload: false });
                }}
                onShowHistory={handleShowHistory}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
