// ========================================
// FILE: src/components/driver/DriverScheduledTripsTab.tsx
// ========================================
// Tab de viagens agendadas — integrar em DriversPageContent como 3ª aba
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button }  from '@/components/ui/button';
import { Input }   from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge }   from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useErrorHandler }     from '@/hooks/useErrorHandler';
import { useTranslation }      from 'react-i18next';
import {
  Search, Plus, Truck, Car, MapPin, Calendar,
  Clock, CheckCircle2, Ban, Filter, X,
  Navigation, User, AlertTriangle,
} from 'lucide-react';
import {
  getAllScheduledTrips,
  cancelScheduledTrip,
} from '@/helpers/scheduled-trip-helpers';
import { IScheduledTrip }      from '@/lib/types/scheduled-trip';
import { ScheduledTripStatus } from '@/lib/db/schemas/scheduled_trips';
import { useScheduledTrips }   from '@/contexts/ScheduledTripsContext';
import NewScheduledTripDialog  from './NewScheduledTripDialog';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function ScheduledTripStatusBadge({ status }: { status: ScheduledTripStatus }) {
  const { t } = useTranslation();

  const map: Record<ScheduledTripStatus, {
    label: string; icon: React.ElementType; className: string;
  }> = {
    scheduled: {
      label: t('scheduledTrips:status.scheduled', 'Agendada'),
      icon:  Calendar,
      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
    },
    pending_leave: {
      label: t('scheduledTrips:status.pending_leave', 'Aguarda Regresso'),
      icon:  Clock,
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
    },
    launched: {
      label: t('scheduledTrips:status.launched', 'Em Curso'),
      icon:  CheckCircle2,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    cancelled: {
      label: t('scheduledTrips:status.cancelled', 'Cancelada'),
      icon:  Ban,
      className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    },
  };

  const info = map[status] ?? map.scheduled;
  const Icon = info.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider',
        info.className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {info.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card individual
// ─────────────────────────────────────────────────────────────────────────────

function ScheduledTripCard({
  trip,
  onCancel,
}: {
  trip:     IScheduledTrip;
  onCancel: (trip: IScheduledTrip) => void;
}) {
  const { t }    = useTranslation();
  const isPast   = trip.scheduled_date < new Date().toISOString().split('T')[0];
  const daysLeft = Math.ceil(
    (new Date(trip.scheduled_date).getTime() - new Date().getTime()) / 86400000
  );

  const canCancel = trip.status === 'scheduled' || trip.status === 'pending_leave';

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-200 bg-card">
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-5">
          {/* Ícone / avatar */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <ScheduledTripStatusBadge status={trip.status} />
                  {trip.status === 'scheduled' && !isPast && daysLeft <= 1 && (
                    <Badge className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {daysLeft === 0
                        ? t('scheduledTrips:badges.today', 'Hoje')
                        : t('scheduledTrips:badges.tomorrow', 'Amanhã')}
                    </Badge>
                  )}
                  {trip.status === 'pending_leave' && (
                    <Badge className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t('scheduledTrips:badges.awaitingReturn', 'Aguarda regresso de férias')}
                    </Badge>
                  )}
                </div>
              </div>
              {canCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 h-7 px-2 shrink-0"
                  onClick={() => onCancel(trip)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Grid de info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {/* Motorista */}
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate font-semibold">{trip.driver_name ?? '—'}</span>
              </div>

              {/* Veículo */}
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {trip.vehicle_plate
                    ? `${trip.vehicle_plate} · ${trip.vehicle_brand} ${trip.vehicle_model}`
                    : '—'}
                </span>
              </div>

              {/* Data */}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {new Date(trip.scheduled_date).toLocaleDateString('pt-PT')}
                </span>
              </div>

              {/* Rota/Destino */}
              {(trip.origin || trip.destination) && (
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate text-xs">
                    {[trip.origin, trip.destination].filter(Boolean).join(' → ')}
                  </span>
                </div>
              )}
            </div>

            {/* Cancelled reason */}
            {trip.status === 'cancelled' && trip.cancelled_reason && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                <span>{trip.cancelled_reason}</span>
              </div>
            )}

            {/* Launched → link para trip real */}
            {trip.status === 'launched' && trip.launched_at && (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t('scheduledTrips:info.launchedAt', 'Iniciada em')}{' '}
                  {new Date(trip.launched_at).toLocaleString('pt-PT')}
                </span>
              </div>
            )}

            {/* Notas */}
            {trip.notes && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{trip.notes}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab principal
// ─────────────────────────────────────────────────────────────────────────────

interface DriverScheduledTripsTabProps {
  drivers:  { id: string; name: string }[];
  vehicles: { id: string; plate: string; brand: string; model: string; status: string }[];
  routes?:  { id: string; name: string; origin?: string; destination?: string }[];
}

export default function DriverScheduledTripsTab({
  drivers,
  vehicles,
  routes = [],
}: DriverScheduledTripsTabProps) {
  const { t }                        = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  const {
    state: { scheduledTrips, isLoading },
    setTrips, updateTrip, setLoading,
  } = useScheduledTrips();

  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [itemsPerPage]                    = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });
  const [statusCounts, setStatusCounts] = useState({
    scheduled: 0, pending_leave: 0, launched: 0, cancelled: 0,
  });

  const [newTripOpen, setNewTripOpen]     = useState(false);
  const [cancelOpen, setCancelOpen]       = useState(false);
  const [selectedTrip, setSelectedTrip]   = useState<IScheduledTrip | null>(null);
  const [isCancelling, setIsCancelling]   = useState(false);
  const [cancelReason, setCancelReason]   = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { loadTrips(); }, [currentPage, debouncedSearch, statusFilter]);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllScheduledTrips({
        page:   currentPage,
        limit:  itemsPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter as ScheduledTripStatus : undefined,
      });
      setTrips(result.data);
      setPaginationInfo(result.pagination);
      if (result.statusCounts) {
        setStatusCounts(result.statusCounts as typeof statusCounts);
      }
    } catch (error) {
      handleError(error, 'scheduledTrips:errors.loadError');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  function handleCancelClick(trip: IScheduledTrip) {
    setSelectedTrip(trip);
    setCancelReason('');
    setCancelOpen(true);
  }

  async function handleConfirmCancel() {
    if (!selectedTrip) return;
    setIsCancelling(true);
    try {
      const updated = await cancelScheduledTrip(selectedTrip.id, {
        cancelled_reason: cancelReason || undefined,
      });
      if (updated) updateTrip(updated);
      showSuccess(t('scheduledTrips:toast.cancelSuccess', 'Viagem cancelada.'));
      setCancelOpen(false);
      setSelectedTrip(null);
      loadTrips();
    } catch (error) {
      handleError(error, 'scheduledTrips:toast.cancelError');
    } finally {
      setIsCancelling(false);
    }
  }

  // ── Filter pills ─────────────────────────────────────────────────────────
  const filterPills = [
    { value: 'all',          label: t('common:all', 'Todos'),                     count: paginationInfo.total },
    { value: 'scheduled',    label: t('scheduledTrips:status.scheduled', 'Agendada'),   count: statusCounts.scheduled    },
    { value: 'pending_leave',label: t('scheduledTrips:status.pending_leave', 'Aguarda'), count: statusCounts.pending_leave },
    { value: 'launched',     label: t('scheduledTrips:status.launched', 'Em Curso'),    count: statusCounts.launched      },
    { value: 'cancelled',    label: t('scheduledTrips:status.cancelled', 'Cancelada'),  count: statusCounts.cancelled     },
  ];

  return (
    <div className="space-y-6">

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('scheduledTrips:searchPlaceholder', 'Pesquisar viagens...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
            />
          </div>
          <Button onClick={() => setNewTripOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {t('scheduledTrips:actions.new', 'Agendar Viagem')}
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto">
          {filterPills.map(pill => (
            <button
              key={pill.value}
              onClick={() => { setStatusFilter(pill.value); setCurrentPage(1); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === pill.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {pill.label}
              {pill.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px]",
                  statusFilter === pill.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80"
                )}>
                  {pill.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {paginationInfo.totalPages > 1 && (
          <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
            <Pagination
              pagination={paginationInfo}
              onPageChange={p => setCurrentPage(p)}
              onLimitChange={() => {}}
            />
          </div>
        )}
      </div>

      {/* ── Lista ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-bold animate-pulse">
            {t('common:loading', 'A carregar')}...
          </p>
        </div>
      ) : scheduledTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
          <Truck className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold">
            {t('scheduledTrips:empty.title', 'Nenhuma viagem agendada')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm
              ? t('common:noResults', 'Nenhum resultado encontrado.')
              : t('scheduledTrips:empty.description', 'Clique em "Agendar Viagem" para criar a primeira.')}
          </p>
          {!searchTerm && (
            <Button className="mt-4" onClick={() => setNewTripOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('scheduledTrips:actions.new', 'Agendar Viagem')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 animate-in fade-in duration-300">
          {scheduledTrips.map(trip => (
            <ScheduledTripCard
              key={trip.id}
              trip={trip}
              onCancel={handleCancelClick}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ────────────────────────────────────────────────────────── */}
      <NewScheduledTripDialog
        open={newTripOpen}
        onOpenChange={setNewTripOpen}
        drivers={drivers}
        vehicles={vehicles}
        routes={routes}
        onCreated={() => loadTrips()}
      />

      {/* Confirmação de cancelamento */}
      <AlertDialog open={cancelOpen} onOpenChange={v => !v && setCancelOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('scheduledTrips:dialogs.cancel.title', 'Cancelar viagem agendada?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('scheduledTrips:dialogs.cancel.description',
                'A viagem não será iniciada. Esta acção não pode ser revertida.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-1">
            <Input
              placeholder={t('scheduledTrips:dialogs.cancel.reasonPlaceholder', 'Motivo do cancelamento (opcional)')}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              {t('common:cancel', 'Cancelar')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling
                ? t('common:processing', 'A processar...')
                : t('scheduledTrips:actions.confirmCancel', 'Confirmar cancelamento')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}