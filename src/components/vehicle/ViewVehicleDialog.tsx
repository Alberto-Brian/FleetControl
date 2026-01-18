// ========================================
// FILE: src/renderer/src/components/vehicle/ViewVehicleDialog.tsx
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ViewVehicleDialogProps {
  vehicle: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewVehicleDialog({ vehicle, open, onOpenChange }: ViewVehicleDialogProps) {
  if (!vehicle) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Disponível', variant: 'default' as const },
      in_use: { label: 'Em Uso', variant: 'secondary' as const },
      maintenance: { label: 'Manutenção', variant: 'destructive' as const },
      inactive: { label: 'Inactivo', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{vehicle.license_plate}</DialogTitle>
            {getStatusBadge(vehicle.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="font-semibold mb-3">Informações do Veículo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{vehicle.brand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ano</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cor</p>
                <p className="font-medium">{vehicle.color || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vehicle.category_color }}
                  />
                  <p className="font-medium">{vehicle.category_name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quilometragem</p>
                <p className="font-medium">{vehicle.current_mileage?.toLocaleString('pt-AO')} km</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações Adicionais */}
          {(vehicle.chassis_number || vehicle.engine_number || vehicle.fuel_tank_capacity) && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Dados Técnicos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.chassis_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número do Chassi</p>
                      <p className="font-medium">{vehicle.chassis_number}</p>
                    </div>
                  )}
                  {vehicle.engine_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Número do Motor</p>
                      <p className="font-medium">{vehicle.engine_number}</p>
                    </div>
                  )}
                  {vehicle.fuel_tank_capacity && (
                    <div>
                      <p className="text-sm text-muted-foreground">Capacidade do Tanque</p>
                      <p className="font-medium">{vehicle.fuel_tank_capacity}L</p>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Datas */}
          <div>
            <h3 className="font-semibold mb-3">Registos</h3>
            <div className="grid grid-cols-2 gap-4">
              {vehicle.acquisition_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Aquisição</p>
                  <p className="font-medium">{new Date(vehicle.acquisition_date).toLocaleDateString('pt-AO')}</p>
                </div>
              )}
              {vehicle.acquisition_value && (
                <div>
                  <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                  <p className="font-medium">{(vehicle.acquisition_value / 100).toLocaleString('pt-AO')} Kz</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                <p className="font-medium">{new Date(vehicle.created_at).toLocaleDateString('pt-AO')}</p>
              </div>
            </div>
          </div>

          {vehicle.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-muted-foreground">{vehicle.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}