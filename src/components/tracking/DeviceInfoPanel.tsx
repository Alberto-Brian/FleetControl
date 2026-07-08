// ========================================
// FILE: src/components/tracking/DeviceInfoPanel.tsx
// ========================================
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge  } from '@/components/ui/badge';
import { X, MapPin, Gauge, Navigation, Clock, History, ChevronDown, ChevronUp } from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed }        from '@/helpers/tracking-helpers';

interface Props {
  device:          TrackedDevice;
  position?:       Position;
  onClose:         () => void;
  onShowHistory:   (from: string, to: string) => void;
}

const PRESETS = [
  { label: '1h',  hours: 1  },
  { label: '6h',  hours: 6  },
  { label: '24h', hours: 24 },
  { label: '7d',  hours: 168 },
] as const;

function toLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DeviceInfoPanel({ device, position, onClose, onShowHistory }: Props) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(24);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo  ] = useState('');
  const [useCustom,  setUseCustom ] = useState(false);

  function handleShowHistory() {
    let from: string;
    let to: string;

    if (useCustom && customFrom && customTo) {
      from = new Date(customFrom).toISOString();
      to   = new Date(customTo).toISOString();
    } else {
      to   = new Date().toISOString();
      from = new Date(Date.now() - selectedPreset * 3600 * 1000).toISOString();
    }

    onShowHistory(from, to);
  }

  function handlePreset(hours: number) {
    setSelectedPreset(hours);
    setUseCustom(false);
  }

  function handleCustomToggle() {
    if (!useCustom) {
      const now = new Date();
      const ago = new Date(Date.now() - selectedPreset * 3600 * 1000);
      setCustomTo(toLocalDateTimeInput(now));
      setCustomFrom(toLocalDateTimeInput(ago));
    }
    setUseCustom(v => !v);
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 w-80 bg-background/95 backdrop-blur rounded-2xl border border-border shadow-xl p-4 space-y-3 pointer-events-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-base">{device.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">{device.uniqueId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs ${
              device.status === 'online'
                ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30'
                : 'text-slate-500 border-slate-200'
            }`}
          >
            {device.status}
          </Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dados da posição */}
      {position ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Gauge className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Velocidade</p>
              <p className="text-sm font-bold">{formatSpeed(position.speed ?? 0)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Rumo</p>
              <p className="text-sm font-bold">{Math.round(position.course ?? 0)}°</p>
            </div>
          </div>

          {position.address && (
            <div className="col-span-2 flex items-start gap-2 p-2 rounded-lg bg-muted/50">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{position.address}</p>
            </div>
          )}

          <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Última actualização</p>
              <p className="text-xs font-medium">
                {new Date(position.timestamp).toLocaleString('pt-PT')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">Sem posição disponível</p>
      )}

      {/* Secção de histórico expansível */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
          onClick={() => setHistoryOpen(v => !v)}
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Historial de percurso
          </div>
          {historyOpen
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </button>

        {historyOpen && (
          <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
            {/* Presets */}
            <div className="flex gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.hours}
                  onClick={() => handlePreset(p.hours)}
                  className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                    !useCustom && selectedPreset === p.hours
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Toggle intervalo personalizado */}
            <button
              onClick={handleCustomToggle}
              className={`w-full text-xs py-1.5 rounded-md border transition-colors ${
                useCustom
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Intervalo personalizado
            </button>

            {useCustom && (
              <div className="space-y-1.5">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold">De</label>
                  <input
                    type="datetime-local"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="w-full mt-0.5 text-xs px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold">Até</label>
                  <input
                    type="datetime-local"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="w-full mt-0.5 text-xs px-2 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <Button
              size="sm"
              className="w-full text-xs"
              onClick={handleShowHistory}
              disabled={useCustom && (!customFrom || !customTo)}
            >
              <History className="w-3.5 h-3.5 mr-1.5" />
              Ver percurso
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
