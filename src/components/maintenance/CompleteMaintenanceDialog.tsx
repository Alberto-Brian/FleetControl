// ========================================
// FILE: src/components/maintenance/CompleteMaintenanceDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { completeMaintenance } from '@/helpers/maintenance-helpers';
import { IUpdateMaintenance } from '@/lib/types/maintenance';
import { Gauge, MapPin, Calendar, TrendingUp, Flag, CheckCircle2 } from 'lucide-react';
import { useMaintenances } from '@/contexts/MaintenancesContext';

export default function CompleteMaintenanceDialog() {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedMaintenance }, updateMaintenance: updateMaintenanceContext } = useMaintenances();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IUpdateMaintenance>({
    diagnosis: '',
    solution: '',
    parts_cost: 0,
    labor_cost: 0,
  });

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

  // ✅ EARLY RETURN
  if (!selectedMaintenance) {
    return null;
  }

  async function handleCompleteMaintenance() {
    if (!formData.solution?.trim()) {
      handleError(new Error('maintenances:alerts.solutionRequired'), 'maintenances:alerts.solutionRequired');
      return;
    }

    if (selectedMaintenance!.status === 'scheduled' && !formData.diagnosis?.trim()) {
      handleError(new Error('maintenances:alerts.diagnosisRequired'), 'maintenances:alerts.diagnosisRequired');
      return;
    }

    setIsLoading(true);

    try {
      const completed = await completeMaintenance(selectedMaintenance!.id, {
        diagnosis: formData.diagnosis?.trim() || undefined,
        solution: formData.solution.trim(),
        parts_cost: formData.parts_cost || 0,
        labor_cost: formData.labor_cost || 0,
      });

      if (completed) {
        updateMaintenanceContext(completed); // ✨ Atualiza contexto
        showSuccess('maintenances:toast.completeSuccess');
        setOpen(false);
      }
    } catch (error: any) {
      handleError(error, 'maintenances:toast.completeError');
    } finally {
      setIsLoading(false);
    }
  }

  const totalCost = (formData.parts_cost || 0) + (formData.labor_cost || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {t('maintenances:actions.complete')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            {t('maintenances:dialogs.complete.title')}
          </DialogTitle>
          <DialogDescription>
            {selectedMaintenance.vehicle_license} - {selectedMaintenance.category_name}
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Manutenção */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('maintenances:fields.vehicle')}</p>
                <p className="font-medium">{selectedMaintenance.vehicle_license}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('maintenances:fields.entryDate')}</p>
                <p className="font-medium">
                  {new Date(selectedMaintenance.entry_date).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {selectedMaintenance.status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="diagnosis">
                {t('maintenances:fields.diagnosis')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="diagnosis"
                placeholder={t('maintenances:placeholders.diagnosis')}
                value={formData.diagnosis || ''}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="solution">
              {t('maintenances:fields.solution')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="solution"
              placeholder={t('maintenances:placeholders.solution')}
              value={formData.solution || ''}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parts-cost">{t('maintenances:fields.partsCost')} (Kz)</Label>
              <Input
                id="parts-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder={t('maintenances:placeholders.partsCost')}
                value={formData.parts_cost || ''}
                onChange={(e) => setFormData({ ...formData, parts_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor-cost">{t('maintenances:fields.laborCost')} (Kz)</Label>
              <Input
                id="labor-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder={t('maintenances:placeholders.laborCost')}
                value={formData.labor_cost || ''}
                onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('maintenances:fields.totalCost')}:</span>
              <span className="text-2xl font-bold">{totalCost.toLocaleString('pt-PT')} Kz</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {t('common:actions.cancel')}
          </Button>
          <Button onClick={handleCompleteMaintenance} disabled={isLoading}>
            {isLoading ? t('maintenances:actions.completing') : t('maintenances:actions.complete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}