// src/components/tracking/GeofencePanel.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation }  from 'react-i18next';
import {
  MapPin, Pencil, Trash2, Circle, Pentagon, X, Gauge,
  ChevronLeft, MapPinned, TriangleAlert, LogIn, LogOut,
  Plus, Minus, Loader2, Radio,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTracking, LocalGeofence } from '@/contexts/TrackingContext';
import { GeofenceFormModal } from './GeofenceFormModal';

interface Props {
  onStartDraw:       (mode: 'circle' | 'polygon') => void;
  onFocusGeofence?:  (g: LocalGeofence) => void;
  onClose?:          () => void;
}

function getGeofenceType(area: string): 'circle' | 'polygon' {
  return area.toUpperCase().startsWith('CIRCLE') ? 'circle' : 'polygon';
}

function parseCircleRadius(area: string): number | null {
  const m = area.match(/CIRCLE\s*\(\s*-?\d+\.?\d*\s+-?\d+\.?\d*\s*,\s*(\d+\.?\d*)\s*\)/i);
  return m ? parseFloat(m[1]) : null;
}

function parsePolygonVertices(area: string): number {
  const m = area.match(/POLYGON\s*\(\s*\((.+)\)\s*\)/i);
  if (!m) return 0;
  // closing coord repeats first, subtract 1
  const coords = m[1].split(',').filter(s => s.trim());
  return Math.max(0, coords.length - 1);
}

function formatRadius(m: number): string {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ALERT_META = {
  geofenceEnter: { icon: LogIn,         color: '#22c55e', label: 'Entrou' },
  geofenceExit:  { icon: LogOut,        color: '#f59e0b', label: 'Saiu'   },
  speedLimit:    { icon: TriangleAlert, color: '#ef4444', label: 'Velocidade' },
} as const;

// ── Detalhe de geofence ──────────────────────────────────────────────────────

interface TraccarDeviceInfo { id: number; name: string; uniqueId: string; }

function GeofenceDetail({
  geofence,
  onBack,
  onEdit,
  onDelete,
  onFocus,
}: {
  geofence:  LocalGeofence;
  onBack:    () => void;
  onEdit:    () => void;
  onDelete:  () => void;
  onFocus?:  () => void;
}) {
  const { state } = useTracking();
  const geoType   = getGeofenceType(geofence.area);
  const radius    = geoType === 'circle' ? parseCircleRadius(geofence.area) : null;
  const vertices  = geoType === 'polygon' ? parsePolygonVertices(geofence.area) : null;
  const speedLimit = geofence.attributes?.speedLimit as number | undefined;

  // Devices assigned to this geofence (from Traccar)
  const [assignedDevices, setAssignedDevices] = useState<TraccarDeviceInfo[]>([]);
  const [loadingDevices,  setLoadingDevices]  = useState(true);
  const [togglingId,      setTogglingId]      = useState<number | null>(null);

  // All known devices (from tracking state)
  const allDevices: TraccarDeviceInfo[] = state.devices.map(d => ({
    id:       d.traccar_id,
    name:     d.name,
    uniqueId: d.uniqueId,
  }));

  useEffect(() => {
    setLoadingDevices(true);
    (window as any)._tracking.getGeofenceDevices(geofence.id)
      .then((list: TraccarDeviceInfo[]) => setAssignedDevices(list ?? []))
      .catch(() => setAssignedDevices([]))
      .finally(() => setLoadingDevices(false));
  }, [geofence.id]);

  const assignedIds = new Set(assignedDevices.map(d => d.id));

  async function toggleDevice(device: TraccarDeviceInfo) {
    setTogglingId(device.id);
    try {
      if (assignedIds.has(device.id)) {
        await (window as any)._tracking.removeGeofenceDevice(geofence.id, device.id);
        setAssignedDevices(prev => prev.filter(d => d.id !== device.id));
      } else {
        await (window as any)._tracking.assignGeofenceDevice(geofence.id, device.id);
        setAssignedDevices(prev => [...prev, device]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  }

  const recentAlerts = state.alerts
    .filter(a => a.geofenceId === geofence.id)
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
          onClick={onBack}
          title="Voltar"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-500/15 flex-shrink-0">
          {geoType === 'circle'
            ? <Circle  className="w-3 h-3 text-amber-500" />
            : <Pentagon className="w-3 h-3 text-amber-500" />}
        </div>
        <span className="text-sm font-semibold flex-1 truncate">{geofence.name}</span>
        <div className="flex gap-1 flex-shrink-0">
          {onFocus && (
            <button
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted"
              onClick={onFocus}
              title="Centrar no mapa"
            >
              <MapPinned className="w-3.5 h-3.5 text-blue-500" />
            </button>
          )}
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted"
            onClick={onEdit}
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/10"
            onClick={onDelete}
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive/70" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">

          {/* Info da zona */}
          <div className="rounded-lg border p-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{geoType === 'circle' ? 'Círculo' : 'Polígono'}</span>
            </div>
            {radius != null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Raio</span>
                <span className="font-medium font-mono">{formatRadius(radius)}</span>
              </div>
            )}
            {vertices != null && vertices > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vértices</span>
                <span className="font-medium font-mono">{vertices}</span>
              </div>
            )}
            {speedLimit != null && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Limite velocidade</span>
                <span className="flex items-center gap-1 font-medium text-orange-500">
                  <Gauge className="w-3 h-3" />
                  {speedLimit} km/h
                </span>
              </div>
            )}
            {geofence.description && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Descrição</span>
                <span className="text-foreground/80 leading-snug">{geofence.description}</span>
              </div>
            )}
          </div>

          {/* Dispositivos monitorados */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Dispositivos
              </p>
              {!loadingDevices && (
                <span className="text-[10px] text-muted-foreground/50">
                  {assignedDevices.length} activo{assignedDevices.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingDevices ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
              </div>
            ) : allDevices.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 py-2 px-0.5">
                Sem dispositivos sincronizados
              </p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                {allDevices.map(device => {
                  const isAssigned = assignedIds.has(device.id);
                  const isToggling = togglingId === device.id;
                  return (
                    <div
                      key={device.id}
                      className="flex items-center gap-2.5 px-2.5 py-2.5 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: isAssigned ? '#22c55e18' : 'transparent' }}
                      >
                        <Radio
                          className="w-3 h-3"
                          style={{ color: isAssigned ? '#22c55e' : 'var(--muted-foreground)', opacity: isAssigned ? 1 : 0.4 }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{device.name}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono">{device.uniqueId}</p>
                      </div>
                      <button
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors flex-shrink-0"
                        style={{
                          background: isAssigned ? '#ef444418' : '#22c55e18',
                          color:      isAssigned ? '#ef4444'   : '#22c55e',
                        }}
                        onClick={() => toggleDevice(device)}
                        disabled={isToggling}
                        title={isAssigned ? 'Remover desta zona' : 'Adicionar a esta zona'}
                      >
                        {isToggling
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : isAssigned
                            ? <Minus className="w-3 h-3" />
                            : <Plus  className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alertas recentes desta zona */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5 px-0.5">
              Alertas recentes
            </p>
            {recentAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 py-2 px-0.5">Sem alertas registados</p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                {recentAlerts.map(a => {
                  const meta   = ALERT_META[a.eventType as keyof typeof ALERT_META] ?? ALERT_META.geofenceEnter;
                  const Icon   = meta.icon;
                  const device = state.devices.find(d => d.traccar_id === a.deviceId);
                  return (
                    <div key={a.id} className="flex items-center gap-2 px-2.5 py-2 border-b last:border-b-0">
                      <Icon className="w-3 h-3 flex-shrink-0" style={{ color: meta.color }} />
                      <span className="text-xs flex-1 truncate"
                        style={{ opacity: a.acknowledged ? 0.5 : 1 }}>
                        {device?.name ?? `#${a.deviceId}`}
                        {a.speed != null && ` · ${Math.round(a.speed)} km/h`}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                        {new Date(a.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── GeofencePanel ────────────────────────────────────────────────────────────

export function GeofencePanel({ onStartDraw, onFocusGeofence, onClose }: Props) {
  const { t }       = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [selected,     setSelected]     = useState<LocalGeofence | null>(null);
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
      if (selected?.id === g.id) setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  }

  // Detalhe seleccionado
  if (selected) {
    return (
      <>
        <GeofenceDetail
          geofence={selected}
          onBack={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setModalOpen(true); }}
          onDelete={() => setDeleteTarget(selected)}
          onFocus={onFocusGeofence ? () => onFocusGeofence(selected) : undefined}
        />
        <GeofenceFormModal
          key={editing?.id ?? 'detail-edit'}
          open={modalOpen}
          editing={editing ?? undefined}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onCreated={(g) => dispatch({ type: 'GEOFENCE_ADDED', payload: g })}
          onUpdated={(g) => { dispatch({ type: 'GEOFENCE_ADDED', payload: g }); setSelected(g); }}
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
      </>
    );
  }

  // Lista de geofences
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
              <div
                key={g.id}
                className="flex items-start gap-2.5 px-3 py-2.5 border-b group hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setSelected(g)}
              >
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
                        {speedLimit} km/h
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
                    onClick={e => { e.stopPropagation(); setEditing(g); setModalOpen(true); }}
                    title={t('common.edit', 'Editar')}
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10"
                    onClick={e => { e.stopPropagation(); setDeleteTarget(g); }}
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
