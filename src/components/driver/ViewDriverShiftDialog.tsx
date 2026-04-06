
// ========================================
// FILE: src/components/driver/ViewDriverShiftDialog.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Input }    from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useErrorHandler }  from '@/hooks/useErrorHandler';
import { useTranslation }   from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Clock, Crown, Users, Calendar, Pencil, Trash2, CheckCircle2,
  Archive, Search, X, Plus, Loader2, Star,
} from 'lucide-react';
import {
  getDriverShiftById, addShiftMember, removeShiftMember,
  setShiftLeader, updateDriverShift, updateDriverShiftStatus,
} from '@/helpers/driver-shift-helpers';
import { IDriverShift } from '@/lib/types/driver-shift';
import { shiftStatus } from '@/lib/db/schemas/driver_shifts';
 
interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  shiftId:      string;
  drivers:      { id: string; name: string }[];
  onUpdated?:   (shift: IDriverShift) => void;
  onDeleted?:   () => void;
}
 
export default function ViewDriverShiftDialog({
  open, onOpenChange, shiftId, drivers, onUpdated, onDeleted,
}: Props) {
  const { t }                        = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
 
  const [shift,        setShift]        = useState<IDriverShift | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [driverSearch, setDriverSearch] = useState('');
 
  useEffect(() => {
    if (open && shiftId) loadShift();
  }, [open, shiftId]);
 
  async function loadShift() {
    setIsLoading(true);
    try {
      const data = await getDriverShiftById(shiftId);
      setShift(data);
    } catch (err) {
      handleError(err, 'drivers:shifts.errors.loadError');
    } finally {
      setIsLoading(false);
    }
  }
 
  async function handleAddMember(driver: { id: string; name: string }) {
    if (!shift) return;
    try {
      const updated = await addShiftMember(shift.id, { driver_id: driver.id, is_leader: false });
      if (updated) { setShift(updated); onUpdated?.(updated); }
      setDriverSearch('');
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.updateError');
    }
  }
 
  async function handleRemoveMember(memberId: string) {
    if (!shift) return;
    try {
      const updated = await removeShiftMember(shift.id, memberId);
      if (updated) { setShift(updated); onUpdated?.(updated); }
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.updateError');
    }
  }
 
  async function handleSetLeader(memberId: string) {
    if (!shift) return;
    try {
      const updated = await setShiftLeader(shift.id, memberId);
      if (updated) { setShift(updated); onUpdated?.(updated); }
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.updateError');
    }
  }
 
  async function handleStatusChange(status: 'draft' | 'active' | 'archived') {
    if (!shift) return;
    try {
      const updated = await updateDriverShiftStatus(shift.id, status);
      if (updated) { setShift(updated); onUpdated?.(updated); }
      showSuccess('drivers:shifts.toast.statusUpdated');
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.updateError');
    }
  }
 
  if (!open) return null;
 
  const availableToAdd = drivers.filter(d =>
    !shift?.members.find(m => m.driver_id === d.id) &&
    d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading || !shift ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between pr-8">
                <div>
                  <DialogTitle className="text-xl font-bold">{shift.name}</DialogTitle>
                  {shift.description && (
                    <DialogDescription className="mt-1">{shift.description}</DialogDescription>
                  )}
                </div>
                {/* Status badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 mt-1',
                    shift.status === 'active'   && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    shift.status === 'draft'    && 'bg-slate-50 text-slate-600 border-slate-200',
                    shift.status === 'archived' && 'bg-amber-50 text-amber-700 border-amber-200'
                  )}
                >
                  {t(`drivers:shifts.status.${shift.status}`)}
                </Badge>
              </div>
            </DialogHeader>
 
            <div className="space-y-5 mt-2">
 
              {/* Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {t('drivers:shifts.fields.schedule')}
                  </p>
                  <p className="font-mono font-bold text-lg">{shift.start_time} – {shift.end_time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    {t('drivers:shifts.fields.period')}
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(shift.start_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' → '}
                    {new Date(shift.end_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
 
              <Separator />
 
              {/* Membros */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('drivers:shifts.sections.members')} ({shift.member_count})
                  </p>
                </div>
 
                {/* Pesquisa para adicionar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('drivers:shifts.placeholders.searchDriver')}
                    value={driverSearch}
                    onChange={e => setDriverSearch(e.target.value)}
                    className="pl-10 h-9"
                  />
                  {driverSearch && availableToAdd.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {availableToAdd.slice(0, 6).map(d => (
                        <button
                          key={d.id}
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted/50 text-sm text-left"
                          onClick={() => handleAddMember(d)}
                        >
                          <Plus className="w-4 h-4 text-primary" />
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
 
                {/* Lista */}
                {shift.members.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed border-muted/50 rounded-xl">
                    {t('drivers:shifts.info.noMembersYet')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shift.members.map(m => (
                      <div
                        key={m.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          m.is_leader
                            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                            : 'bg-muted/30 border-muted/60'
                        )}
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback className={cn(
                            'text-sm font-bold',
                            m.is_leader ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                          )}>
                            {m.driver_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{m.driver_name}</span>
                            {m.is_leader && (
                              <Badge variant="outline" className="text-[10px] gap-1 px-2 border-amber-300 text-amber-700 bg-amber-50 font-bold">
                                <Crown className="w-3 h-3" />
                                {t('drivers:shifts.info.leader')}
                              </Badge>
                            )}
                          </div>
                          {m.notes && <p className="text-xs text-muted-foreground mt-0.5">{m.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!m.is_leader && (
                            <button
                              type="button"
                              title={t('drivers:shifts.actions.setLeader')}
                              onClick={() => handleSetLeader(m.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              <Separator />
 
              {/* Acções de estado */}
              <div className="flex flex-wrap gap-2">
                {shift.status === 'draft' && (
                  <Button variant="outline" size="sm" className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => handleStatusChange('active')}>
                    <CheckCircle2 className="w-4 h-4" />{t('drivers:shifts.actions.activate')}
                  </Button>
                )}
                {shift.status === 'active' && (
                  <Button variant="outline" size="sm" className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                    onClick={() => handleStatusChange('archived')}>
                    <Archive className="w-4 h-4" />{t('drivers:shifts.actions.archive')}
                  </Button>
                )}
                {shift.status === 'archived' && (
                  <Button variant="outline" size="sm" className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    onClick={() => handleStatusChange('active')}>
                    <CheckCircle2 className="w-4 h-4" />{t('drivers:shifts.actions.reactivate')}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}