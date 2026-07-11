// src/components/tracking/GeofenceOverlay.tsx
import React from 'react';
import { Circle, Polygon, Tooltip } from 'react-leaflet';
import type { LocalGeofence } from '@/contexts/TrackingContext';

interface Props {
  geofences:  LocalGeofence[];
  selectedId: number | null;
  onSelect:   (g: LocalGeofence) => void;
}

function parseArea(area: string): { type: 'circle'; lat: number; lon: number; radius: number } | { type: 'polygon'; points: [number, number][] } | null {
  // CIRCLE (lat lon, radius)
  const circleMatch = area.match(/CIRCLE\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*\)/i);
  if (circleMatch) {
    return { type: 'circle', lat: parseFloat(circleMatch[1]), lon: parseFloat(circleMatch[2]), radius: parseFloat(circleMatch[3]) };
  }

  // POLYGON((lon lat, ...))
  const polygonMatch = area.match(/POLYGON\s*\(\s*\((.+)\)\s*\)/i);
  if (polygonMatch) {
    const points: [number, number][] = polygonMatch[1]
      .split(',')
      .map(p => p.trim().split(/\s+/).map(Number))
      .filter(p => p.length === 2)
      .map(([lon, lat]) => [lat, lon]); // Leaflet usa [lat, lon]
    return { type: 'polygon', points };
  }

  return null;
}

export function GeofenceOverlay({ geofences, selectedId, onSelect }: Props) {
  return (
    <>
      {geofences.map(g => {
        const parsed     = parseArea(g.area);
        const isSelected = g.id === selectedId;
        const color      = isSelected ? '#3b82f6' : '#f59e0b';
        const fillOpacity = isSelected ? 0.18 : 0.08;

        if (!parsed) return null;

        if (parsed.type === 'circle') {
          return (
            <Circle
              key={g.id}
              center={[parsed.lat, parsed.lon]}
              radius={parsed.radius}
              pathOptions={{ color, fillColor: color, fillOpacity, weight: isSelected ? 2.5 : 1.5 }}
              eventHandlers={{ click: () => onSelect(g) }}
            >
              <Tooltip sticky>{g.name}</Tooltip>
            </Circle>
          );
        }

        return (
          <Polygon
            key={g.id}
            positions={parsed.points}
            pathOptions={{ color, fillColor: color, fillOpacity, weight: isSelected ? 2.5 : 1.5 }}
            eventHandlers={{ click: () => onSelect(g) }}
          >
            <Tooltip sticky>{g.name}</Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
