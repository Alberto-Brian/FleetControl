// src/components/maintenance/NewMaintenanceDialog.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Wrench, Plus } from 'lucide-react';
import { createMaintenance } from '@/helpers/maintenance-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllMaintenanceCategories } from '@/helpers/maintenance-category-helpers';
import { getAllWorkshops } from '@/helpers/workshop-helpers';
import { ICreateMaintenance } from '@/lib/types/maintenance';

interface NewMaintenanceDialogProps {
  onMaintenanceCreated?: (maintenance: any) => void;
}

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventiva' },
  { value: 'corrective', label: 'Corretiva' },
];

const PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'text-green-600' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
];

export default function NewMaintenanceDialog({ onMaintenanceCreated }: NewMaintenanceDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [formData, setFormData] = useState<ICreateMaintenance>({
    vehicle_id: '',
    category_id: '',
    workshop_id: undefined,
    type: 'corrective',
    vehicle_mileage: 0,
    description: '',
    priority: 'normal',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, categoriesData, workshopsData] = await Promise.all([
        getAllVehicles(),
        getAllMaintenanceCategories(),
        getAllWorkshops(),
      ]);
      setVehicles(vehiclesData.filter(v => v.status !== 'inactive'));
      setCategories(categoriesData);
      setWorkshops(workshopsData.filter(w => w.is_active === true));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newMaintenance = await createMaintenance(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Manutenção registada com sucesso.',
      });
      
      if (onMaintenanceCreated) {
        onMaintenanceCreated(newMaintenance);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar manutenção',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      vehicle_id: '',
      category_id: '',
      workshop_id: undefined,
      type: 'corrective',
      vehicle_mileage: 0,
      description: '',
      priority: 'normal',
      notes: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Registar Manutenção
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da manutenção a ser realizada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Veículo */}
          <div className="space-y-2">
            <Label>Veículo *</Label>
            <Select
              value={formData.vehicle_id}
              onValueChange={(value) => {
                const vehicle = vehicles.find(v => v.id === value);
                setFormData({ 
                  ...formData, 
                  vehicle_id: value,
                  vehicle_mileage: vehicle?.current_mileage || 0
                });
              }}
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

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Manutenção *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quilometragem e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quilometragem do Veículo *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 45000"
                value={formData.vehicle_mileage || ''}
                onChange={(e) => setFormData({ ...formData, vehicle_mileage: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Oficina */}
          <div className="space-y-2">
            <Label>Oficina (opcional)</Label>
            <Select
              value={formData.workshop_id || 'none'}
              onValueChange={(value) => setFormData({ ...formData, workshop_id: value === 'none' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a oficina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {workshops.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} {w.city && `- ${w.city}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição do Problema *</Label>
            <Textarea
              placeholder="Descreva o problema ou serviço a ser realizado..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
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
              {isLoading ? 'Registando...' : 'Registar Manutenção'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}