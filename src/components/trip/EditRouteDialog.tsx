import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Route as RouteIcon } from 'lucide-react';
import { updateRoute } from '@/helpers/route-helpers';
import { IUpdateRoute } from '@/lib/types/route';

interface EditRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: any | null;
  onRouteUpdated: (route: any) => void;
}

const ROUTE_TYPES = [
  { value: 'regular', label: 'routes:types.regular' },
  { value: 'express', label: 'routes:types.express' },
  { value: 'alternative', label: 'routes:types.alternative' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'common:status.active' },
  { value: 'inactive', label: 'common:status.inactive' },
];

export default function EditRouteDialog({ open, onOpenChange, route, onRouteUpdated }: EditRouteDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateRoute>({
    name: '',
    origin: '',
    destination: '',
    distance_km: 0,
    estimated_duration_hours: 0,
    route_type: 'regular',
    description: '',
    waypoints: '',
    status: 'active',
  });

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || '',
        origin: route.origin || '',
        destination: route.destination || '',
        distance_km: route.distance_km || route.estimated_distance || 0,
        estimated_duration_hours: route.estimated_duration_hours || route.estimated_duration || 0,
        route_type: route.route_type || 'regular',
        description: route.description || '',
        waypoints: route.waypoints || '',
        status: route.status || 'active',
      });
    }
  }, [route]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!route) return;
    setIsLoading(true);

    try {
      const updated = await updateRoute(route.id, formData);
      onRouteUpdated(updated);
      showSuccess('routes:toast.updateSuccess');
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, 'routes:toast.updateError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5" />
            {t('routes:dialogs.edit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('routes:dialogs.edit.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('routes:fields.name')} <span className="text-destructive">*</span></Label>
            <Input
              placeholder={t('routes:placeholders.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('routes:fields.origin')} <span className="text-destructive">*</span></Label>
              <Input
                placeholder={t('routes:placeholders.origin')}
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('routes:fields.destination')} <span className="text-destructive">*</span></Label>
              <Input
                placeholder={t('routes:placeholders.destination')}
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('routes:fields.distance')} <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min="0"
                placeholder={t('routes:placeholders.distance')}
                value={formData.distance_km || ''}
                onChange={(e) => setFormData({ ...formData, distance_km: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('routes:fields.duration')}</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder={t('routes:placeholders.duration')}
                value={formData.estimated_duration_hours || ''}
                onChange={(e) => setFormData({ ...formData, estimated_duration_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('routes:fields.type')}</Label>
              <Select value={formData.route_type} onValueChange={(v) => setFormData({ ...formData, route_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROUTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{t(type.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('common:status.label')}</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('routes:fields.waypoints')}</Label>
            <Input
              placeholder={t('routes:placeholders.waypoints')}
              value={formData.waypoints || ''}
              onChange={(e) => setFormData({ ...formData, waypoints: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t('routes:hints.waypoints')}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('routes:fields.description')}</Label>
            <Textarea
              placeholder={t('routes:placeholders.description')}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {(formData.distance_km ?? 0) > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">
                <span className="text-green-700 dark:text-green-400">{formData.origin || '...'}</span>
                <span className="mx-2">→</span>
                <span className="text-red-700 dark:text-red-400">{formData.destination || '...'}</span>
                <span className="ml-3 font-bold">{formData.distance_km} km</span>
                {(formData.estimated_duration_hours ?? 0) > 0 && (
                  <span className="ml-2 text-muted-foreground">(~{formData.estimated_duration_hours}h)</span>
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common:actions.saving') : t('common:actions.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}