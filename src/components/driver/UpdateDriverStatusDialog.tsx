// ========================================
// FILE: src/components/driver/UpdateDriverStatusDialog.tsx (ATUALIZADO - SEM TEXTOS ESTÁTICOS)
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { updateDriver as updateDriverHelper } from '@/helpers/driver-helpers';
import { useDrivers } from '@/contexts/DriversContext';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, UserX, X, Save } from 'lucide-react';
import { DriverStatus } from '@/lib/db/schemas/drivers';

interface UpdateDriverStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDriverStatusDialog({ open, onOpenChange }: UpdateDriverStatusDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<DriverStatus>();

  useEffect(() => {
    if (open && selectedDriver) {
      setStatus(selectedDriver.status);
    }
  }, [open, selectedDriver]);

  if (!selectedDriver) return null;

  const statusOptions = [
    { 
      value: 'active', 
      label: t('drivers:status.active.label'),
      description: t('drivers:status.active.description'),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500'
    },
    { 
      value: 'on_leave', 
      label: t('drivers:status.on_leave.label'),
      description: t('drivers:status.on_leave.description'),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      ring: 'ring-amber-500'
    },
    { 
      value: 'terminated', 
      label: t('drivers:status.terminated.label'),
      description: t('drivers:status.terminated.description'),
      icon: UserX,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      ring: 'ring-slate-500'
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateDriverHelper(selectedDriver!.id, { status });
      if (updated) {
        updateDriver(updated);
        showSuccess(t('drivers:toast.updateSuccess'));
        onOpenChange(false);
      }
    } catch (error: any) {
      handleError(error, t('drivers:toast.updateError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.status.title')}</DialogTitle>
          <DialogDescription>
            {t('drivers:dialogs.status.description', { name: selectedDriver.name })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={status} onValueChange={setStatus} className="space-y-3">
            {statusOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  status === option.value
                    ? cn(option.bg, option.border, "ring-2 ring-offset-2", option.ring)
                    : "border-border bg-card hover:border-muted-foreground/20"
                )}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <option.icon className={cn("w-5 h-5", option.color)} />
                    <span className={cn("font-bold", option.color)}>{option.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || status === selectedDriver.status}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('drivers:actions.updating')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('drivers:actions.confirm')}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}