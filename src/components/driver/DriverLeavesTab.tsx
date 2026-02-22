// ========================================
// FILE: src/components/driver/DriversLeavesTab.tsx
// ========================================
// Tab autónoma de gestão de férias — integrar em DriversPageContent
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import {
  Search, CalendarDays, Plus, X, CalendarClock, CheckCircle2,
  Clock, Ban, AlertTriangle, Filter, Users
} from 'lucide-react';
import { getAllDriverLeaves, cancelDriverLeave } from '@/helpers/driver-leave-helpers';
import { IDriverLeave } from '@/lib/types/driver-leave';
import { LeaveStatus } from '@/lib/db/schemas/driver_leaves';
import { cn } from '@/lib/utils';
import { useDriverLeaves } from '@/contexts/DriverLeavesContext';
import NewDriverLeaveDialog from './NewDriverLeaveDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

interface DriversLeavesTabProps {
  /** Lista de drivers para o select no dialog de criação */
  drivers: { id: string; name: string }[];
}

export default function DriversLeavesTab({ drivers }: DriversLeavesTabProps) {
  const { t }                        = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  const { state: { leaves, isLoading }, setLeaves, addLeave, updateLeave, setLoading } = useDriverLeaves();

  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [currentPage, setCurrentPage]       = useState(1);
  const [itemsPerPage]                      = useState(20);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });

  const [statusCounts, setStatusCounts] = useState({
    scheduled: 0, pending_trip: 0, active: 0, completed: 0, cancelled: 0,
  });

  const [newLeaveOpen, setNewLeaveOpen]   = useState(false);
  const [cancelOpen, setCancelOpen]       = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<IDriverLeave | null>(null);
  const [isCancelling, setIsCancelling]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { loadLeaves(); }, [currentPage, debouncedSearch, statusFilter]);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllDriverLeaves({
        page:   currentPage,
        limit:  itemsPerPage,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter as LeaveStatus : undefined,
      });
      setLeaves(result.data);
      setPaginationInfo(result.pagination);
      if (result.statusCounts) {
        setStatusCounts(result.statusCounts as typeof statusCounts);
      }
    } catch (error) {
      handleError(error, 'drivers:leaves.errors.loadError');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  async function handleCancel() {
    if (!selectedLeave) return;
    setIsCancelling(true);
    try {
      const updated = await cancelDriverLeave(selectedLeave.id);
      if (updated) updateLeave(updated);
      showSuccess(t('drivers:leaves.toast.cancelSuccess'));
      setCancelOpen(false);
      setSelectedLeave(null);
      loadLeaves();
    } catch (error) {
      handleError(error, t('drivers:leaves.toast.cancelError'));
    } finally {
      setIsCancelling(false);
    }
  }

  function getStatusConfig(status: LeaveStatus) {
    const map: Record<string, { label: string; icon: any; class: string }> = {
      scheduled: {
        label: t('drivers:leaves.status.scheduled'),
        icon:  CalendarClock,
        class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
      },
      pending_trip: {
        label: t('drivers:leaves.status.pending_trip'),
        icon:  Clock,
        class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      },
      active: {
        label: t('drivers:leaves.status.active'),
        icon:  CheckCircle2,
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      },
      completed: {
        label: t('drivers:leaves.status.completed'),
        icon:  CheckCircle2,
        class: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
      },
      cancelled: {
        label: t('drivers:leaves.status.cancelled'),
        icon:  Ban,
        class: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
      },
    };
    return map[status] || map.scheduled;
  }

  const canCancel = (s: string) => ['scheduled', 'pending_trip', 'active'].includes(s);

  const stats = [
    { label: t('drivers:leaves.status.scheduled'),    value: statusCounts.scheduled,    icon: CalendarClock, color: 'text-blue-600',    bg: 'bg-blue-50/60'    },
    { label: t('drivers:leaves.status.pending_trip'), value: statusCounts.pending_trip, icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50/60'   },
    { label: t('drivers:leaves.status.active'),       value: statusCounts.active,       icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('drivers:leaves.status.completed'),    value: statusCounts.completed,    icon: CheckCircle2,  color: 'text-slate-600',   bg: 'bg-slate-100/60'  },
    { label: t('drivers:leaves.status.cancelled'),    value: statusCounts.cancelled,    icon: Ban,           color: 'text-red-500',     bg: 'bg-red-50/60'     },
  ];

  return (
    <div className="space-y-6">

      {/* Header da tab */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{t('drivers:leaves.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('drivers:leaves.description')}</p>
        </div>
        <Button onClick={() => setNewLeaveOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('drivers:leaves.actions.schedule')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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
              placeholder={t('drivers:leaves.placeholders.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={t('drivers:leaves.filters.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('drivers:leaves.filters.all')}</SelectItem>
              <SelectItem value="scheduled">{t('drivers:leaves.status.scheduled')}</SelectItem>
              <SelectItem value="pending_trip">{t('drivers:leaves.status.pending_trip')}</SelectItem>
              <SelectItem value="active">{t('drivers:leaves.status.active')}</SelectItem>
              <SelectItem value="completed">{t('drivers:leaves.status.completed')}</SelectItem>
              <SelectItem value="cancelled">{t('drivers:leaves.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paginationInfo.totalPages > 1 && (
          <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
            <Pagination
              pagination={paginationInfo}
              onPageChange={setCurrentPage}
              onLimitChange={() => {}}
            />
          </div>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : leaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border-2 border-dashed border-muted/50">
          <CalendarDays className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold">{t('drivers:leaves.empty.noLeaves')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('drivers:leaves.empty.adjustFilters')}</p>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-300">
          {leaves.map((leave) => {
            const cfg  = getStatusConfig(leave.status as LeaveStatus);
            const Icon = cfg.icon;
            const startDate = new Date(leave.start_date);
            const endDate   = new Date(leave.end_date);
            const today     = new Date();
            const days      = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            // Progresso visual (só relevante para active)
            const progressPct = leave.status === 'active'
              ? Math.min(100, Math.max(0, Math.round(
                  ((today.getTime() - startDate.getTime()) /
                  (endDate.getTime()   - startDate.getTime())) * 100
                )))
              : 0;

            // Cor da borda esquerda por status
            const borderColors: Record<string, string> = {
              scheduled:    '#3b82f6',
              pending_trip: '#f59e0b',
              active:       '#10b981',
              completed:    '#94a3b8',
              cancelled:    '#ef4444',
            };
            const borderColor = borderColors[leave.status] ?? '#94a3b8';

            const initials = leave.driver_name
              ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??';

            return (
              <div
                key={leave.id}
                className="group relative bg-card rounded-2xl border border-border/60 hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden"
                style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
              >
                {/* Barra de progresso (só active) */}
                {leave.status === 'active' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/50">
                    <div
                      className="h-full bg-emerald-500/60 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}

                <div className="flex items-stretch gap-0">

                  {/* Coluna esquerda — avatar + dias */}
                  <div className="flex flex-col items-center justify-center gap-1.5 px-5 py-4 min-w-[80px] border-r border-border/40 bg-muted/20">
                    <Avatar className="w-10 h-10 ring-2 ring-background shadow-sm">
                      <AvatarFallback
                        className="font-black text-sm"
                        style={{
                          backgroundColor: `${borderColor}18`,
                          color:           borderColor,
                        }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-lg font-black leading-none" style={{ color: borderColor }}>
                        {days}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">
                        {t('drivers:leaves.info.days')}
                      </p>
                    </div>
                  </div>

                  {/* Coluna central — info principal */}
                  <div className="flex-1 min-w-0 px-4 py-4 space-y-2">

                    {/* Linha 1: nome + badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm truncate">{leave.driver_name}</span>
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
                    </div>

                    {/* Linha 2: timeline de datas */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                            {t('drivers:leaves.fields.startDate')}
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {startDate.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>

                        {/* Linha conectora */}
                        <div className="flex items-center gap-1 mx-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: borderColor }} />
                          <div className="w-8 h-px bg-border" />
                          <CalendarDays className="w-3 h-3 text-muted-foreground" />
                          <div className="w-8 h-px bg-border" />
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                            {t('drivers:leaves.fields.endDate')}
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {endDate.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linha 3: motivo + notas + progresso */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {leave.reason && (
                        <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                          {t(`drivers:leaves.reasons.${leave.reason}`, { defaultValue: leave.reason })}
                        </span>
                      )}
                      {leave.status === 'active' && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          {progressPct}% {t('drivers:leaves.info.elapsed', 'decorrido')}
                        </span>
                      )}
                      {leave.status === 'pending_trip' && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          {t('drivers:leaves.info.pendingTripNote')}
                        </span>
                      )}
                      {leave.cancelled_reason && (
                        <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                          "{leave.cancelled_reason}"
                        </span>
                      )}
                      {leave.notes && !leave.cancelled_reason && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {leave.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coluna direita — acção */}
                  {canCancel(leave.status) && (
                    <div className="flex items-center px-3 border-l border-border/40">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { setSelectedLeave(leave); setCancelOpen(true); }}
                        title={t('drivers:leaves.actions.cancel')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <NewDriverLeaveDialog
        open={newLeaveOpen}
        onOpenChange={setNewLeaveOpen}
        drivers={drivers}
        onCreated={(leave) => { addLeave(leave); loadLeaves(); }}
      />

      <ConfirmDeleteDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancel}
        title={t('drivers:leaves.dialogs.cancel.title')}
        description={t('drivers:leaves.dialogs.cancel.description')}
        warning={t('drivers:leaves.dialogs.cancel.warning')}
        itemName={selectedLeave
          ? `${new Date(selectedLeave.start_date).toLocaleDateString('pt-AO')} → ${new Date(selectedLeave.end_date).toLocaleDateString('pt-AO')}`
          : undefined}
        isLoading={isCancelling}
        // confirmLabel={t('drivers:leaves.actions.confirmCancel')}
        // confirmVariant="destructive"
      />
    </div>
  );
}