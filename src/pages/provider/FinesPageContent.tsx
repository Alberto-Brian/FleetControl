// ========================================
// FILE: src/pages/provider/FinesPageContent.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  Search, 
  DollarSign, 
  FileText, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Scale,
  LayoutGrid,
  List,
  Rows,
  Car,
  MapPin
} from 'lucide-react';

// Context & Helpers
import { useFines } from '@/contexts/FinesContext';
import { getAllFines, deleteFine as deleteFineHelper, isOverdue, getDaysOverdue, getDaysUntilDue } from '@/helpers/fine-helpers';

// Dialogs
import NewFineDialog from '@/components/fine/NewFineDialog';
import ViewFineDialog from '@/components/fine/ViewFineDialog';
import EditFineDialog from '@/components/fine/EditFineDialog';
import MarkAsPaidDialog from '@/components/fine/MarkAsPaidDialog';
import ContestFineDialog from '@/components/fine/ContestFineDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type ViewMode = 'compact' | 'normal' | 'cards';

export default function FinesPageContent() {
  const { t } = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  const {
    state: { fines, selectedFine, isLoading },
    setFines,
    selectFine,
    deleteFine: removeFineFromContext,
    setLoading
  } = useFines();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [contestDialogOpen, setContestDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFines();
  }, []);

  async function loadFines() {
    setLoading(true);
    try {
      const data = await getAllFines();
      setFines(data);
    } catch (error) {
      handleError(error, 'fines:errors.loading');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedFine) return;
    setIsDeleting(true);
    
    try {
      await deleteFineHelper(selectedFine.id);
      removeFineFromContext(selectedFine.id);
      showSuccess('fines:toast.deleteSuccess');
      setDeleteDialogOpen(false);
      selectFine(null);
    } catch (error) {
      handleError(error, 'fines:toast.deleteError');
    } finally {
      setIsDeleting(false);
    }
  }

  // Filtros
  const filteredFines = fines.filter(f => {
    const matchesSearch = 
      f.fine_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.vehicle_license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.infraction_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'overdue' ? isOverdue(f) : f.status === statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalAmount = fines.reduce((sum, f) => sum + f.fine_amount, 0);
  const pendingCount = fines.filter(f => f.status === 'pending').length;
  const paidCount = fines.filter(f => f.status === 'paid').length;
  const overdueCount = fines.filter(f => isOverdue(f)).length;

  // Badges
  function getStatusBadge(status: string) {
    const map = {
      pending: { label: t('fines:status.pending.label'), className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
      paid: { label: t('fines:status.paid.label'), className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
      contested: { label: t('fines:status.contested.label'), className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400' },
      cancelled: { label: t('fines:status.cancelled.label'), className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400' },
    };
    const s = map[status as keyof typeof map] || map.pending;
    return <Badge variant="outline" className={cn("rounded-full text-[10px] font-bold px-2.5 py-0.5", s.className)}>{s.label}</Badge>;
  }

  const viewModes = [
    { mode: 'compact', icon: Rows, label: t('common:viewModes.compact') },
    { mode: 'normal', icon: List, label: t('common:viewModes.normal') },
    { mode: 'cards', icon: LayoutGrid, label: t('common:viewModes.cards') },
  ] as const;

  // COMPACT VIEW
  function renderCompactView() {
    return (
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-muted/50 px-6 py-4 grid grid-cols-12 gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground border-b">
          <div className="col-span-2">{t('fines:fields.fineNumber')}</div>
          <div className="col-span-2">{t('fines:fields.vehicle')}</div>
          <div className="col-span-3">{t('fines:fields.infractionType')}</div>
          <div className="col-span-2">{t('fines:fields.status')}</div>
          <div className="col-span-2">{t('fines:fields.fineAmount')}</div>
          <div className="col-span-1 text-right">{t('common:actions.actions')}</div>
        </div>
        <div className="divide-y">
          {filteredFines.map((fine) => (
            <div key={fine.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors">
              <div className="col-span-2">
                <span className="font-mono font-bold text-sm">{fine.fine_number}</span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-sm">{fine.vehicle_license}</span>
              </div>
              <div className="col-span-3">
                <span className="text-sm truncate block">{fine.infraction_type}</span>
              </div>
              <div className="col-span-2">{getStatusBadge(fine.status)}</div>
              <div className="col-span-2">
                <span className="text-sm font-bold">{fine.fine_amount.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div className="col-span-1 flex gap-1 justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { selectFine(fine); setViewDialogOpen(true); }}>
                  <Eye className="w-4 h-4" />
                </Button>
                {fine.status === 'pending' && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => { selectFine(fine); setMarkAsPaidDialogOpen(true); }}>
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { selectFine(fine); setEditDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { selectFine(fine); setDeleteDialogOpen(true); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // NORMAL VIEW
  function renderNormalView() {
    return (
      <div className="grid gap-4">
        {filteredFines.map((fine) => (
          <Card 
            key={fine.id} 
            className="overflow-hidden border-l-4 group hover:shadow-md transition-all cursor-pointer"
            style={{ borderLeftColor: fine.status === 'pending' ? '#ef4444' : '#94a3b8' }}
            onClick={() => { selectFine(fine); setViewDialogOpen(true); }}
          >
            <CardContent className="p-0">
              <div className="flex items-center p-5 gap-5">
                <div className={cn(
                  "hidden sm:flex h-12 w-12 items-center justify-center rounded-xl",
                  fine.status === 'pending' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                )}>
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{fine.infraction_type}</h3>
                    {getStatusBadge(fine.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-mono font-bold text-foreground/80">{fine.fine_number}</span>
                    <span className="font-mono">{fine.vehicle_license}</span>
                    {fine.driver_name && <span>{fine.driver_name}</span>}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(fine.fine_date).toLocaleDateString('pt-PT')}
                    </span>
                    {fine.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {fine.location}
                      </span>
                    )}
                  </div>
                  {isOverdue(fine) && (
                    <div className="mt-2">
                      <Badge variant="destructive" className="text-[10px]">
                        {t('fines:alerts.overdue', { days: getDaysOverdue(fine.due_date!) })}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className="text-xs text-muted-foreground">{t('fines:fields.fineAmount')}</p>
                    <p className="text-xl font-bold text-red-600">{fine.fine_amount.toLocaleString('pt-PT')} Kz</p>
                  </div>
                  {fine.status === 'pending' && (
                    <>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); selectFine(fine); setMarkAsPaidDialogOpen(true); }}>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); selectFine(fine); setEditDialogOpen(true); }}>
                        <Edit className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); selectFine(fine); setDeleteDialogOpen(true); }}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // CARDS VIEW
  function renderCardsView() {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredFines.map((fine) => (
          <Card 
            key={fine.id} 
            className="overflow-hidden group hover:shadow-lg transition-all duration-300 bg-card border-muted/60"
          >
            <div className="p-5 pb-3">
              <div className="flex justify-between items-start mb-3">
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  fine.status === 'pending' 
                    ? 'bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white' 
                    : 'bg-slate-100 text-slate-600'
                )}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                {getStatusBadge(fine.status)}
              </div>
              
              <h3 className="text-lg font-bold leading-tight line-clamp-2 mb-2">
                {fine.infraction_type}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="font-mono font-bold">{fine.fine_number}</span>
                <span>•</span>
                <span className="font-mono">{fine.vehicle_license}</span>
              </div>

              {/* Grid de Info */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/50 border mb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Data</p>
                  <p className="text-sm font-bold">
                    {new Date(fine.fine_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                {fine.points && fine.points > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pontos</p>
                    <p className="text-sm font-bold">{fine.points}</p>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Valor</p>
                  <p className="text-sm font-bold">{(fine.fine_amount / 1000).toFixed(0)}K</p>
                </div>
              </div>

              {/* Alertas */}
              {isOverdue(fine) && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-2 text-xs font-semibold flex items-center gap-2 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {t('fines:alerts.overdue', { days: getDaysOverdue(fine.due_date!) })}
                </div>
              )}

              {fine.due_date && !isOverdue(fine) && fine.status === 'pending' && getDaysUntilDue(fine.due_date) <= 7 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg p-2 text-xs font-semibold flex items-center gap-2 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {t('fines:alerts.dueSoon', { days: getDaysUntilDue(fine.due_date) })}
                </div>
              )}

              {/* Valor em destaque */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                    {t('fines:fields.fineAmount')}
                  </span>
                  <span className="text-xl font-black text-red-600">
                    {fine.fine_amount.toLocaleString('pt-PT')} <span className="text-sm">Kz</span>
                  </span>
                </div>

                {/* Botões dinâmicos */}
                <div className="flex gap-2">
                  {fine.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-xs font-bold"
                        onClick={() => { selectFine(fine); setMarkAsPaidDialogOpen(true); }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Pagar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-9 text-xs font-bold"
                        onClick={() => { selectFine(fine); setContestDialogOpen(true); }}
                      >
                        <Scale className="w-3.5 h-3.5 mr-1" />
                        Contestar
                      </Button>
                    </>
                  )}
                  {fine.status !== 'pending' && (
                    <Button 
                      size="sm" 
                      // variant="outline" 
                      className="flex-1 h-9 text-xs font-bold"
                      onClick={() => { selectFine(fine); setViewDialogOpen(true); }}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent -m-6 p-6">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('fines:title')}</h1>
            <p className="text-muted-foreground text-base">
              {pendingCount} {t('fines:stats.pending').toLowerCase()} • {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NewFineDialog />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              label: t('fines:stats.total'), 
              value: `${totalAmount.toLocaleString('pt-PT')} Kz`, 
              icon: DollarSign, 
              color: 'text-red-600', 
              bg: 'bg-red-50/60 dark:bg-red-950/20' 
            },
            { 
              label: t('fines:stats.pending'), 
              value: pendingCount, 
              icon: AlertCircle, 
              color: 'text-orange-600', 
              bg: 'bg-orange-50/60 dark:bg-orange-950/20' 
            },
            { 
              label: t('fines:stats.paid'), 
              value: paidCount, 
              icon: CheckCircle2, 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50/60 dark:bg-emerald-950/20' 
            },
            { 
              label: t('fines:stats.overdue'), 
              value: overdueCount, 
              icon: FileText, 
              color: 'text-red-600', 
              bg: 'bg-red-50/60 dark:bg-red-950/20' 
            },
          ].map((stat, i) => (
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
                placeholder={t('fines:searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-muted/20 border-none focus-visible:ring-1"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 text-sm bg-muted/20 border-none">
                <SelectValue placeholder={t('fines:filters.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('fines:filters.all')}</SelectItem>
                <SelectItem value="pending">{t('fines:filters.pending')}</SelectItem>
                <SelectItem value="paid">{t('fines:filters.paid')}</SelectItem>
                <SelectItem value="contested">{t('fines:filters.contested')}</SelectItem>
                <SelectItem value="overdue">{t('fines:filters.overdue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-bold animate-pulse">
              {t('common:loading')}...
            </p>
          </div>
        ) : filteredFines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted/50">
            <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold">{t('fines:noFines')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? t('common:noResults') : t('common:noData')}
            </p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            {viewMode === 'compact' && renderCompactView()}
            {viewMode === 'normal' && renderNormalView()}
            {viewMode === 'cards' && renderCardsView()}
          </div>
        )}

        {/* Dialogs */}
        <ViewFineDialog 
          open={viewDialogOpen} 
          onOpenChange={setViewDialogOpen}
          onEdit={() => { setViewDialogOpen(false); setEditDialogOpen(true); }}
          onMarkAsPaid={() => { setViewDialogOpen(false); setMarkAsPaidDialogOpen(true); }}
          onContest={() => { setViewDialogOpen(false); setContestDialogOpen(true); }}
        />
        <EditFineDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
        <MarkAsPaidDialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen} />
        <ContestFineDialog open={contestDialogOpen} onOpenChange={setContestDialogOpen} />
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title={t('fines:dialogs.delete.title')}
          description={t('fines:dialogs.delete.warning')}
          itemName={selectedFine ? `${selectedFine.fine_number} - ${selectedFine.vehicle_license}` : ''}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}