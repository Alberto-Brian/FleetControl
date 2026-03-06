// ========================================
// FILE: src/components/driver/DriverScheduledTripsTab.tsx (ATUALIZADO)
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Truck, Car, MapPin, Calendar,
  Clock, CheckCircle2, Ban, Filter, X,
  Navigation, User, AlertTriangle, RotateCcw
} from 'lucide-react';
import {
  getAllScheduledTrips,
  cancelScheduledTrip,
} from '@/helpers/scheduled-trip-helpers';
import { IScheduledTrip } from '@/lib/types/scheduled-trip';
import { ScheduledTripStatus } from '@/lib/db/schemas/scheduled_trips';
import { useScheduledTrips } from '@/contexts/ScheduledTripsContext';
import NewScheduledTripDialog from './NewScheduledTripDialog';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Status config (igual ao LeavesTab)
// ─────────────────────────────────────────────────────────────────────────────

function getStatusConfig(status: ScheduledTripStatus, t: any) {
  const map: Record<ScheduledTripStatus, { label: string; icon: any; class: string; color: string }> = {
    scheduled: {
      label: t('scheduledTrips:status.scheduled'),
      icon: Calendar,
      class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
      color: '#3b82f6',
    },
    pending_leave: {
      label: t('scheduledTrips:status.pending_leave'),
      icon: Clock,
      class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      color: '#f59e0b',
    },
    launched: {
      label: t('scheduledTrips:status.launched'),
      icon: CheckCircle2,
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      color: '#10b981',
    },
    cancelled: {
      label: t('scheduledTrips:status.cancelled'),
      icon: Ban,
      class: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
      color: '#94a3b8',
    },
  };
  return map[status] ?? map.scheduled;
}

// ─────────────────────────────────────────────────────────────────────────────
// Card individual (estilo LeavesTab)
// ─────────────────────────────────────────────────────────────────────────────

function ScheduledTripCard({
  trip,
  onCancel,
}: {
  trip: IScheduledTrip;
  onCancel: (trip: IScheduledTrip) => void;
}) {
  const { t } = useTranslation();
  const cfg = getStatusConfig(trip.status, t);
  const Icon = cfg.icon;
  
  const isPast = trip.scheduled_date < new Date().toISOString().split('T')[0];
  const daysLeft = Math.ceil(
    (new Date(trip.scheduled_date).getTime() - new Date().getTime()) / 86400000
  );
  
  const canCancel = trip.status === 'scheduled' || trip.status === 'pending_leave';
  
  // Iniciais do motorista
  const initials = trip.driver_name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  return (
    <div
      className="group relative bg-card rounded-2xl border border-border/60 hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: cfg.color }}
    >
      <div className="flex items-stretch gap-0">
        
        {/* Coluna esquerda — avatar + dias */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-4 min-w-[80px] border-r border-border/40 bg-muted/20">
          <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
            <AvatarFallback
              className="font-black text-sm"
              style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-lg font-black leading-none" style={{ color: cfg.color }}>
              {daysLeft >= 0 ? daysLeft : 0}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">
              {t('scheduledTrips:info.days', 'dias')}
            </p>
          </div>
        </div>

        {/* Coluna central — info principal */}
        <div className="flex-1 min-w-0 px-4 py-4 space-y-2">
          
          {/* Linha 1: nome + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm truncate">{trip.driver_name ?? '—'}</span>
            <Badge
              variant="outline"
              className={cn(
                'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                cfg.class
              )}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </Badge>
            
            {/* Badges extras */}
            {trip.status === 'scheduled' && !isPast && daysLeft <= 1 && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                {daysLeft === 0 ? t('scheduledTrips:badges.today') : t('scheduledTrips:badges.tomorrow')}
              </span>
            )}
            {trip.status === 'pending_leave' && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                {t('scheduledTrips:badges.awaitingReturn')}
              </span>
            )}
          </div>

          {/* Linha 2: timeline de datas */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                  {t('scheduledTrips:fields.scheduledDate')}
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {new Date(trip.scheduled_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                </span>
              </div>

              {/* Linha conectora */}
              <div className="flex items-center gap-1 mx-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <div className="w-8 h-px bg-border" />
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <div className="w-8 h-px bg-border" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                  {t('scheduledTrips:fields.vehicle')}
                </span>
                <span className="font-mono font-semibold text-foreground truncate max-w-[100px]">
                  {trip.vehicle_plate ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Linha 3: rota + info extra */}
          <div className="flex items-center gap-3 flex-wrap">
            {(trip.origin || trip.destination) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                <Navigation className="w-3 h-3" />
                {[trip.origin, trip.destination].filter(Boolean).join(' → ')}
              </span>
            )}
            
            {trip.vehicle_plate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Car className="w-3 h-3" />
                {trip.vehicle_plate}
              </span>
            )}
            
            {trip.status === 'launched' && trip.launched_at && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {t('scheduledTrips:info.launchedAt')} {new Date(trip.launched_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            
            {trip.status === 'cancelled' && trip.cancelled_reason && (
              <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                "{trip.cancelled_reason}"
              </span>
            )}
            
            {trip.notes && !trip.cancelled_reason && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {trip.notes}
              </span>
            )}
          </div>
        </div>

        {/* Coluna direita — ação */}
        {canCancel && (
          <div className="flex items-center px-3 border-l border-border/40">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCancel(trip)}
              title={t('scheduledTrips:actions.confirmCancel')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab principal (estilo LeavesTab)
// ─────────────────────────────────────────────────────────────────────────────

interface DriverScheduledTripsTabProps {
  drivers: { id: string; name: string }[];
  vehicles: { id: string; plate: string; brand: string; model: string; status: string }[];
  routes?: { id: string; name: string; origin?: string; destination?: string }[];
}

export default function DriverScheduledTripsTab({
  drivers,
  vehicles,
  routes = [],
}: DriverScheduledTripsTabProps) {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  const {
    state: { scheduledTrips, isLoading },
    setTrips, updateTrip, setLoading,
  } = useScheduledTrips();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });
  const [statusCounts, setStatusCounts] = useState({
    scheduled: 0, pending_leave: 0, launched: 0, cancelled: 0,
  });

  const [newTripOpen, setNewTripOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<IScheduledTrip | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
        page: currentPage,
        limit: itemsPerPage,
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
      showSuccess(t('scheduledTrips:toast.cancelSuccess'));
      setCancelOpen(false);
      setSelectedTrip(null);
      loadTrips();
    } catch (error) {
      handleError(error, 'scheduledTrips:toast.cancelError');
    } finally {
      setIsCancelling(false);
    }
  }

  // Stats (igual ao LeavesTab)
  const stats = [
    { label: t('scheduledTrips:status.scheduled'), value: statusCounts.scheduled, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50/60' },
    { label: t('scheduledTrips:status.pending_leave'), value: statusCounts.pending_leave, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/60' },
    { label: t('scheduledTrips:status.launched'), value: statusCounts.launched, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('scheduledTrips:status.cancelled'), value: statusCounts.cancelled, icon: Ban, color: 'text-slate-600', bg: 'bg-slate-100/60' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header da tab */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{t('scheduledTrips:tabs.scheduledTrips')}</h2>
          <p className="text-sm text-muted-foreground">{t('scheduledTrips:description', 'Gestão de viagens agendadas')}</p>
        </div>
        <Button onClick={() => setNewTripOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('scheduledTrips:actions.new')}
        </Button>
      </div>

      {/* Stats (igual ao LeavesTab) */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl shrink-0', stat.bg, stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate leading-tight">
                  {stat.label}
                </p>
                <p className="text-2xl font-black tracking-tight leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-2xl border border-muted/50 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('scheduledTrips:searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={t('common:all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('scheduledTrips:filters.all')}</SelectItem>
              <SelectItem value="scheduled">{t('scheduledTrips:filters.scheduled')}</SelectItem>
              <SelectItem value="pending_leave">{t('scheduledTrips:filters.pending_leave')}</SelectItem>
              <SelectItem value="launched">{t('scheduledTrips:filters.launched')}</SelectItem>
              <SelectItem value="cancelled">{t('scheduledTrips:filters.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paginationInfo.totalPages > 1 && (
          <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
            <Pagination
              pagination={paginationInfo}
              onPageChange={p => setCurrentPage(p)}
              onLimitChange={() => { }}
            />
          </div>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : scheduledTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border-2 border-dashed border-muted/50">
          <Truck className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold">{t('scheduledTrips:empty.title')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('scheduledTrips:empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-300">
          {scheduledTrips.map(trip => (
            <ScheduledTripCard
              key={trip.id}
              trip={trip}
              onCancel={handleCancelClick}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
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
            <AlertDialogTitle>{t('scheduledTrips:dialogs.cancel.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('scheduledTrips:dialogs.cancel.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-1">
            <Input
              placeholder={t('scheduledTrips:dialogs.cancel.reasonPlaceholder')}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t('common:cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isCancelling ? t('common:processing') : t('scheduledTrips:actions.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}