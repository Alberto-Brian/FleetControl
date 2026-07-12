// src/components/tracking/GeofencePanel.tsx
import React, { useState } from 'react';
import { useTranslation }  from 'react-i18next';
import { MapPin, Pencil, Trash2, Circle, Pentagon, X, Gauge } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTracking, LocalGeofence } from '@/contexts/TrackingContext';
import { GeofenceFormModal } from './GeofenceFormModal';

interface Props {
  onStartDraw: (mode: 'circle' | 'polygon') => void;
  onClose?:    () => void;
}

function getGeofenceType(area: string): 'circle' | 'polygon' {
  return area.toUpperCase().startsWith('CIRCLE') ? 'circle' : 'polygon';
}

export function GeofencePanel({ onStartDraw, onClose }: Props) {
  const { t }       = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [editing,      setEditing]      = useState<LocalGeofence | null>(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [deleting,     setDeleting]     = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocalGeofence | null>(null);

  async function confirmDelete(g: LocalGeofence) {
    setDeleteTarget(null);
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
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <Pentagon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold flex-1">{t('geofences.panelTitle')}</span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onStartDraw('circle')}>
            <Circle className="w-3 h-3" /> {t('geofences.drawCircle')}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onStartDraw('polygon')}>
            <Pentagon className="w-3 h-3" /> {t('geofences.drawPolygon')}
          </Button>
          {onClose && (
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.geofences.length === 0 ? (
          <div className="p-6 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('geofences.empty')}</p>
          </div>
        ) : (
          state.geofences.map(g => {
            const geoType    = getGeofenceType(g.area);
            const speedLimit = g.attributes?.speedLimit as number | undefined;
            return (
              <div key={g.id} className="flex items-start gap-2.5 px-3 py-2.5 border-b group hover:bg-muted/40 transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-500/10">
                  {geoType === 'circle'
                    ? <Circle  className="w-3.5 h-3.5 text-amber-500" />
                    : <Pentagon className="w-3.5 h-3.5 text-amber-500" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {geoType === 'circle' ? 'Círculo' : 'Polígono'}
                    </span>
                    {speedLimit != null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                        <Gauge className="w-3 h-3" />
                        {t('geofences.speedLimitBadge', { speed: speedLimit })} km/h
                      </span>
                    )}
                    {g.description && (
                      <span className="text-[10px] text-muted-foreground/60 truncate max-w-[120px]">
                        {g.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
                    onClick={() => { setEditing(g); setModalOpen(true); }}
                    title={t('common.edit', 'Editar')}
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(g)}
                    disabled={deleting === g.id}
                    title={t('common.delete', 'Eliminar')}
                  >
                    <Trash2 className="w-3 h-3 text-destructive/70" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <GeofenceFormModal
        key={editing?.id ?? 'new'}
        open={modalOpen}
        editing={editing ?? undefined}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onCreated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
        onUpdated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('geofences.deleteTitle', 'Eliminar zona')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('geofences.deleteConfirm', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
            >
              {t('common.delete', 'Eliminar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
