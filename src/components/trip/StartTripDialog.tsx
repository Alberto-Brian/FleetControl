// ========================================
// FILE: src/components/trip/StartTripDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Truck, User, MapPin, Gauge, Route as RouteIcon, ArrowRight } from 'lucide-react';
import { createTrip } from '@/helpers/trip-helpers';
import { getAvailableVehicles } from '@/helpers/vehicle-helpers';
import { getActiveDrivers } from '@/helpers/driver-helpers';
import { getActiveRoutes } from '@/helpers/route-helpers';
import { ICreateTrip } from '@/lib/types/trip';
import { Separator } from '@/components/ui/separator';

interface StartTripDialogProps {
  onTripCreated: (trip: any) => void;
}

export default function StartTripDialog({ onTripCreated }: StartTripDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [useRoute, setUseRoute] = useState(true); // true = usar rota, false = manual
  const [formData, setFormData] = useState<ICreateTrip>({
    vehicle_id: '',
    driver_id: '',
    route_id: '',
    start_mileage: 0,
    origin: '',
    destination: '',
    purpose: '',
  });

  useEffect(() => {
    if (open) {
      loadData();
      console.log(vehicles)
    }
  }, [open]);

  async function loadData() {
    try {
      const [vehiclesData, driversData, routesData] = await Promise.all([
        getAvailableVehicles(),
        getActiveDrivers(),
        getActiveRoutes()
      ]);
      
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setRoutes(routesData);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive',
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validação: se usar rota, route_id é obrigatório; senão, origin/destination
    if (useRoute && !formData.route_id) {
      toast({
        title: 'Erro',
        description: 'Selecione uma rota',
        variant: 'destructive',
      });
      return;
    }

    if (!useRoute && (!formData.origin || !formData.destination)) {
      toast({
        title: 'Erro',
        description: 'Informe origem e destino',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados: se usar rota, limpar origin/destination manual
      const tripData: ICreateTrip = useRoute
        ? {
            vehicle_id: formData.vehicle_id,
            driver_id: formData.driver_id,
            route_id: formData.route_id,
            start_mileage: formData.start_mileage,
            purpose: formData.purpose,
            notes: formData.notes,
          }
        : {
            vehicle_id: formData.vehicle_id,
            driver_id: formData.driver_id,
            start_mileage: formData.start_mileage,
            origin: formData.origin,
            destination: formData.destination,
            purpose: formData.purpose,
            notes: formData.notes,
          };

      const newTrip = await createTrip(tripData);

      if (newTrip) {
        toast({
          title: 'Sucesso!',
          description: 'Viagem iniciada com sucesso.',
        });
        onTripCreated(newTrip);
        setOpen(false);
        resetForm();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao iniciar viagem',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      vehicle_id: '',
      driver_id: '',
      route_id: '',
      start_mileage: 0,
      origin: '',
      destination: '',
      purpose: '',
    });
    setUseRoute(true);
  }

  function handleRouteChange(routeId: string) {
    const selectedRoute = routes.find(r => r.id === routeId);
    setFormData({
      ...formData,
      route_id: routeId,
      origin: selectedRoute?.origin || '',
      destination: selectedRoute?.destination || '',
    });
  }

  const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
  const selectedRoute = routes.find(r => r.id === formData.route_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Iniciar Viagem
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Iniciar Nova Viagem</DialogTitle>
          <DialogDescription>
            Selecione o veículo e motorista para iniciar uma viagem
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Veículo e Motorista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    start_mileage: vehicle?.current_mileage || 0
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum veículo disponível
                    </div>
                  ) : (
                    vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{v.license_plate}</span>
                          <span className="text-muted-foreground">-</span>
                          <span>{v.brand} {v.model}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedVehicle && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  KM Actual: {selectedVehicle.current_mileage?.toLocaleString('pt-AO')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Motorista *
              </Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum motorista disponível
                    </div>
                  ) : (
                    drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        <div className="flex items-center gap-2">
                          <span>{d.name}</span>
                          {d.license_category && (
                            <span className="text-xs text-muted-foreground">
                              (CNH {d.license_category})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Toggle: Usar Rota ou Manual */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-3">
                <RouteIcon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Tipo de Viagem</p>
                  <p className="text-xs text-muted-foreground">
                    {useRoute ? 'Usar rota pré-cadastrada' : 'Definir origem/destino manualmente'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={useRoute ? 'default' : 'outline'}
                  onClick={() => {
                    setUseRoute(true);
                    setFormData({ ...formData, origin: '', destination: '' });
                  }}
                >
                  Rota Cadastrada
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!useRoute ? 'default' : 'outline'}
                  onClick={() => {
                    setUseRoute(false);
                    setFormData({ ...formData, route_id: '' });
                  }}
                >
                  Manual
                </Button>
              </div>
            </div>

            {/* Seleção de Rota OU Origem/Destino Manual */}
            {useRoute ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <RouteIcon className="w-4 h-4" />
                    Rota *
                  </Label>
                  <Select
                    value={formData.route_id}
                    onValueChange={handleRouteChange}
                    required={useRoute}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma rota cadastrada" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nenhuma rota cadastrada
                        </div>
                      ) : (
                        routes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{r.name}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-green-600 dark:text-green-400">
                                {r.origin}
                              </span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm text-red-600 dark:text-red-400">
                                {r.destination}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview da Rota Selecionada */}
                {selectedRoute && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">Detalhes da Rota</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Origem</p>
                        <p className="font-medium text-green-700 dark:text-green-400">
                          {selectedRoute.origin}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Destino</p>
                        <p className="font-medium text-red-700 dark:text-red-400">
                          {selectedRoute.destination}
                        </p>
                      </div>
                      {selectedRoute.estimated_distance && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Distância Estimada</p>
                          <p className="font-medium">
                            {selectedRoute.estimated_distance.toLocaleString('pt-AO')} km
                          </p>
                        </div>
                      )}
                      {selectedRoute.estimated_duration && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Duração Estimada</p>
                          <p className="font-medium">{selectedRoute.estimated_duration}h</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Origem *
                  </Label>
                  <Input
                    placeholder="Ex: Luanda"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    required={!useRoute}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Destino *
                  </Label>
                  <Input
                    placeholder="Ex: Benguela"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    required={!useRoute}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* KM Inicial e Finalidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Quilometragem Inicial *
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.start_mileage}
                onChange={(e) => setFormData({ ...formData, start_mileage: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Verifique o odômetro do veículo antes de partir
              </p>
            </div>

            <div className="space-y-2">
              <Label>Finalidade</Label>
              <Input
                placeholder="Ex: Entrega de mercadorias"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre a viagem..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || vehicles.length === 0 || drivers.length === 0}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}