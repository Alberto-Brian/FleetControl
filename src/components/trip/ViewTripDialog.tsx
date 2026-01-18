// ========================================
// FILE: src/components/trip/ViewTripDialog.tsx
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Truck, 
  User, 
  Gauge, 
  TrendingUp,
  Clock,
  FileText,
  Target,
  Route
} from 'lucide-react';

interface ViewTripDialogProps {
  trip: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewTripDialog({ trip, open, onOpenChange }: ViewTripDialogProps) {
  if (!trip) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      in_progress: { 
        label: 'Em Andamento', 
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200'
      },
      completed: { 
        label: 'Concluída', 
        className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200'
      },
      cancelled: { 
        label: 'Cancelada', 
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.in_progress;
    return (
      <Badge className={`${statusInfo.className} text-sm px-3 py-1`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const distance = trip.end_mileage ? trip.end_mileage - trip.start_mileage : null;
  const duration = trip.start_date && trip.end_date 
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{trip.trip_code}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span className="text-sm">
                  <span className="font-medium text-green-600 dark:text-green-400">{trip.origin}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{trip.destination}</span>
                </span>
              </div>
            </div>
            {getStatusBadge(trip.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas em Destaque (se completada) */}
          {trip.status === 'completed' && distance !== null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distância Percorrida</p>
                    <p className="text-2xl font-bold text-primary">
                      {distance.toLocaleString('pt-AO')} km
                    </p>
                  </div>
                </div>
              </Card>

              {duration !== null && (
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duração</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {duration}h
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Informações do Veículo e Motorista */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Veículo e Motorista</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Veículo</p>
                </div>
                <p className="font-semibold text-lg mb-1">{trip.vehicle_license}</p>
                <p className="text-sm text-muted-foreground">
                  {trip.vehicle_brand} {trip.vehicle_model}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Motorista</p>
                </div>
                <p className="font-semibold text-lg">{trip.driver_name}</p>
              </div>
            </div>
          </Card>

          {/* Informações da Viagem */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">Detalhes da Viagem</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">Origem</p>
                </div>
                <p className="font-medium text-green-700 dark:text-green-400">{trip.origin}</p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-muted-foreground">Destino</p>
                </div>
                <p className="font-medium text-red-700 dark:text-red-400">{trip.destination}</p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Data/Hora de Início</p>
                </div>
                <p className="font-medium">
                  {new Date(trip.start_date).toLocaleString('pt-AO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {trip.end_date && (
                <div className="p-3 rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Data/Hora de Conclusão</p>
                  </div>
                  <p className="font-medium">
                    {new Date(trip.end_date).toLocaleString('pt-AO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quilometragem */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">Quilometragem</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <p className="text-xs text-muted-foreground mb-1">KM Inicial</p>
                <p className="text-xl font-bold">{trip.start_mileage?.toLocaleString('pt-AO')}</p>
              </div>

              {trip.end_mileage && (
                <>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground mb-1">KM Final</p>
                    <p className="text-xl font-bold">{trip.end_mileage.toLocaleString('pt-AO')}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Distância</p>
                    <p className="text-xl font-bold text-primary">
                      {distance?.toLocaleString('pt-AO')} km
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Finalidade */}
          {trip.purpose && (
            <Card className="p-5 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg">Finalidade</h3>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm">{trip.purpose}</p>
              </div>
            </Card>
          )}

          {/* Observações */}
          {trip.notes && (
            <Card className="p-5 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">Observações</h3>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {trip.notes}
                </p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}