// src/components/tracking/GeofenceFormModal.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation }  from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';

import type { LocalGeofence } from '@/contexts/TrackingContext';

interface TraccarDevice { id: number; name: string; uniqueId: string; }

interface Props {
  open:         boolean;
  pendingWkt?:  string;
  editing?:     LocalGeofence;
  onClose:      () => void;
  onCreated:    (g: LocalGeofence) => void;
  onUpdated:    (g: LocalGeofence) => void;
}

export function GeofenceFormModal({ open, pendingWkt, editing, onClose, onCreated, onUpdated }: Props) {
  const { t }     = useTranslation('tracking');
  const [name, setName]               = useState(editing?.name ?? '');
  const [speedLimit, setSpeedLimit]   = useState<string>(
    editing?.attributes?.speedLimit != null ? String(editing.attributes.speedLimit) : ''
  );
  const [devices, setDevices]         = useState<TraccarDevice[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading]         = useState(false);
  const [error,   setError]           = useState('');

  const isEdit = !!editing;

  // Carrega dispositivos ao abrir (só para criação — edição não suporta reassign)
  useEffect(() => {
    if (!open || isEdit) return;
    (window as any)._tracking.getDevices()
      .then((res: any) => {
        const list: TraccarDevice[] = res?.data ?? res ?? [];
        setDevices(list);
        // Pré-seleccionar todos por defeito
        setSelectedIds(new Set(list.map((d: TraccarDevice) => Number(d.id))));
      })
      .catch(() => setDevices([]));
  }, [open, isEdit]);

  function toggleDevice(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(prev =>
      prev.size === devices.length ? new Set() : new Set(devices.map(d => Number(d.id)))
    );
  }

  async function handleSubmit() {
    if (!name.trim()) { setError(t('geofences.nameRequired')); return; }
    setLoading(true);
    setError('');
    try {
      const attributes: Record<string, unknown> = {};
      if (speedLimit.trim()) attributes.speedLimit = Number(speedLimit);

      if (isEdit && editing) {
        await (window as any)._tracking.updateGeofence(editing.id, { name: name.trim(), attributes });
        onUpdated({ ...editing, name: name.trim(), attributes });
      } else {
        const deviceIds = Array.from(selectedIds);
        const created = await (window as any)._tracking.createGeofence({
          name:       name.trim(),
          area:       pendingWkt!,
          attributes,
          deviceIds,
        });
        onCreated({ id: created.id, name: created.name, area: created.area, attributes: created.attributes });
      }
      onClose();
    } catch (e: any) {
      setError(e.message ?? t('geofences.saveError'));
    } finally {
      setLoading(false);
    }
  }

  const allSelected = devices.length > 0 && selectedIds.size === devices.length;

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('geofences.editTitle') : t('geofences.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="gf-name">{t('geofences.nameLabel')}</Label>
            <Input
              id="gf-name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder={t('geofences.namePlaceholder')}
            />
          </div>

          {/* Limite de velocidade */}
          <div className="space-y-1.5">
            <Label htmlFor="gf-speed">{t('geofences.speedLimitLabel')}</Label>
            <div className="relative">
              <Input
                id="gf-speed"
                type="number"
                min={0}
                value={speedLimit}
                onChange={e => setSpeedLimit(e.target.value)}
                placeholder={t('geofences.speedLimitPlaceholder')}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km/h</span>
            </div>
          </div>

          {/* Dispositivos (apenas na criação) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>{t('geofences.devicesLabel', 'Dispositivos a monitorizar')}</Label>
                {devices.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {allSelected ? t('geofences.deselectAll', 'Desseleccionar todos') : t('geofences.selectAll', 'Seleccionar todos')}
                  </button>
                )}
              </div>

              {devices.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  {t('geofences.noDevices', 'Nenhum dispositivo disponível')}
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto rounded-md border border-input p-2 space-y-1.5">
                  {devices.map(d => (
                    <label
                      key={d.id}
                      htmlFor={`dev-${d.id}`}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        id={`dev-${d.id}`}
                        checked={selectedIds.has(Number(d.id))}
                        onChange={() => toggleDevice(Number(d.id))}
                        className="h-4 w-4 rounded border border-input accent-primary"
                      />
                      <span className="text-sm leading-none">{d.name || d.uniqueId}</span>
                      <span className="text-xs text-muted-foreground ml-auto font-mono">{d.uniqueId}</span>
                    </label>
                  ))}
                </div>
              )}

              {devices.length > 0 && selectedIds.size === 0 && (
                <p className="text-xs text-amber-500">
                  {t('geofences.noDevicesSelected', 'Seleccione pelo menos um dispositivo para receber alertas')}
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>{t('geofences.cancel')}</Button>
          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {isEdit ? t('geofences.save') : t('geofences.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
