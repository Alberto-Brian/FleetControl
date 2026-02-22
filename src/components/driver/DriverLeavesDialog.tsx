// ========================================
// FILE: src/components/driver/DriverLeavesDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarDays, Plus, X, Clock, CheckCircle2, Ban, AlertTriangle, 
  Loader2, CalendarClock, RotateCcw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getLeavesByDriver, cancelDriverLeave } from '@/helpers/driver-leave-helpers';
import { IDriverLeave } from '@/lib/types/driver-leave';
import { LeaveStatus } from '@/lib/db/schemas/driver_leaves';
import { cn } from '@/lib/utils';
import NewDriverLeaveDialog from './NewDriverLeaveDialog';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

interface DriverLeavesDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  driverId:     string;
  driverName:   string;
}

export default function DriverLeavesDialog({
  open,
  onOpenChange,
  driverId,
  driverName,
}: DriverLeavesDialogProps) {
  const { t }                        = useTranslation();
  const { handleError, showSuccess } = useErrorHandler();

  const [leaves, setLeaves]                   = useState<IDriverLeave[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [newLeaveOpen, setNewLeaveOpen]       = useState(false);
  const [cancelOpen, setCancelOpen]           = useState(false);
  const [selectedLeave, setSelectedLeave]     = useState<IDriverLeave | null>(null);
  const [isCancelling, setIsCancelling]       = useState(false);
  const [cancelReason, setCancelReason]       = useState('');

  useEffect(() => {
    if (open) loadLeaves();
  }, [open, driverId]);

  async function loadLeaves() {
    setIsLoading(true);
    try {
      const data = await getLeavesByDriver(driverId);
      setLeaves(data);
    } catch (error) {
      handleError(error, t('drivers:leaves.errors.loadError'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!selectedLeave) return;
    setIsCancelling(true);
    try {
      const updated = await cancelDriverLeave(selectedLeave.id, {
        cancelled_reason: cancelReason || undefined,
      });
      if (updated) {
        setLeaves((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l))
        );
      }
      showSuccess(t('drivers:leaves.toast.cancelSuccess'));
      setCancelOpen(false);
      setSelectedLeave(null);
      setCancelReason('');
    } catch (error) {
      handleError(error, t('drivers:leaves.toast.cancelError'));
    } finally {
      setIsCancelling(false);
    }
  }

  function openCancelDialog(leave: IDriverLeave) {
    setSelectedLeave(leave);
    setCancelReason('');
    setCancelOpen(true);
  }

  function getStatusConfig(status: LeaveStatus) {
    const map = {
      scheduled: {
        label:  t('drivers:leaves.status.scheduled'),
        icon:   CalendarClock,
        class:  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800',
      },
      pending_trip: {
        label:  t('drivers:leaves.status.pending_trip'),
        icon:   Clock,
        class:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
      },
      active: {
        label:  t('drivers:leaves.status.active'),
        icon:   CheckCircle2,
        class:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
      },
      completed: {
        label:  t('drivers:leaves.status.completed'),
        icon:   CheckCircle2,
        class:  'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
      },
      cancelled: {
        label:  t('drivers:leaves.status.cancelled'),
        icon:   Ban,
        class:  'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
      },
    };
    return map[status] || map.scheduled;
  }

  const canCancel = (status: LeaveStatus) =>
    ['scheduled', 'pending_trip', 'active'].includes(status);

  // Agrupa: activas/agendadas primeiro, depois históricas
  const activeLeaves    = leaves.filter(l => ['scheduled', 'pending_trip', 'active'].includes(l.status));
  const historicLeaves  = leaves.filter(l => ['completed', 'cancelled'].includes(l.status));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                {t('drivers:leaves.dialogs.list.title', { name: driverName })}
              </DialogTitle>
              <Button
                size="sm"
                onClick={() => setNewLeaveOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('drivers:leaves.actions.schedule')}
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="font-bold text-muted-foreground">
                  {t('drivers:leaves.empty.noLeaves')}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {t('drivers:leaves.empty.noLeavesHint')}
                </p>
              </div>
            ) : (
              <>
                {/* Férias activas / agendadas */}
                {activeLeaves.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
                      {t('drivers:leaves.sections.upcoming')}
                    </h3>
                    <div className="space-y-3">
                      {activeLeaves.map((leave) => (
                        <LeaveCard
                          key={leave.id}
                          leave={leave}
                          getStatusConfig={getStatusConfig}
                          canCancel={canCancel}
                          onCancel={openCancelDialog}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeLeaves.length > 0 && historicLeaves.length > 0 && (
                  <Separator />
                )}

                {/* Histórico */}
                {historicLeaves.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
                      {t('drivers:leaves.sections.history')}
                    </h3>
                    <div className="space-y-3">
                      {historicLeaves.map((leave) => (
                        <LeaveCard
                          key={leave.id}
                          leave={leave}
                          getStatusConfig={getStatusConfig}
                          canCancel={canCancel}
                          onCancel={openCancelDialog}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog agendar novas férias */}
      <NewDriverLeaveDialog
        open={newLeaveOpen}
        onOpenChange={setNewLeaveOpen}
        preselectedDriverId={driverId}
        preselectedDriverName={driverName}
        onCreated={(leave) => setLeaves((prev) => [leave, ...prev])}
      />

      {/* Confirmar cancelamento */}
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
    </>
  );
}

// ─── Sub-componente: card de uma férias ──────────────────────────────────────

interface LeaveCardProps {
  leave:           IDriverLeave;
  getStatusConfig: (s: LeaveStatus) => { label: string; icon: any; class: string };
  canCancel:       (s: LeaveStatus) => boolean;
  onCancel:        (l: IDriverLeave) => void;
  t:               (key: string, opts?: any) => string;
}

function LeaveCard({ leave, getStatusConfig, canCancel, onCancel, t }: LeaveCardProps) {
  const cfg    = getStatusConfig(leave.status as LeaveStatus);
  const Icon   = cfg.icon;

  const start  = new Date(leave.start_date).toLocaleDateString('pt-AO');
  const end    = new Date(leave.end_date).toLocaleDateString('pt-AO');
  const days   =
    Math.ceil(
      (new Date(leave.end_date).getTime() - new Date(leave.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
      <div className="flex flex-col items-center gap-1 min-w-[56px] text-center">
        <CalendarDays className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground">
          {days}d
        </span>
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm">
            {start} → {end}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
              cfg.class
            )}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </Badge>
        </div>

        {leave.reason && (
          <p className="text-xs text-muted-foreground">
            {t(`drivers:leaves.reasons.${leave.reason}`, { defaultValue: leave.reason })}
          </p>
        )}

        {leave.status === 'pending_trip' && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('drivers:leaves.info.pendingTripNote')}
          </div>
        )}

        {leave.cancelled_reason && (
          <p className="text-xs text-muted-foreground italic">
            {t('drivers:leaves.fields.cancelledReason')}: {leave.cancelled_reason}
          </p>
        )}

        {leave.notes && (
          <p className="text-xs text-muted-foreground">{leave.notes}</p>
        )}
      </div>

      {canCancel(leave.status as LeaveStatus) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
          onClick={() => onCancel(leave)}
          title={t('drivers:leaves.actions.cancel')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}