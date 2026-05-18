import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useApiConnection } from '@/hooks/useApiConnection';
import type { Position, Device, ConnectionState, TraccarStatus } from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';

interface TrackingState {
  devices:          TrackedDevice[];
  positions:        Position[];
  selectedDevice:   TrackedDevice | null;
  isLoading:        boolean;
  isSidebarOpen:    boolean;
  showHistory:      boolean;
  historyPositions: Position[];
  connectionMode:   'realtime' | 'manual';
  trail: Record<number, [number, number][]>; // deviceId → array de [lat, lng]
}

type Action =
  | { type: 'SET_DEVICES';      payload: TrackedDevice[] }
  | { type: 'SET_POSITIONS';    payload: Position[] }
  | { type: 'UPDATE_POSITIONS'; payload: Position[] }
  | { type: 'SELECT_DEVICE';    payload: TrackedDevice | null }
  | { type: 'SET_LOADING';      payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_HISTORY';      payload: Position[] }
  | { type: 'TOGGLE_HISTORY';   payload: boolean }
  | { type: 'SET_MODE';         payload: 'realtime' | 'manual' };

const initial: TrackingState = {
  devices:          [],
  positions:        [],
  selectedDevice:   null,
  isLoading:        false,
  isSidebarOpen:    true,
  showHistory:      false,
  historyPositions: [],
  connectionMode:   'realtime',
  trail: {},
};

function reducer(state: TrackingState, action: Action): TrackingState {
  switch (action.type) {
    case 'SET_DEVICES':      return { ...state, devices: action.payload };
    case 'SET_POSITIONS':    return { ...state, positions: action.payload };
    case 'UPDATE_POSITIONS': {
      const map = new Map(state.positions.map(p => [p.deviceId, p]));
      action.payload.forEach(p => map.set(p.deviceId, p));
      // Acumula trail — máx 200 pontos por device
        const newTrail = { ...state.trail };
        action.payload.forEach(p => {
          const existing = newTrail[p.deviceId] ?? [];
          const point: [number, number] = [p.latitude, p.longitude];
          // Só adiciona se a posição mudou
          const last = existing[existing.length - 1];
          if (!last || last[0] !== point[0] || last[1] !== point[1]) {
            newTrail[p.deviceId] = [...existing, point].slice(-200);
          }
        });
      return { ...state, positions: Array.from(map.values()), trail: newTrail };
    }
    case 'SELECT_DEVICE':    return { ...state, selectedDevice: action.payload };
    case 'SET_LOADING':      return { ...state, isLoading: action.payload };
    case 'TOGGLE_SIDEBAR':   return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_HISTORY':      return { ...state, historyPositions: action.payload };
    case 'TOGGLE_HISTORY':   return { ...state, showHistory: action.payload };
    case 'SET_MODE':         return { ...state, connectionMode: action.payload };
    default: return state;
  }
}

// O contexto expõe o socket completo para o LicenseGuard poder chamar connect/disconnect
interface TrackingContextValue {
  state:         TrackingState;
  dispatch:      React.Dispatch<Action>;
  // Dados do socket expostos directamente
  isConnected:   boolean;
  connState:     ConnectionState;
  connError:     Error | null;
  traccarStatus: TraccarStatus | null;
  connect:       (token: string) => void;
  disconnect:    () => void;
}

const Ctx = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Socket único para toda a app
  const {
    positions,
    devices,
    isConnected,
    state:     connState,
    error:     connError,
    traccarStatus,
    connect,
    disconnect,
  } = useApiConnection();

  // Posições em tempo real → contexto
  useEffect(() => {
    if (positions.length === 0) return;
    dispatch({ type: 'UPDATE_POSITIONS', payload: positions });
  }, [positions]); // positions é novo array em cada update — funciona por referência

  // Devices → contexto
  // Mapeia Device (Socket.io, id = traccar int) para TrackedDevice (traccar_id = traccar int)
  useEffect(() => {
    if (devices.length === 0) return;
    const mapped: TrackedDevice[] = devices.map(d => ({
      id:          d.id,        // ID inteiro do Traccar (usado como identificador em tempo real)
      traccar_id:  d.id,        // mesmo valor — necessário para bater com pos.deviceId
      name:        d.name,
      uniqueId:    d.uniqueId,
      status:      d.status,
      lastUpdate:  d.lastUpdate,
      attributes:  d.attributes,
    }));
    dispatch({ type: 'SET_DEVICES', payload: mapped });
  }, [devices]);

  return (
    <Ctx.Provider value={{
      state, dispatch,
      isConnected, connState, connError, traccarStatus,
      connect, disconnect,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTracking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTracking fora do TrackingProvider');
  return ctx;
}