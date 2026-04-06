// ========================================
// FILE: src/components/driver/NewDriverShiftDialog.tsx
// ========================================
import React, { useState } from 'react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge }    from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useErrorHandler }  from '@/hooks/useErrorHandler';
import { useTranslation }   from 'react-i18next';
import { cn } from '@/lib/utils';
import { Clock, Crown, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { createDriverShift } from '@/helpers/driver-shift-helpers';
import { IDriverShift, ICreateShiftMember } from '@/lib/types/driver-shift';
 
interface Props {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  drivers:      { id: string; name: string }[];
  onCreated?:   (shift: IDriverShift) => void;
}
 
interface MemberDraft {
  driver_id:   string;
  driver_name: string;
  is_leader:   boolean;
  notes:       string;
}
 
export default function NewDriverShiftDialog({ open, onOpenChange, drivers, onCreated }: Props) {
  const { t }                        = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
 
  const [isLoading,  setIsLoading]  = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [members,    setMembers]    = useState<MemberDraft[]>([]);
 
  const [form, setForm] = useState({
    name:        '',
    description: '',
    start_date:  '',
    end_date:    '',
    start_time:  '08:00',
    end_time:    '16:00',
    status:      'draft' as const,
    notes:       '',
  });
 
  function resetForm() {
    setForm({ name: '', description: '', start_date: '', end_date: '', start_time: '08:00', end_time: '16:00', status: 'draft', notes: '' });
    setMembers([]);
    setDriverSearch('');
  }
 
  function addMember(driver: { id: string; name: string }) {
    if (members.find(m => m.driver_id === driver.id)) return;
    setMembers(prev => [...prev, { driver_id: driver.id, driver_name: driver.name, is_leader: false, notes: '' }]);
    setDriverSearch('');
  }
 
  function removeMember(driverId: string) {
    setMembers(prev => prev.filter(m => m.driver_id !== driverId));
  }
 
  function toggleLeader(driverId: string) {
    setMembers(prev => prev.map(m => ({
      ...m,
      is_leader: m.driver_id === driverId ? !m.is_leader : false,
    })));
  }
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const created = await createDriverShift({
        ...form,
        description: form.description || undefined,
        notes:       form.notes       || undefined,
        members:     members.map(m => ({
          driver_id: m.driver_id,
          is_leader: m.is_leader,
          notes:     m.notes || undefined,
        })),
      });
      onCreated?.(created);
      showSuccess('drivers:shifts.toast.createSuccess');
      onOpenChange(false);
      resetForm();
    } catch (err) {
      handleError(err, 'drivers:shifts.toast.createError');
    } finally {
      setIsLoading(false);
    }
  }
 
  const availableDrivers = drivers.filter(d =>
    !members.find(m => m.driver_id === d.id) &&
    d.name.toLowerCase().includes(driverSearch.toLowerCase())
  );
 
  const leaderCount = members.filter(m => m.is_leader).length;
 
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-5 h-5 text-primary" />
            {t('drivers:shifts.dialogs.new.title')}
          </DialogTitle>
          <DialogDescription>{t('drivers:shifts.dialogs.new.description')}</DialogDescription>
        </DialogHeader>
 
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
 
          {/* ── Identificação ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('drivers:shifts.fields.name')} *</Label>
              <Input
                placeholder={t('drivers:shifts.placeholders.name')}
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('drivers:shifts.fields.description')}</Label>
              <Input
                placeholder={t('drivers:shifts.placeholders.description')}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
 
          <Separator />
 
          {/* ── Período e Horário ─────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t('drivers:shifts.sections.schedule')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('drivers:shifts.fields.startDate')} *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('drivers:shifts.fields.endDate')} *</Label>
                <Input
                  type="date"
                  min={form.start_date}
                  value={form.end_date}
                  onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('drivers:shifts.fields.startTime')} *</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('drivers:shifts.fields.endTime')} *</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('drivers:shifts.fields.status')}</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t('drivers:shifts.status.draft')}</SelectItem>
                    <SelectItem value="active">{t('drivers:shifts.status.active')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
 
          <Separator />
 
          {/* ── Motoristas ────────────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('drivers:shifts.sections.members')}
            </p>
 
            {/* Pesquisa para adicionar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('drivers:shifts.placeholders.searchDriver')}
                value={driverSearch}
                onChange={e => setDriverSearch(e.target.value)}
                className="pl-10"
              />
              {driverSearch && availableDrivers.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {availableDrivers.slice(0, 8).map(d => (
                    <button
                      key={d.id}
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 text-sm text-left transition-colors"
                      onClick={() => addMember(d)}
                    >
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                          {d.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
 
            {/* Lista de membros adicionados */}
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-muted/50 rounded-xl">
                <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">{t('drivers:shifts.info.noMembersYet')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <div
                    key={m.driver_id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border transition-colors',
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
                        <span className="font-semibold text-sm truncate">{m.driver_name}</span>
                        {m.is_leader && (
                          <Badge variant="outline" className="text-[10px] font-bold gap-1 px-2 border-amber-300 text-amber-700 bg-amber-50">
                            <Crown className="w-3 h-3" />
                            {t('drivers:shifts.info.leader')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle líder */}
                      <button
                        type="button"
                        title={m.is_leader ? t('drivers:shifts.actions.removeLeader') : t('drivers:shifts.actions.setLeader')}
                        onClick={() => toggleLeader(m.driver_id)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          m.is_leader
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-50'
                        )}
                      >
                        <Crown className="w-4 h-4" />
                      </button>
                      {/* Remover */}
                      <button
                        type="button"
                        onClick={() => removeMember(m.driver_id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {leaderCount === 0 && members.length > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    {t('drivers:shifts.info.noLeaderYet')}
                  </p>
                )}
              </div>
            )}
          </div>
 
          {/* ── Notas ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>{t('drivers:shifts.fields.notes')}</Label>
            <Textarea
              placeholder={t('drivers:shifts.placeholders.notes')}
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="resize-none"
            />
          </div>
 
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !form.name || !form.start_date || !form.end_date}>
              {isLoading ? t('drivers:shifts.actions.creating') : t('drivers:shifts.actions.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}