// src/components/tracking/AlertItem.tsx
import React    from 'react';
import { LogIn, LogOut, Gauge, CheckCheck } from 'lucide-react';
import type { GeofenceAlert } from '@/contexts/TrackingContext';
import { useTracking } from '@/contexts/TrackingContext';

interface Props {
  alert:         GeofenceAlert;
  onAcknowledge: (id: string) => void;
}

const EVENT_META = {
  geofenceEnter: { icon: LogIn,  color: '#22c55e', label: 'Entrou' },
  geofenceExit:  { icon: LogOut, color: '#f59e0b', label: 'Saiu' },
  speedLimit:    { icon: Gauge,  color: '#ef4444', label: 'Velocidade' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

export function AlertItem({ alert, onAcknowledge }: Props) {
  const { state } = useTracking();
  const meta = EVENT_META[alert.eventType] ?? EVENT_META.geofenceEnter;
  const Icon = meta.icon;

  const device = state.devices.find(d => d.traccar_id === alert.deviceId);
  const deviceLabel = device?.name ?? `#${alert.deviceId}`;

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2.5 border-b transition-colors ${
        alert.acknowledged ? 'opacity-50' : 'hover:bg-muted/30'
      }`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${meta.color}22` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight">
          <span style={{ color: meta.color }}>{meta.label}</span>
          {' · '}
          <span className="text-foreground font-semibold">{deviceLabel}</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {alert.geofenceName}
          {alert.speed != null && ` · ${Math.round(alert.speed)} km/h`}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatTime(alert.createdAt)}</p>
      </div>

      {!alert.acknowledged && (
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted flex-shrink-0"
          onClick={() => onAcknowledge(alert.id)}
          title="Marcar como lido"
        >
          <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
