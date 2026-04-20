// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/tracking-helpers.ts
// ========================================
import type { Device, Position } from '@/hooks/useApiConnection';

export interface TrackedDevice {
  id:          number;   // UUID do Postgres
  traccar_id:  number;   // ID numérico do Traccar ← este é o que bate com pos.deviceId
  name:        string;
  uniqueId:    string;
  status:      string;
  lastUpdate?: string;
  attributes?: Record<string, unknown>;
}

export interface PositionHistory {
  id:        number;
  deviceId:  number;
  latitude:  number;
  longitude: number;
  speed:     number;
  course:    number;
  fixTime:   string;
  address?:  string;
  attributes?: Record<string, unknown>;
}

// Paleta fixa — cores distinguíveis entre si
const DEVICE_COLORS = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#f59e0b', // âmbar
  '#ef4444', // vermelho
  '#8b5cf6', // violeta
  '#06b6d4', // ciano
  '#f97316', // laranja
  '#ec4899', // rosa
];

export async function getTrackedDevices(): Promise<TrackedDevice[]> {
  try {
    return await window._tracking.getDevices();
  } catch { return []; }
}

export async function getLivePositions(deviceId?: number): Promise<Position[]> {
  try {
    return await window._tracking.getPositions(deviceId);
  } catch { return []; }
}

export async function getPositionHistory(
  deviceId: number, from: string, to: string,
): Promise<PositionHistory[]> {
  try {
    return await window._tracking.getHistory(deviceId, from, to);
  } catch { return []; }
}

export async function syncDevices(): Promise<TrackedDevice[]> {
  try {
    return await window._tracking.syncDevices();
  } catch { return []; }
}

export async function syncGeofences() {
  try {
    return await window._tracking.syncGeofences();
  } catch { return []; }
}

export async function getGeofences() {
  try {
    return await window._tracking.getGeofences();
  } catch { return []; }
}

// Calcula bearing entre dois pontos (para rodar o ícone do veículo)
export function getBearing(from: Position, to: Position): number {
  const lat1 = (from.latitude  * Math.PI) / 180;
  const lat2 = (to.latitude    * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y    = Math.sin(dLon) * Math.cos(lat2);
  const x    = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Formata velocidade para exibição
export function formatSpeed(knots: number): string {
  const kmh = knots * 1.852;
  return `${kmh.toFixed(0)} km/h`;
}

// Mapeia cada deviceId a uma cor consistente
const deviceColorCache = new Map<number, string>();

export function getDeviceTrailColor(deviceId: number): string {
  if (!deviceColorCache.has(deviceId)) {
    const index = deviceColorCache.size % DEVICE_COLORS.length;
    deviceColorCache.set(deviceId, DEVICE_COLORS[index]);
  }
  return deviceColorCache.get(deviceId)!;
}

// Determina a cor do marcador pelo status
export function getDeviceColor(status: string, speed: number): string {
  if (status === 'offline') return '#6b7280'; // cinzento
  if (speed > 0)            return '#10b981'; // verde — em movimento
  return '#3b82f6';                           // azul — parado online
}