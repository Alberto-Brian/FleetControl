// ========================================
// FILE: src/components/maintenance/CompleteMaintenanceDialog.tsx (ACTUALIZADO - DESIGN MELHORADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { completeMaintenance } from '@/helpers/maintenance-helpers';
import { IUpdateMaintenance } from '@/lib/types/maintenance';
import { CheckCircle2, MapPin, Calendar, TrendingUp, Wrench, DollarSign } from 'lucide-react';
import { useMaintenances } from '@/contexts/MaintenancesContext';
import { cn } from '@/lib/utils';

interface CompleteMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompleteMaintenanceDialog({ open, onOpenChange }: CompleteMaintenanceDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedMaintenance }, updateMaintenance: updateMaintenanceContext } = useMaintenances();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateMaintenance>({
    diagnosis: '',
    solution: '',
    parts_cost: 0,
    labor_cost: 0,
  });

  // ✅ useEffect SEMPRE executado (antes do early return)
  useEffect(() => {
    if (open && selectedMaintenance) {
      setFormData({
        diagnosis: selectedMaintenance.diagnosis || '',
        solution: '',
        parts_cost: selectedMaintenance.parts_cost || 0,
        labor_cost: selectedMaintenance.labor_cost || 0,
      });
    }
  }, [open, selectedMaintenance]);

  // ✅ EARLY RETURN DEPOIS DO useEffect
  if (!selectedMaintenance) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.solution?.trim()) {
      handleError(new Error('maintenances:alerts.solutionRequired'), 'maintenances:alerts.solutionRequired');
      return;
    }

    if (selectedMaintenance.status === 'scheduled' && !formData.diagnosis?.trim()) {
      handleError(new Error('maintenances:alerts.diagnosisRequired'), 'maintenances:alerts.diagnosisRequired');
      return;
    }

    setIsLoading(true);

    try {
      const completed = await completeMaintenance(selectedMaintenance.id, {
        diagnosis: formData.diagnosis?.trim() || undefined,
        solution: formData.solution.trim(),
        parts_cost: formData.parts_cost || 0,
        labor_cost: formData.labor_cost || 0,
      });

      if (completed) {
        updateMaintenanceContext(completed);
        showSuccess('maintenances:toast.completeSuccess');
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, 'maintenances:toast.completeError');
    } finally {
      setIsLoading(false);
    }
  }

  const totalCost = (formData.parts_cost || 0) + (formData.labor_cost || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            {t('maintenances:dialogs.complete.title')}
          </DialogTitle>
          <DialogDescription>
            {t('maintenances:dialogs.complete.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Resumo da Manutenção */}
          <Card className="p-4 bg-muted/30 border-muted/50">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
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

          {/* Diagnóstico (apenas se status = scheduled) */}
          {selectedMaintenance.status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm font-medium">
                {t('maintenances:fields.diagnosis')} 
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Textarea
                id="diagnosis"
                placeholder={t('maintenances:placeholders.diagnosis')}
                value={formData.diagnosis || ''}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('maintenances:hints.diagnosis')}
              </p>
            </div>
          )}

          {/* Solução */}
          <div className="space-y-2">
            <Label htmlFor="solution" className="text-sm font-medium">
              {t('maintenances:fields.solution')} 
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="solution"
              placeholder={t('maintenances:placeholders.solution')}
              value={formData.solution || ''}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={4}
              className="resize-none"
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('maintenances:hints.solution')}
            </p>
          </div>

          {/* Custos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              {t('maintenances:sections.costs')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parts-cost" className="text-sm font-medium">
                  {t('maintenances:fields.partsCost')} (Kz)
                </Label>
                <Input
                  id="parts-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.parts_cost || ''}
                  onChange={(e) => setFormData({ ...formData, parts_cost: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor-cost" className="text-sm font-medium">
                  {t('maintenances:fields.laborCost')} (Kz)
                </Label>
                <Input
                  id="labor-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.labor_cost || ''}
                  onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-bold text-sm text-green-900 dark:text-green-100">
                  {t('maintenances:fields.totalCost')}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-700 dark:text-green-300">
                  {totalCost.toLocaleString('pt-PT')} <span className="text-lg">Kz</span>
                </p>
                {totalCost > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t('maintenances:info.breakdown', {
                      parts: (formData.parts_cost || 0).toLocaleString('pt-PT'),
                      labor: (formData.labor_cost || 0).toLocaleString('pt-PT'),
                    })}
                  </p>
                )}
              </div>
            </div>
          </Card>

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
                "min-w-[140px] bg-green-600 hover:bg-green-700",
                isLoading && "opacity-70"
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                  {t('maintenances:actions.completing')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('maintenances:actions.complete')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}