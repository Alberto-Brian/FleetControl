// src/components/tracking/GeofenceDrawTool.tsx
import { useEffect, useRef } from 'react';
import { useMap }            from 'react-leaflet';
import L                     from 'leaflet';

type DrawMode = 'circle' | 'polygon' | null;

interface Props {
  mode:      DrawMode;
  onConfirm: (wkt: string) => void;
  onCancel:  () => void;
}

export function GeofenceDrawTool({ mode, onConfirm, onCancel }: Props) {
  const map        = useMap();
  const layerRef   = useRef<L.Layer | null>(null);
  const stateRef   = useRef<{
    center?: L.LatLng;
    drawing: boolean;
    points:  L.LatLng[];
  }>({ drawing: false, points: [] });

  useEffect(() => {
    if (!mode) {
      cleanup();
      return;
    }

    map.getContainer().style.cursor = 'crosshair';

    if (mode === 'circle') {
      setupCircleMode();
    } else {
      setupPolygonMode();
    }

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function cleanup() {
    map.getContainer().style.cursor = '';
    map.off('mousedown').off('mousemove').off('mouseup').off('click').off('dblclick');
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    stateRef.current = { drawing: false, points: [] };
  }

  function setupCircleMode() {
    let preview: L.Circle | null = null;

    map.on('mousedown', (e: L.LeafletMouseEvent) => {
      L.DomEvent.preventDefault(e.originalEvent);
      stateRef.current.center  = e.latlng;
      stateRef.current.drawing = true;
      preview = L.circle(e.latlng, { radius: 1, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }).addTo(map);
      layerRef.current = preview;
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (!stateRef.current.drawing || !stateRef.current.center || !preview) return;
      const radius = stateRef.current.center.distanceTo(e.latlng);
      preview.setRadius(radius);
    });

    map.on('mouseup', (e: L.LeafletMouseEvent) => {
      if (!stateRef.current.drawing || !stateRef.current.center) return;
      stateRef.current.drawing = false;
      const radius = stateRef.current.center.distanceTo(e.latlng);
      if (radius < 10) { cleanup(); onCancel(); return; }

      const { lat, lng } = stateRef.current.center;
      const wkt = `CIRCLE (${lat} ${lng}, ${Math.round(radius)})`;
      onConfirm(wkt);
    });
  }

  function setupPolygonMode() {
    const points: L.LatLng[] = [];
    let preview: L.Polygon | null = null;

    map.on('click', (e: L.LeafletMouseEvent) => {
      points.push(e.latlng);
      if (preview) { map.removeLayer(preview); }
      if (points.length >= 2) {
        preview = L.polygon(points, { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }).addTo(map);
        layerRef.current = preview;
      }
    });

    map.on('dblclick', (e: L.LeafletMouseEvent) => {
      L.DomEvent.preventDefault(e.originalEvent);
      const userPoints = points.slice(0, -2); // strip 2 phantom click events from dblclick
      if (userPoints.length < 3) { cleanup(); onCancel(); return; }

      const wkt = `POLYGON((${userPoints.map(p => `${p.lng} ${p.lat}`).join(', ')}, ${userPoints[0].lng} ${userPoints[0].lat}))`;
      onConfirm(wkt);
    });
  }

  return null; // comportamento puro, sem UI
}
