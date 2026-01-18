// ========================================
// FILE: src/pages/TripsPage.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  Calendar, 
  Truck as TruckIcon, 
  User, 
  Flag, 
  Search, 
  Route as RouteIcon,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';
import StartTripDialog from '@/components/trip/StartTripDialog';
import CompleteTripDialog from '@/components/trip/CompleteTripDialog';
import ViewTripDialog from '@/components/trip/ViewTripDialog';
import NewRouteDialog from '@/components/route/NewRouteDialog';
import { getAllTrips } from '@/helpers/trip-helpers';

export default function TripsPage() {
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setIsLoading(true);
    try {
      const data = await getAllTrips();
      setTrips(data);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar viagens',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTrips = trips.filter(t =>
    t.trip_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getStatusBadge(status: string) {
    const statusMap = {
      in_progress: { 
        label: 'Em Andamento', 
        variant: 'secondary' as const,
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      },
      completed: { 
        label: 'Concluída', 
        variant: 'default' as const,
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      },
      cancelled: { 
        label: 'Cancelada', 
        variant: 'outline' as const,
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.in_progress;
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  }

  const activeTrips = trips.filter(t => t.status === 'in_progress').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Gestão de Viagens</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                {activeTrips} em andamento
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">
                {completedTrips} concluída{completedTrips !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <NewRouteDialog onRouteCreated={() => {
            toast({ title: 'Sucesso!', description: 'Rota registada com sucesso.' });
          }} />
          <StartTripDialog onTripCreated={(trip) => {
            setTrips([trip, ...trips]);
          }} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar por código, veículo, motorista, origem ou destino..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Viagens */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <RouteIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem registada'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="p-5 hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{trip.trip_code}</h3>
                    {getStatusBadge(trip.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Início: {new Date(trip.start_date).toLocaleString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {trip.end_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Fim: {new Date(trip.end_date).toLocaleString('pt-AO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Distância em Destaque */}
                {trip.end_mileage && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">Distância</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {(trip.end_mileage - trip.start_mileage).toLocaleString('pt-AO')} km
                    </p>
                  </div>
                )}
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Veículo */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-lg bg-background">
                    <TruckIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Veículo</p>
                    <p className="font-semibold truncate">{trip.vehicle_license}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {trip.vehicle_brand} {trip.vehicle_model}
                    </p>
                  </div>
                </div>

                {/* Motorista */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-lg bg-background">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Motorista</p>
                    <p className="font-semibold truncate">{trip.driver_name}</p>
                  </div>
                </div>

                {/* Rota */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-lg bg-background">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Rota</p>
                    <p className="font-semibold text-sm">
                      <span className="text-green-600 dark:text-green-400">{trip.origin}</span>
                      <span className="mx-1 text-muted-foreground">→</span>
                      <span className="text-red-600 dark:text-red-400">{trip.destination}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trip.end_mileage 
                        ? `${(trip.end_mileage - trip.start_mileage).toLocaleString('pt-AO')} km` 
                        : `KM inicial: ${trip.start_mileage.toLocaleString('pt-AO')}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Finalidade */}
              {trip.purpose && (
                <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-muted">
                  <p className="text-xs text-muted-foreground mb-1">Finalidade</p>
                  <p className="text-sm">{trip.purpose}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSelectedTrip(trip);
                    setViewDialogOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
                
                {trip.status === 'in_progress' && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedTrip(trip);
                      setCompleteDialogOpen(true);
                    }}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Finalizar Viagem
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedTrip && (
        <>
          <CompleteTripDialog
            trip={selectedTrip}
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            onTripCompleted={(completed) => {
              setTrips(trips.map(t => t.id === completed.id ? completed : t));
              setCompleteDialogOpen(false);
            }}
          />

          <ViewTripDialog
            trip={selectedTrip}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        </>
      )}
    </div>
  );
}