// ========================================
// FILE: src/components/vehicle/ImeiSelector.tsx
// ========================================
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getTrackedDevices } from '@/helpers/tracking-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import type { TrackedDevice } from '@/helpers/tracking-helpers';

interface ImeiSelectorProps {
  value:               string | null | undefined;
  onChange:            (value: string | null) => void;
  currentVehicleImei?: string;
  disabled?:           boolean;
}

const STATUS_COLORS: Record<string, string> = {
  online:   '#4ade80',
  moving:   '#22d3ee',
  offline:  '#6b7280',
  unknown:  '#6b7280',
};

function statusColor(status: string | null | undefined): string {
  return STATUS_COLORS[status ?? 'unknown'] ?? STATUS_COLORS.unknown;
}

export function ImeiSelector({ value, onChange, currentVehicleImei, disabled }: ImeiSelectorProps) {
  const { t } = useTranslation('vehicles');
  const [open,    setOpen]    = useState(false);
  const [devices, setDevices] = useState<TrackedDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');

  async function loadOptions() {
    setLoading(true);
    try {
      const [traccarDevices, vehiclesResult] = await Promise.all([
        getTrackedDevices(),
        getAllVehicles({ limit: 1000 }),
      ]);
      const vehicles = vehiclesResult?.data ?? [];
      const taken = new Set(
        vehicles
          .filter(v => v.traccar_unique_id && v.traccar_unique_id !== currentVehicleImei)
          .map(v => v.traccar_unique_id as string),
      );
      setDevices(traccarDevices.filter(d => d.uniqueId && !taken.has(d.uniqueId)));
    } catch {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) { setSearch(''); loadOptions(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedDevice = devices.find(d => d.uniqueId === value);

  const filtered = search.trim()
    ? devices.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.uniqueId ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : devices;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: statusColor(selectedDevice?.status) }}
              />
              <span className="truncate">
                {selectedDevice ? selectedDevice.name : value}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{t('placeholders.selectImei')}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 shadow-xl border border-border rounded-lg overflow-hidden"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Campo de pesquisa — idêntico ao selector de categorias */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('placeholders.searchImei')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Lista com scroll nativo — idêntico ao selector de categorias */}
        <div className="overflow-y-auto max-h-[240px] p-1 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground">

          {/* Estado: a carregar */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('dialogs.sync.imeiLoading')}
            </div>
          )}

          {/* Estado: sem dispositivos */}
          {!loading && filtered.length === 0 && !value && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('dialogs.sync.noImeiAvailable')}
            </div>
          )}

          {/* Opção de limpar */}
          {!loading && value && (
            <button
              type="button"
              onClick={() => { onChange(null); setOpen(false); }}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-left text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-3 w-3 shrink-0" />
              <span className="flex-1">{t('dialogs.sync.clearImei')}</span>
            </button>
          )}

          {/* Dispositivos disponíveis */}
          {!loading && filtered.map((device) => {
            const isSelected = value === device.uniqueId;
            return (
              <button
                key={device.uniqueId}
                type="button"
                onClick={() => { onChange(device.uniqueId ?? null); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-left transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isSelected && 'bg-accent/50',
                )}
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: statusColor(device.status) }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={cn('truncate', isSelected && 'font-medium')}>
                    {device.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground truncate">
                    {device.uniqueId}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
