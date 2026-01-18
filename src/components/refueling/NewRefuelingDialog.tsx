// src/renderer/src/components/NewRefuelingDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Fuel, Plus } from 'lucide-react';
import { createRefueling } from '@/helpers/refueling-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllDrivers } from '@/helpers/driver-helpers';
import { getAllFuelStations } from '@/helpers/fuel-station-helpers';
import { ICreateRefueling } from '@/lib/types/refueling';

interface NewRefuelingDialogProps {
  onRefuelingCreated?: (refueling: any) => void;
}

const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Gasóleo' },
  { value: 'electric', label: 'Elétrico' },
  { value: 'hybrid', label: 'Híbrido' },
];

export default function NewRefuelingDialog({ onRefuelingCreated }: NewRefuelingDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateRefueling>({
    vehicle_id: '',
    driver_id: undefined,
    station_id: undefined,
    fuel_type: 'diesel',
    liters: 0,
    price_per_liter: 0,
    current_mileage: 0,
    is_full_tank: true,
    invoice_number: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, driversData, stationsData] = await Promise.all([
        getAllVehicles(),
        getAllDrivers(),
        getAllFuelStations(),
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setStations(stationsData.filter(s => s.is_active === true));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newRefueling = await createRefueling(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Abastecimento registado com sucesso.',
      });
      
      if (onRefuelingCreated) {
        onRefuelingCreated(newRefueling);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar abastecimento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      vehicle_id: '',
      driver_id: undefined,
      station_id: undefined,
      fuel_type: 'diesel',
      liters: 0,
      price_per_liter: 0,
      current_mileage: 0,
      is_full_tank: true,
      invoice_number: '',
      notes: '',
    });
  }

  const totalCost = formData.liters * formData.price_per_liter;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Registar Abastecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            Registar Abastecimento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do abastecimento realizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Veículo e Motorista */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Veículo *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.license_plate} - {v.brand} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motorista (opcional)</Label>
              <Select
                value={formData.driver_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posto de Combustível */}
          <div className="space-y-2">
            <Label>Posto de Combustível (opcional)</Label>
            <Select
              value={formData.station_id || 'none'}
              onValueChange={(value) => setFormData({ ...formData, station_id: value === 'none' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o posto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} {s.brand && `(${s.brand})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Combustível e Quilometragem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Combustível *</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quilometragem Atual *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 45000"
                value={formData.current_mileage || ''}
                onChange={(e) => setFormData({ ...formData, current_mileage: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          {/* Litros e Preço */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Litros *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 50.5"
                value={formData.liters || ''}
                onChange={(e) => setFormData({ ...formData, liters: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Preço/Litro (Kz) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 250.00"
                value={formData.price_per_liter || ''}
                onChange={(e) => setFormData({ ...formData, price_per_liter: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Total (Kz)</Label>
              <Input
                type="text"
                value={totalCost.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Tanque Cheio e Nº Fatura */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="is_full_tank"
                checked={formData.is_full_tank}
                onCheckedChange={(checked) => setFormData({ ...formData, is_full_tank: checked as boolean })}
              />
              <label
                htmlFor="is_full_tank"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tanque Cheio
              </label>
            </div>

            <div className="space-y-2">
              <Label>Nº Fatura/Recibo (opcional)</Label>
              <Input
                placeholder="Ex: FAT-2024-001"
                value={formData.invoice_number || ''}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Resumo */}
          {totalCost > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg space-y-1">
              <p className="text-sm font-medium">Resumo do Abastecimento:</p>
              <p className="text-sm">
                {formData.liters} litros × {formData.price_per_liter.toLocaleString('pt-AO')} Kz = 
                <span className="font-bold text-lg ml-2">
                  {totalCost.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registando...' : 'Registar Abastecimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}