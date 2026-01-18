// ========================================
// FILE: src/components/trip/CompleteTripDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { completeTrip } from '@/helpers/trip-helpers';
import { ICompleteTrip } from '@/lib/types/trip';
import { Gauge, MapPin, Calendar, TrendingUp, Flag, AlertCircle } from 'lucide-react';

interface CompleteTripDialogProps {
  trip: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTripCompleted: (trip: any) => void;
}

export default function CompleteTripDialog({ trip, open, onOpenChange, onTripCompleted }: CompleteTripDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICompleteTrip>({
    end_mileage: 0,
    notes: '',
  });

  useEffect(() => {
    if (open && trip) {
      setFormData({
        end_mileage: trip.start_mileage || 0,
        notes: '',
      });
    }
  }, [open, trip]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.end_mileage <= trip.start_mileage) {
      toast({
        title: 'Erro',
        description: 'A quilometragem final deve ser maior que a inicial',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const completed = await completeTrip(trip.id, formData);

      if (completed) {
        toast({
          title: 'Sucesso!',
          description: 'Viagem finalizada com sucesso.',
        });
        onTripCompleted(completed);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao finalizar viagem',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!trip) return null;

  const distance = formData.end_mileage - (trip?.start_mileage || 0);
  const hasError = formData.end_mileage > 0 && formData.end_mileage <= trip.start_mileage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            Finalizar Viagem
          </DialogTitle>
          <DialogDescription>
            {trip?.trip_code}
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Viagem */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="font-medium">{trip.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="font-medium">{trip.destination}</p>
              </div>
            </div>

            {trip.start_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="font-medium">
                    {new Date(trip.start_date).toLocaleString('pt-AO', {
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

            {trip.vehicle_license && (
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Veículo</p>
                  <p className="font-medium">{trip.vehicle_license}</p>
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
                KM Inicial
              </Label>
              <Input
                value={trip?.start_mileage?.toLocaleString('pt-AO')}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                KM Final *
              </Label>
              <Input
                type="number"
                min={trip?.start_mileage + 1}
                value={formData.end_mileage || ''}
                onChange={(e) => setFormData({ ...formData, end_mileage: parseInt(e.target.value) || 0 })}
                className={hasError ? 'border-destructive' : ''}
                required
              />
              {hasError && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>KM final deve ser maior que KM inicial</span>
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
                    <p className="text-sm text-muted-foreground">Distância Percorrida</p>
                    <p className="text-2xl font-bold text-primary">
                      {distance.toLocaleString('pt-AO')} km
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações sobre a Viagem</Label>
            <Textarea
              placeholder="Registre aqui qualquer informação relevante: condições da estrada, incidentes, gastos extras, etc..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || hasError || distance <= 0}>
              {isLoading ? 'Finalizando...' : 'Finalizar Viagem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}