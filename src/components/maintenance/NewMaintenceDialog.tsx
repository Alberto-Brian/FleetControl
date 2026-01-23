// ========================================
// FILE: src/components/maintenance/NewMaintenanceDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Wrench, Plus, Truck, AlertCircle } from 'lucide-react';
import { createMaintenance } from '@/helpers/maintenance-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { getAllMaintenanceCategories } from '@/helpers/maintenance-category-helpers';
import { getAllWorkshops } from '@/helpers/workshop-helpers';
import { ICreateMaintenance } from '@/lib/types/maintenance';
import { IVehicle } from '@/lib/types/vehicle';
import { IWorkshop } from '@/lib/types/workshop';

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
  const [startNow, setStartNow] = useState(false);
  const [formData, setFormData] = useState<ICreateMaintenance & { 
    parts_cost?: number; 
    labor_cost?: number;
    work_order_number?: string;
  }>({
    vehicle_id: '',
    category_id: '',
    workshop_id: undefined,
    type: 'corrective',
    vehicle_mileage: 0,
    description: '',
    priority: 'normal',
    notes: '',
    parts_cost: 0,
    labor_cost: 0,
    work_order_number: '',
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
      setVehicles(vehiclesData.filter((v: IVehicle) => v.status !== 'inactive'));
      setCategories(categoriesData);
      setWorkshops(workshopsData.filter((w: IWorkshop) => w.is_active === true));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação manual dos campos obrigatórios
    if (!formData.vehicle_id) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, selecione um veículo',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.category_id) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, selecione uma categoria',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, selecione o tipo de manutenção',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, preencha a descrição do problema',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.vehicle_mileage || formData.vehicle_mileage <= 0) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe a quilometragem',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const maintenanceData: any = {
        vehicle_id: formData.vehicle_id,
        category_id: formData.category_id,
        workshop_id: formData.workshop_id || undefined,
        type: formData.type,
        vehicle_mileage: formData.vehicle_mileage,
        description: formData.description.trim(),
        priority: formData.priority,
        notes: formData.notes?.trim() || undefined,
        parts_cost: formData.parts_cost || undefined,
        labor_cost: formData.labor_cost || undefined,
        work_order_number: formData.work_order_number?.trim() || undefined,
        status: startNow ? 'in_progress' : 'scheduled',
      };

      const newMaintenance = await createMaintenance(maintenanceData);
      
      toast({
        title: 'Sucesso!',
        description: startNow 
          ? 'Manutenção iniciada com sucesso.' 
          : 'Manutenção agendada com sucesso.',
      });
      
      if (onMaintenanceCreated) {
        onMaintenanceCreated(newMaintenance);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating maintenance:', error);
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
      parts_cost: 0,
      labor_cost: 0,
      work_order_number: '',
    });
    setStartNow(false);
  }

  const totalCost = (formData.parts_cost || 0) + (formData.labor_cost || 0);
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Manutenção
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Registar Manutenção
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da manutenção a ser realizada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Veículo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Veículo *
            </Label>
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
            >
              <SelectTrigger className={!formData.vehicle_id ? 'border-muted-foreground' : ''}>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                    Nenhum veículo disponível
                  </div>
                ) : (
                  vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <span className="font-semibold">{v.license_plate}</span>
                      <span className="text-muted-foreground"> - </span>
                      <span>{v.brand} {v.model}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedVehicle && (
              <p className="text-xs text-muted-foreground">
                KM Actual: {selectedVehicle.current_mileage?.toLocaleString('pt-AO')}
              </p>
            )}
          </div>

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Manutenção *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
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
              >
                <SelectTrigger className={!formData.category_id ? 'border-muted-foreground' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                      Nenhuma categoria disponível
                    </div>
                  ) : (
                    categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div 
                          className="w-3 h-3 rounded-full inline-block mr-2" 
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quilometragem, Prioridade e Ordem de Serviço */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quilometragem *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 45000"
                value={formData.vehicle_mileage || ''}
                onChange={(e) => setFormData({ ...formData, vehicle_mileage: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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

            <div className="space-y-2">
              <Label>Nº Ordem de Serviço</Label>
              <Input
                placeholder="Ex: OS-2024-001"
                value={formData.work_order_number || ''}
                onChange={(e) => setFormData({ ...formData, work_order_number: e.target.value })}
              />
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

          {/* Custos */}
          <div className="space-y-3">
            <Label>Custos Estimados</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Peças (Kz)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.parts_cost || ''}
                  onChange={(e) => setFormData({ ...formData, parts_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mão de Obra (Kz)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.labor_cost || ''}
                  onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Total</Label>
                <Input
                  value={totalCost.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                  disabled
                  className="bg-muted font-bold"
                />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição do Problema *</Label>
            <Textarea
              placeholder="Descreva o problema ou serviço a ser realizado..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={!formData.description ? 'border-muted-foreground' : ''}
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

          {/* Checkbox para iniciar agora */}
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
            <Checkbox
              id="start_now"
              checked={startNow}
              onCheckedChange={(checked) => setStartNow(checked as boolean)}
            />
            <label
              htmlFor="start_now"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Iniciar manutenção imediatamente (alterar status do veículo para "Em Manutenção")
            </label>
          </div>

          {/* Resumo */}
          {totalCost > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium">
                Custo Total Estimado: 
                <span className="text-lg ml-2 font-bold text-primary">
                  {totalCost.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {startNow ? 'Em Andamento' : 'Agendada'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || vehicles.length === 0 || categories.length === 0}
            >
              {isLoading ? 'Registando...' : startNow ? 'Iniciar Manutenção' : 'Agendar Manutenção'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}