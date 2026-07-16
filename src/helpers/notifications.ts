// src/helpers/notifications.ts
import type { GeofenceAlert } from '@/contexts/TrackingContext';

export interface AlertSettings {
  nativeNotificationsEnabled?: boolean;
  notifyWhenFocused?:          boolean;
  osOnlyNotifications?:        boolean; // suprimir toasts na app; usar apenas SO
  notifyNativeEnter:           boolean;
  notifyNativeExit:            boolean;
  notifyNativeSpeed:           boolean;
  notifyIgnitionOn:            boolean;
  notifyIgnitionOff:           boolean;
  notifyDeviceMoving:          boolean;
  notifyDeviceStopped:         boolean;
  cooldownSpeedMs?:            number;
}

// No Electron, a permissão é implícita — o main process não precisa de permissão OS.
export async function requestNotificationPermission(): Promise<void> {}

/**
 * @param eventLabel  Label já traduzido do tipo de evento (vem do caller que tem acesso a t())
 * @param deviceLabel Identificação do veículo (marca + modelo + matrícula ou nome do dispositivo)
 */
export function sendNativeNotification(
  alert:       GeofenceAlert,
  settings:    AlertSettings,
  deviceLabel: string = '',
  eventLabel:  string = '',
): void {
  if (!settings.nativeNotificationsEnabled) return;

  // osOnlyNotifications → sempre mostra OS (ignora estado do foco)
  // notifyWhenFocused   → mostra SO mesmo com a janela activa (em foco)
  // default             → só mostra quando a janela não tem foco (minimizada ou em segundo plano)
  // hasFocus() é false quando minimizada OU coberta por outra janela — cobre ambos os casos.
  // Mais fiável que document.hidden com setBackgroundThrottling(false) activo.
  if (!settings.osOnlyNotifications && !settings.notifyWhenFocused && document.hasFocus()) return;

  const typeKey = alert.eventType === 'geofenceEnter'  ? 'notifyNativeEnter'
                : alert.eventType === 'geofenceExit'   ? 'notifyNativeExit'
                : alert.eventType === 'ignitionOn'     ? 'notifyIgnitionOn'
                : alert.eventType === 'ignitionOff'    ? 'notifyIgnitionOff'
                : alert.eventType === 'deviceMoving'   ? 'notifyDeviceMoving'
                : alert.eventType === 'deviceStopped'  ? 'notifyDeviceStopped'
                : 'notifyNativeSpeed';

  if (!settings[typeKey as keyof AlertSettings]) return;

  const parts: string[] = [eventLabel || alert.eventType];
  if (deviceLabel) parts.push(deviceLabel);
  if (alert.geofenceName) parts.push(alert.geofenceName);
  if (alert.speed != null) parts.push(`${Math.round(alert.speed)} km/h`);

  // Delega ao main process — funciona mesmo com a janela minimizada/em background
  (window as any).system?.showNotification?.('FleetControl', parts.join(' · '));
}
