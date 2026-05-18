// ========================================
// FILE: src/components/tracking/TrackingMap.tsx
// ========================================
import React, { useEffect, useRef, } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { getDeviceColor, getDeviceTrailColor, formatSpeed } from '@/helpers/tracking-helpers';

// Fix ícone Leaflet + Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  positions:      Position[];
  devices:        TrackedDevice[];
  selectedDevice: TrackedDevice | null;
  showHistory:    boolean;
  trail:          Record<number, [number, number][]>; 
  onSelectDevice: (device: TrackedDevice) => void;
}

export function TrackingMap({ mapRef, positions, devices, selectedDevice, showHistory, trail, onSelectDevice }: Props) {
  // Centro inicial — primeira posição disponível ou Luanda
  const center: [number, number] = positions.length > 0
    ? [positions[0].latitude, positions[0].longitude]
    : [-8.8368, 13.2343];
    

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

       {/* Linhas de percurso em tempo real — uma por device */}
      {!showHistory && Object.entries(trail).map(([deviceIdStr, points]) => {
        if (points.length < 2) return null;
        const deviceId = Number(deviceIdStr);

        // traccar_id é o ID inteiro do Traccar — bate com a chave do trail
        const device = devices.find(d => d.traccar_id === deviceId);

        const isSelected = selectedDevice
          ? selectedDevice.traccar_id === deviceId
          : false;

        const color = device
          ? getDeviceTrailColor(deviceId)
          : '#6b7280';

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

      {/* Marcadores — posição actual */}
      {!showHistory && positions.map(pos => {
        // Encontra o device pelo traccarId
        const device = devices.find(d => {
          const tid = (d as any).traccar_id;
          return tid === pos.deviceId;
        });

        const deviceName = device?.name ?? `Device ${pos.deviceId}`;
        const isSelected = selectedDevice
          ? (() => {
              const stid = (selectedDevice as any).traccar_id;
              return stid === pos.deviceId;
            })()
          : false;

        const isMoving   = (pos.speed ?? 0) > 0;
        const color      = getDeviceColor(device?.status ?? 'unknown', pos.speed ?? 0);
        const icon       = createDeviceIcon(color, pos.course ?? 0, isSelected, isMoving);

        return (
          <Marker
            key={pos.deviceId}
            position={[pos.latitude, pos.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => device && onSelectDevice(device),
            }}
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

      {/* Linha de histórico de posições (modo showHistory) */}
      {showHistory && Object.entries(trail).map(([deviceIdStr, points]) => {
        if (points.length < 2) return null;
        const deviceId  = Number(deviceIdStr);
        const isSelected = selectedDevice ? selectedDevice.traccar_id === deviceId : false;
        const color      = getDeviceTrailColor(deviceId);
        return (
          <Polyline
            key={`history-${deviceId}`}
            positions={points}
            color={color}
            weight={isSelected ? 3 : 2}
            opacity={isSelected ? 0.9 : 0.45}
            dashArray={isSelected ? undefined : '6 4'}
          />
        );
      })}
    </MapContainer>
  );
}