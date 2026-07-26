// src/components/tracking/AlertPanel.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell, CheckCheck, X, ChevronLeft, LogIn, LogOut, Gauge,
  MapPin, Clock, Navigation, Zap, ZapOff, Play, Square, Search, Filter,
} from 'lucide-react';
import { Button }        from '@/components/ui/button';
import { useTracking }   from '@/contexts/TrackingContext';
import type { GeofenceAlert } from '@/contexts/TrackingContext';
import { AlertItem }     from './AlertItem';
import { getDeviceDisplayName } from '@/helpers/tracking-helpers';

interface Props {
  isOpen?:            boolean;
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

function formatPeriodDate(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const isToday    = d.toDateString() === now.toDateString();
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isToday)    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isThisYear) return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
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
              <p className="font-medium mt-0.5">{getDeviceDisplayName(device, alert.deviceId)}</p>
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

type FilterTab = 'all' | 'unread' | 'read';

export function AlertPanel({ isOpen, onClose, onFocusCoords }: Props) {
  const { t }               = useTranslation('tracking');
  const { state, dispatch } = useTracking();
  const [selected,    setSelected]    = useState<GeofenceAlert | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterTab,   setFilterTab]   = useState<FilterTab>('all');
  const [filterZone,  setFilterZone]  = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelected(null);
      setSearch('');
      setFilterTab('all');
      setFilterZone(null);
    }
  }, [isOpen]);

  const unreadCount = state.unreadAlerts;
  const readCount   = state.alerts.length - unreadCount;

  // Mapa traccar_id → device name para pesquisa
  const deviceNameMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    state.devices.forEach(d => { map[d.traccar_id] = getDeviceDisplayName(d); });
    return map;
  }, [state.devices]);

  // Nomes localizados de tipos de evento para pesquisa
  const eventNameMap = useMemo<Record<string, string>>(() => ({
    geofenceEnter: t('alerts.enter'),
    geofenceExit:  t('alerts.exit'),
    speedLimit:    t('alerts.speed'),
    ignitionOn:    t('alerts.ignitionOn'),
    ignitionOff:   t('alerts.ignitionOff'),
    deviceMoving:  t('alerts.moving'),
    deviceStopped: t('alerts.stopped'),
  }), [t]);

  // Zonas disponíveis para o selector — derivadas de state.geofences (reactivo a criação/remoção)
  const alertZones = useMemo(() => {
    return state.geofences
      .map(g => [g.id, g.name] as [number, string])
      .sort((a, b) => a[1].localeCompare(b[1]));
  }, [state.geofences]);

  // Limpa o filtro de zona se a zona seleccionada foi eliminada
  useEffect(() => {
    if (filterZone !== null && !state.geofences.some(g => g.id === filterZone)) {
      setFilterZone(null);
    }
  }, [state.geofences, filterZone]);

  // Alertas filtrados por tab + zona + pesquisa
  const filteredAlerts = useMemo(() => {
    let list = state.alerts;
    if (filterTab === 'unread') list = list.filter(a => !a.acknowledged);
    if (filterTab === 'read')   list = list.filter(a => a.acknowledged);
    if (filterZone !== null)    list = list.filter(a => a.geofenceId === filterZone);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(a => {
        const deviceName = (deviceNameMap[a.deviceId] ?? '').toLowerCase();
        const eventName  = (eventNameMap[a.eventType] ?? a.eventType).toLowerCase();
        const zoneName   = (a.geofenceName ?? '').toLowerCase();
        return deviceName.includes(q) || eventName.includes(q) || zoneName.includes(q);
      });
    }
    return list;
  }, [state.alerts, filterTab, filterZone, search, deviceNameMap, eventNameMap]);

  // Data do alerta mais antigo (para mostrar o período coberto)
  const oldestAlertDate = useMemo(() => {
    if (state.alerts.length === 0) return null;
    return state.alerts.reduce((oldest, a) =>
      a.createdAt < oldest ? a.createdAt : oldest,
      state.alerts[0].createdAt,
    );
  }, [state.alerts]);

  async function handleAcknowledge(id: string) {
    try {
      await (window as any)._tracking.acknowledgeAlert(id);
      dispatch({ type: 'ALERT_ACKNOWLEDGED', payload: id });
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

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',    label: t('alerts.filterAll'),    count: state.alerts.length },
    { key: 'unread', label: t('alerts.filterUnread'), count: unreadCount },
    { key: 'read',   label: t('alerts.filterRead'),   count: readCount },
  ];

  const isFiltered = search.trim() !== '' || filterTab !== 'all' || filterZone !== null;

  // Lista
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold flex-1">{t('alerts.panelTitle')}</span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleAcknowledgeAll} disabled={loading}>
            <CheckCheck className="w-3.5 h-3.5" /> {t('alerts.readAll')}
          </Button>
        )}
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Barra de estatísticas: lidos/não lidos + período */}
      {state.alerts.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {unreadCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {t('alerts.statsUnread', { count: unreadCount })}
              </span>
            )}
            {readCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                {t('alerts.statsRead', { count: readCount })}
              </span>
            )}
          </div>
          {oldestAlertDate && (
            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 truncate">
              {t('alerts.period', { from: formatPeriodDate(oldestAlertDate) })}
            </span>
          )}
        </div>
      )}

      {/* Pesquisa + filtro de zona + tabs */}
      {state.alerts.length > 0 && (
        <div className="flex flex-col gap-1.5 px-2.5 py-2 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('alerts.search')}
              className="w-full h-7 pl-7 pr-2.5 text-xs rounded-md border bg-background/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {alertZones.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <select
                value={filterZone ?? ''}
                onChange={e => setFilterZone(e.target.value === '' ? null : Number(e.target.value))}
                className={`flex-1 h-6 pl-1.5 pr-1 text-[10px] rounded border bg-background/60 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer ${
                  filterZone !== null ? 'text-primary border-primary/40' : 'text-muted-foreground'
                }`}
              >
                <option value="">{t('alerts.filterZoneAll')}</option>
                {alertZones.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-1">
            {TABS.map(tab => {
              const isActive = filterTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1 h-6 rounded text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  <span className={`font-semibold flex-shrink-0 ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contador de resultados filtrados */}
      {isFiltered && state.alerts.length > 0 && (
        <div className="px-3 py-1 text-[10px] text-muted-foreground border-b bg-muted/10 flex-shrink-0">
          {t('alerts.countOf', { filtered: filteredAlerts.length, total: state.alerts.length })}
        </div>
      )}

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {state.alerts.length === 0 ? t('alerts.empty') : t('alerts.noResults')}
            </p>
          </div>
        ) : (
          filteredAlerts.map(a => (
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
