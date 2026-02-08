// ========================================
// FILE: src/components/driver/UpdateDriverStatusDialog.tsx (ATUALIZADO COM VALIDAÇÕES)
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
import { CheckCircle2, Clock, UserX, X, Save, Info, Lock } from 'lucide-react';
import { DriverStatus, driverAvailability } from '@/lib/db/schemas/drivers';

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

  const isOnTrip = selectedDriver.availability === 'on_trip';
  const isInactiveStatus = status === 'on_leave' || status === 'terminated';

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
      // Se o status for on_leave ou terminated, forçar disponibilidade para offline
      const updateData: any = { status };
      if (status === 'on_leave' || status === 'terminated') {
        updateData.availability = driverAvailability.OFFLINE;
      }

      const updated = await updateDriverHelper(selectedDriver!.id, updateData);
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
            {isOnTrip 
              ? t('drivers:dialogs.status.onTripDescription', { name: selectedDriver.name })
              : t('drivers:dialogs.status.description', { name: selectedDriver.name })
            }
          </DialogDescription>
        </DialogHeader>

        {isOnTrip && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('drivers:dialogs.status.onTripAlertTitle')}</p>
              <p className="text-blue-700">{t('drivers:dialogs.status.onTripAlertDescription')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup 
            value={status} 
            onValueChange={setStatus} 
            className="space-y-3"
            disabled={isOnTrip}
          >
            {statusOptions.map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  status === option.value
                    ? cn(option.bg, option.border, "ring-2 ring-offset-2", option.ring)
                    : "border-border bg-card",
                  isOnTrip && "opacity-50 cursor-not-allowed",
                  !isOnTrip && status !== option.value && "hover:border-muted-foreground/20"
                )}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value} 
                  className="mt-1"
                  disabled={isOnTrip}
                />
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

          {/* Aviso quando status inativo for selecionado */}
          {isInactiveStatus && !isOnTrip && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{t('drivers:dialogs.status.willSetOffline')}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              {isOnTrip ? (
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {t('common:close')}
                </span>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  {t('common:cancel')}
                </>
              )}
            </Button>
            {!isOnTrip && (
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
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}