// ========================================
// FILE: src/components/maintenance/StartMaintenanceDialog.tsx (ATUALIZADO)
// ========================================
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play } from 'lucide-react';
import { updateMaintenance } from '@/helpers/maintenance-helpers';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { useMaintenances } from '@/contexts/MaintenancesContext';

export default function StartMaintenanceDialog() {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedMaintenance }, updateMaintenance: updateMaintenanceContext } = useMaintenances();
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');

  // ✅ EARLY RETURN
  if (!selectedMaintenance) {
    return null;
  }

  async function handleStartMaintenance() {
    if (!diagnosis.trim()) {
      handleError(new Error('maintenances:alerts.diagnosisRequired'), 'maintenances:alerts.diagnosisRequired');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateMaintenance(selectedMaintenance!.id, {
        status: 'in_progress',
        diagnosis: diagnosis.trim(),
        work_order_number: workOrderNumber.trim() || undefined,
      });

      if (updated) {
        updateMaintenanceContext(updated); // ✨ Atualiza contexto
        showSuccess('maintenances:toast.startSuccess');
        setOpen(false);
        setDiagnosis('');
        setWorkOrderNumber('');
      }
    } catch (error) {
      handleError(error, 'maintenances:toast.startError');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Play className="w-4 h-4 mr-2" />
          {t('maintenances:actions.start')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('maintenances:dialogs.start.title')}</DialogTitle>
          <DialogDescription>
            {selectedMaintenance.vehicle_license} - {selectedMaintenance.category_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-order">
              {t('maintenances:fields.workOrderNumber')} <span className="text-muted-foreground">({t('common:optional')})</span>
            </Label>
            <Input
              id="work-order"
              placeholder={t('maintenances:placeholders.workOrderNumber')}
              value={workOrderNumber}
              onChange={(e) => setWorkOrderNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">
              {t('maintenances:fields.diagnosis')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="diagnosis"
              placeholder={t('maintenances:placeholders.diagnosis')}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {t('common:actions.cancel')}
          </Button>
          <Button onClick={handleStartMaintenance} disabled={isLoading}>
            {isLoading ? t('maintenances:actions.starting') : t('maintenances:actions.start')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}