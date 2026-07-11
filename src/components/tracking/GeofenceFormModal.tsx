// src/components/tracking/GeofenceFormModal.tsx
import React, { useState } from 'react';
import { useTranslation }  from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import type { LocalGeofence } from '@/contexts/TrackingContext';

interface Props {
  open:         boolean;
  pendingWkt?:  string;        // área desenhada (nova geofence)
  editing?:     LocalGeofence; // geofence a editar
  onClose:      () => void;
  onCreated:    (g: LocalGeofence) => void;
  onUpdated:    (g: LocalGeofence) => void;
}

export function GeofenceFormModal({ open, pendingWkt, editing, onClose, onCreated, onUpdated }: Props) {
  const { t }     = useTranslation('tracking');
  const [name, setName]           = useState(editing?.name ?? '');
  const [speedLimit, setSpeedLimit] = useState<string>(
    editing?.attributes?.speedLimit != null ? String(editing.attributes.speedLimit) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isEdit = !!editing;

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
        const created = await (window as any)._tracking.createGeofence({ name: name.trim(), area: pendingWkt!, attributes });
        onCreated({ id: created.id, name: created.name, area: created.area, attributes: created.attributes });
      }
      onClose();
    } catch (e: any) {
      setError(e.message ?? t('geofences.saveError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('geofences.editTitle') : t('geofences.createTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="gf-name">{t('geofences.nameLabel')}</Label>
            <Input id="gf-name" value={name} onChange={e => setName(e.target.value)} autoFocus placeholder={t('geofences.namePlaceholder')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gf-speed">{t('geofences.speedLimitLabel')}</Label>
            <div className="relative">
              <Input id="gf-speed" type="number" min={0} value={speedLimit} onChange={e => setSpeedLimit(e.target.value)} placeholder={t('geofences.speedLimitPlaceholder')} className="pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km/h</span>
            </div>
          </div>
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
