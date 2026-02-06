// ========================================
// FILE: src/components/vehicle/ChangeStatusDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Settings2, Ban, RefreshCw, ArrowRight, FileText } from 'lucide-react';
import { updateStatusVehicle } from '@/helpers/vehicle-helpers';
import { IUpdateStatus } from '@/lib/types/vehicle';
import { VehicleStatus } from '@/lib/db/schemas/vehicles';
import { cn } from '@/lib/utils';
import { useVehicles } from '@/contexts/VehiclesContext';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangeStatusDialog({  
    open, 
    onOpenChange, 
}: ChangeStatusDialogProps) {
    const { t } = useTranslation();
    const { showSuccess, handleError } = useErrorHandler();
    
    // ✨ ACESSA O VEÍCULO DO CONTEXTO
    const { state: { selectedVehicle }, updateVehicle } = useVehicles();
    
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<VehicleStatus>('available');
    const [notes, setNotes] = useState<string>('');

    const statusOptions = [
      {
        value: 'available' as const,
        label: t('vehicles:status.available.label'),
        description: t('vehicles:status.available.description'),
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        hoverBg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      },
      {
        value: 'in_use' as const,
        label: t('vehicles:status.in_use.label'),
        description: t('vehicles:status.in_use.description'),
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        hoverBg: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
      },
      {
        value: 'maintenance' as const,
        label: t('vehicles:status.maintenance.label'),
        description: t('vehicles:status.maintenance.description'),
        icon: Settings2,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        hoverBg: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
      },
      {
        value: 'inactive' as const,
        label: t('vehicles:status.inactive.label'),
        description: t('vehicles:status.inactive.description'),
        icon: Ban,
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-900',
        borderColor: 'border-slate-200 dark:border-slate-800',
        hoverBg: 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50',
      },
    ];

    // ✅ SINCRONIZA COM O VEÍCULO QUANDO ABRE
    useEffect(() => {
      if (open && selectedVehicle) {
        setSelectedStatus(selectedVehicle.status);
        setNotes('');
      }
    }, [open, selectedVehicle]);

    // ✅ EARLY RETURN - RESOLVE TODOS OS PROBLEMAS DE NULL
    if (!selectedVehicle) {
      return null;
    }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      // ✅ Aqui TypeScript já sabe que selectedVehicle não é null
      if (selectedStatus === selectedVehicle!.status) {
        onOpenChange(false);
        return;
      }

      setIsLoading(true);

      try {
        const updateData: IUpdateStatus = { status: selectedStatus };
        
        // Adiciona nota se fornecida
        if (notes.trim()) {
          const timestamp = new Date().toLocaleString('pt-AO');
          const statusLabel = statusOptions.find(s => s.value === selectedStatus)?.label;
          const newNote = `[${timestamp}] ${t('vehicles:statusChange.notePrefix')}: ${statusLabel}. ${notes}`;
          
          // ✅ Sem precisar de ? porque selectedVehicle não é null
          updateData.notes = selectedVehicle.notes 
            ? `${selectedVehicle.notes}\n${newNote}` 
            : newNote;
        }

        const updated = await updateStatusVehicle(selectedVehicle.id, updateData);

        if (updated) {
          // ✨ ATUALIZA O CONTEXTO GLOBAL
          updateVehicle(updated);
          showSuccess('vehicles:toast.statusUpdateSuccess');
          onOpenChange(false);
        }
      } catch (error) {
        handleError(error, 'vehicles:toast.statusUpdateError');
      } finally {
        setIsLoading(false);
      }
    }

    // ✅ currentStatusOption também funciona sem problemas
    const currentStatusOption = statusOptions.find(s => s.value === selectedVehicle.status);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              {t('vehicles:statusChange.title')}
            </DialogTitle>
            <DialogDescription>
              {selectedVehicle.brand} {selectedVehicle.model} • {selectedVehicle.license_plate}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Layout de 2 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* COLUNA ESQUERDA - Status Atual e Novo */}
              <div className="space-y-6">
                {/* Status Actual */}
                {currentStatusOption && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      {t('vehicles:statusChange.currentStatus')}
                    </Label>
                    <div className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      currentStatusOption.bgColor,
                      currentStatusOption.borderColor
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          currentStatusOption.bgColor
                        )}>
                          <currentStatusOption.icon className={cn("w-5 h-5", currentStatusOption.color)} />
                        </div>
                        <div className="flex-1">
                          <p className={cn("font-bold text-sm", currentStatusOption.color)}>
                            {currentStatusOption.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {currentStatusOption.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seta de Transição */}
                <div className="flex justify-center py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-px w-12 bg-border" />
                    <ArrowRight className="w-5 h-5" />
                    <div className="h-px w-12 bg-border" />
                  </div>
                </div>

                {/* Novo Status */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    {t('vehicles:statusChange.newStatus')} *
                  </Label>
                  <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                    <div className="grid grid-cols-2 gap-3">
                      {statusOptions.map((option) => (
                        <div key={option.value}>
                          <Label
                            htmlFor={option.value}
                            className={cn(
                              "flex flex-col gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                              selectedStatus === option.value
                                ? cn(option.borderColor, option.bgColor, "shadow-md ring-2 ring-offset-2 ring-offset-background", option.borderColor.replace('border-', 'ring-'))
                                : "border-border bg-card hover:border-muted-foreground/20",
                              option.hoverBg
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <option.icon className={cn(
                                "w-5 h-5 transition-colors",
                                selectedStatus === option.value ? option.color : "text-muted-foreground"
                              )} />
                              <RadioGroupItem 
                                value={option.value} 
                                id={option.value}
                                className="data-[state=checked]:border-primary"
                              />
                            </div>
                            <div>
                              <p className={cn(
                                "font-semibold text-sm leading-tight transition-colors",
                                selectedStatus === option.value ? option.color : "text-foreground"
                              )}>
                                {option.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                {option.description}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* COLUNA DIREITA - Observações e Ações */}
              <div className="space-y-6">
                {/* Observações */}
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    {t('vehicles:statusChange.notesLabel')}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="notes"
                      placeholder={t('vehicles:statusChange.notesPlaceholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={8}
                      className="resize-none border-2 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{t('vehicles:statusChange.notesHelper')}</span>
                    </p>
                  </div>
                </div>

                {/* Informação Adicional */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <RefreshCw className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold">{t('vehicles:statusChange.infoTitle')}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('vehicles:statusChange.infoDescription')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    {t('vehicles:statusChange.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || selectedStatus === selectedVehicle.status}
                    className="min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        {t('vehicles:statusChange.updating')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('vehicles:statusChange.confirm')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
}