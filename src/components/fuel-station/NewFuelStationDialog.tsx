// src/components/fuel-station/NewFuelStationDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Fuel } from 'lucide-react';
import { createFuelStation } from '@/helpers/fuel-station-helpers';
import { ICreateFuelStation } from '@/lib/types/fuel-station';
import { FuelType } from '@/lib/db/schemas/refuelings';

interface NewFuelStationDialogProps {
  onStationCreated?: (station: any) => void;
}

export default function NewFuelStationDialog({ onStationCreated }: NewFuelStationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateFuelStation>({
    name: '',
    brand: '',
    phone: '',
    address: '',
    city: '',
    fuel_types: 'diesel',
    has_convenience_store: 'false',
    has_car_wash: 'false',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newStation = await createFuelStation(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Posto de combustível registado com sucesso.',
      });
      
      if (onStationCreated) {
        onStationCreated(newStation);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar posto',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      brand: '',
      phone: '',
      address: '',
      city: '',
      fuel_types: 'diesel',
      has_convenience_store: 'false',
      has_car_wash: 'false',
      notes: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Posto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5" />
            Registar Posto de Combustível
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do posto de combustível
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e Marca */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Posto *</Label>
              <Input
                placeholder="Ex: Posto Talatona"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                placeholder="Ex: Sonangol, Puma"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              type="tel"
              placeholder="Ex: 923 456 789"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Endereço e Cidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                placeholder="Ex: Rua Principal, nº 100"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                placeholder="Ex: Luanda"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          {/* Tipos de Combustível */}
          <div className="space-y-2">
            <Label>Tipos de Combustível</Label>
            <Input
              placeholder="Ex: Gasolina, Gasóleo, GPL"
              value={formData.fuel_types || ''}
              onChange={(e) => setFormData({ ...formData, fuel_types: e.target.value as FuelType })}
            />
          </div>

          {/* Serviços Adicionais */}
          <div className="space-y-3">
            <Label>Serviços Adicionais</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="convenience_store"
                  checked={formData.has_convenience_store === 'true'}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, has_convenience_store: checked ? 'true' : 'false' })
                  }
                />
                <label
                  htmlFor="convenience_store"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Loja de Conveniência
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="car_wash"
                  checked={formData.has_car_wash === 'true'}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, has_car_wash: checked ? 'true' : 'false' })
                  }
                />
                <label
                  htmlFor="car_wash"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Lavagem de Carros
                </label>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre o posto..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registando...' : 'Registar Posto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}