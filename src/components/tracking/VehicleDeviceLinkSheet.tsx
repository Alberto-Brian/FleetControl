// ========================================
// FILE: src/components/tracking/VehicleDeviceLinkSheet.tsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button }    from '@/components/ui/button';
import { Badge }     from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Link2, Link2Off, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import {
  getLinkSuggestions,
  linkVehicleDevice,
  unlinkVehicleDevice,
} from '@/helpers/tracking-helpers';
import type { LinkSuggestion, LinkSuggestionDevice } from '@/helpers/tracking-helpers';

interface Props {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
}

export function VehicleDeviceLinkSheet({ open, onOpenChange }: Props) {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  // vehicleId → selected traccarDevice UUID from dropdown
  const [selections,  setSelections]  = useState<Record<string, string>>({});
  const [pending,     setPending]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLinkSuggestions();
      setSuggestions(data);
      // Pre-populate dropdowns: use best_match if vehicle is unlinked
      const init: Record<string, string> = {};
      data.forEach(s => {
        if (!s.vehicle.traccar_device_id && s.best_match) {
          init[s.vehicle.id] = s.best_match.id;
        }
      });
      setSelections(init);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function handleLink(vehicleId: string) {
    const deviceId = selections[vehicleId];
    if (!deviceId) return;
    setPending(vehicleId);
    try {
      await linkVehicleDevice(vehicleId, deviceId);
      await load();
    } catch (err) {
      console.error('[Link] Erro ao associar:', err);
    } finally {
      setPending(null);
    }
  }

  async function handleUnlink(vehicleId: string) {
    setPending(vehicleId);
    try {
      await unlinkVehicleDevice(vehicleId);
      await load();
    } catch (err) {
      console.error('[Link] Erro ao remover:', err);
    } finally {
      setPending(null);
    }
  }

  const linked   = suggestions.filter(s =>  s.vehicle.traccar_device_id);
  const unlinked = suggestions.filter(s => !s.vehicle.traccar_device_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4 text-primary" />
            Associação Veículos ↔ Traccar
          </DialogTitle>
          <DialogDescription className="text-xs">
            Associe cada veículo registado ao seu dispositivo GPS no Traccar.
            Sugestões automáticas são geradas pela matrícula.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">

              {/* ── Sem dispositivo ── */}
              {unlinked.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Sem dispositivo associado ({unlinked.length})
                  </h3>
                  <div className="space-y-2">
                    {unlinked.map(s => (
                      <VehicleRow
                        key={s.vehicle.id}
                        suggestion={s}
                        selectedDeviceId={selections[s.vehicle.id] ?? ''}
                        onSelectDevice={id => setSelections(prev => ({ ...prev, [s.vehicle.id]: id }))}
                        isPending={pending === s.vehicle.id}
                        onLink={() => handleLink(s.vehicle.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Já associados ── */}
              {linked.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Associados ({linked.length})
                  </h3>
                  <div className="space-y-2">
                    {linked.map(s => (
                      <LinkedRow
                        key={s.vehicle.id}
                        suggestion={s}
                        allDevices={s.alternatives.map(a => a.device)}
                        isPending={pending === s.vehicle.id}
                        onUnlink={() => handleUnlink(s.vehicle.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {suggestions.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum veículo encontrado. Sincroniza os dispositivos Traccar primeiro.
                </div>
              )}

            </div>
          </ScrollArea>
        )}

        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>{suggestions.length} veículos · {linked.length} associados</span>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading} className="h-7 text-xs">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Recarregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Row: unlinked vehicle ─────────────────────────────────────────────────────

interface VehicleRowProps {
  suggestion:       LinkSuggestion;
  selectedDeviceId: string;
  onSelectDevice:   (id: string) => void;
  isPending:        boolean;
  onLink:           () => void;
}

function VehicleRow({ suggestion, selectedDeviceId, onSelectDevice, isPending, onLink }: VehicleRowProps) {
  const { vehicle, best_match, alternatives } = suggestion;
  const hasSuggestion = !!best_match;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
      {/* Vehicle info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-mono">{vehicle.license_plate}</p>
        <p className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</p>
      </div>

      {/* Device selector */}
      <div className="flex items-center gap-2">
        {hasSuggestion && (
          <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
            <Sparkles className="w-3 h-3" />
            Sugestão
          </span>
        )}
        <select
          value={selectedDeviceId}
          onChange={e => onSelectDevice(e.target.value)}
          className="h-8 text-xs rounded-md border border-input bg-background px-2 pr-6 focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px] max-w-[180px] truncate"
        >
          <option value="">— seleccionar —</option>
          {alternatives.map(({ device, score }) => (
            <option key={device.id} value={device.id}>
              {device.name} {score > 0 ? `(${Math.round(score * 100)}%)` : ''}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={!selectedDeviceId || isPending}
          onClick={onLink}
        >
          {isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><Link2 className="w-3.5 h-3.5 mr-1" />Associar</>
          }
        </Button>
      </div>
    </div>
  );
}

// ── Row: already linked vehicle ───────────────────────────────────────────────

interface LinkedRowProps {
  suggestion:  LinkSuggestion;
  allDevices:  LinkSuggestionDevice[];
  isPending:   boolean;
  onUnlink:    () => void;
}

function LinkedRow({ suggestion, allDevices, isPending, onUnlink }: LinkedRowProps) {
  const { vehicle } = suggestion;
  const device = allDevices.find(d => d.id === vehicle.traccar_device_id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800/40 dark:bg-green-950/20 transition-colors">
      {/* Vehicle info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-mono">{vehicle.license_plate}</p>
        <p className="text-xs text-muted-foreground truncate">{vehicle.brand} {vehicle.model}</p>
      </div>

      {/* Linked device */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-medium">{device?.name ?? '—'}</p>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              device?.status === 'online'
                ? 'text-green-600 border-green-300'
                : 'text-slate-500 border-slate-300'
            }`}
          >
            {device?.status ?? 'desconhecido'}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isPending}
          onClick={onUnlink}
        >
          {isPending
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <><Link2Off className="w-3.5 h-3.5 mr-1" />Remover</>
          }
        </Button>
      </div>
    </div>
  );
}
