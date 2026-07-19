// ========================================
// FILE: src/components/tracking/TraccarDevicesPanel.tsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { getTrackedDevices } from '@/helpers/tracking-helpers';
import { getAllVehicles } from '@/helpers/vehicle-helpers';
import type { TrackedDevice } from '@/helpers/tracking-helpers';
import type { IVehicle } from '@/lib/types/vehicle';

interface DeviceRow {
  device:        TrackedDevice;
  linkedVehicle: IVehicle | null;
}

interface Props {
  onViewVehicle?: (vehicleId: string) => void;
}

export function TraccarDevicesPanel({ onViewVehicle }: Props) {
  const { t }                     = useTranslation('tracking');
  const [rows,    setRows]        = useState<DeviceRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [devices, vehiclesResult] = await Promise.all([
          getTrackedDevices(),
          getAllVehicles({ limit: 1000 }),
        ]);
        const vehicles = vehiclesResult?.data ?? [];
        setRows(
          devices.map(device => ({
            device,
            linkedVehicle: vehicles.find(
              v => v.traccar_unique_id === device.uniqueId && !v.deleted_at,
            ) ?? null,
          })),
        );
      } catch {
        setError(t('devicesPanel.error'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground p-4">{t('devicesPanel.loading')}</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive p-4">{error}</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">{t('devicesPanel.empty')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{t('devicesPanel.subtitle')}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b">
              <th className="text-left py-2 pr-3">{t('devicesPanel.imeiLabel')}</th>
              <th className="text-left py-2 pr-3">{t('devicesPanel.statusLabel')}</th>
              <th className="text-left py-2 pr-3">{t('devicesPanel.linkedVehicle')}</th>
              <th className="text-left py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ device, linkedVehicle }) => (
              <tr key={device.id} className="border-b last:border-0">
                <td className="py-2 pr-3 font-mono text-xs">{device.uniqueId}</td>
                <td className="py-2 pr-3">
                  <Badge
                    variant={device.status === 'online' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {device.status}
                  </Badge>
                </td>
                <td className="py-2 pr-3 text-xs">
                  {linkedVehicle
                    ? `${linkedVehicle.brand} ${linkedVehicle.model} · ${linkedVehicle.license_plate}`
                    : <span className="text-muted-foreground">{t('devicesPanel.noVehicle')}</span>}
                </td>
                <td className="py-2 text-xs">
                  {linkedVehicle && onViewVehicle && (
                    <button
                      className="text-primary underline"
                      onClick={() => onViewVehicle(linkedVehicle.id)}
                    >
                      {t('devicesPanel.viewVehicle')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
