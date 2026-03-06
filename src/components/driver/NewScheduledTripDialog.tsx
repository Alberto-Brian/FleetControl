// ========================================
// FILE: src/components/driver/NewScheduledTripDialog.tsx
// ========================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge }  from '@/components/ui/badge';
import {
  Truck, User, Car, MapPin, Calendar,
  Info, AlertTriangle, Navigation,
} from 'lucide-react';
import { useTranslation }  from 'react-i18next';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { createScheduledTrip } from '@/helpers/scheduled-trip-helpers';
import { useScheduledTrips }   from '@/contexts/ScheduledTripsContext';
import { ICreateScheduledTrip } from '@/lib/types/scheduled-trip';
import { cn } from '@/lib/utils';

// Propósitos comuns de viagem
const TRIP_PURPOSES = [
  'business',
  'maintenance_transport',
  'airport_transfer',
  'client_visit',
  'delivery',
  'other',
] as const;

interface NewScheduledTripDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  /** Pré-selecciona o driver — passado do contexto da aba */
  preselectedDriverId?:   string;
  preselectedDriverName?: string;
  /** Listas para os selects */
  drivers?:  { id: string; name: string }[];
  vehicles?: { id: string; plate: string; brand: string; model: string; status: string }[];
  routes?:   { id: string; name: string; origin?: string; destination?: string }[];
  /** Callback após criar */
  onCreated?: (trip: any) => void;
}

export default function NewScheduledTripDialog({
  open,
  onOpenChange,
  preselectedDriverId,
  preselectedDriverName,
  drivers  = [],
  vehicles = [],
  routes   = [],
  onCreated,
}: NewScheduledTripDialogProps) {
  const { t }                        = useTranslation();
  const { showSuccess, handleError } = useErrorHandler();
  const { addTrip }                  = useScheduledTrips();

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<ICreateScheduledTrip>({
    driver_id:      preselectedDriverId || '',
    vehicle_id:     '',
    route_id:       undefined,
    scheduled_date: '',
    origin:         '',
    destination:    '',
    purpose:        '',
    notes:          '',
  });

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setForm({
        driver_id:      preselectedDriverId || '',
        vehicle_id:     '',
        route_id:       undefined,
        scheduled_date: '',
        origin:         '',
        destination:    '',
        purpose:        '',
        notes:          '',
      });
    }
  }, [open, preselectedDriverId]);

  // Quando muda a rota, preenche origin/destination automaticamente
  function handleRouteChange(routeId: string) {
    const route = routes.find(r => r.id === routeId);
    setForm(f => ({
      ...f,
      route_id:    routeId || undefined,
      origin:      route?.origin      || f.origin,
      destination: route?.destination || f.destination,
    }));
  }

  // Veículos disponíveis (excluir os in_use ou maintenance)
  const availableVehicles = useMemo(() =>
    vehicles.filter(v => v.status === 'available' || v.status === 'inactive'),
    [vehicles]
  );

  // Veículo seleccionado (para mostrar info)
  const selectedVehicle = useMemo(() =>
    vehicles.find(v => v.id === form.vehicle_id),
    [vehicles, form.vehicle_id]
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const hasRequiredFields = form.driver_id && form.vehicle_id && form.scheduled_date;

  // Dias até à viagem
  const daysUntil = useMemo(() => {
    if (!form.scheduled_date) return null;
    const diff = Math.ceil(
      (new Date(form.scheduled_date).getTime() - new Date().getTime()) / 86400000
    );
    return diff;
  }, [form.scheduled_date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const created = await createScheduledTrip({
        ...form,
        route_id:    form.route_id    || undefined,
        origin:      form.origin      || undefined,
        destination: form.destination || undefined,
        purpose:     form.purpose     || undefined,
        notes:       form.notes       || undefined,
      });
      addTrip(created);
      onCreated?.(created);
      showSuccess(t('scheduledTrips:toast.createSuccess', 'Viagem agendada com sucesso.'));
      onOpenChange(false);
    } catch (error: any) {
      handleError(error, t('scheduledTrips:toast.createError', 'Erro ao agendar viagem.'));
    } finally {
      setIsLoading(false);
    }
  }

  function set<K extends keyof ICreateScheduledTrip>(k: K, v: ICreateScheduledTrip[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {t('scheduledTrips:dialogs.new.title', 'Agendar Viagem')}
          </DialogTitle>
          <DialogDescription>
            {preselectedDriverName
              ? t('scheduledTrips:dialogs.new.descriptionFor',
                  { name: preselectedDriverName },
                  `Agendar viagem para ${preselectedDriverName}`)
              : t('scheduledTrips:dialogs.new.description',
                  'Preencha os dados para agendar a viagem. Será iniciada automaticamente na data indicada.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* ── Motorista ────────────────────────────────────────── */}
          {!preselectedDriverId && (
            <div className="space-y-2">
              <Label>
                {t('scheduledTrips:fields.driver', 'Motorista')}
                {' '}<span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={drivers.map(d => ({
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
                onValueChange={v => set('driver_id', v)}
                placeholder={t('scheduledTrips:placeholders.selectDriver', 'Seleccionar motorista...')}
                searchPlaceholder={t('scheduledTrips:placeholders.searchDriver', 'Pesquisar motorista...')}
                emptyMessage={t('common:noResults', 'Nenhum resultado.')}
              />
            </div>
          )}

          {/* ── Veículo ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              {t('scheduledTrips:fields.vehicle', 'Veículo')}
              {' '}<span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={availableVehicles.map(v => ({
                value:      v.id,
                searchText: `${v.plate} ${v.brand} ${v.model}`,
                label: (
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">{v.plate}</span>
                    <span className="text-muted-foreground text-xs">{v.brand} {v.model}</span>
                  </div>
                ),
                selectedLabel: (
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">{v.plate}</span>
                    <span className="text-muted-foreground text-xs">{v.brand} {v.model}</span>
                  </div>
                ),
              }))}
              value={form.vehicle_id}
              onValueChange={v => set('vehicle_id', v)}
              placeholder={t('scheduledTrips:placeholders.selectVehicle', 'Seleccionar veículo...')}
              searchPlaceholder={t('scheduledTrips:placeholders.searchVehicle', 'Pesquisar matrícula...')}
              emptyMessage={t('common:noResults', 'Nenhum veículo disponível.')}
            />
            {vehicles.length > 0 && availableVehicles.length === 0 && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {t('scheduledTrips:warnings.noVehiclesAvailable', 'Todos os veículos estão em uso ou em manutenção.')}
              </p>
            )}
          </div>

          {/* ── Data agendada ─────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="scheduled_date">
              {t('scheduledTrips:fields.scheduledDate', 'Data de Início')}
              {' '}<span className="text-destructive">*</span>
            </Label>
            <Input
              id="scheduled_date"
              type="date"
              min={todayStr}
              value={form.scheduled_date}
              onChange={e => set('scheduled_date', e.target.value)}
              required
            />
            {/* Info sobre quando será lançada */}
            {daysUntil !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm border",
                daysUntil === 0
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400"
                  : "bg-primary/5 border-primary/20 text-primary"
              )}>
                <Info className="w-4 h-4 shrink-0" />
                <span className="font-semibold">
                  {daysUntil === 0
                    ? t('scheduledTrips:info.launchesToday', 'A viagem será iniciada automaticamente hoje.')
                    : t('scheduledTrips:info.daysUntil', { days: daysUntil },
                        `A viagem inicia em ${daysUntil} dia(s).`)}
                </span>
              </div>
            )}
          </div>

          {/* ── Rota (opcional) ───────────────────────────────────── */}
          {routes.length > 0 && (
            <div className="space-y-2">
              <Label>
                {t('scheduledTrips:fields.route', 'Rota')}
                {' '}
                <span className="text-muted-foreground text-xs font-normal">
                  ({t('common:optional', 'opcional')})
                </span>
              </Label>
              <Select
                value={form.route_id ?? 'none'}
                onValueChange={v => handleRouteChange(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('scheduledTrips:placeholders.selectRoute', 'Seleccionar rota...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('scheduledTrips:placeholders.noRoute', 'Sem rota predefinida')}
                  </SelectItem>
                  {routes.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{r.name}</span>
                        {r.origin && r.destination && (
                          <span className="text-muted-foreground text-xs">
                            ({r.origin} → {r.destination})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Origem / Destino ──────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="origin">
                {t('scheduledTrips:fields.origin', 'Origem')}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="origin"
                  className="pl-8"
                  value={form.origin ?? ''}
                  onChange={e => set('origin', e.target.value)}
                  placeholder={t('scheduledTrips:placeholders.origin', 'Ex: Luanda')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">
                {t('scheduledTrips:fields.destination', 'Destino')}
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="destination"
                  className="pl-8"
                  value={form.destination ?? ''}
                  onChange={e => set('destination', e.target.value)}
                  placeholder={t('scheduledTrips:placeholders.destination', 'Ex: Benguela')}
                />
              </div>
            </div>
          </div>

          {/* ── Propósito ─────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              {t('scheduledTrips:fields.purpose', 'Propósito')}
            </Label>
            <Select
              value={form.purpose ?? 'none'}
              onValueChange={v => set('purpose', v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('scheduledTrips:placeholders.purpose', 'Seleccionar propósito...')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t('scheduledTrips:purposes.none', 'Não especificado')}
                </SelectItem>
                {TRIP_PURPOSES.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`scheduledTrips:purposes.${p}`, p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Notas ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {t('scheduledTrips:fields.notes', 'Notas')}
            </Label>
            <Textarea
              id="notes"
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder={t('scheduledTrips:placeholders.notes', 'Observações adicionais...')}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* ── Info sobre o scheduler ────────────────────────────── */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">
              {t('scheduledTrips:info.schedulingNote', 'Nota sobre o agendamento')}
            </p>
            <p>
              {t('scheduledTrips:info.schedulingNoteDetail',
                'A viagem será iniciada automaticamente na data indicada. Se o motorista estiver de licença, aguardará o regresso. Se o veículo estiver indisponível, a viagem será cancelada automaticamente.')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common:cancel', 'Cancelar')}
            </Button>
            <Button type="submit" disabled={isLoading || !hasRequiredFields}>
              {isLoading
                ? t('scheduledTrips:actions.scheduling', 'A agendar...')
                : t('scheduledTrips:actions.schedule', 'Agendar Viagem')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}