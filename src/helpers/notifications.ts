// src/helpers/notifications.ts
import type { GeofenceAlert } from '@/contexts/TrackingContext';

export interface AlertSettings {
  notifyNativeEnter: boolean;
  notifyNativeExit:  boolean;
  notifyNativeSpeed: boolean;
  cooldownSpeedMs?:  number;
}

const TITLES: Record<string, string> = {
  geofenceEnter: 'Entrou na zona',
  geofenceExit:  'Saiu da zona',
  speedLimit:    'Velocidade excessiva',
};

export async function requestNotificationPermission(): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

export function sendNativeNotification(alert: GeofenceAlert, settings: AlertSettings): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const typeKey = alert.eventType === 'geofenceEnter' ? 'notifyNativeEnter'
                : alert.eventType === 'geofenceExit'  ? 'notifyNativeExit'
                : 'notifyNativeSpeed';

  if (!settings[typeKey as keyof AlertSettings]) return;

  const title = `FleetControl — ${TITLES[alert.eventType] ?? alert.eventType}`;
  const body  = `Device #${alert.deviceId} · ${alert.geofenceName}${alert.speed != null ? ` · ${Math.round(alert.speed)} km/h` : ''}`;

  new Notification(title, {
    body,
    tag: `${alert.eventType}-${alert.deviceId}`,
  });
}
