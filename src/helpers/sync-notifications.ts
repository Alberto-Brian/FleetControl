// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/helpers/sync-notifications.ts
// ========================================
//
// Pedido do utilizador (2026-09-0X): som ao chegar um dado novo via
// PowerSync, com um interruptor nas Definições > Sincronização. Gerado por
// Web Audio (sem ficheiro de áudio a acompanhar o projecto) — um "ping"
// curto e ascendente, não um alarme. A preferência é lida directamente do
// localStorage em cada disparo (não React state) para nunca ficar
// desactualizada entre o componente que liga o som (montado uma vez, em
// LicenseGuard) e o toggle nas Definições (montado só quando o diálogo
// está aberto) — sem precisar de um Context só para isto.

const SYNC_SOUND_KEY = 'fc_sync_sound_enabled';

export function isSyncSoundEnabled(): boolean {
  return localStorage.getItem(SYNC_SOUND_KEY) !== 'false'; // omisso = activado
}

export function setSyncSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SYNC_SOUND_KEY, String(enabled));
}

// ── Toast de "dados actualizados" ────────────────────────────────────────
// Pedido do utilizador: separado do som (pode querer um sem o outro),
// configurável em canto próprio (pedido: superior direito, por omissão) ou
// no mesmo canto dos restantes toasts da app (bottom-right, ver
// components/ui/sooner.tsx). O JSX do toast em si vive em SyncNotifier.tsx
// (este ficheiro fica sem React) — aqui só a preferência persistida.
const TOAST_ENABLED_KEY  = 'fc_sync_toast_enabled';
const TOAST_POSITION_KEY = 'fc_sync_toast_position';

export function isSyncToastEnabled(): boolean {
  // Achado do utilizador (2026-09-0X): ao contrário do som, o toast fica
  // DESACTIVADO por omissão — só o próprio utilizador o liga.
  return localStorage.getItem(TOAST_ENABLED_KEY) === 'true'; // omisso = desactivado
}
export function setSyncToastEnabled(enabled: boolean): void {
  localStorage.setItem(TOAST_ENABLED_KEY, String(enabled));
}

export type SyncToastPosition = 'own-corner' | 'same-as-toasts';
export function getSyncToastPosition(): SyncToastPosition {
  return localStorage.getItem(TOAST_POSITION_KEY) === 'same-as-toasts' ? 'same-as-toasts' : 'own-corner';
}
export function setSyncToastPositionSetting(position: SyncToastPosition): void {
  localStorage.setItem(TOAST_POSITION_KEY, position);
}

// Nome amigável por tabela sincronizada (SYNCED_TABLES em
// src/lib/powersync/client.ts) — só para a mensagem do toast/som, nunca
// para decidir nada. Uma tabela desconhecida (nova, ainda não mapeada)
// cai no próprio nome em vez de rebentar.
const TABLE_LABELS: Record<string, { pt: string; en: string }> = {
  vehicles:                { pt: 'Veículos',                    en: 'Vehicles' },
  drivers:                 { pt: 'Motoristas',                  en: 'Drivers' },
  trips:                   { pt: 'Viagens',                     en: 'Trips' },
  fuel:                    { pt: 'Combustível',                 en: 'Fuel' },
  maintenance:             { pt: 'Manutenções',                 en: 'Maintenance' },
  expenses:                { pt: 'Despesas',                    en: 'Expenses' },
  fines:                   { pt: 'Multas',                      en: 'Fines' },
  categories:               { pt: 'Categorias',                  en: 'Categories' },
  routes:                  { pt: 'Rotas',                       en: 'Routes' },
  workshops:                { pt: 'Oficinas',                    en: 'Workshops' },
  fuel_stations:            { pt: 'Postos de combustível',       en: 'Fuel stations' },
  maintenance_categories:  { pt: 'Categorias de manutenção',    en: 'Maintenance categories' },
  vehicle_documents:        { pt: 'Documentos de veículo',       en: 'Vehicle documents' },
  maintenance_items:       { pt: 'Itens de manutenção',         en: 'Maintenance items' },
  scheduled_trips:          { pt: 'Viagens agendadas',           en: 'Scheduled trips' },
};

export function labelForSyncedTable(table: string, locale: 'pt' | 'en'): string {
  return TABLE_LABELS[table]?.[locale] ?? table;
}

export function formatSyncToastMessage(changedTables: string[], locale: 'pt' | 'en'): string {
  const labels = Array.from(new Set(changedTables.map((t) => labelForSyncedTable(t, locale))));
  if (labels.length === 0) return '';
  const joined = labels.join(', ');
  if (labels.length === 1) return locale === 'pt' ? `${joined} actualizado(s)` : `${joined} updated`;
  return locale === 'pt' ? `${joined} actualizados` : `${joined} updated`;
}

let _audioCtx: AudioContext | null = null;

export function playSyncSound(): void {
  try {
    if (!_audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      _audioCtx = new Ctor();
    }
    const ctx = _audioCtx;
    const now = ctx.currentTime;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);                          // A5
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);  // até E6 — soa a "chegada", não a alarme

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // O som é um extra — uma falha aqui (ex. AudioContext bloqueado antes
    // de qualquer interacção do utilizador) nunca deve rebentar nada.
  }
}
