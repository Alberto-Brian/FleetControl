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

// ── Sinal sonoro de alerta ───────────────────────────────────────────────
// Mesmo padrão já usado em sync-notifications.ts (preferência lida directo
// do localStorage a cada disparo, sem passar por React state — evita um
// Context só para isto e nunca fica desactualizado entre quem liga o som,
// TrackingContext, montado uma vez, e o toggle nas Definições, montado só
// quando o diálogo está aberto). Tom diferente do som de sincronização
// (mais agudo, dois tons) para se distinguir ao ouvido — um alerta de
// geofence/velocidade não é a mesma coisa que "chegaram dados novos".
const ALERT_SOUND_KEY = 'fc_alert_sound_enabled';

export function isAlertSoundEnabled(): boolean {
  return localStorage.getItem(ALERT_SOUND_KEY) !== 'false'; // omisso = activado
}

export function setAlertSoundEnabled(enabled: boolean): void {
  localStorage.setItem(ALERT_SOUND_KEY, String(enabled));
}

let _alertAudioCtx: AudioContext | null = null;

export function playAlertSound(): void {
  try {
    if (!_alertAudioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      _alertAudioCtx = new Ctor();
    }
    const ctx = _alertAudioCtx;
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration);
    };

    playTone(988,  0,    0.15); // B5
    playTone(1319, 0.12, 0.18); // E6
  } catch {
    // O som é um extra — uma falha aqui nunca deve impedir o toast/notificação nativa.
  }
}

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

  // Só notifica via SO quando a janela não tem foco (minimizada ou em segundo plano).
  // hasFocus() é false em ambos os casos e é mais fiável que document.hidden
  // quando setBackgroundThrottling(false) está activo.
  if (document.hasFocus()) return;

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
