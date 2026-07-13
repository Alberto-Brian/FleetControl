import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import { useApiConnection } from '@/hooks/useApiConnection';
import type { Position, Device, ConnectionState, TraccarStatus } from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { sendNativeNotification } from '@/helpers/notifications';
import type { AlertSettings } from '@/helpers/notifications';

export interface LocalGeofence {
  id:           number; // traccarId
  name:         string;
  area:         string; // WKT
  description?: string;
  attributes?:  Record<string, unknown>;
}

export interface GeofenceAlert {
  id:             string;
  organizationId: string;
  geofenceId:     number;
  geofenceName:   string;
  deviceId:       number;
  vehicleId:      string | null;
  eventType:      'geofenceEnter' | 'geofenceExit' | 'speedLimit';
  speed:          number | null;
  speedLimit:     number | null;
  latitude:       number | null;
  longitude:      number | null;
  acknowledged:   boolean;
  createdAt:      string;
}

interface TrackingState {
  devices:          TrackedDevice[];
  positions:        Position[];
  selectedDevice:   TrackedDevice | null;
  isLoading:        boolean;
  isSidebarOpen:    boolean;
  showHistory:      boolean;
  historyPositions: Position[];
  connectionMode:   'realtime' | 'manual';
  trail:            Record<number, [number, number][]>;
  filteredStatus:   'all' | 'online' | 'offline';
  lastUpdate:       Date | null;
  followMode:       boolean;
  followDeviceId:   number | null;
  geofences:        LocalGeofence[];
  alerts:           GeofenceAlert[];
  unreadAlerts:     number;
}

type Action =
  | { type: 'SET_DEVICES';      payload: TrackedDevice[] }
  | { type: 'UPDATE_DEVICES';   payload: TrackedDevice[] }
  | { type: 'SET_POSITIONS';    payload: Position[] }
  | { type: 'UPDATE_POSITIONS'; payload: Position[] }
  | { type: 'SELECT_DEVICE';    payload: TrackedDevice | null }
  | { type: 'SET_LOADING';      payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_HISTORY';      payload: Position[] }
  | { type: 'TOGGLE_HISTORY';   payload: boolean }
  | { type: 'SET_MODE';         payload: 'realtime' | 'manual' }
  | { type: 'FILTER_STATUS';    payload: 'all' | 'online' | 'offline' }
  | { type: 'SET_FOLLOW';       payload: number | null }
  | { type: 'GEOFENCES_LOADED';   payload: LocalGeofence[] }
  | { type: 'GEOFENCE_ADDED';     payload: LocalGeofence }
  | { type: 'GEOFENCE_REMOVED';   payload: number }           // traccarId
  | { type: 'ALERTS_RECEIVED';    payload: GeofenceAlert[] }  // prepend, most recent first
  | { type: 'ALERT_ACKNOWLEDGED'; payload: string };          // alert id

const initial: TrackingState = {
  devices:          [],
  positions:        [],
  selectedDevice:   null,
  isLoading:        false,
  isSidebarOpen:    true,
  showHistory:      false,
  historyPositions: [],
  connectionMode:   'realtime',
  trail:            {},
  filteredStatus:   'all',
  lastUpdate:       null,
  followMode:       false,
  followDeviceId:   null,
  geofences:        [],
  alerts:           [],
  unreadAlerts:     0,
};

function reducer(state: TrackingState, action: Action): TrackingState {
  switch (action.type) {
    case 'SET_DEVICES':    return { ...state, devices: action.payload };
    case 'UPDATE_DEVICES': {
      // Merge: mantém todos os dispositivos existentes e actualiza só os que chegaram
      const map = new Map(state.devices.map(d => [d.traccar_id, d]));
      action.payload.forEach(d => map.set(d.traccar_id, d));
      return { ...state, devices: Array.from(map.values()) };
    }
    case 'SET_POSITIONS':    return { ...state, positions: action.payload };
    case 'UPDATE_POSITIONS': {
      const map = new Map(state.positions.map(p => [p.deviceId, p]));
      action.payload.forEach(p => map.set(p.deviceId, p));
      const newTrail = { ...state.trail };
      action.payload.forEach(p => {
        const existing = newTrail[p.deviceId] ?? [];
        const point: [number, number] = [p.latitude, p.longitude];
        const last = existing[existing.length - 1];
        if (!last || last[0] !== point[0] || last[1] !== point[1]) {
          newTrail[p.deviceId] = [...existing, point].slice(-200);
        }
      });
      return { ...state, positions: Array.from(map.values()), trail: newTrail, lastUpdate: new Date() };
    }
    case 'SELECT_DEVICE': {
      // Parar follow mode ao mudar de dispositivo
      const stayFollow = action.payload !== null && state.followDeviceId === action.payload.traccar_id;
      return {
        ...state,
        selectedDevice: action.payload,
        followMode:     stayFollow ? state.followMode : false,
        followDeviceId: stayFollow ? state.followDeviceId : null,
      };
    }
    case 'SET_LOADING':      return { ...state, isLoading: action.payload };
    case 'TOGGLE_SIDEBAR':   return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_HISTORY':      return { ...state, historyPositions: action.payload };
    case 'TOGGLE_HISTORY':   return { ...state, showHistory: action.payload };
    case 'SET_MODE':         return { ...state, connectionMode: action.payload };
    case 'FILTER_STATUS':    return { ...state, filteredStatus: action.payload };
    case 'SET_FOLLOW':
      return { ...state, followMode: action.payload !== null, followDeviceId: action.payload };
    case 'GEOFENCES_LOADED':
      return { ...state, geofences: action.payload };
    case 'GEOFENCE_ADDED':
      return { ...state, geofences: [...state.geofences.filter(g => g.id !== action.payload.id), action.payload] };
    case 'GEOFENCE_REMOVED':
      return { ...state, geofences: state.geofences.filter(g => g.id !== action.payload) };
    case 'ALERTS_RECEIVED': {
      const merged = [...action.payload, ...state.alerts].slice(0, 500); // max 500 in memory
      const unread = merged.filter(a => !a.acknowledged).length;
      return { ...state, alerts: merged, unreadAlerts: unread };
    }
    case 'ALERT_ACKNOWLEDGED': {
      const alerts = state.alerts.map(a => a.id === action.payload ? { ...a, acknowledged: true } : a);
      return { ...state, alerts, unreadAlerts: alerts.filter(a => !a.acknowledged).length };
    }
    default: return state;
  }
}

// O contexto expõe o socket completo para o LicenseGuard poder chamar connect/disconnect
interface TrackingContextValue {
  state:          TrackingState;
  dispatch:       React.Dispatch<Action>;
  isConnected:    boolean;
  connState:      ConnectionState;
  connError:      Error | null;
  traccarStatus:  TraccarStatus | null;
  reconnectCount: number;
  connect:        (token: string) => void;
  disconnect:     () => void;
  geofences:      LocalGeofence[];
  alerts:         GeofenceAlert[];
  unreadAlerts:   number;
}

const Ctx = createContext<TrackingContextValue | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const alertSettingsRef = useRef<AlertSettings | null>(null);
  useEffect(() => { alertSettingsRef.current = alertSettings; }, [alertSettings]);

  // Socket único para toda a app
  const {
    positions,
    devices,
    isConnected,
    state:          connState,
    error:          connError,
    traccarStatus,
    reconnectCount,
    connect,
    disconnect,
    geofenceAlerts,
  } = useApiConnection();

  // Posições em tempo real → contexto
  useEffect(() => {
    if (positions.length === 0) return;
    dispatch({ type: 'UPDATE_POSITIONS', payload: positions });
  }, [positions]); // positions é novo array em cada update — funciona por referência

  // Devices → contexto (merge para não perder dispositivos offline)
  useEffect(() => {
    if (devices.length === 0) return;
    const mapped: TrackedDevice[] = devices.map(d => ({
      id:         d.id,
      traccar_id: d.id,
      name:       d.name,
      uniqueId:   d.uniqueId,
      status:     d.status,
      lastUpdate: d.lastUpdate,
      attributes: d.attributes,
    }));
    dispatch({ type: 'UPDATE_DEVICES', payload: mapped });
  }, [devices]);

  // Load geofences on mount
  useEffect(() => {
    window._tracking.getGeofences().then((raw: any[]) => {
      const geofences: LocalGeofence[] = raw.map(g => ({
        id:          g.traccar_id ?? g.traccarId ?? g.id,
        name:        g.name,
        area:        g.area,
        description: g.description,
        attributes:  g.attributes,
      }));
      dispatch({ type: 'GEOFENCES_LOADED', payload: geofences });
    }).catch(console.error);
  }, []);

  // Named loader so it can be shared between the isConnected effect and the custom event listener
  const loadAlertSettings = useCallback(() => {
    (window as any)._tracking.getAlertSettings()
      .then((s: any) => { if (s) setAlertSettings(s); })
      .catch(console.error);
  }, []);

  // Geofence alerts from socket
  // alertSettings is read via ref so changes to settings never re-trigger this effect
  // (re-triggering would show duplicate toasts/notifications for already-seen alerts)
  // dispatch only [latest] — not the full array — to avoid exponential duplication in state
  useEffect(() => {
    if (geofenceAlerts.length === 0) return;
    const latest = geofenceAlerts[0];
    dispatch({ type: 'ALERTS_RECEIVED', payload: [latest] });
    if (latest) {
      const settings = alertSettingsRef.current;
      const settingKey: Record<string, keyof AlertSettings> = {
        geofenceEnter: 'notifyNativeEnter',
        geofenceExit:  'notifyNativeExit',
        speedLimit:    'notifyNativeSpeed',
      };
      const key = settingKey[latest.eventType];
      // If settings not yet loaded, default to showing; if loaded, respect the toggle
      const enabled = !settings || !key || settings[key];
      if (enabled) {
        const labels: Record<string, string> = {
          geofenceEnter: 'Entrou',
          geofenceExit:  'Saiu',
          speedLimit:    'Velocidade excessiva',
        };
        const device = state.devices.find(d => d.traccar_id === latest.deviceId);
        const deviceLabel = device?.name ?? `#${latest.deviceId}`;
        toast.warning(`${labels[latest.eventType] ?? latest.eventType} · ${deviceLabel} · ${latest.geofenceName}`);
        if (settings) sendNativeNotification(latest, settings);
      }
    }
  }, [geofenceAlerts]);

  // Load alert settings when connected
  useEffect(() => {
    if (!isConnected) return;
    loadAlertSettings();
  }, [isConnected, loadAlertSettings]);

  // Re-load alert settings whenever SettingsDialog persists a change
  useEffect(() => {
    function handleAlertSettingsChanged(e: Event) {
      const detail = (e as CustomEvent<Partial<AlertSettings>>).detail;
      if (detail && typeof detail.notifyNativeEnter === 'boolean') {
        // TrackingToolbar passed the new values directly — apply immediately without re-fetching
        setAlertSettings(prev => prev ? { ...prev, ...detail } : (detail as AlertSettings));
      } else {
        // SettingsDialog saved and fired the event without detail — re-fetch from API
        loadAlertSettings();
      }
    }
    window.addEventListener('alertSettingsChanged', handleAlertSettingsChanged);
    return () => window.removeEventListener('alertSettingsChanged', handleAlertSettingsChanged);
  }, [loadAlertSettings]);

  return (
    <Ctx.Provider value={{
      state, dispatch,
      isConnected, connState, connError, traccarStatus, reconnectCount,
      connect, disconnect,
      geofences:    state.geofences,
      alerts:       state.alerts,
      unreadAlerts: state.unreadAlerts,
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