// ========================================
// FILE: src/components/vehicle/UpdateMileageDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { Gauge, TrendingUp } from 'lucide-react';
import { updateVehicle as updateBdVehicle } from '@/helpers/vehicle-helpers';
import { useVehicles } from '@/contexts/VehiclesContext';

interface UpdateMileageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateMileageDialog({ 
  open, 
  onOpenChange, 
}: UpdateMileageDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showWarning, handleError } = useErrorHandler();
  const { state: { selectedVehicle }, updateVehicle } = useVehicles();
  
  const [isLoading, setIsLoading] = useState(false);
  const [newMileage, setNewMileage] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);

  // ✅ SINCRONIZA COM O VEÍCULO QUANDO ABRE
  useEffect(() => {
    if (open && selectedVehicle) {
      setNewMileage(selectedVehicle.current_mileage || 0);
    }
  }, [open, selectedVehicle]);

  // ✅ CALCULA DIFERENÇA
  useEffect(() => {
    if (selectedVehicle) {
      const diff = newMileage - selectedVehicle.current_mileage;
      setDifference(diff);
    }
  }, [newMileage, selectedVehicle]);

  // ✅ EARLY RETURN - RESOLVE TODOS OS PROBLEMAS DE NULL
  if (!selectedVehicle) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ✅ Aqui TypeScript já sabe que selectedVehicle não é null
    // Validação: novo valor deve ser maior que o atual
    if (newMileage < selectedVehicle.current_mileage) {
      showWarning('vehicles:warnings.newMileageCannotBeLessThanCurrent');
      return;
    }

    // Validação: diferença muito grande (alerta)
    if (difference > 10000) {
      showWarning('vehicles:warnings.mileageDifferenceTooBig');
      return;
    }

    setIsLoading(true);

    try {
      const updated = await updateBdVehicle(selectedVehicle!.id, {
        current_mileage: newMileage
      });

      if (updated) {
        updateVehicle(updated); // ✨ Atualiza contexto
        showSuccess('vehicles:toast.mileageUpdateSuccess');
        onOpenChange(false);
      }
    } catch (error) {
      handleError(error, 'vehicles:errors.errorUpdatingMileage');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Actualizar Quilometragem
          </DialogTitle>
          <DialogDescription>
            {selectedVehicle.brand} {selectedVehicle.model} - {selectedVehicle.license_plate}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Km Actual */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Quilometragem Actual
            </p>
            <p className="text-2xl font-bold">
              {selectedVehicle.current_mileage.toLocaleString('pt-AO')} 
              <span className="text-sm font-normal text-muted-foreground ml-2">km</span>
            </p>
          </div>

          {/* Nova Km */}
          <div className="space-y-2">
            <Label htmlFor="mileage" className="text-base font-semibold">
              Nova Quilometragem *
            </Label>
            <div className="relative">
              <Input
                id="mileage"
                type="number"
                min={selectedVehicle.current_mileage}
                value={newMileage}
                onChange={(e) => setNewMileage(parseInt(e.target.value) || 0)}
                className="pr-12 text-lg"
                required
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                km
              </span>
            </div>
          </div>

          {/* Diferença */}
          {difference !== 0 && (
            <div className={`p-4 rounded-lg border ${
              difference > 0 
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${
                  difference > 0 ? 'text-blue-600' : 'text-red-600'
                }`} />
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Diferença
                  </p>
                  <p className={`text-xl font-bold ${
                    difference > 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {difference > 0 ? '+' : ''}{difference.toLocaleString('pt-AO')} km
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || difference === 0}>
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}