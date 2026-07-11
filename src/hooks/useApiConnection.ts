// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/useApiConnection.ts
// ========================================
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GeofenceAlert } from '@/contexts/TrackingContext';

// ========================================
// TIPOS (todos definidos aqui)
// ========================================

/** Estado da conexão com o servidor Traccar */
interface TraccarStatus {
  connected: boolean;
  lastPing?: string;
}

/** Posição GPS de um dispositivo */
interface Position {
  deviceId: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  course?: number;
  accuracy?: number;
  batteryLevel?: number;
  address?: string;
  timestamp: string;
  attributes?: Record<string, unknown>;
}

/** Dispositivo rastreado */
interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  lastUpdate?: string;
  category?: string;
  phone?: string;
  model?: string;
  contact?: string;
  attributes?: Record<string, unknown>;
}

/** Evento do Traccar (geofence, alarme, etc.) */
interface TraccarEvent {
  id: number;
  deviceId: number;
  type: string;
  eventTime: string;
  positionId?: number;
  geofenceId?: number;
  maintenanceId?: number;
  attributes?: Record<string, unknown>;
}

/** Estados possíveis da conexão Socket.IO */
type ConnectionState = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'disconnected' 
  | 'error';

/** Retorno do hook useApiConnection */
interface UseApiConnectionReturn {
  socket: Socket | null;
  state: ConnectionState;
  error: Error | null;
  traccarStatus: TraccarStatus | null;
  connect: (token: string) => void;
  disconnect: () => void;
  positions: Position[];
  devices: Device[];
  events: TraccarEvent[];
  isConnected: boolean;
  reconnectCount: number; // incrementa em cada reconexão — usar para recarregar dados
  getDevicePosition: (deviceId: number) => Position | undefined;
  geofenceAlerts: GeofenceAlert[];
}

// ========================================
// CONFIGURAÇÃO
// ========================================

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const NAMESPACE = '/traccar';

// ========================================
// HOOK
// ========================================

export function useApiConnection(): UseApiConnectionReturn {
  // -- Refs para persistir entre renders --
  const socketRef = useRef<Socket | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  
  // -- Estados --
  const [state, setState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [traccarStatus, setTraccarStatus] = useState<TraccarStatus | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [events, setEvents] = useState<TraccarEvent[]>([]);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);

  // -- Helper: buscar posição de dispositivo específico --
  const getDevicePosition = useCallback((deviceId: number): Position | undefined => {
    return positions.find(p => p.deviceId === deviceId);
  }, [positions]);

  // -- Cleanup helper --
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Limpando conexão anterior...');
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
    }
    currentTokenRef.current = null;
  }, []);

  // -- Desconectar --
  const disconnect = useCallback(() => {
    cleanupSocket();
    setState('idle');
    setError(null);
    setTraccarStatus(null);
    // Mantém dados em cache (positions/devices/events) para uso offline
  }, [cleanupSocket]);

  // -- Conectar --
  const connect = useCallback((token: string) => {
    // Evita reconectar se já está conectado com o mesmo token
    if (socketRef.current?.connected && currentTokenRef.current === token) {
      console.log('[Socket] Já conectado com este token');
      return;
    }

    // Limpa conexão anterior se houver
    cleanupSocket();

    currentTokenRef.current = token;
    setState('connecting');
    setError(null);

    console.log('[Socket] Iniciando conexão...');

    const socket = io(`${SOCKET_URL}${NAMESPACE}`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    socketRef.current = socket;

    // ===== HANDLERS DE CONEXÃO =====

    socket.on('connect', () => {
      console.log('[Socket] ✅ Conectado ao FleetControl API');
      setState('connected');
      setError(null);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] ❌ Desconectado: ${reason}`);
      setState('disconnected');
      
      // Se o servidor forçou desconexão, tenta reconectar manualmente
      if (reason === 'io server disconnect') {
        console.log('[Socket] Servidor desconectou. Tentando reconectar em 2s...');
        setTimeout(() => {
          if (currentTokenRef.current) {
            socket.connect();
          }
        }, 2000);
      }
    });

    socket.on('connect_error', (err: Error) => {
      console.error('[Socket] 💥 Erro de conexão:', err.message);
      setError(err);
      setState('error');
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log(`[Socket] 🔄 Reconectado após ${attemptNumber} tentativas`);
      setState('connected');
      setError(null);
      setReconnectCount(n => n + 1); // sinaliza ao consumer para recarregar dados
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`[Socket] 🔄 Tentativa de reconexão ${attemptNumber}/10`);
    });

    socket.on('reconnect_error', (err: Error) => {
      console.error('[Socket] 💥 Erro na reconexão:', err.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] 💥 Falhou todas as tentativas de reconexão');
      setState('error');
      setError(new Error('Falha ao reconectar após múltiplas tentativas'));
    });

    // ===== HANDLERS DE DADOS =====

    socket.on('traccar:status', (status: TraccarStatus) => {
      console.log('[Socket] Status Traccar:', status);
      setTraccarStatus(status);
    });

    socket.on('positions:update', (newPositions: any[]) => {

        // Normaliza o formato do Traccar para o tipo Position
        const normalized = newPositions.map(p => ({
          deviceId:     p.deviceId,
          latitude:     p.latitude,
          longitude:    p.longitude,
          altitude:     p.altitude,
          speed:        p.speed,
          course:       p.course,
          accuracy:     p.accuracy,
          address:      p.address   ?? null,
          batteryLevel: p.attributes?.batteryLevel ?? null,
          timestamp: (p.fixTime || p.serverTime || p.deviceTime || new Date().toISOString()),
          attributes:   p.attributes,
        }));

        setPositions(prev => {
          const positionMap = new Map<number, Position>(prev.map(p => [p.deviceId, p]));
          normalized.forEach(pos => positionMap.set(pos.deviceId, pos));
          // Array.from cria sempre nova referência → React detecta a mudança
          return Array.from(positionMap.values());
        });
      });

    socket.on('devices:update', (newDevices: Device[]) => {
      // Merge por ID para não perder devices não incluídos neste batch
      setDevices(prev => {
        const map = new Map(prev.map(d => [d.id, d]));
        newDevices.forEach(d => map.set(d.id, d));
        return Array.from(map.values());
      });
    });

    socket.on('traccar:events', (newEvents: TraccarEvent[]) => {
      console.log(`[Socket] Recebidos ${newEvents.length} eventos`);
      
      setEvents(prev => {
        const combined = [...newEvents, ...prev];
        // Mantém apenas os 200 eventos mais recentes (limite de memória)
        return combined.slice(0, 200);
      });
    });

    socket.on('geofence:alert', (alert: GeofenceAlert) => {
      setGeofenceAlerts(prev => [alert, ...prev].slice(0, 50));
    });

    // ===== ERROS DO SERVIDOR =====

    socket.on('error', (err: Error) => {
      console.error('[Socket] Erro do servidor:', err);
      setError(err);
    });

  }, [cleanupSocket]);

  // -- Cleanup ao desmontar --
  useEffect(() => {
    return () => {
      cleanupSocket();
    };
  }, [cleanupSocket]);

  return {
    socket: socketRef.current,
    state,
    error,
    traccarStatus,
    connect,
    disconnect,
    positions,
    devices,
    events,
    isConnected: state === 'connected',
    reconnectCount,
    getDevicePosition,
    geofenceAlerts,
  };
}

// ========================================
// EXPORTS ADICIONAIS
// ========================================

export type {
  TraccarStatus,
  Position,
  Device,
  TraccarEvent,
  ConnectionState,
  UseApiConnectionReturn,
};