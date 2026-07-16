// src/components/tracking/AlertItem.tsx
import React    from 'react';
import { LogIn, LogOut, Gauge, CheckCheck, Zap, ZapOff, Play, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { GeofenceAlert } from '@/contexts/TrackingContext';
import { useTracking } from '@/contexts/TrackingContext';

interface Props {
  alert:         GeofenceAlert;
  onAcknowledge: (id: string) => void;
  onSelect:      (a: GeofenceAlert) => void;
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  geofenceEnter:  { icon: LogIn,   color: '#22c55e' },
  geofenceExit:   { icon: LogOut,  color: '#f59e0b' },
  speedLimit:     { icon: Gauge,   color: '#ef4444' },
  ignitionOn:     { icon: Zap,     color: '#10b981' },
  ignitionOff:    { icon: ZapOff,  color: '#6b7280' },
  deviceMoving:   { icon: Play,    color: '#3b82f6' },
  deviceStopped:  { icon: Square,  color: '#8b5cf6' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AlertItem({ alert, onAcknowledge, onSelect }: Props) {
  const { t } = useTranslation('tracking');
  const { state } = useTracking();

  const EVENT_LABELS: Record<string, string> = {
    geofenceEnter: t('alerts.enter'),
    geofenceExit:  t('alerts.exit'),
    speedLimit:    t('alerts.speed'),
    ignitionOn:    t('alerts.ignitionOn'),
    ignitionOff:   t('alerts.ignitionOff'),
    deviceMoving:  t('alerts.moving'),
    deviceStopped: t('alerts.stopped'),
  };

  const icons = EVENT_ICONS[alert.eventType] ?? EVENT_ICONS.geofenceEnter;
  const Icon = icons.icon;

  const device = state.devices.find(d => d.traccar_id === alert.deviceId);
  const deviceLabel = device?.name ?? `#${alert.deviceId}`;
  const label = EVENT_LABELS[alert.eventType] ?? alert.eventType;

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2.5 border-b transition-colors cursor-pointer ${
        alert.acknowledged ? 'opacity-50 hover:bg-muted/20' : 'hover:bg-muted/30'
      }`}
      onClick={() => onSelect(alert)}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${icons.color}22` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: icons.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight">
          <span style={{ color: icons.color }}>{label}</span>
          {' · '}
          <span className="text-foreground font-semibold">{deviceLabel}</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {alert.geofenceName ?? deviceLabel}
          {alert.speed != null && ` · ${Math.round(alert.speed)} km/h`}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatTime(alert.createdAt)}</p>
      </div>

      {!alert.acknowledged && (
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted flex-shrink-0"
          onClick={e => { e.stopPropagation(); onAcknowledge(alert.id); }}
          title={t('alertDetail.markRead')}
        >
          <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
