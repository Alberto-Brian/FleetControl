// ========================================
// FILE: src/components/vehicle/ViewVehicleDialog.tsx (REDESENHADO)
// ========================================
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, Gauge, RefreshCw, CheckCircle2, Clock, Settings2, Ban, 
  Truck, Tag, Calendar, DollarSign, FileText, RotateCcw, Fuel,
  Palette, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVehicles } from '@/contexts/VehiclesContext';
import { useTranslation } from 'react-i18next';

// Importar os dialogs
import UpdateMileageDialog from './UpdateMileageDialog';
import ChangeStatusDialog from './ChangeStatusDialog';
import EditVehicleDialog from './EditVehicleDialog';

interface ViewVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewVehicleDialog({ open, onOpenChange }: ViewVehicleDialogProps) {
  const { state: { selectedVehicle } } = useVehicles();
  const { t } = useTranslation();
  
  const [mileageDialogOpen, setMileageDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!selectedVehicle || !open) return null;

  const getStatusConfig = (status: string) => {
    const configs = {
      available: { 
        label: t('vehicles:status.available.label'),
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: 'ring-emerald-500',
        desc: 'Pronto para uso'
      },
      in_use: { 
        label: t('vehicles:status.in_use.label'),
        icon: Clock,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        ring: 'ring-blue-500',
        desc: 'Em serviço'
      },
      maintenance: { 
        label: t('vehicles:status.maintenance.label'), 
        icon: Settings2,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: 'ring-amber-500',
        desc: 'Em manutenção'
      },
      inactive: { 
        label: t('vehicles:status.inactive.label'), 
        icon: Ban,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        ring: 'ring-slate-500',
        desc: 'Fora de uso'
      },
    };
    return configs[status as keyof typeof configs] || configs.available;
  };

  const statusConfig = getStatusConfig(selectedVehicle.status);
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold font-mono">
                  {selectedVehicle.license_plate}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider",
                  statusConfig.bg,
                  statusConfig.color,
                  statusConfig.border
                )}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {statusConfig.label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* AÇÕES RÁPIDAS - Cards clicáveis */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                <RotateCcw className="w-3 h-3" /> Actualizações Rápidas
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Atualizar Km */}
                <button
                  onClick={() => setMileageDialogOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Quilometragem</p>
                    <p className="font-bold text-sm mt-0.5">Actualizar km atual</p>
                  </div>
                </button>

                {/* Alterar Status */}
                <button
                  onClick={() => setStatusDialogOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-blue-500/50 hover:bg-blue-50/50 transition-all text-left group"
                  disabled={selectedVehicle.status === 'in_use'}
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estado</p>
                    <p className="font-bold text-sm mt-0.5">
                      {selectedVehicle.status === 'in_use' ? 'Em uso - bloqueado' : 'Alterar status'}
                    </p>
                  </div>
                </button>

                {/* Editar Dados */}
                <button
                  onClick={() => setEditDialogOpen(true)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:border-purple-500/50 hover:bg-purple-50/50 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dados do Veículo</p>
                    <p className="font-bold text-sm mt-0.5">Editar informações</p>
                  </div>
                </button>

                {/* Ver Categoria */}
                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-muted/30">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: `${selectedVehicle.category_color}20`,
                      color: selectedVehicle.category_color 
                    }}
                  >
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Categoria</p>
                    <p className="font-bold text-sm mt-0.5">{selectedVehicle.category_name}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informações agrupadas em cards */}
            <div className="space-y-4">
              {/* Dados Principais */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-3 h-3" /> Dados do Veículo
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Marca / Modelo</p>
                    <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Ano</p>
                    <p className="font-medium">{selectedVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Cor</p>
                    <div className="flex items-center gap-2">
                      {selectedVehicle.color && (
                        <div 
                          className="w-3 h-3 rounded-full border border-muted"
                          style={{ backgroundColor: selectedVehicle.color.toLowerCase() === 'branco' ? '#f8fafc' : selectedVehicle.color.toLowerCase() }}
                        />
                      )}
                      <p className="font-medium">{selectedVehicle.color || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Quilometragem</p>
                    <p className="font-medium font-mono">
                      {selectedVehicle.current_mileage?.toLocaleString('pt-AO') || '0'} km
                    </p>
                  </div>
                </div>
              </div>

              {/* Dados Técnicos */}
              {(selectedVehicle.chassis_number || selectedVehicle.engine_number || selectedVehicle.fuel_tank_capacity) && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Dados Técnicos
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedVehicle.chassis_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Chassi</span>
                        <span className="font-mono font-medium text-xs">{selectedVehicle.chassis_number}</span>
                      </div>
                    )}
                    {selectedVehicle.engine_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Motor</span>
                        <span className="font-mono font-medium text-xs">{selectedVehicle.engine_number}</span>
                      </div>
                    )}
                    {selectedVehicle.fuel_tank_capacity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Capacidade Tanque</span>
                        <span className="font-medium">{selectedVehicle.fuel_tank_capacity} L</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aquisição */}
              {(selectedVehicle.acquisition_date || selectedVehicle.acquisition_value) && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Aquisição
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedVehicle.acquisition_date && (
                      <div>
                        <p className="text-muted-foreground text-xs">Data</p>
                        <p className="font-medium">
                          {new Date(selectedVehicle.acquisition_date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    )}
                    {selectedVehicle.acquisition_value && (
                      <div>
                        <p className="text-muted-foreground text-xs">Valor</p>
                        <p className="font-medium">
                          {(selectedVehicle.acquisition_value / 100).toLocaleString('pt-AO', {
                            style: 'currency',
                            currency: 'AOA'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Registos */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Registos
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Cadastro</p>
                    <p className="font-medium">
                      {selectedVehicle.created_at 
                        ? new Date(selectedVehicle.created_at).toLocaleDateString('pt-AO')
                        : '-'
                      }
                    </p>
                  </div>
                  {selectedVehicle.updated_at && selectedVehicle.updated_at !== selectedVehicle.created_at && (
                    <div>
                      <p className="text-muted-foreground text-xs">Última Actualização</p>
                      <p className="font-medium">
                        {new Date(selectedVehicle.updated_at).toLocaleDateString('pt-AO')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {selectedVehicle.notes && (
                <div className="p-4 bg-muted/30 rounded-xl">
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Observações
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedVehicle.notes}</p>
                </div>
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground pt-4">
              <p>Para edição completa, utilize o botão "Editar" na lista principal</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <UpdateMileageDialog open={mileageDialogOpen} onOpenChange={setMileageDialogOpen} />
      <ChangeStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} />
      <EditVehicleDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </>
  );
}