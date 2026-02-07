// ========================================
// FILE: src/pages/provider/TripsPageContent.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { 
  Search, MapPin, Calendar, Truck, User, Flag, TrendingUp, Clock, Eye, 
  Route as RouteIcon, AlertCircle, XCircle, List, LayoutGrid, MoreHorizontal, 
  Navigation, ArrowRight, Gauge, PlayCircle, CheckCircle2
} from 'lucide-react';
import { getAllTrips, cancelTrip as cancelTripHelper } from '@/helpers/trip-helpers';
import { cn } from '@/lib/utils';
import { useTrips } from '@/contexts/TripsContext';

// Dialogs
import StartTripDialog from '@/components/trip/StartTripDialog';
import CompleteTripDialog from '@/components/trip/CompleteTripDialog';
import ViewTripDialog from '@/components/trip/ViewTripDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  closeDropdownsAndOpenDialog
} from '@/components/ui/dropdown-menu';

type ViewMode = 'list' | 'cards';

export default function TripsPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  // ✨ CONTEXT
  const { 
    state: { trips, selectedTrip, isLoading },
    setTrips,
    selectTrip,
    updateTrip,
    setLoading,
  } = useTrips();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards'); // Cards como padrão

  // Dialogs
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    setLoading(true);
    try {
      const data = await getAllTrips();
      setTrips(data);
    } catch (error) {
      handleError(error, 'trips:errors.errorLoading');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelTrip() {
    if (!selectedTrip) return;
    setIsCancelling(true);
    
    try {
      await cancelTripHelper(selectedTrip.id);
      
      // ✨ Atualiza viagem no contexto
      const updatedTrip = { ...selectedTrip, status: 'cancelled' as const };
      updateTrip(updatedTrip);
      
      showSuccess('trips:toast.cancelSuccess');
      setCancelDialogOpen(false);
      selectTrip(null);
      
    } catch (error) {
      handleError(error, 'trips:toast.cancelError');
    } finally {
      setIsCancelling(false);
    }
  }

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
      <Badge variant="outline" className={cn("flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider", statusInfo.className)}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    );
  }

  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.trip_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = trips.filter(t => t.status === 'in_progress').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;
  const cancelledCount = trips.filter(t => t.status === 'cancelled').length;
  const totalDistance = trips
    .filter(t => t.end_mileage)
    .reduce((sum, t) => sum + (t.end_mileage! - t.start_mileage), 0);

  // Renderização da visualização em Lista (melhorada)
  function renderListView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-2">{t('trips:table.code')}</div>
          <div className="col-span-3">{t('trips:table.route')}</div>
          <div className="col-span-2">{t('trips:table.vehicle')}</div>
          <div className="col-span-2">{t('trips:table.driver')}</div>
          <div className="col-span-2">{t('trips:table.status')}</div>
          <div className="col-span-1 text-right">{t('trips:table.actions')}</div>
        </div>
        <div className="divide-y">
          {filteredTrips.map((trip) => {
            const distance = trip.end_mileage ? trip.end_mileage - trip.start_mileage : null;
            
            return (
              <div key={trip.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors duration-150">
                <div className="col-span-2">
                  <span className="font-mono font-bold text-sm bg-muted/50 px-2.5 py-1 rounded border border-muted-foreground/10">
                    {trip.trip_code}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(trip.start_date).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>
                </div>
                
                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-green-600 dark:text-green-400 truncate max-w-[80px]">{trip.origin}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-semibold text-red-600 dark:text-red-400 truncate max-w-[80px]">{trip.destination}</span>
                  </div>
                  {distance !== null && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {distance.toLocaleString('pt-PT')} km
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{trip.vehicle_license}</span>
                    <span className="text-xs text-muted-foreground truncate">{trip.vehicle_brand} {trip.vehicle_model}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-sm font-medium truncate block">{trip.driver_name}</span>
                  <span className="text-xs text-muted-foreground truncate">{trip.driver_license_number}</span>
                  {/* <span className="text-xs text-muted-foreground truncate">{trip.driver_email}</span> */}

                </div>

                <div className="col-span-2">
                  {getStatusBadge(trip.status)}
                </div>

                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => {
                        closeDropdownsAndOpenDialog(() => {
                          selectTrip(trip);
                          setViewDialogOpen(true);
                        });
                      }}>
                        <Eye className="w-4 h-4 mr-2" /> {t('trips:actions.view')}
                      </DropdownMenuItem>
                      
                      {trip.status === 'in_progress' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            closeDropdownsAndOpenDialog(() => {
                              selectTrip(trip);
                              setCompleteDialogOpen(true);
                            });
                          }}>
                            <Flag className="w-4 h-4 mr-2" /> {t('trips:actions.complete')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                            closeDropdownsAndOpenDialog(() => {
                              selectTrip(trip);
                              setCancelDialogOpen(true);
                            });
                          }}>
                            <XCircle className="w-4 h-4 mr-2" /> {t('trips:actions.cancel')}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Renderização da visualização em Cards (NOVA - padrão)
  function renderCardsView() {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredTrips.map((trip) => {
          const distance = trip.end_mileage ? trip.end_mileage - trip.start_mileage : null;
          const isInProgress = trip.status === 'in_progress';
          
          return (
            <Card 
              key={trip.id} 
              className={cn(
                "flex flex-col h-full group hover:shadow-xl transition-all duration-300 bg-card relative overflow-hidden",
                isInProgress && "ring-1 ring-blue-600 dark:ring-blue-400"
              )}
            >
              {/* Barra de progresso lateral para viagens em andamento */}
              {/* {isInProgress && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 animate-pulse" />
              )} */}
              
              <CardContent className="p-0 flex flex-col h-full">
                {/* Header com código e status */}
                <div className="p-5 pb-3 border-b border-muted/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isInProgress ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                      )}>
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-lg leading-tight">{trip.trip_code}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trip.start_date).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>
                </div>

                {/* Corpo - Rota destacada */}
                <div className="p-5 pt-4 flex-1 space-y-4">
                  {/* Rota Visual */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('trips:fields.origin')}</p>
                        <p className="font-bold text-foreground truncate">{trip.origin}</p>
                      </div>
                    </div>
                    
                    {/* Linha conectora */}
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 h-8 bg-gradient-to-b from-green-200 to-red-200 dark:from-green-800 dark:to-red-800" />
                    
                    <div className="flex items-center gap-3 mt-6">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('trips:fields.destination')}</p>
                        <p className="font-bold text-foreground truncate">{trip.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-muted/40 border border-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('trips:fields.vehicle')}</span>
                      </div>
                      <p className="font-bold text-sm truncate">{trip.vehicle_license}</p>
                      <p className="text-xs text-muted-foreground truncate">{trip.vehicle_brand}</p>
                      <p className="text-xs text-muted-foreground truncate">{trip.vehicle_model}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('trips:fields.driver')}</span>
                      </div>
                      <p className="font-bold text-sm truncate">{trip.driver_name}</p>
                       <p className="text-xs text-muted-foreground truncate">{trip.driver_license_number}</p>
                       <p className="text-xs text-muted-foreground truncate">{trip.driver_email}</p>
                    </div>
                  </div>

                  {/* Distância ou KM Inicial */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-muted/30 to-muted/50 border border-muted">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {distance !== null ? t('trips:fields.distance') : t('trips:info.kmInitial')}
                      </span>
                    </div>
                    <span className="font-bold text-lg">
                      {distance !== null 
                        ? `${distance.toLocaleString('pt-PT')} km`
                        : `${trip.start_mileage.toLocaleString('pt-PT')} km`
                      }
                    </span>
                  </div>

                  {/* Finalidade */}
                  {trip.purpose && (
                    <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-1">{t('trips:fields.purpose')}</p>
                      <p className="text-sm text-foreground/80 line-clamp-2">{trip.purpose}</p>
                    </div>
                  )}
                </div>

                {/* Footer - Ações */}
                <div className="p-4 pt-0 mt-auto">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1 h-10 text-sm font-bold"
                      onClick={() => {
                        selectTrip(trip);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('trips:actions.view')}
                    </Button>
                    
                    {isInProgress ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="flex-1 h-10 text-sm font-bold shadow-sm">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            {t('trips:actions.actions')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => {
                            closeDropdownsAndOpenDialog(() => {
                              selectTrip(trip);
                              setCompleteDialogOpen(true);
                            });
                          }}>
                            <Flag className="w-4 h-4 mr-2 text-emerald-600" />
                            {t('trips:actions.complete')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              closeDropdownsAndOpenDialog(() => {
                                selectTrip(trip);
                                setCancelDialogOpen(true);
                              });
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('trips:actions.cancel')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground"
                        disabled
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const stats = [
    { label: t('trips:stats.total'), value: trips.length, icon: RouteIcon, color: 'text-slate-600', bg: 'bg-slate-100/60' },
    { label: t('trips:stats.inProgress'), value: activeCount, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/60' },
    { label: t('trips:stats.completed'), value: completedCount, icon: Flag, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('trips:stats.totalDistance'), value: `${totalDistance.toLocaleString('pt-PT')} km`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50/60' },
  ];

  const viewModes = [
    { mode: 'list', icon: List, label: t('trips:dialogs.view.list') },
    { mode: 'cards', icon: LayoutGrid, label: t('trips:dialogs.view.cards') },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('trips:title')}</h1>
            <p className="text-muted-foreground text-base">
              {t('trips:description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StartTripDialog />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card p-4 rounded-2xl border border-muted/50 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('trips:searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
                <SelectValue placeholder={t('trips:filters.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('trips:filters.all')}</SelectItem>
                <SelectItem value="in_progress">{t('trips:filters.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('trips:filters.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('trips:filters.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-3 self-center lg:self-auto">
            <div className="flex bg-muted/30 p-1 rounded-xl border border-muted/50">
              {viewModes.map((item) => (
                <Button
                  key={item.mode}
                  variant={viewMode === item.mode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(item.mode as ViewMode)}
                  className={cn(
                    "h-9 px-3 rounded-lg transition-all flex items-center gap-2",
                    viewMode === item.mode ? "bg-background shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                  )}
                  title={item.label}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-bold animate-pulse">
              {t('common:loading')}...
            </p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
            <RouteIcon className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold">{t('trips:noTrips')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? t('common:noResults') : t('common:noData')}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {viewMode === 'list' ? renderListView() : renderCardsView()}
          </div>
        )}

        {/* Dialogs */}
        <CompleteTripDialog
          open={completeDialogOpen}
          onOpenChange={setCompleteDialogOpen}
        />

        <ViewTripDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <ConfirmDeleteDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={handleCancelTrip}
          title={t('trips:dialogs.cancel.title')}
          description={t('trips:dialogs.cancel.warning')}
          itemName={selectedTrip?.trip_code}
          isLoading={isCancelling}
        />
      </div>
    </div>
  );
}