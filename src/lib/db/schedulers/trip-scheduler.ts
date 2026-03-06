// ========================================
// FILE: src/lib/schedulers/trip-scheduler.ts
// ========================================
// Corre no processo MAIN do Electron — mesmo processo que o leave-scheduler.
// Inicializar chamando startTripScheduler() no main.ts após o DB estar pronto.
// Pode correr em conjunto com o leave-scheduler sem conflitos.
// ========================================

import { processScheduledTrips } from '@/lib/db/queries/scheduled_trips.queries';

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos — igual ao leave-scheduler

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Executa um ciclo completo do trip scheduler.
 * Pode ser chamado isoladamente para forçar processamento.
 */
export async function runTripSchedulerCycle(): Promise<void> {
  try {
    const result = await processScheduledTrips();

    if (
      result.launched.length      > 0 ||
      result.pendingLeave.length  > 0 ||
      result.autoCancelled.length > 0
    ) {
      console.log('[TripScheduler] processScheduledTrips:', result);
    }
  } catch (error) {
    console.error('[TripScheduler] Error during cycle:', error);
  }
}

/**
 * Inicia o scheduler.
 * Corre imediatamente no arranque e depois a cada 5 minutos.
 */
export function startTripScheduler(): void {
  if (schedulerTimer) {
    console.warn('[TripScheduler] Already running — skipping start');
    return;
  }

  console.log('[TripScheduler] Starting — interval:', INTERVAL_MS / 1000, 's');

  // Corre imediatamente para processar quaisquer viagens pendentes
  runTripSchedulerCycle();

  schedulerTimer = setInterval(runTripSchedulerCycle, INTERVAL_MS);
}

/**
 * Para o scheduler (útil em testes ou shutdown gracioso).
 */
export function stopTripScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[TripScheduler] Stopped');
  }
}