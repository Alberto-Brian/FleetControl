// ========================================
// FILE: src/components/tracking/TraccarDevicesPanel.tsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, RefreshCw, ArrowLeft, Cpu,
  MapPin, Gauge, Clock, Copy, CheckCircle2,
  Car, Navigation2, Unlink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTrackedDevices } from '@/helpers/tracking-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import { useTracking } from '@/contexts/TrackingContext';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import type { IVehicle } from '@/lib/types/vehicle';
import { formatSpeed } from '@/helpers/tracking-helpers';

interface DeviceRow {
  device:        TrackedDevice;
  linkedVehicle: IVehicle | null;
}

interface Props {
  isOpen:          boolean;
  onClose:         () => void;
  onViewVehicle?:  (vehicleId: string) => void;
  onCenterDevice?: (device: TrackedDevice) => void;
}

function formatRelative(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5)     return 'agora';
  if (diff < 60)    return `${diff}s atrás`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export function TraccarDevicesPanel({ isOpen, onClose, onViewVehicle, onCenterDevice }: Props) {
  const { t } = useTranslation('tracking');
  const { state: { positions } } = useTracking();

  const [rows,        setRows]        = useState<DeviceRow[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [selected,    setSelected]    = useState<DeviceRow | null>(null);
  const [copied,      setCopied]      = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [devices, vehiclesResult] = await Promise.all([
        getTrackedDevices(),
        getAllVehicles({ limit: 1000 }),
      ]);
      const vehicles = vehiclesResult?.data ?? [];
      const newRows = devices.map(device => ({
        device,
        linkedVehicle: vehicles.find(
          v => v.traccar_unique_id === device.uniqueId && !v.deleted_at,
        ) ?? null,
      }));
      setRows(newRows);
      // Actualiza o device seleccionado se ainda existir na nova lista
      if (selected) {
        const updated = newRows.find(r => r.device.id === selected.device.id);
        setSelected(updated ?? null);
      }
    } catch {
      setError(t('devicesPanel.error'));
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  // Limpa selecção ao fechar
  useEffect(() => { if (!isOpen) setSelected(null); }, [isOpen]);

  function handleCopyImei(imei: string) {
    navigator.clipboard.writeText(imei).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const onlineCount  = rows.filter(r => r.device.status === 'online').length;
  const offlineCount = rows.length - onlineCount;

  // ── Vista de detalhe ────────────────────────────────────────────────────────
  if (selected) {
    const { device, linkedVehicle } = selected;
    const pos = positions.find(p => p.deviceId === device.traccar_id);
    const isOnline = device.status === 'online';

    return (
      <div className="flex flex-col h-full">
        {/* Header detalhe */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => setSelected(null)}
            title="Voltar à lista"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-semibold truncate">{device.name}</span>
          </div>
          <Badge
            variant={isOnline ? 'default' : 'secondary'}
            className="text-[10px] h-4 px-1.5 flex-shrink-0"
          >
            {device.status ?? 'unknown'}
          </Badge>
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
            onClick={() => { setSelected(null); onClose(); }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Corpo detalhe */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* IMEI */}
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">IMEI / ID único</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs flex-1 break-all">{device.uniqueId ?? '—'}</span>
              {device.uniqueId && (
                <button
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
                  onClick={() => handleCopyImei(device.uniqueId!)}
                  title="Copiar IMEI"
                >
                  {copied
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </button>
              )}
            </div>
          </div>

          {/* Posição em tempo real */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Posição actual</p>
            {pos ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-mono">{pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {formatSpeed(pos.speed ?? 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation2 className="w-3 h-3" style={{ transform: `rotate(${pos.course ?? 0}deg)` }} />
                    {Math.round(pos.course ?? 0)}°
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelative(pos.timestamp)}
                  </span>
                </div>
                {pos.address && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{pos.address}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'A aguardar posição...' : 'Dispositivo offline — sem posição disponível'}
              </p>
            )}
          </div>

          {/* Última actualização */}
          {device.lastUpdate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>Última actualização: {formatRelative(device.lastUpdate)}</span>
            </div>
          )}

          {/* Veículo associado */}
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Veículo associado</p>
            {linkedVehicle ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-medium">
                    {linkedVehicle.brand} {linkedVehicle.model}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pl-5">{linkedVehicle.license_plate}</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Unlink className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t('devicesPanel.noVehicle')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Acções */}
        <div className="border-t p-3 space-y-2 flex-shrink-0">
          {pos && onCenterDevice && (
            <button
              className="w-full h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              onClick={() => onCenterDevice(device)}
            >
              <MapPin className="w-3.5 h-3.5" />
              Centrar no mapa
            </button>
          )}
          {linkedVehicle && onViewVehicle && (
            <button
              className="w-full h-8 rounded-md border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              onClick={() => onViewVehicle(linkedVehicle.id)}
            >
              <Car className="w-3.5 h-3.5" />
              {t('devicesPanel.viewVehicle')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Vista de lista ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header lista */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0">
        <Cpu className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-semibold flex-1 truncate">{t('devicesPanel.title')}</span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-50"
          onClick={load}
          title={t('devicesPanel.refresh', 'Actualizar')}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sumário */}
      {rows.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 border-b flex-shrink-0">
          <span className="text-[11px] text-muted-foreground">{rows.length} dispositivos</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            {onlineCount} online
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 inline-block" />
            {offlineCount} offline
          </span>
        </div>
      )}

      {/* Body lista */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <p className="text-sm text-muted-foreground">{t('devicesPanel.loading')}</p>
        )}
        {!loading && error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!loading && !error && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('devicesPanel.empty')}</p>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="space-y-1.5">
            {rows.map((row) => {
              const { device, linkedVehicle } = row;
              const isOnline = device.status === 'online';
              const pos = positions.find(p => p.deviceId === device.traccar_id);

              return (
                <button
                  key={device.id}
                  className="w-full rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors group"
                  onClick={() => setSelected(row)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{
                        background: isOnline ? '#4ade80' : 'var(--ui-t20)',
                        boxShadow:  isOnline ? '0 0 4px #4ade80' : 'none',
                      }}
                    />
                    <span className="font-medium text-xs flex-1 truncate">{device.name}</span>
                    <Badge
                      variant={isOnline ? 'default' : 'secondary'}
                      className="text-[10px] h-4 px-1.5 flex-shrink-0"
                    >
                      {device.status ?? 'unknown'}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground truncate pl-3.5">
                    {device.uniqueId ?? '—'}
                  </p>
                  {linkedVehicle ? (
                    <p className="text-[11px] text-muted-foreground truncate pl-3.5 mt-0.5 flex items-center gap-1">
                      <Car className="w-3 h-3 flex-shrink-0" />
                      {linkedVehicle.brand} {linkedVehicle.model} · {linkedVehicle.license_plate}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground/50 pl-3.5 mt-0.5 flex items-center gap-1">
                      <Unlink className="w-3 h-3 flex-shrink-0" />
                      {t('devicesPanel.noVehicle')}
                    </p>
                  )}
                  {pos && (
                    <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 flex items-center gap-1">
                      <Gauge className="w-3 h-3 flex-shrink-0" />
                      {formatSpeed(pos.speed ?? 0)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
