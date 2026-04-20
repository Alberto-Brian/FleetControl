// ========================================
// FILE: src/components/tracking/DeviceInfoPanel.tsx
// ========================================
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge  } from '@/components/ui/badge';
import { X, MapPin, Gauge, Navigation, Clock, History } from 'lucide-react';
import type { Position }      from '@/hooks/useApiConnection';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import { formatSpeed }        from '@/helpers/tracking-helpers';

interface Props {
  device:          TrackedDevice;
  position?:       Position;
  onClose:         () => void;
  onShowHistory:   (from: string, to: string) => void;
}

export function DeviceInfoPanel({ device, position, onClose, onShowHistory }: Props) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-72 bg-background/95 backdrop-blur rounded-2xl border border-border shadow-xl p-4 space-y-3">
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

      {/* Histórico */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => {
          const to   = new Date().toISOString();
          const from = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
          onShowHistory(from, to);
        }}
      >
        <History className="w-3.5 h-3.5 mr-1.5" />
        Ver historial das últimas 24h
      </Button>
    </div>
  );
}