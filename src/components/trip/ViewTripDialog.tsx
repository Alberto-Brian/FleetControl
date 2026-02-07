// ========================================
// FILE: src/components/trip/ViewTripDialog.tsx (ATUALIZADO)
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  MapPin, Calendar, Truck, User, Gauge, TrendingUp, Clock, FileText, Target, Route, Flag, XCircle
} from 'lucide-react';
import { useTrips } from '@/contexts/TripsContext';

interface ViewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewTripDialog({ open, onOpenChange }: ViewTripDialogProps) {
  const { t } = useTranslation();
  const { state: { selectedTrip } } = useTrips();

  // ✅ EARLY RETURN
  if (!selectedTrip || !open) return null;

  function getStatusBadge(status: string) {
    const statusMap = {
      in_progress: { 
        label: t('trips:status.in_progress.label'),
        icon: Clock,
        className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
      },
      completed: { 
        label: t('trips:status.completed.label'),
        icon: Flag,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
      },
      cancelled: { 
        label: t('trips:status.cancelled.label'),
        icon: XCircle,
        className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
      },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.in_progress;
    const Icon = statusInfo.icon;

    return (
      <Badge className={cn("text-sm px-3 py-1 flex items-center gap-1.5", statusInfo.className)}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    );
  }

  const distance = selectedTrip.end_mileage ? selectedTrip.end_mileage - selectedTrip.start_mileage : null;
  const duration = selectedTrip.start_date && selectedTrip.end_date 
    ? Math.ceil((new Date(selectedTrip.end_date).getTime() - new Date(selectedTrip.start_date).getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold mb-2">{selectedTrip.trip_code}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span className="text-sm">
                  <span className="font-medium text-green-600 dark:text-green-400">{selectedTrip.origin}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{selectedTrip.destination}</span>
                </span>
              </div>
            </div>
            {getStatusBadge(selectedTrip.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estatísticas (se completada) */}
          {selectedTrip.status === 'completed' && distance !== null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('trips:fields.distance')}</p>
                    <p className="text-2xl font-bold text-primary">
                      {distance.toLocaleString('pt-PT')} km
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
                      <p className="text-sm text-muted-foreground">{t('trips:fields.duration')}</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {t('trips:info.hours', { count: duration })}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Veículo e Motorista */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{t('trips:dialogs.view.vehicleAndDriver')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t('trips:fields.vehicle')}</p>
                </div>
                <p className="font-semibold text-lg mb-1">{selectedTrip.vehicle_license}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTrip.vehicle_brand} {selectedTrip.vehicle_model}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t('trips:fields.driver')}</p>
                </div>
                <p className="font-semibold text-lg">{selectedTrip.driver_name}</p>
              </div>
            </div>
          </Card>

          {/* Detalhes da Viagem */}
          <Card className="p-5 bg-muted/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">{t('trips:dialogs.view.tripDetails')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">{t('trips:fields.origin')}</p>
                </div>
                <p className="font-medium text-green-700 dark:text-green-400">{selectedTrip.origin}</p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-muted-foreground">{t('trips:fields.destination')}</p>
                </div>
                <p className="font-medium text-red-700 dark:text-red-400">{selectedTrip.destination}</p>
              </div>

              <div className="p-3 rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t('trips:fields.startDate')}</p>
                </div>
                <p className="font-medium">
                  {new Date(selectedTrip.start_date).toLocaleString('pt-PT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {selectedTrip.end_date && (
                <div className="p-3 rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{t('trips:fields.endDate')}</p>
                  </div>
                  <p className="font-medium">
                    {new Date(selectedTrip.end_date).toLocaleString('pt-PT', {
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
              <h3 className="font-semibold text-lg">{t('trips:dialogs.view.mileageInfo')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-background">
                <p className="text-xs text-muted-foreground mb-1">{t('trips:dialogs.view.initialKm')}</p>
                <p className="text-xl font-bold">{selectedTrip.start_mileage?.toLocaleString('pt-PT')}</p>
              </div>

              {selectedTrip.end_mileage && (
                <>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground mb-1">{t('trips:dialogs.view.finalKm')}</p>
                    <p className="text-xl font-bold">{selectedTrip.end_mileage.toLocaleString('pt-PT')}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">{t('trips:fields.distance')}</p>
                    <p className="text-xl font-bold text-primary">
                      {distance?.toLocaleString('pt-PT')} km
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Finalidade */}
          {selectedTrip.purpose && (
            <Card className="p-5 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('trips:fields.purpose')}</h3>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm">{selectedTrip.purpose}</p>
              </div>
            </Card>
          )}

          {/* Observações */}
          {selectedTrip.notes ? (
            <Card className="p-5 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('trips:fields.notes')}</h3>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedTrip.notes}
                </p>
              </div>
            </Card>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">{t('trips:info.noObservations')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}