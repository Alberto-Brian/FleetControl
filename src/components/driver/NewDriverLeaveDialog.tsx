// ========================================
// FILE: src/components/driver/NewDriverLeaveDialog.tsx
// ========================================
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
import { CalendarDays, Info, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { createDriverLeave } from '@/helpers/driver-leave-helpers';
import { useDriverLeaves } from '@/contexts/DriverLeavesContext';
import { ICreateDriverLeave } from '@/lib/types/driver-leave';
import { cn } from '@/lib/utils';

const LEAVE_REASONS = [
  'annual_leave',
  'medical_leave',
  'personal_leave',
  'other',
] as const;

interface NewDriverLeaveDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  /** Pré-selecciona o driver — passado do ViewDriverDialog */
  preselectedDriverId?:   string;
  preselectedDriverName?: string;
  /** Lista de drivers disponíveis (para quando não há pré-selecção) */
  drivers?: { id: string; name: string }[];
  /** Callback após criar — para o caller actualizar o seu estado local */
  onCreated?: (leave: any) => void;
}

export default function NewDriverLeaveDialog({
  open,
  onOpenChange,
  preselectedDriverId,
  preselectedDriverName,
  drivers = [],
  onCreated,
}: NewDriverLeaveDialogProps) {
  const { t }                        = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { addLeave }                 = useDriverLeaves();

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<ICreateDriverLeave>({
    driver_id:  preselectedDriverId || '',
    start_date: '',
    end_date:   '',
    reason:     '',
    notes:      '',
  });

  // Reset ao abrir
  React.useEffect(() => {
    if (open) {
      setForm({
        driver_id:  preselectedDriverId || '',
        start_date: '',
        end_date:   '',
        reason:     '',
        notes:      '',
      });
    }
  }, [open, preselectedDriverId]);

  // Calcula duração em dias
  const durationDays = React.useMemo(() => {
    if (!form.start_date || !form.end_date) return 0;
    const diff =
      new Date(form.end_date).getTime() - new Date(form.start_date).getTime();
    return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1 : 0;
  }, [form.start_date, form.end_date]);

  const todayStr = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const created = await createDriverLeave({
        ...form,
        reason: form.reason || undefined,
        notes:  form.notes  || undefined,
      });
      addLeave(created);
      onCreated?.(created);
      showSuccess(t('drivers:leaves.toast.createSuccess'));
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, t('drivers:leaves.toast.createError'));
    } finally {
      setIsLoading(false);
    }
  }

  const hasDriver = preselectedDriverId || form.driver_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {t('drivers:leaves.dialogs.new.title')}
          </DialogTitle>
          <DialogDescription>
            {preselectedDriverName
              ? t('drivers:leaves.dialogs.new.descriptionFor', { name: preselectedDriverName })
              : t('drivers:leaves.dialogs.new.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Driver — só mostra se não houver pré-selecção */}
          {!preselectedDriverId && (
            <div className="space-y-2">
              <Label>{t('drivers:leaves.fields.driver')} *</Label>
              <SearchableSelect
                options={drivers.map((d) => ({
                  value:      d.id,
                  searchText: d.name,
                  label: (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{d.name}</span>
                    </div>
                  ),
                  selectedLabel: (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{d.name}</span>
                    </div>
                  ),
                }))}
                value={form.driver_id}
                onValueChange={(v) => setForm({ ...form, driver_id: v })}
                placeholder={t('drivers:leaves.placeholders.selectDriver')}
                searchPlaceholder={t('drivers:leaves.placeholders.searchDriver', 'Pesquisar motorista...')}
                emptyMessage={t('common:noResults', 'Nenhum resultado encontrado.')}
              />
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t('drivers:leaves.fields.startDate')} *</Label>
              <Input
                id="start_date"
                type="date"
                min={todayStr}
                value={form.start_date}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    start_date: val,
                    // Se end_date < novo start_date, limpa
                    end_date: f.end_date && f.end_date < val ? '' : f.end_date,
                  }));
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t('drivers:leaves.fields.endDate')} *</Label>
              <Input
                id="end_date"
                type="date"
                min={form.start_date || todayStr}
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                required
                disabled={!form.start_date}
              />
            </div>
          </div>

          {/* Duração calculada */}
          {durationDays > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span className="text-primary font-semibold">
                {t('drivers:leaves.info.duration', { days: durationDays })}
              </span>
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-2">
            <Label>{t('drivers:leaves.fields.reason')}</Label>
            <Select
              value={form.reason}
              onValueChange={(v) => setForm({ ...form, reason: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('drivers:leaves.placeholders.reason')} />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`drivers:leaves.reasons.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('drivers:leaves.fields.notes')}</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('drivers:leaves.placeholders.notes')}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Info sobre lógica de estados */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">{t('drivers:leaves.info.schedulingNote')}</p>
            <p>{t('drivers:leaves.info.schedulingNoteDetail')}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !hasDriver}>
              {isLoading
                ? t('drivers:leaves.actions.scheduling')
                : t('drivers:leaves.actions.schedule')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}