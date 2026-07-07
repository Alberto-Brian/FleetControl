// ========================================
// FILE: src/components/tracking/TrackingMap.tsx
// ========================================
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice, PositionHistory } from '@/helpers/tracking-helpers';
import { getDeviceColor, getDeviceTrailColor, formatSpeed } from '@/helpers/tracking-helpers';

// Ícone SVG com seta de direcção
function createDeviceIcon(color: string, course: number, isSelected: boolean, isMoving: boolean) {
  const size   = isSelected ? 44 : 36;
  const pulse  = isSelected
    ? `<circle cx="22" cy="22" r="20" fill="${color}" opacity="0.15"/>`
    : '';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 44 44"
         xmlns="http://www.w3.org/2000/svg">
      ${pulse}
      <circle cx="22" cy="22" r="${isSelected ? 14 : 12}"
              fill="${color}"
              stroke="white"
              stroke-width="${isSelected ? 3 : 2}"
              opacity="0.95"/>
      <g transform="translate(22,22) rotate(${course})">
        <path d="M0,-9 L5,5 L0,2 L-5,5 Z"
              fill="white"
              opacity="${isMoving ? 1 : 0.5}"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html:       svg,
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController({ selectedDevice, positions }: {
  selectedDevice: TrackedDevice | null;
  positions:      Position[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedDevice) return;
    // traccar_id é o ID inteiro do Traccar — bate com pos.deviceId
    const pos = positions.find(p => p.deviceId === selectedDevice.traccar_id);
    if (pos) {
      map.flyTo([pos.latitude, pos.longitude], map.getZoom() < 14 ? 15 : map.getZoom(), {
        duration: 0.8,
      });
    }
  }, [selectedDevice?.traccar_id]);
  return null;
}

interface Props {
  mapRef?: React.MutableRefObject<any>;
  positions:        Position[];
  historyPositions: Position[];
  devices:          TrackedDevice[];
  selectedDevice:   TrackedDevice | null;
  showHistory:      boolean;
  trail:            Record<number, [number, number][]>;
  onSelectDevice:   (device: TrackedDevice) => void;
}

function createEndpointIcon(color: string, label: 'S' | 'F') {
  const svg = `
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="14" y="19" text-anchor="middle" font-size="11" font-weight="bold"
            font-family="sans-serif" fill="white">${label}</text>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
}

export function TrackingMap({
  mapRef, positions, historyPositions, devices, selectedDevice, showHistory, trail, onSelectDevice,
}: Props) {
  const center: [number, number] = positions.length > 0
    ? [positions[0].latitude, positions[0].longitude]
    : [-8.8368, 13.2343];

  // Agrupamento das historyPositions por deviceId → polylines de histórico
  const historyLines = useMemo(() => {
    const map = new Map<number, [number, number][]>();
    historyPositions.forEach(p => {
      const pts = map.get(p.deviceId) ?? [];
      pts.push([p.latitude, p.longitude]);
      map.set(p.deviceId, pts);
    });
    return map;
  }, [historyPositions]);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      <MapController selectedDevice={selectedDevice} positions={positions} />

      {/* ── MODO TEMPO REAL ─────────────────────────────────── */}
      {!showHistory && Object.entries(trail).map(([deviceIdStr, points]) => {
        if (points.length < 2) return null;
        const deviceId  = Number(deviceIdStr);
        const device    = devices.find(d => d.traccar_id === deviceId);
        const isSelected = selectedDevice?.traccar_id === deviceId;
        const color     = device ? getDeviceTrailColor(deviceId) : '#6b7280';
        return (
          <Polyline
            key={`trail-${deviceId}`}
            positions={points}
            color={color}
            weight={isSelected ? 3 : 2}
            opacity={isSelected ? 0.8 : 0.4}
            dashArray={isSelected ? undefined : '6 4'}
          />
        );
      })}

      {!showHistory && positions.map(pos => {
        const device     = devices.find(d => d.traccar_id === pos.deviceId);
        const deviceName = device?.name ?? `Device ${pos.deviceId}`;
        const isSelected = selectedDevice?.traccar_id === pos.deviceId;
        const isMoving   = (pos.speed ?? 0) > 0;
        const color      = getDeviceColor(device?.status ?? 'unknown', pos.speed ?? 0);
        const icon       = createDeviceIcon(color, pos.course ?? 0, isSelected, isMoving);

        return (
          <Marker
            key={`${pos.deviceId}-${pos.timestamp}`}
            position={[pos.latitude, pos.longitude]}
            icon={icon}
            eventHandlers={{ click: () => device && onSelectDevice(device) }}
          >
            <Popup>
              <div style={{ minWidth: 170, fontFamily: 'sans-serif' }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{deviceName}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#666' }}>
                  <span>⚡ {formatSpeed(pos.speed ?? 0)}</span>
                  <span>🧭 {Math.round(pos.course ?? 0)}°</span>
                </div>
                {pos.address && (
                  <p style={{ fontSize: 11, marginTop: 6, color: '#888', lineHeight: 1.4 }}>
                    📍 {pos.address}
                  </p>
                )}
                <p style={{ fontSize: 10, color: '#aaa', marginTop: 6 }}>
                  {new Date(pos.timestamp).toLocaleString('pt-PT')}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ── MODO HISTÓRICO ───────────────────────────────────── */}
      {showHistory && Array.from(historyLines.entries()).map(([deviceId, points]) => {
        if (points.length < 2) return null;
        const isSelected = selectedDevice?.traccar_id === deviceId;
        const color      = getDeviceTrailColor(deviceId);
        const start      = points[0];
        const end        = points[points.length - 1];
        return (
          <React.Fragment key={`history-${deviceId}`}>
            <Polyline
              positions={points}
              color={color}
              weight={isSelected ? 4 : 3}
              opacity={isSelected ? 0.9 : 0.6}
            />
            <Marker position={start} icon={createEndpointIcon('#22c55e', 'S')}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
                  <strong>Início</strong>
                  {historyPositions.find(p => p.deviceId === deviceId && p.latitude === start[0]) && (
                    <p style={{ color: '#888', marginTop: 4 }}>
                      {new Date(historyPositions.find(p => p.deviceId === deviceId)!.timestamp).toLocaleString('pt-PT')}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            <Marker position={end} icon={createEndpointIcon('#ef4444', 'F')}>
              <Popup>
                <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
                  <strong>Fim</strong>
                  {historyPositions.filter(p => p.deviceId === deviceId).at(-1) && (
                    <p style={{ color: '#888', marginTop: 4 }}>
                      {new Date(historyPositions.filter(p => p.deviceId === deviceId).at(-1)!.timestamp).toLocaleString('pt-PT')}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}