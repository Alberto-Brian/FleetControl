// ========================================
// FILE: src/components/refueling/ViewRefuelingDialog.tsx (ATUALIZADO)
// ========================================
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { 
  Fuel, Truck, User, MapPin, Calendar, TrendingUp, FileText, 
  Route, Droplets, DollarSign, Gauge, CheckCircle2, StickyNote,
  Navigation, Clock, Flag
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRefuelings } from '@/contexts/RefuelingsContext';
import { cn } from '@/lib/utils';

interface ViewRefuelingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewRefuelingDialog({ open, onOpenChange }: ViewRefuelingDialogProps) {
  const { t } = useTranslation();
  const { state: { selectedRefueling } } = useRefuelings();

  if (!selectedRefueling || !open) return null;

  // Helper para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper para status da viagem
  const getTripStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Fuel className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {t('refuelings:dialogs.view.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {formatDate(selectedRefueling.refueling_date)}
              </DialogDescription>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl sm:text-3xl font-black text-primary tracking-tight font-mono">
                {selectedRefueling.total_cost.toLocaleString('pt-PT')}
                <span className="text-sm ml-1">Kz</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {t('refuelings:sections.identification')}
            </h4>
            
            <Card className="p-4 border-l-4 border-l-primary bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{t('refuelings:fields.vehicle')}</p>
                  <p className="text-xl sm:text-2xl font-bold font-mono truncate">{selectedRefueling.vehicle_license}</p>
                  {(selectedRefueling.vehicle_brand || selectedRefueling.vehicle_model) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedRefueling.vehicle_brand} {selectedRefueling.vehicle_model}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Badge variant="outline" className="capitalize text-xs">
                    {t(`refuelings:fuelTypes.${selectedRefueling.fuel_type}`)}
                  </Badge>
                  {selectedRefueling.is_full_tank && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t('refuelings:info.fullTank')}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{t('refuelings:fields.mileage')}:</span>
                  <span className="font-mono font-medium">{selectedRefueling.current_mileage.toLocaleString('pt-PT')} km</span>
                </div>
                {selectedRefueling.driver_name && (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{t('refuelings:fields.driver')}:</span>
                    <span className="font-medium truncate">{selectedRefueling.driver_name}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Trip Info (ATUALIZADO) */}
            {selectedRefueling.trip_id && (
              <Card className={cn(
                "p-4 border-l-4 bg-blue-50/30 dark:bg-blue-900/10",
                selectedRefueling.trip_status === 'completed' ? "border-l-green-500 bg-green-50/30 dark:bg-green-900/10" :
                selectedRefueling.trip_status === 'in_progress' ? "border-l-blue-500" :
                "border-l-slate-500 bg-slate-50/30 dark:bg-slate-900/10"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    selectedRefueling.trip_status === 'completed' ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                    selectedRefueling.trip_status === 'in_progress' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}>
                    <Route className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs text-muted-foreground">{t('refuelings:fields.trip')}</p>
                      {selectedRefueling.trip_status && (
                        <Badge className={cn("text-[10px]", getTripStatusColor(selectedRefueling.trip_status))}>
                          {t(`trips:status.${selectedRefueling.trip_status}.label`)}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Nome da viagem */}
                    <p className="font-bold text-lg truncate">
                      {selectedRefueling.route_name || selectedRefueling.trip_code || selectedRefueling.trip_destination || t('refuelings:info.unnamedTrip')}
                    </p>
                    
                    {/* Origem -> Destino */}
                    {(selectedRefueling.trip_origin || selectedRefueling.trip_destination) && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Navigation className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {selectedRefueling.trip_origin || '...'} 
                          <span className="mx-2 text-border">→</span> 
                          {selectedRefueling.trip_destination || '...'}
                        </span>
                      </div>
                    )}
                    
                    {/* Data da viagem */}
                    {selectedRefueling.trip_start_date && (
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatDate(selectedRefueling.trip_start_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t('refuelings:sections.location')}
            </h4>
            
            <div className="grid gap-3">
              {selectedRefueling.station_name ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-muted">
                  <div className="p-2 rounded-lg bg-background shadow-sm shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{selectedRefueling.station_name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {selectedRefueling.station_brand && (
                        <span className="text-xs text-muted-foreground">{selectedRefueling.station_brand}</span>
                      )}
                      {selectedRefueling.station_city && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {selectedRefueling.station_city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-dashed border-muted text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{t('refuelings:info.noStation')}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Costs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('refuelings:sections.quantities')}
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-muted text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-muted-foreground">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{t('refuelings:fields.liters')}</span>
                </div>
                <p className="text-xl sm:text-2xl font-black font-mono text-foreground">{selectedRefueling.liters}</p>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Litros</span>
              </div>
              
              <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-muted text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{t('refuelings:fields.pricePerLiter')}</span>
                </div>
                <p className="text-xl sm:text-2xl font-black font-mono text-foreground">
                  {selectedRefueling.price_per_liter.toFixed(2)}
                </p>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Kz/L</span>
              </div>
              
              <div className="p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2 text-primary/70">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t('refuelings:fields.totalCost')}</span>
                </div>
                <p className="text-xl sm:text-2xl font-black font-mono text-primary">
                  {selectedRefueling.total_cost.toLocaleString('pt-PT')}
                </p>
                <span className="text-[10px] sm:text-xs text-primary/70">Kz</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(selectedRefueling.invoice_number || selectedRefueling.notes) && (
            <>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('refuelings:sections.details')}
                </h4>
                
                <div className="space-y-3">
                  {selectedRefueling.invoice_number && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-muted">
                      <div className="p-2 rounded-lg bg-background shadow-sm shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{t('refuelings:fields.invoiceNumber')}</p>
                        <p className="text-sm text-muted-foreground font-mono truncate">{selectedRefueling.invoice_number}</p>
                      </div>
                    </div>
                  )}

                  {selectedRefueling.notes && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <StickyNote className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t('refuelings:fields.notes')}</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedRefueling.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}