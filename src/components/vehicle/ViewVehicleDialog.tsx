// ========================================
// FILE: src/components/vehicle/ViewVehicleDialog.tsx (CORRIGIDO)
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Gauge, RefreshCw, CheckCircle2, Clock, Settings2, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicles } from '@/contexts/VehiclesContext'; // ✨ Import
import { useTranslation } from 'react-i18next';

// Importar os novos dialogs
import UpdateMileageDialog from './UpdateMileageDialog';
import ChangeStatusDialog from './ChangeStatusDialog';
import EditVehicleDialog from './EditVehicleDialog';

interface ViewVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewVehicleDialog({ 
  open, 
  onOpenChange,
}: ViewVehicleDialogProps) {
   // ✨ ACESSA O VEÍCULO DO CONTEXTO
  const { state: { selectedVehicle } } = useVehicles();


  const { t } = useTranslation();
  
  // Estados para controlar abertura dos dialogs de ação
  const [mileageDialogOpen, setMileageDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);


  // ✅ CRÍTICO: Retorna null se não houver dados válidos
  if (!selectedVehicle || !open) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { 
        label: t('vehicles:status.available.label'),
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      },
      in_use: { 
        label: t('vehicles:status.in_use.label'),
        icon: Clock,
        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
      },
      maintenance: { 
        label: t('vehicles:status.maintenance.label'), 
        icon: Settings2,
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
      },
      inactive: { 
        label: t('vehicles:status.inactive.label'), 
        icon: Ban,
        className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    const Icon = statusInfo.icon;

    return (
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity",
          statusInfo.className
        )}
        onClick={() => setStatusDialogOpen(true)}
      >
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {selectedVehicle.license_plate || 'Sem matrícula'}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {selectedVehicle.brand || '-'} {selectedVehicle.model || '-'} ({selectedVehicle.year || '-'})
                </p>
              </div>
              {selectedVehicle.status && getStatusBadge(selectedVehicle.status)}
            </div>
          </DialogHeader>

          {/* Botões de Ação Rápida */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar Dados
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMileageDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Gauge className="w-4 h-4" />
              Atualizar Km
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setStatusDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={selectedVehicle.status === 'in_use'}
            >
              <RefreshCw className="w-4 h-4" />
              Alterar Status
            </Button>
          </div>

          <Separator />

          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                Informações do Veículo
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p className="font-medium">{selectedVehicle.brand || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p className="font-medium">{selectedVehicle.model || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ano</p>
                  <p className="font-medium">{selectedVehicle.year || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cor</p>
                  <p className="font-medium">{selectedVehicle.color || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <div className="flex items-center gap-2">
                    {selectedVehicle.category_color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedVehicle.category_color }}
                      />
                    )}
                    <p className="font-medium">{selectedVehicle.category_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quilometragem</p>
                  <p className="font-medium">
                    {selectedVehicle.current_mileage 
                      ? `${selectedVehicle.current_mileage.toLocaleString('pt-AO')} km`
                      : '0 km'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Dados Técnicos */}
            {(selectedVehicle.chassis_number || selectedVehicle.engine_number || selectedVehicle.fuel_tank_capacity) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    Dados Técnicos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedVehicle.chassis_number && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Número do Chassi</p>
                        <p className="font-medium font-mono text-sm">{selectedVehicle.chassis_number}</p>
                      </div>
                    )}
                    {selectedVehicle.engine_number && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Número do Motor</p>
                        <p className="font-medium font-mono text-sm">{selectedVehicle.engine_number}</p>
                      </div>
                    )}
                    {selectedVehicle.fuel_tank_capacity && (
                      <div>
                        <p className="text-sm text-muted-foreground">Capacidade do Tanque</p>
                        <p className="font-medium">{selectedVehicle.fuel_tank_capacity}L</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Aquisição */}
            {(selectedVehicle.acquisition_date || selectedVehicle.acquisition_value) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    Aquisição
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedVehicle.acquisition_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Aquisição</p>
                        <p className="font-medium">
                          {new Date(selectedVehicle.acquisition_date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    )}
                    {selectedVehicle.acquisition_value && (
                      <div>
                        <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                        <p className="font-medium">
                          {(selectedVehicle.acquisition_value / 100).toLocaleString('pt-AO', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} Kz
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Registos */}
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                Registos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                  <p className="font-medium">
                    {selectedVehicle.created_at 
                      ? new Date(selectedVehicle.created_at).toLocaleDateString('pt-AO')
                      : '-'
                    }
                  </p>
                </div>
                {selectedVehicle.updated_at && selectedVehicle.updated_at !== selectedVehicle.created_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Última Actualização</p>
                    <p className="font-medium">
                      {new Date(selectedVehicle.updated_at).toLocaleDateString('pt-AO')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {selectedVehicle.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    Observações
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                    <p className="text-sm whitespace-pre-wrap">{selectedVehicle.notes}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs de Ação - Passam o currentVehicle */}
      {mileageDialogOpen && selectedVehicle && (
        <UpdateMileageDialog
          open={mileageDialogOpen}
          onOpenChange={setMileageDialogOpen}
        />
      )}

      {statusDialogOpen && selectedVehicle && (
        <ChangeStatusDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
        />
      )}

      {editDialogOpen && selectedVehicle && (
        <EditVehicleDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}