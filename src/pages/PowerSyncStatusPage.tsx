// ========================================
// FILE: src/pages/PowerSyncStatusPage.tsx
// ========================================
//
// Fase 12, Prompt 22.10 — ecrã de diagnóstico, só leitura. Consulta o
// PowerSyncDatabase do processo principal via IPC (window._service_powersync,
// src/helpers/ipc/services/powersync/) — nunca decide nada, só mostra o que o
// SDK e a base local já sabem. Existe para o utilizador poder VER a
// sincronização a acontecer sem precisar de abrir os logs do servidor.
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw, Wifi, WifiOff, UploadCloud, DownloadCloud,
  Database, Truck, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';

const REFRESH_INTERVAL_MS = 5000;

function StatusRow({ icon: Icon, label, value, tone }: {
  icon: React.ElementType; label: string; value: React.ReactNode; tone?: 'ok' | 'warn' | 'error';
}) {
  const color = tone === 'error' ? '#f87171' : tone === 'warn' ? '#fbbf24' : tone === 'ok' ? '#4ade80' : 'var(--ui-t68)';
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--ui-b04)' }}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ui-t35)' }} />
        <span className="text-xs" style={{ color: 'var(--ui-t55)' }}>{label}</span>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{value}</span>
    </div>
  );
}

export default function PowerSyncStatusPage() {
  const { t } = useTranslation('powersyncStatus');
  const [status, setStatus] = useState<IPowerSyncStatusSnapshot | null>(null);
  const [snapshot, setSnapshot] = useState<IPowerSyncSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, snap] = await Promise.all([
      window._service_powersync.getStatus(),
      window._service_powersync.getSnapshot(),
    ]);
    setStatus(s);
    setSnapshot(snap);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const tableLabels: Record<string, string> = {
    vehicles: t('counts.tables.vehicles'),
    drivers: t('counts.tables.drivers'),
    trips: t('counts.tables.trips'),
    fuel: t('counts.tables.fuel'),
    maintenance: t('counts.tables.maintenance'),
    expenses: t('counts.tables.expenses'),
    categories: t('counts.tables.categories'),
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--ui-t90)' }}>{t('title')}</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--ui-t45)' }}>{t('subtitle')}</p>
          </div>
          <button
            onClick={() => void refresh()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: 'var(--ui-b07)', color: 'var(--ui-t68)' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('refresh')}
          </button>
        </div>

        {!status?.connected && !status?.hasSynced && (
          <div
            className="flex gap-2.5 rounded-lg px-3.5 py-3"
            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ui-t68)' }}>{t('noSessionNote')}</p>
          </div>
        )}

        {/* Connection status card */}
        <div className="rounded-lg px-4 py-3" style={{ border: '1px solid var(--ui-b07)' }}>
          <h2 className="text-xs font-semibold mb-2" style={{ color: 'var(--ui-t72)' }}>{t('status.title')}</h2>
          <StatusRow
            icon={status?.connected ? Wifi : WifiOff}
            label={t('status.title')}
            value={status?.connecting ? t('status.connecting') : status?.connected ? t('status.connected') : t('status.disconnected')}
            tone={status?.connected ? 'ok' : status?.connecting ? 'warn' : 'error'}
          />
          <StatusRow
            icon={CheckCircle2}
            label={t('status.hasSynced')}
            value={status?.hasSynced ? t('status.hasSyncedYes') : t('status.hasSyncedNo')}
            tone={status?.hasSynced ? 'ok' : undefined}
          />
          <StatusRow
            icon={Clock}
            label={t('status.lastSyncedAt')}
            value={status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : t('status.never')}
          />
          <StatusRow
            icon={UploadCloud}
            label={t('status.uploading')}
            value={status?.uploading ? t('status.uploading') : t('status.idle')}
            tone={status?.uploading ? 'warn' : undefined}
          />
          <StatusRow
            icon={DownloadCloud}
            label={t('status.downloading')}
            value={status?.downloading ? t('status.downloading') : t('status.idle')}
            tone={status?.downloading ? 'warn' : undefined}
          />
          {status?.uploadError && (
            <StatusRow icon={AlertTriangle} label={t('status.uploadError')} value={status.uploadError} tone="error" />
          )}
          {status?.downloadError && (
            <StatusRow icon={AlertTriangle} label={t('status.downloadError')} value={status.downloadError} tone="error" />
          )}
        </div>

        {/* Table counts */}
        <div className="rounded-lg px-4 py-3" style={{ border: '1px solid var(--ui-b07)' }}>
          <h2 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--ui-t72)' }}>
            <Database className="w-3.5 h-3.5" />
            {t('counts.title')}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(snapshot?.counts ?? {}).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--ui-b04)' }}>
                <span className="text-xs" style={{ color: 'var(--ui-t58)' }}>{tableLabels[table] ?? table}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--ui-t85)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicles preview */}
        <div className="rounded-lg px-4 py-3" style={{ border: '1px solid var(--ui-b07)' }}>
          <h2 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--ui-t72)' }}>
            <Truck className="w-3.5 h-3.5" />
            {t('preview.title')}
          </h2>
          {!loading && (snapshot?.vehiclesPreview.length ?? 0) === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: 'var(--ui-t35)' }}>{t('preview.empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ui-b07)' }}>
                    <th className="text-left py-1.5 font-semibold" style={{ color: 'var(--ui-t45)' }}>{t('preview.licensePlate')}</th>
                    <th className="text-left py-1.5 font-semibold" style={{ color: 'var(--ui-t45)' }}>{t('preview.brandModel')}</th>
                    <th className="text-left py-1.5 font-semibold" style={{ color: 'var(--ui-t45)' }}>{t('preview.vehicleStatus')}</th>
                    <th className="text-left py-1.5 font-semibold" style={{ color: 'var(--ui-t45)' }}>{t('preview.tracking')}</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot?.vehiclesPreview.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--ui-b04)' }}>
                      <td className="py-1.5" style={{ color: 'var(--ui-t82)' }}><strong>{v.license_plate}</strong></td>
                      <td className="py-1.5" style={{ color: 'var(--ui-t58)' }}>{v.brand} {v.model}</td>
                      <td className="py-1.5" style={{ color: 'var(--ui-t58)' }}>{v.status}</td>
                      <td className="py-1.5" style={{ color: 'var(--ui-t58)' }}>
                        {v.tracking_enabled ? t('preview.trackingOn') : t('preview.trackingOff')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--ui-t20)' }}>{t('autoRefreshNote')}</p>
      </div>
    </div>
  );
}
