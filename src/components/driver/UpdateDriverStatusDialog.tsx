// ========================================
// FILE: src/components/driver/UpdateDriverStatusDialog.tsx (CORRIGIDO - BLOQUEIO TOTAL ON_LEAVE)
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
import { DriverStatus, driverStatus, driverAvailability } from '@/lib/db/schemas/drivers';

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

  const isOnTrip = selectedDriver.availability === driverAvailability.ON_TRIP;
  // CORREÇÃO: Verificar se está em licença - bloqueia TUDO igual ao on_trip
  const isOnLeave = selectedDriver.status === driverStatus.ON_LEAVE;
  
  // Se está em viagem OU em licença, o dialog inteiro é somente leitura
  const isReadOnly = isOnTrip || isOnLeave;

  const statusOptions = [
    { 
      value: driverStatus.ACTIVE, 
      label: t('drivers:status.active.label'),
      description: t('drivers:status.active.description'),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500',
      selectable: true
    },
    { 
      value: driverStatus.ON_LEAVE, 
      label: t('drivers:status.on_leave.label'),
      description: t('drivers:status.on_leave.description'),
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      ring: 'ring-amber-500',
      selectable: false // Nunca selecionável manualmente
    },
    { 
      value: driverStatus.TERMINATED, 
      label: t('drivers:status.terminated.label'),
      description: t('drivers:status.terminated.description'),
      icon: UserX,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      ring: 'ring-slate-500',
      selectable: true
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isReadOnly) return; // Segurança extra
    
    setIsLoading(true);

    try {
      const updateData: any = { status };
      
      if (status === driverStatus.TERMINATED) {
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

  // Só permite submit se não estiver em modo leitura E houver mudança válida
  const hasChanges = !isReadOnly && status !== selectedDriver.status && status !== driverStatus.ON_LEAVE;

  // Mensagem de alerta quando está bloqueado (viagem ou licença)
  const getAlertMessage = () => {
    if (isOnTrip) {
      return {
        title: t('drivers:dialogs.status.onTripAlertTitle'),
        description: t('drivers:dialogs.status.onTripAlertDescription')
      };
    }
    if (isOnLeave) {
      return {
        title: t('drivers:dialogs.status.onLeaveAlertTitle'),
        description: t('drivers:dialogs.status.onLeaveAlertDescription')
      };
    }
    return null;
  };

  const alertMessage = getAlertMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", isReadOnly && "pointer-events-none")}>
        <DialogHeader>
          <DialogTitle>{t('drivers:dialogs.status.title')}</DialogTitle>
          <DialogDescription>
            {isReadOnly 
              ? t('drivers:dialogs.status.blockedDescription', { name: selectedDriver.name })
              : t('drivers:dialogs.status.description', { name: selectedDriver.name })
            }
          </DialogDescription>
        </DialogHeader>

        {alertMessage && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{alertMessage.title}</p>
              <p className="text-blue-700">{alertMessage.description}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup 
            value={status} 
            onValueChange={(val) => !isReadOnly && setStatus(val as DriverStatus)} 
            className="space-y-3"
            disabled={isReadOnly}
          >
            {statusOptions.map((option) => {
              const isSelected = status === option.value;
              const isOnLeaveOption = option.value === driverStatus.ON_LEAVE;
              
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all",
                    isSelected && !isReadOnly && option.selectable
                      ? cn(option.bg, option.border, "ring-2 ring-offset-2", option.ring)
                      : "border-border bg-card",
                    isReadOnly 
                      ? "opacity-60 cursor-not-allowed" // Tudo desabilitado
                      : isOnLeaveOption 
                        ? "opacity-50 cursor-not-allowed" // Só on_leave bloqueado
                        : !isSelected && "hover:border-muted-foreground/20 cursor-pointer"
                  )}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value} 
                    className="mt-1"
                    disabled={isReadOnly || isOnLeaveOption} // Desabilita on_leave sempre
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <option.icon className={cn("w-5 h-5", option.color)} />
                      <span className={cn("font-bold", option.color)}>{option.label}</span>
                      {isOnLeaveOption && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {t('drivers:dialogs.status.auto')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>

                  {/* Overlay para on_leave quando NÃO está em licença (mostra bloqueio) */}
                  {!isReadOnly && isOnLeaveOption && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                      <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {t('drivers:dialogs.status.viaLeaveSystem')}
                      </span>
                    </div>
                  )}
                </Label>
              );
            })}
          </RadioGroup>

          {/* Aviso quando terminated é selecionado (só em modo edição) */}
          {!isReadOnly && status === driverStatus.TERMINATED && (
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
              className={isReadOnly ? "pointer-events-auto" : ""} // Permitir clicar em fechar mesmo em readonly
            >
              {isReadOnly ? (
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
            
            {/* Só mostra botão de confirmar se NÃO estiver em modo leitura */}
            {!isReadOnly && (
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