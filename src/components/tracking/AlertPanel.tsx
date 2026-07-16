// src/components/tracking/AlertPanel.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell, CheckCheck, X, ChevronLeft, LogIn, LogOut, Gauge,
  MapPin, Clock, Navigation, Zap, ZapOff, Play, Square,
} from 'lucide-react';
import { Button }        from '@/components/ui/button';
import { useTracking }   from '@/contexts/TrackingContext';
import type { GeofenceAlert } from '@/contexts/TrackingContext';
import { AlertItem }     from './AlertItem';

interface Props {
  onClose:            () => void;
  onFocusCoords?:     (lat: number, lon: number) => void;
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  geofenceEnter:  { icon: LogIn,   color: '#22c55e', bg: '#22c55e18' },
  geofenceExit:   { icon: LogOut,  color: '#f59e0b', bg: '#f59e0b18' },
  speedLimit:     { icon: Gauge,   color: '#ef4444', bg: '#ef444418' },
  ignitionOn:     { icon: Zap,     color: '#10b981', bg: '#10b98118' },
  ignitionOff:    { icon: ZapOff,  color: '#6b7280', bg: '#6b728018' },
  deviceMoving:   { icon: Play,    color: '#3b82f6', bg: '#3b82f618' },
  deviceStopped:  { icon: Square,  color: '#8b5cf6', bg: '#8b5cf618' },
};

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString([], {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ── Detalhe de alerta ────────────────────────────────────────────────────────

function AlertDetail({
  alert,
  onBack,
  onAcknowledge,
  onFocusCoords,
}: {
  alert:          GeofenceAlert;
  onBack:         () => void;
  onAcknowledge:  (id: string) => void;
  onFocusCoords?: (lat: number, lon: number) => void;
}) {
  const { t }     = useTranslation('tracking');
  const { state } = useTracking();
  const icons     = EVENT_ICONS[alert.eventType] ?? EVENT_ICONS.geofenceEnter;
  const Icon      = icons.icon;
  const device    = state.devices.find(d => d.traccar_id === alert.deviceId);
  const EVENT_LABELS: Record<string, string> = {
    geofenceEnter: t('alertDetail.events.geofenceEnter'),
    geofenceExit:  t('alertDetail.events.geofenceExit'),
    speedLimit:    t('alertDetail.events.speedLimit'),
    ignitionOn:    t('alertDetail.events.ignitionOn'),
    ignitionOff:   t('alertDetail.events.ignitionOff'),
    deviceMoving:  t('alertDetail.events.deviceMoving'),
    deviceStopped: t('alertDetail.events.deviceStopped'),
  };
  const eventLabel = EVENT_LABELS[alert.eventType] ?? alert.eventType;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
          onClick={onBack}
          title={t('alertDetail.back')}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: icons.bg }}
        >
          <Icon className="w-3 h-3" style={{ color: icons.color }} />
        </div>
        <span className="text-sm font-semibold flex-1 truncate" style={{ color: icons.color }}>
          {eventLabel}
        </span>
        {!alert.acknowledged && (
          <button
            className="flex items-center gap-1 text-xs px-2 h-6 rounded hover:bg-muted text-muted-foreground"
            onClick={() => onAcknowledge(alert.id)}
            title={t('alertDetail.markRead')}
          >
            <CheckCheck className="w-3 h-3" />
            <span>{t('alertDetail.read')}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Bloco principal */}
        <div className="rounded-lg border p-3 space-y-2.5 text-xs">
          {/* Data/hora */}
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{t('alertDetail.datetime')}</p>
              <p className="font-medium mt-0.5">{formatFull(alert.createdAt)}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Dispositivo */}
          <div className="flex items-start gap-2">
            <Navigation className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{t('alertDetail.device')}</p>
              <p className="font-medium mt-0.5">{device?.name ?? `#${alert.deviceId}`}</p>
              {device?.uniqueId && (
                <p className="text-muted-foreground/70 font-mono text-[10px] mt-0.5">{device.uniqueId}</p>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Zona — só para alertas com geofence */}
          {alert.geofenceName != null && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{t('alertDetail.zone')}</p>
                <p className="font-medium mt-0.5">{alert.geofenceName}</p>
              </div>
            </div>
          )}

          {/* Velocidade */}
          {alert.speed != null && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('alertDetail.speedDetected')}</span>
                <span className="font-semibold font-mono" style={{ color: '#ef4444' }}>
                  {Math.round(alert.speed)} km/h
                </span>
              </div>
              {alert.speedLimit != null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('alertDetail.speedLimit')}</span>
                  <span className="font-mono text-orange-500">{alert.speedLimit} km/h</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Coordenadas */}
        {alert.latitude != null && alert.longitude != null && (
          <div className="rounded-lg border p-3 space-y-2 text-xs">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {t('alertDetail.location')}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('alertDetail.latitude')}</span>
              <span className="font-mono">{alert.latitude.toFixed(6)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('alertDetail.longitude')}</span>
              <span className="font-mono">{alert.longitude.toFixed(6)}</span>
            </div>
            {onFocusCoords && (
              <button
                className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs rounded-md h-7 transition-colors hover:bg-muted border"
                onClick={() => onFocusCoords(alert.latitude!, alert.longitude!)}
              >
                <MapPin className="w-3 h-3" />
                {t('alertDetail.viewOnMap')}
              </button>
            )}
          </div>
        )}

        {/* Estado */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: alert.acknowledged ? '#22c55e' : '#f59e0b' }}
          />
          {alert.acknowledged ? t('alertDetail.read') : t('alertDetail.unread')}
        </div>
      </div>
    </div>
  );
}

// ── AlertPanel ───────────────────────────────────────────────────────────────

export function AlertPanel({ onClose, onFocusCoords }: Props) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [selected, setSelected] = useState<GeofenceAlert | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleAcknowledge(id: string) {
    try {
      await (window as any)._tracking.acknowledgeAlert(id);
      dispatch({ type: 'ALERT_ACKNOWLEDGED', payload: id });
      // update selected in-place so detail reflects new state
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, acknowledged: true } : prev);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAcknowledgeAll() {
    setLoading(true);
    try {
      await (window as any)._tracking.acknowledgeAllAlerts();
      state.alerts.forEach(a => dispatch({ type: 'ALERT_ACKNOWLEDGED', payload: a.id }));
      if (selected) setSelected(prev => prev ? { ...prev, acknowledged: true } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Detalhe seleccionado
  if (selected) {
    return (
      <AlertDetail
        alert={selected}
        onBack={() => setSelected(null)}
        onAcknowledge={handleAcknowledge}
        onFocusCoords={onFocusCoords}
      />
    );
  }

  // Lista
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold flex-1">{t('alerts.panelTitle')}</span>
        {state.unreadAlerts > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleAcknowledgeAll} disabled={loading}>
            <CheckCheck className="w-3.5 h-3.5" /> {t('alerts.readAll')}
          </Button>
        )}
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.alerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">{t('alerts.empty')}</p>
          </div>
        ) : (
          state.alerts.map(a => (
            <AlertItem
              key={a.id}
              alert={a}
              onAcknowledge={handleAcknowledge}
              onSelect={setSelected}
            />
          ))
        )}
      </div>
    </div>
  );
}
