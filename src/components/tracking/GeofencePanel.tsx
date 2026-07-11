// src/components/tracking/GeofencePanel.tsx
import React, { useState } from 'react';
import { useTranslation }  from 'react-i18next';
import { MapPin, Pencil, Trash2, Circle, Pentagon } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { useTracking, LocalGeofence } from '@/contexts/TrackingContext';
import { GeofenceFormModal } from './GeofenceFormModal';

interface Props {
  onStartDraw: (mode: 'circle' | 'polygon') => void;
}

export function GeofencePanel({ onStartDraw }: Props) {
  const { t }       = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [editing,   setEditing]  = useState<LocalGeofence | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  async function handleDelete(g: LocalGeofence) {
    if (!confirm(t('geofences.deleteConfirm', { name: g.name }))) return;
    setDeleting(g.id);
    try {
      await (window as any)._tracking.deleteGeofence(g.id);
      dispatch({ type: 'GEOFENCE_REMOVED', payload: g.id });
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {t('geofences.panelTitle')}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => onStartDraw('circle')}>
            <Circle className="w-3.5 h-3.5" /> {t('geofences.drawCircle')}
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => onStartDraw('polygon')}>
            <Pentagon className="w-3.5 h-3.5" /> {t('geofences.drawPolygon')}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.geofences.length === 0 ? (
          <div className="p-6 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('geofences.empty')}</p>
          </div>
        ) : (
          state.geofences.map(g => (
            <div key={g.id} className="flex items-center gap-2 px-3 py-2.5 border-b group hover:bg-muted/40 transition-colors">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{g.name}</p>
                {!!g.attributes?.speedLimit && (
                  <p className="text-[10px] text-muted-foreground">
                    {t('geofences.speedLimitBadge', { speed: g.attributes.speedLimit })} km/h
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
                  onClick={() => { setEditing(g); setModalOpen(true); }}
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10"
                  onClick={() => handleDelete(g)}
                  disabled={deleting === g.id}
                >
                  <Trash2 className="w-3 h-3 text-destructive/70" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <GeofenceFormModal
        open={modalOpen}
        editing={editing ?? undefined}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onCreated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
        onUpdated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
      />
    </div>
  );
}
