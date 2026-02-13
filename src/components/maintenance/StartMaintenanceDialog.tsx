// ========================================
// FILE: src/components/maintenance/StartMaintenanceDialog.tsx (ACTUALIZADO - DESIGN MELHORADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Play, MapPin, Calendar, Wrench } from 'lucide-react';
import { updateMaintenance } from '@/helpers/maintenance-helpers';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { useMaintenances } from '@/contexts/MaintenancesContext';
import { cn } from '@/lib/utils';

interface StartMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StartMaintenanceDialog({ open, onOpenChange }: StartMaintenanceDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedMaintenance }, updateMaintenance: updateMaintenanceContext } = useMaintenances();
  
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  // ✅ useEffect SEMPRE executado (antes do early return)
  useEffect(() => {
    if (open && selectedMaintenance) {
      setDiagnosis('');
      setWorkOrderNumber('');
    }
  }, [open, selectedMaintenance]);

  // ✅ EARLY RETURN DEPOIS DO useEffect
  if (!selectedMaintenance) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!diagnosis.trim()) {
      handleError(new Error('maintenances:alerts.diagnosisRequired'), 'maintenances:alerts.diagnosisRequired');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateMaintenance(selectedMaintenance.id, {
        status: 'in_progress',
        diagnosis: diagnosis.trim(),
        work_order_number: workOrderNumber.trim() || undefined,
      });

      if (updated) {
        updateMaintenanceContext(updated);
        showSuccess('maintenances:toast.startSuccess');
        onOpenChange(false);
      }
    } catch (error) {
      handleError(error, 'maintenances:toast.startError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Play className="w-5 h-5 text-blue-600" />
            {t('maintenances:dialogs.start.title')}
          </DialogTitle>
          <DialogDescription>
            {t('maintenances:dialogs.start.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumo da Manutenção */}
          <Card className="p-4 bg-muted/30 border-muted/50">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{t('maintenances:fields.vehicle')}</p>
                  <p className="font-bold text-sm">
                    <span className="font-mono">{selectedMaintenance.vehicle_license}</span>
                    <span className="text-muted-foreground font-normal mx-2">•</span>
                    <span className="font-normal">{selectedMaintenance.vehicle_brand} {selectedMaintenance.vehicle_model}</span>
                  </p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('maintenances:fields.category')}</p>
                    <p className="font-medium text-sm">{selectedMaintenance.category_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('maintenances:fields.entryDate')}</p>
                    <p className="font-medium text-sm">
                      {new Date(selectedMaintenance.entry_date).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Ordem de Serviço */}
          <div className="space-y-2">
            <Label htmlFor="work-order" className="text-sm font-medium">
              {t('maintenances:fields.workOrderNumber')} 
              <span className="text-muted-foreground font-normal ml-1">({t('common:optional')})</span>
            </Label>
            <Input
              id="work-order"
              placeholder={t('maintenances:placeholders.workOrderNumber')}
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              {t('maintenances:hints.workOrderNumber')}
            </p>
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-sm font-medium">
              {t('maintenances:fields.diagnosis')} 
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="diagnosis"
              placeholder={t('maintenances:placeholders.diagnosis')}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={4}
              className="resize-none"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('maintenances:hints.diagnosis')}
            </p>
          </div>

          {/* Footer com Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {t('common:actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "min-w-[140px] bg-blue-600 hover:bg-blue-700",
                isLoading && "opacity-70"
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                  {t('maintenances:actions.starting')}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {t('maintenances:actions.start')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}