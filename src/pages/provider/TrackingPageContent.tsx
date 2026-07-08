// ========================================
// FILE: src/pages/provider/TrackingPageContent.tsx
// ========================================
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTranslation }    from 'react-i18next';
import { useTracking }       from '@/contexts/TrackingContext';
import { useApiConnection }  from '@/hooks/useApiConnection';
import {
  getTrackedDevices,
  getLivePositions,
  getPositionHistory,
  syncDevices,
} from '@/helpers/tracking-helpers';
import { TrackingMap }             from '@/components/tracking/TrackingMap';
import { DeviceSidebar }           from '@/components/tracking/DeviceSidebar';
import { TrackingToolbar }         from '@/components/tracking/TrackingToolbar';
import { DeviceInfoPanel }         from '@/components/tracking/DeviceInfoPanel';
import { VehicleDeviceLinkSheet }  from '@/components/tracking/VehicleDeviceLinkSheet';
import { CreateTraccarDeviceDialog } from '@/components/tracking/CreateTraccarDeviceDialog';
import { Loader2 }                 from 'lucide-react';

interface TrackingPageContentProps {
  // false → só o mapa, sem toolbar/sidebar/painéis (modo fundo)
  showControls?: boolean;
  // pixels a deslocar os controlos da esquerda (para o nav rail em modo mapa)
  leftOffset?: number;
}

export function TrackingPageContent({ showControls = true, leftOffset = 0 }: TrackingPageContentProps) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch, isConnected } = useTracking();
  const mapRef = useRef<any>(null);
  const [linkSheetOpen, setLinkSheetOpen] = useState(false);
  const [createDeviceOpen, setCreateDeviceOpen] = useState(false);

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
      // Se conectado, sincroniza devices do Traccar antes de carregar a lista
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
      // traccar_id é o ID inteiro do Traccar usado pelo endpoint de histórico
      const hist = await getPositionHistory(state.selectedDevice.traccar_id, from, to);
      dispatch({ type: 'SET_HISTORY', payload: hist as any });
    } catch (err) {
      console.error('[Tracking] Erro ao carregar histórico:', err);
      dispatch({ type: 'TOGGLE_HISTORY', payload: false });
    }
  }

  // Em modo fundo (showControls=false) não mostra spinner — o mapa fica estático
  if (showControls && state.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('map.loading', 'A carregar...')}</p>
      </div>
    );
  }

  // Margens negativas só no layout normal (não no modo fundo)
  const wrapClass = showControls
    ? 'relative h-full -m-4 md:-m-6 overflow-hidden'
    : 'relative h-full overflow-hidden';

  return (
    <div className={wrapClass}>
      {/* Mapa ocupa toda a área */}
      <TrackingMap
        mapRef={mapRef}
        positions={state.positions}
        historyPositions={state.historyPositions}
        devices={state.devices}
        selectedDevice={state.selectedDevice}
        showHistory={state.showHistory}
        trail={state.trail}
        onSelectDevice={(device) => dispatch({ type: 'SELECT_DEVICE', payload: device })}
      />

      {/* Controlos — só renderizados quando showControls=true */}
      {showControls && (
        <>
          {/* Contentor dos controlos com offset do nav rail */}
          <div
            className="absolute top-0 bottom-0 right-0"
            style={{ left: leftOffset, pointerEvents: 'none' }}
          >
            <div className="relative h-full" style={{ pointerEvents: 'none' }}>
              {/* Sidebar — agora auto-contida com os controlos de ação */}
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
                  onSyncDevices={async () => {
                    dispatch({ type: 'SET_LOADING', payload: true });
                    try {
                      const devs = await syncDevices();
                      if (devs?.length) dispatch({ type: 'SET_DEVICES', payload: devs });
                    } finally {
                      dispatch({ type: 'SET_LOADING', payload: false });
                    }
                  }}
                  onFilterStatus={(status) => dispatch({ type: 'FILTER_STATUS', payload: status })}
                  onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                />
              )}

              {/* Toolbar — apenas status + acções no canto superior direito */}
              <TrackingToolbar
                isConnected={isConnected}
                isSidebarOpen={state.isSidebarOpen}
                onToggleSidebar={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                totalDevices={state.devices.length}
                onlineDevices={state.devices.filter(d => d.status === 'online').length}
                offlineDevices={state.devices.filter(d => d.status !== 'online').length}
                showingHistory={state.showHistory}
                onExitHistory={() => dispatch({ type: 'TOGGLE_HISTORY', payload: false })}
                isLoading={state.isLoading}
                lastUpdate={state.lastUpdate}
                onLinkDevices={() => setLinkSheetOpen(true)}
                onCreateDevice={() => setCreateDeviceOpen(true)}
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

          <VehicleDeviceLinkSheet
            open={linkSheetOpen}
            onOpenChange={setLinkSheetOpen}
          />
          <CreateTraccarDeviceDialog
            open={createDeviceOpen}
            onOpenChange={setCreateDeviceOpen}
            onCreated={loadInitial}
          />
        </>
      )}
    </div>
  );
}
