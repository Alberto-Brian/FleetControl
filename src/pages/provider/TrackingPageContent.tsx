// ========================================
// FILE: src/pages/provider/TrackingPageContent.tsx
// ========================================
import React, { useEffect, useRef, useCallback } from 'react';
import { useTranslation }    from 'react-i18next';
import { useTracking }       from '@/contexts/TrackingContext';
import { useApiConnection }  from '@/hooks/useApiConnection';
import {
  getTrackedDevices,
  getLivePositions,
  getPositionHistory,
} from '@/helpers/tracking-helpers';
import { TrackingMap }       from '@/components/tracking/TrackingMap';
import { DeviceSidebar }     from '@/components/tracking/DeviceSidebar';
import { TrackingToolbar }   from '@/components/tracking/TrackingToolbar';
import { DeviceInfoPanel }   from '@/components/tracking/DeviceInfoPanel';
import { Loader2 }           from 'lucide-react';

export function TrackingPageContent() {
  const { t }               = useTranslation('tracking');
  const { state, dispatch, isConnected } = useTracking();
  // Referência ao mapa para centrar programaticamente
const mapRef = useRef<any>(null);

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
      const hist = await getPositionHistory(state.selectedDevice.id, from, to);
      dispatch({ type: 'SET_HISTORY', payload: hist as any });
    } catch (err) {
      console.error('[Tracking] Erro ao carregar histórico:', err);
      dispatch({ type: 'TOGGLE_HISTORY', payload: false });
    }
  }

  if (state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('map.loading', 'A carregar...')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-4 md:-m-6 overflow-hidden">
      {state.isSidebarOpen && (
        <DeviceSidebar
          devices={state.devices}
          positions={state.positions}
          selectedDevice={state.selectedDevice}
          onSelect={(device) => {
            dispatch({ type: 'SELECT_DEVICE', payload: device });
            // Sai do modo histórico ao seleccionar novo device
            dispatch({ type: 'TOGGLE_HISTORY', payload: false });
          }}
        />
      )}

      <div className="flex-1 flex flex-col relative">
        <TrackingToolbar
            isConnected={isConnected}
            isSidebarOpen={state.isSidebarOpen}
            onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            onRefresh={loadInitial}
            totalDevices={state.devices.length}
            onlineDevices={state.devices.filter(d => d.status === 'online').length}
            offlineDevices={state.devices.filter(d => d.status !== 'online').length}  // ⬅️ NOVO
            showingHistory={state.showHistory}
            onExitHistory={() => dispatch({ type: 'TOGGLE_HISTORY', payload: false })}
            onFilterStatus={(status) => dispatch({ type: 'FILTER_STATUS', payload: status })}  // ⬅️ NOVO
            isLoading={state.isLoading}  // ⬅️ NOVO
            lastUpdate={state.lastUpdate} // ⬅️ NOVO (adicione ao estado)
          />

        <TrackingMap
          mapRef={mapRef}
          positions={state.showHistory ? state.historyPositions : state.positions}
          devices={state.devices}
          selectedDevice={state.selectedDevice}
          showHistory={state.showHistory}
          trail={state.trail}
          onSelectDevice={(device) => dispatch({ type: 'SELECT_DEVICE', payload: device })}
        />

        {state.selectedDevice && (
          <DeviceInfoPanel
            device={state.selectedDevice}
            position={state.positions.find(p => p.deviceId === state.selectedDevice?.id)}
            onClose={() => {
              dispatch({ type: 'SELECT_DEVICE', payload: null });
              dispatch({ type: 'TOGGLE_HISTORY', payload: false });
            }}
            onShowHistory={handleShowHistory}
          />
        )}
      </div>
    </div>
  );
}