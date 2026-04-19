// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/useApiConnection.ts
// ========================================
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  // Estado da conexão
  socket: Socket | null;
  state: ConnectionState;
  error: Error | null;
  traccarStatus: TraccarStatus | null;
  
  // Ações
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Dados em tempo real (último estado conhecido)
  positions: Position[];
  devices: Device[];
  events: TraccarEvent[];
  
  // Helpers
  isConnected: boolean;
  getDevicePosition: (deviceId: number) => Position | undefined;
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

    socket.on('positions:update', (newPositions: Position[]) => {
      console.log(`[Socket] Recebidas ${newPositions.length} posições`);
      
      setPositions(prev => {
        // Merge inteligente: atualiza existentes, adiciona novas
        const positionMap = new Map<number, Position>(
          prev.map(p => [p.deviceId, p])
        );
        
        newPositions.forEach(pos => {
          positionMap.set(pos.deviceId, pos);
        });
        
        return Array.from(positionMap.values()).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    });

    socket.on('devices:update', (newDevices: Device[]) => {
      console.log(`[Socket] Recebidos ${newDevices.length} dispositivos`);
      setDevices(newDevices);
    });

    socket.on('traccar:events', (newEvents: TraccarEvent[]) => {
      console.log(`[Socket] Recebidos ${newEvents.length} eventos`);
      
      setEvents(prev => {
        const combined = [...newEvents, ...prev];
        // Mantém apenas os 200 eventos mais recentes (limite de memória)
        return combined.slice(0, 200);
      });
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
    getDevicePosition,
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