// ========================================
// FILE: src/components/driver/DriverShiftsTab.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Badge }    from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/pagination';
import { useErrorHandler }  from '@/hooks/useErrorHandler';
import { useTranslation }   from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Search, Plus, Clock, Users, Crown, Calendar, ChevronRight,
  Pencil, Trash2, Archive, CheckCircle2, FileText, MoreHorizontal,
  Shield, Star,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  closeDropdownsAndOpenDialog,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useDriverShifts } from '@/contexts/DriverShiftsContext';
import {
  getAllDriverShifts,
  deleteDriverShift,
  updateDriverShiftStatus,
} from '@/helpers/driver-shift-helpers';
import { IDriverShiftSummary } from '@/lib/types/driver-shift';
import { ShiftStatus } from '@/lib/db/schemas/driver_shifts';

import NewDriverShiftDialog  from './NewDriverShiftDialog';
import ViewDriverShiftDialog from './ViewDriverShiftDialog';

interface DriverShiftsTabProps {
  drivers: { id: string; name: string }[];
}

// ─── Helpers de apresentação ─────────────────────────────────────────────────

function statusMeta(status: ShiftStatus, t: any) {
  const map = {
    draft:    { label: t('drivers:shifts.status.draft'),    className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400', icon: FileText },
    active:   { label: t('drivers:shifts.status.active'),   className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400', icon: CheckCircle2 },
    archived: { label: t('drivers:shifts.status.archived'), className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400', icon: Archive },
  };
  return map[status] ?? map.draft;
}

function formatTimeRange(start: string, end: string) {
  return `${start} – ${end}`;
}

function formatDateRange(start: string, end: string, locale = 'pt-PT') {
  const s = new Date(start).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
  const e = new Date(end).toLocaleDateString(locale,   { day: '2-digit', month: 'short', year: 'numeric' });
  return `${s} → ${e}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function DriverShiftsTab({ drivers }: DriverShiftsTabProps) {
  const { t }                        = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();
  const {
    state: { shifts, isLoading },
    setShifts, removeShift, updateShift, selectShift, setLoading,
  } = useDriverShifts();

  const [searchTerm,     setSearchTerm]     = useState('');
  const [statusFilter,   setStatusFilter]   = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPrevPage: false,
  });
  const [statusCounts, setStatusCounts] = useState({ draft: 0, active: 0, archived: 0 });

  const [newOpen,    setNewOpen]    = useState(false);
  const [viewOpen,   setViewOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [targetShift, setTargetShift] = useState<IDriverShiftSummary | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { loadShifts(); }, [currentPage, debouncedSearch, statusFilter]);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllDriverShifts({
        page:   currentPage,
        limit:  20,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter as ShiftStatus : undefined,
      });
      setShifts(result.data);
      setPaginationInfo(result.pagination);
      if (result.statusCounts) setStatusCounts(result.statusCounts as typeof statusCounts);
    } catch (err) {
      handleError(err, 'drivers:shifts.errors.loadError');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  async function handleDelete() {
    if (!targetShift) return;
    setDeleting(true);
    try {
      await deleteDriverShift(targetShift.id);
      removeShift(targetShift.id);
      showSuccess('drivers:shifts.toast.deleteSuccess');
      setDeleteOpen(false);
      setTargetShift(null);
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.deleteError');
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(shift: IDriverShiftSummary, status: ShiftStatus) {
    try {
      const updated = await updateDriverShiftStatus(shift.id, status);
      if (updated) updateShift(updated);
      showSuccess('drivers:shifts.toast.statusUpdated');
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.updateError');
    }
  }

  function openView(shift: IDriverShiftSummary) {
    selectShift(null); // reset — ViewDialog vai buscar completo
    setTargetShift(shift);
    setViewOpen(true);
  }

  // ── Stats bar ─────────────────────────────────────────────────────────────

  const statCards = [
    { label: t('drivers:shifts.stats.total'),    value: paginationInfo.total, color: 'text-slate-600',   bg: 'bg-slate-100/60'  },
    { label: t('drivers:shifts.status.draft'),   value: statusCounts.draft,   color: 'text-slate-500',   bg: 'bg-slate-50/60'   },
    { label: t('drivers:shifts.status.active'),  value: statusCounts.active,  color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
    { label: t('drivers:shifts.status.archived'),value: statusCounts.archived,color: 'text-amber-600',   bg: 'bg-amber-50/60'   },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl shrink-0', s.bg, s.color)}>
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate">{s.label}</p>
                <p className="text-2xl font-black">{s.value}</p>
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
              placeholder={t('drivers:shifts.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
            />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm bg-muted/20 border-none">
              <SelectValue placeholder={t('drivers:shifts.filters.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('drivers:shifts.filters.all')}</SelectItem>
              <SelectItem value="draft">{t('drivers:shifts.status.draft')}</SelectItem>
              <SelectItem value="active">{t('drivers:shifts.status.active')}</SelectItem>
              <SelectItem value="archived">{t('drivers:shifts.status.archived')}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2 shrink-0" onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('drivers:shifts.newShift')}
          </Button>
        </div>
        {paginationInfo.totalPages > 1 && (
          <div className="border-t border-muted/40 px-3 py-2 flex justify-end">
            <Pagination
              pagination={paginationInfo}
              onPageChange={setCurrentPage}
              onLimitChange={l => { setCurrentPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-bold animate-pulse">{t('common:loading')}...</p>
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
          <Clock className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold">{t('drivers:shifts.noShifts')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{searchTerm ? t('common:noResults') : t('common:noData')}</p>
          <Button className="mt-6 gap-2" onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4" />{t('drivers:shifts.newShift')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-300">
          {shifts.map(shift => {
            const meta  = statusMeta(shift.status, t);
            const Icon  = meta.icon;
            return (
              <Card
                key={shift.id}
                className="group hover:shadow-lg transition-all duration-300 bg-card border-muted/60 cursor-pointer overflow-hidden"
                onClick={() => openView(shift)}
              >
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn('text-[10px] font-bold px-2 py-0.5 gap-1 rounded-full border', meta.className)}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold leading-tight truncate" title={shift.name}>
                        {shift.name}
                      </CardTitle>
                      {shift.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{shift.description}</p>
                      )}
                    </div>
                    {/* Menu de acções */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); openView(shift); }}>
                          <ChevronRight className="w-4 h-4 mr-2" />{t('common:actions.view')}
                        </DropdownMenuItem>
                        {shift.status === 'draft' && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleStatusChange(shift, 'active'); }}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />{t('drivers:shifts.actions.activate')}
                          </DropdownMenuItem>
                        )}
                        {shift.status === 'active' && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleStatusChange(shift, 'archived'); }}>
                            <Archive className="w-4 h-4 mr-2 text-amber-600" />{t('drivers:shifts.actions.archive')}
                          </DropdownMenuItem>
                        )}
                        {shift.status === 'archived' && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); handleStatusChange(shift, 'active'); }}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />{t('drivers:shifts.actions.reactivate')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={e => {
                            e.stopPropagation();
                            closeDropdownsAndOpenDialog(() => { setTargetShift(shift); setDeleteOpen(true); });
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />{t('common:actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Horário */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-mono font-bold">{formatTimeRange(shift.start_time, shift.end_time)}</span>
                  </div>
                  {/* Período */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{formatDateRange(shift.start_date, shift.end_date)}</span>
                  </div>

                  <Separator className="my-2" />

                  {/* Membros e líder */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{shift.member_count}</span>
                      <span className="text-muted-foreground">
                        {shift.member_count === 1 ? t('drivers:shifts.info.member') : t('drivers:shifts.info.members')}
                      </span>
                    </div>
                    {shift.leader_name && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        <Crown className="w-3 h-3" />
                        <span className="font-semibold truncate max-w-[100px]">{shift.leader_name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <NewDriverShiftDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        drivers={drivers}
        onCreated={shift => { loadShifts(); }}
      />

      {targetShift && (
        <ViewDriverShiftDialog
          open={viewOpen}
          onOpenChange={setViewOpen}
          shiftId={targetShift.id}
          drivers={drivers}
          onUpdated={shift => updateShift(shift)}
          onDeleted={() => { removeShift(targetShift.id); setViewOpen(false); }}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {t('drivers:shifts.dialogs.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('drivers:shifts.dialogs.delete.description', { name: targetShift?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('common:actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? t('common:deleting') : t('common:actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}