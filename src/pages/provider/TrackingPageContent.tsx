// ========================================
// FILE: src/pages/provider/TrackingPageContent.tsx
// ========================================
import React, { useEffect, useRef, useState } from 'react';
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
import { Loader2 }                  from 'lucide-react';

interface TrackingPageContentProps {
  showControls?: boolean;
  leftOffset?:   number;
  onOpenSettings?: () => void;
}

export function TrackingPageContent({ showControls = true, leftOffset = 0, onOpenSettings }: TrackingPageContentProps) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch, isConnected } = useTracking();
  const mapRef              = useRef<any>(null);
  const [tileLayer, setTileLayer] = useState<TileLayerId>('osm');

  useEffect(() => { loadInitial(); }, []);
  useEffect(() => {
    if (state.positions.length > 0 && mapRef.current) {
      const first = state.positions[0];
      mapRef.current.setView([first.latitude, first.longitude], 14);
    }
  }, [state.positions.length]);

  async function loadInitial() {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isConnected) await syncDevices();
      const [devs, pos] = await Promise.all([
        getTrackedDevices(),
        getLivePositions(),
      ]);
      dispatch({ type: 'SET_DEVICES',   payload: devs });
      dispatch({ type: 'SET_POSITIONS', payload: pos  });
    } catch (err) {
      console.error('[Tracking] Erro ao carregar:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function handleShowHistory(from: string, to: string) {
    if (!state.selectedDevice) return;
    dispatch({ type: 'TOGGLE_HISTORY', payload: true });
    try {
      const hist = await getPositionHistory(state.selectedDevice.traccar_id, from, to);
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
        onSelectDevice={(device) => dispatch({ type: 'SELECT_DEVICE', payload: device })}
      />

      {/* Controlos */}
      {showControls && (
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{ left: leftOffset, pointerEvents: 'none' }}
        >
          <div className="relative h-full" style={{ pointerEvents: 'none' }}>
            {state.isSidebarOpen && (
              <DeviceSidebar
                devices={state.devices}
                positions={state.positions}
                selectedDevice={state.selectedDevice}
                filteredStatus={state.filteredStatus}
                onSelect={(device) => {
                  dispatch({ type: 'SELECT_DEVICE', payload: device });
                  dispatch({ type: 'TOGGLE_HISTORY', payload: false });
                }}
                isConnected={isConnected}
                isLoading={state.isLoading}
                onRefresh={loadInitial}
                onFilterStatus={(status) => dispatch({ type: 'FILTER_STATUS', payload: status })}
                onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
              />
            )}

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
              onOpenSettings={onOpenSettings}
            />

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
