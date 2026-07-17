// ========================================
// FILE: src/components/tracking/TrackingMap.tsx
// ========================================
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice, PositionHistory } from '@/helpers/tracking-helpers';
import { getDeviceColor, getDeviceTrailColor, formatSpeed } from '@/helpers/tracking-helpers';
import type { MapLabelType } from '@/hooks/useMapSettings';
import { GeofenceOverlay } from './GeofenceOverlay';
import { GeofenceDrawTool } from './GeofenceDrawTool';
import type { LocalGeofence } from '@/contexts/TrackingContext';
import { useTracking } from '@/contexts/TrackingContext';

// CSS da animação de pulse — injectado uma vez no documento
const PULSE_STYLE_ID = 'fc-marker-pulse-style';
function ensurePulseStyle() {
  if (document.getElementById(PULSE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes fc-heartbeat {
      0%, 100% { transform: scale(1); }
      30%       { transform: scale(1.13); }
      60%       { transform: scale(1.05); }
    }
    .fc-pulse { animation: fc-heartbeat 3.5s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

// Ícone SVG circular com seta de direcção e label
function createDeviceIcon(
  color: string, course: number, isSelected: boolean, isMoving: boolean, name?: string, shouldPulse = false,
) {
  const size = isSelected ? 40 : 30;
  const r    = isSelected ? 14 : 11;
  const cx   = size / 2;
  const cy   = size / 2;
  const sw   = isSelected ? 2.5 : 2;

  const pulse = isSelected
    ? `<circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="${color}" opacity="0.15"/>`
    : '';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${pulse}
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="white" stroke-width="${sw}"/>
      <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.3}" r="${r * 0.28}" fill="white" opacity="0.2"/>
      <g transform="translate(${cx},${cy}) rotate(${course})">
        <path d="M0,${-r * 0.68} L${r * 0.38},${r * 0.38} L0,${r * 0.1} L${-r * 0.38},${r * 0.38} Z"
              fill="white" opacity="${isMoving ? 0.95 : 0.45}"/>
      </g>
    </svg>`;

  const escapedName = name
    ? name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    : null;

  const label = escapedName
    ? `<div style="
        position:absolute;
        top:${size + 4}px;
        left:50%;
        transform:translateX(-50%);
        white-space:nowrap;
        background:rgba(10,17,32,0.88);
        color:rgba(255,255,255,0.88);
        font-size:10px;
        font-weight:600;
        padding:2px 6px;
        border-radius:4px;
        font-family:system-ui,sans-serif;
        pointer-events:none;
        border:1px solid rgba(255,255,255,0.1);
        max-width:120px;
        overflow:hidden;
        text-overflow:ellipsis;
      ">${escapedName}</div>`
    : '';

  const pulseClass = shouldPulse && !isSelected ? 'fc-pulse' : '';
  return L.divIcon({
    html:       `<div class="${pulseClass}" style="position:relative;width:${size}px;height:${size}px">${svg}${label}</div>`,
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [cx, cy],
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

type LayerConfig = {
  url:         string;
  attribution: string;
  maxZoom:     number;
  overlay?:    { url: string; attribution: string };
};

export type TileLayerId = 'osm' | 'satellite' | 'hybrid' | 'terrain' | 'carto';

const TILE_LAYERS: Record<TileLayerId, LayerConfig> = {
  osm: {
    url:         'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:     19,
  },
  satellite: {
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom:     19,
  },
  hybrid: {
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom:     19,
    overlay: {
      url:         'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: '',
    },
  },
  terrain: {
    url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom:     18,
  },
  carto: {
    url:         'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom:     20,
  },
};

interface Props {
  mapRef?: React.MutableRefObject<any>;
  positions:        Position[];
  historyPositions: Position[];
  devices:          TrackedDevice[];
  selectedDevice:   TrackedDevice | null;
  showHistory:      boolean;
  trail:            Record<number, [number, number][]>;
  tileLayerId?:     TileLayerId;
  labelType?:       MapLabelType;
  animateMarkers?:  boolean;
  pulseMarkers?:    boolean;
  onSelectDevice:   (device: TrackedDevice) => void;
  geofences?:          LocalGeofence[];
  selectedGeofenceId?: number | null;
  onGeofenceSelect?:   (g: LocalGeofence) => void;
  drawMode?:      'circle' | 'polygon' | null;
  onDrawConfirm?: (wkt: string) => void;
  onDrawCancel?:  () => void;
}

function getDeviceLabel(name: string, type: MapLabelType = 'both'): string {
  if (type === 'both') return name;
  const idx = name.indexOf(' - ');
  if (idx === -1) return name;
  return type === 'plate' ? name.slice(0, idx) : name.slice(idx + 3);
}

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const size  = 30;
  const label = count > 99 ? '99+' : String(count);
  const fs    = label.length > 2 ? 9 : 12;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="#18181b" stroke="white" stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" font-size="${fs}"
            font-weight="700" font-family="system-ui,sans-serif" fill="white">${label}</text>
    </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size/2, size/2] });
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
  mapRef, positions, historyPositions, devices, selectedDevice, showHistory, trail,
  tileLayerId = 'osm', labelType = 'both', animateMarkers = true, pulseMarkers = false, onSelectDevice,
  geofences, selectedGeofenceId, onGeofenceSelect,
  drawMode, onDrawConfirm, onDrawCancel,
}: Props) {
  useEffect(() => { ensurePulseStyle(); }, []);

  // Filtrar posições pelos IMEIs activos (tracking_enabled=true)
  const { activeImeis } = useTracking();
  const visiblePositions = activeImeis.size > 0
    ? positions.filter(pos => {
        const device = devices.find(d => d.traccar_id === pos.deviceId);
        return device ? activeImeis.has(device.uniqueId) : false;
      })
    : [];

  const center: [number, number] = visiblePositions.length > 0
    ? [visiblePositions[0].latitude, visiblePositions[0].longitude]
    : positions.length > 0
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
        key={tileLayerId}
        url={TILE_LAYERS[tileLayerId].url}
        attribution={TILE_LAYERS[tileLayerId].attribution}
        maxZoom={TILE_LAYERS[tileLayerId].maxZoom}
      />
      {TILE_LAYERS[tileLayerId].overlay && (
        <TileLayer
          key={`${tileLayerId}-overlay`}
          url={TILE_LAYERS[tileLayerId].overlay!.url}
          attribution={TILE_LAYERS[tileLayerId].overlay!.attribution}
          opacity={0.85}
        />
      )}

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

      {!showHistory && (
        <MarkerClusterGroup iconCreateFunction={createClusterIcon} chunkedLoading animate animateAddingMarkers={animateMarkers} maxClusterRadius={40}>
          {visiblePositions.map(pos => {
            const device     = devices.find(d => d.traccar_id === pos.deviceId);
            const deviceName = device?.name ?? `Device ${pos.deviceId}`;
            const isSelected = selectedDevice?.traccar_id === pos.deviceId;
            const isMoving   = (pos.speed ?? 0) > 0;
            const color      = getDeviceColor(device?.status ?? 'unknown', pos.speed ?? 0);
            const mapLabel   = getDeviceLabel(deviceName, labelType);
            const icon       = createDeviceIcon(color, pos.course ?? 0, isSelected, isMoving, mapLabel, pulseMarkers);

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
        </MarkerClusterGroup>
      )}

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
      {geofences && geofences.length > 0 && (
        <GeofenceOverlay
          geofences={geofences}
          selectedId={selectedGeofenceId ?? null}
          onSelect={onGeofenceSelect ?? (() => {})}
        />
      )}
      {drawMode && (
        <GeofenceDrawTool
          mode={drawMode}
          onConfirm={onDrawConfirm ?? (() => {})}
          onCancel={onDrawCancel ?? (() => {})}
        />
      )}
    </MapContainer>
  );
}