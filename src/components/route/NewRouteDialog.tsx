// src/components/route/NewRouteDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Route as RouteIcon } from 'lucide-react';
import { createRoute } from '@/helpers/route-helpers';
import { ICreateRoute } from '@/lib/types/route';

interface NewRouteDialogProps {
  onRouteCreated?: (route: any) => void;
}

const ROUTE_TYPES = [
  { value: 'regular', label: 'Regular' },
  { value: 'express', label: 'Expressa' },
  { value: 'alternative', label: 'Alternativa' },
];

export default function NewRouteDialog({ onRouteCreated }: NewRouteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateRoute>({
    name: '',
    origin: '',
    destination: '',
    distance_km: 0,
    estimated_duration_hours: 0,
    route_type: 'regular',
    description: '',
    waypoints: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newRoute = await createRoute(formData);
      
      toast({
        title: 'Sucesso!',
        description: 'Rota registada com sucesso.',
      });
      
      if (onRouteCreated) {
        onRouteCreated(newRoute);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registar rota',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      origin: '',
      destination: '',
      distance_km: 0,
      estimated_duration_hours: 0,
      route_type: 'regular',
      description: '',
      waypoints: '',
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Rota
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RouteIcon className="w-5 h-5" />
            Registar Rota
          </DialogTitle>
          <DialogDescription>
            Defina um percurso pré-estabelecido para viagens
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Rota */}
          <div className="space-y-2">
            <Label>Nome da Rota *</Label>
            <Input
              placeholder="Ex: Luanda - Benguela"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Origem e Destino */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem *</Label>
              <Input
                placeholder="Ex: Luanda"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Destino *</Label>
              <Input
                placeholder="Ex: Benguela"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Distância e Duração */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Distância (km) *</Label>
              <Input
                type="number"
                min="0"
                placeholder="Ex: 650"
                value={formData.distance_km || ''}
                onChange={(e) => setFormData({ ...formData, distance_km: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Duração (horas)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 8"
                value={formData.estimated_duration_hours || ''}
                onChange={(e) => setFormData({ ...formData, estimated_duration_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Rota</Label>
              <Select
                value={formData.route_type}
                onValueChange={(value) => setFormData({ ...formData, route_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pontos de Passagem */}
          <div className="space-y-2">
            <Label>Pontos de Passagem</Label>
            <Input
              placeholder="Ex: Catumbela, Lobito"
              value={formData.waypoints || ''}
              onChange={(e) => setFormData({ ...formData, waypoints: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Separe múltiplos pontos por vírgula
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Informações adicionais sobre a rota..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Resumo */}
          {formData.distance_km > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                {formData.origin || '...'} → {formData.destination || '...'}: 
                <span className="ml-2">{formData.distance_km} km</span>
                {formData.estimated_duration_hours && formData.estimated_duration_hours > 0 && (
                  <span className="ml-2">
                    (~{formData.estimated_duration_hours}h)
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registando...' : 'Registar Rota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}