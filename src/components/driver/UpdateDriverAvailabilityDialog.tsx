// ========================================
// FILE: src/components/driver/UpdateDriverAvailabilityDialog.tsx (COMPLETO)
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
import { CheckCircle2, Truck, Ban, Info, Lock, X } from 'lucide-react';
import { DriverAvailability, driverAvailability } from '@/lib/db/schemas/drivers';

interface UpdateDriverAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateDriverAvailabilityDialog({ open, onOpenChange }: UpdateDriverAvailabilityDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { state: { selectedDriver }, updateDriver } = useDrivers();
  
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<DriverAvailability>(driverAvailability.AVAILABLE);

  useEffect(() => {
    if (open && selectedDriver) {
      setAvailability(selectedDriver.availability);
    }
  }, [open, selectedDriver]);

  if (!selectedDriver) return null;

  const availabilityOptions = [
    { 
      value: 'available', 
      label: t('drivers:availability.available.label'),
      description: t('drivers:availability.available.description'),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500',
      selectable: true
    },
    { 
      value: 'on_trip', 
      label: t('drivers:availability.on_trip.label'),
      description: t('drivers:availability.on_trip.description'),
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
      selectable: false
    },
    { 
      value: 'offline', 
      label: t('drivers:availability.offline.label'),
      description: t('drivers:availability.offline.description'),
      icon: Ban,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      ring: 'ring-slate-500',
      selectable: true
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateDriverHelper(selectedDriver!.id, { availability });
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

  const isCurrentlyOnTrip = selectedDriver.availability === 'on_trip';
  const hasChanges = availability !== selectedDriver.availability && availability !== 'on_trip';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.availability.title')}</DialogTitle>
          <DialogDescription>
            {isCurrentlyOnTrip 
              ? t('drivers:dialogs.availability.onTripDescription', { name: selectedDriver.name })
              : t('drivers:dialogs.availability.description', { name: selectedDriver.name })
            }
          </DialogDescription>
        </DialogHeader>

        {isCurrentlyOnTrip && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('drivers:dialogs.availability.onTripAlertTitle')}</p>
              <p className="text-blue-700">{t('drivers:dialogs.availability.onTripAlertDescription')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup 
            value={availability} 
            onValueChange={setAvailability} 
            className="space-y-3"
            disabled={isCurrentlyOnTrip}
          >
            {availabilityOptions.map((option) => {
              const isSelected = availability === option.value;
              const isOnTripOption = option.value === 'on_trip';
              const isDisabled = isCurrentlyOnTrip || (isOnTripOption && !isCurrentlyOnTrip);
              
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all",
                    isSelected && option.selectable
                      ? cn(option.bg, option.border, "ring-2 ring-offset-2", option.ring)
                      : "border-border bg-card",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    !isDisabled && !isSelected && "hover:border-muted-foreground/20 cursor-pointer"
                  )}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    disabled={isDisabled}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <option.icon className={cn("w-5 h-5", option.color)} />
                      <span className={cn("font-bold", option.color)}>{option.label}</span>
                      {isOnTripOption && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {t('drivers:dialogs.availability.auto')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  
                  {isOnTripOption && !isCurrentlyOnTrip && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                      <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border">
                        {t('drivers:dialogs.availability.viaTripSystem')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isLoading}
            >
              {isCurrentlyOnTrip ? (
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {t('common:close')}
                </span>
              ) : (
                t('common:cancel')
              )}
            </Button>
            {!isCurrentlyOnTrip && (
              <Button 
                type="submit" 
                disabled={isLoading || !hasChanges}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('drivers:actions.updating')}
                  </span>
                ) : (
                  t('drivers:actions.confirm')
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}