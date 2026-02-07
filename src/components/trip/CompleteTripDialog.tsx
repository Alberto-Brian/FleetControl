// ========================================
// FILE: src/components/trip/CompleteTripDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { completeTrip as completeTripHelper } from '@/helpers/trip-helpers';
import { ICompleteTrip } from '@/lib/types/trip';
import { Gauge, MapPin, Calendar, TrendingUp, Flag, AlertCircle } from 'lucide-react';
import { useTrips } from '@/contexts/TripsContext';

interface CompleteTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompleteTripDialog({ open, onOpenChange }: CompleteTripDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedTrip }, updateTrip } = useTrips();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICompleteTrip>({
    end_mileage: 0,
    notes: '',
  });

  useEffect(() => {
    if (open && selectedTrip) {
      setFormData({
        end_mileage: selectedTrip.start_mileage || 0,
        notes: '',
      });
    }
  }, [open, selectedTrip]);

  // ✅ EARLY RETURN
  if (!selectedTrip) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.end_mileage <= selectedTrip!.start_mileage) {
      handleError(new Error('trips:alerts.endMileageError'), 'trips:alerts.endMileageError');
      return;
    }

    setIsLoading(true);

    try {
      const completed = await completeTripHelper(selectedTrip!.id, formData);

      if (completed) {
        updateTrip(completed); // ✨ Atualiza contexto
        showSuccess('trips:toast.completeSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'trips:toast.completeError');
    } finally {
      setIsLoading(false);
    }
  }

  const distance = formData.end_mileage - selectedTrip.start_mileage;
  const hasError = formData.end_mileage > 0 && formData.end_mileage <= selectedTrip.start_mileage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            {t('trips:dialogs.complete.title')}
          </DialogTitle>
          <DialogDescription>
            {selectedTrip.trip_code}
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Viagem */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('trips:fields.origin')}</p>
                <p className="font-medium">{selectedTrip.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('trips:fields.destination')}</p>
                <p className="font-medium">{selectedTrip.destination}</p>
              </div>
            </div>

            {selectedTrip.start_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('trips:fields.startDate')}</p>
                  <p className="font-medium">
                    {new Date(selectedTrip.start_date).toLocaleString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}

            {selectedTrip.vehicle_license && (
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('trips:fields.vehicle')}</p>
                  <p className="font-medium">{selectedTrip.vehicle_license}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quilometragem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                {t('trips:dialogs.view.initialKm')}
              </Label>
              <Input
                value={selectedTrip.start_mileage?.toLocaleString('pt-PT')}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                {t('trips:dialogs.view.finalKm')} *
              </Label>
              <Input
                type="number"
                min={selectedTrip.start_mileage + 1}
                value={formData.end_mileage || ''}
                onChange={(e) => setFormData({ ...formData, end_mileage: parseInt(e.target.value) || 0 })}
                className={hasError ? 'border-destructive' : ''}
                required
              />
              {hasError && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>{t('trips:alerts.endMileageError')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Distância Calculada */}
          {distance > 0 && (
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('trips:dialogs.complete.distanceCalculated')}</p>
                    <p className="text-2xl font-bold text-primary">
                      {distance.toLocaleString('pt-PT')} km
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label>{t('trips:fields.notes')}</Label>
            <Textarea
              placeholder={t('trips:placeholders.endNotes')}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || hasError || distance <= 0}>
              {isLoading ? t('trips:actions.completing') : t('trips:actions.complete')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}