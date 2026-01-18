// src/components/fine/NewFineDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, AlertCircle } from 'lucide-react';
import { createFine } from '@/helpers/fine-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllDrivers } from '@/helpers/driver-helpers';
import { ICreateFine } from '@/lib/types/fine';

interface NewFineDialogProps {
  onFineCreated?: (fine: any) => void;
}

const INFRACTION_TYPES = [
  'Excesso de Velocidade',
  'Estacionamento Proibido',
  'Uso de Telemóvel',
  'Ultrapassagem Indevida',
  'Sinal Vermelho',
  'Falta de Documentos',
  'Outro',
];

export default function NewFineDialog({ onFineCreated }: NewFineDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateFine>({
    vehicle_id: '',
    driver_id: undefined,
    fine_number: '',
    fine_date: new Date().toISOString().split('T')[0],
    infraction_type: '',
    description: '',
    location: '',
    fine_amount: 0,
    due_date: '',
    points: 0,
    authority: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        getAllVehicles(),
        getAllDrivers(),
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newFine = await createFine(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Multa registada com sucesso.',
      });
      
      if (onFineCreated) {
        onFineCreated(newFine);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar multa',
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
      fine_number: '',
      fine_date: new Date().toISOString().split('T')[0],
      infraction_type: '',
      description: '',
      location: '',
      fine_amount: 0,
      due_date: '',
      points: 0,
      authority: '',
      notes: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Multa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Registar Multa
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da multa de trânsito
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
              <Label>Motorista (se conhecido)</Label>
              <Select
                value={formData.driver_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Desconhecido</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nº Auto e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número do Auto *</Label>
              <Input
                placeholder="Ex: AUTO-2024-001"
                value={formData.fine_number}
                onChange={(e) => setFormData({ ...formData, fine_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data da Infração *</Label>
              <Input
                type="date"
                value={formData.fine_date}
                onChange={(e) => setFormData({ ...formData, fine_date: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Tipo de Infração */}
          <div className="space-y-2">
            <Label>Tipo de Infração *</Label>
            <Select
              value={formData.infraction_type}
              onValueChange={(value) => setFormData({ ...formData, infraction_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {INFRACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              placeholder="Descrição detalhada da infração..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required
            />
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label>Local da Infração</Label>
            <Input
              placeholder="Ex: Avenida 4 de Fevereiro"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Valor, Pontos, Vencimento */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor (Kz) *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 15000"
                value={formData.fine_amount || ''}
                onChange={(e) => setFormData({ ...formData, fine_amount: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pontos</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 2"
                value={formData.points || ''}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Autoridade */}
          <div className="space-y-2">
            <Label>Autoridade</Label>
            <Input
              placeholder="Ex: Polícia Nacional de Trânsito"
              value={formData.authority || ''}
              onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registando...' : 'Registar Multa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}