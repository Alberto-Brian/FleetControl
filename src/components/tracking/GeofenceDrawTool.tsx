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
    map.dragging.enable();
    map.doubleClickZoom.enable();
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    stateRef.current = { drawing: false, points: [] };
  }

  function setupCircleMode() {
    let preview: L.Circle | null = null;
    map.dragging.disable();

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
      cleanup();
      onConfirm(wkt);
    });
  }

  function setupPolygonMode() {
    const points: L.LatLng[] = [];
    let preview: L.Polygon | null = null;
    let lastClickTime = 0;
    map.doubleClickZoom.disable();

    // Duplo-clique detectado por timing no evento click (mais fiável que o evento dblclick no Electron)
    map.on('click', (e: L.LeafletMouseEvent) => {
      const now = Date.now();
      if (now - lastClickTime < 350) {
        // Segundo clique em menos de 350ms = confirmar polígono
        if (points.length < 3) { cleanup(); onCancel(); return; }
        // Traccar uses lat-lon order for ALL WKT types (same as CIRCLE format)
        const wkt = `POLYGON ((${points.map(p => `${p.lat} ${p.lng}`).join(', ')}, ${points[0].lat} ${points[0].lng}))`;
        cleanup();
        onConfirm(wkt);
        return;
      }
      lastClickTime = now;
      points.push(e.latlng);
      if (preview) { map.removeLayer(preview); }
      if (points.length >= 2) {
        preview = L.polygon(points, { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }).addTo(map);
        layerRef.current = preview;
      }
    });
  }

  return null; // comportamento puro, sem UI
}
