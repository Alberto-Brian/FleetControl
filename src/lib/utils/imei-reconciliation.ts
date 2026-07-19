// ========================================
// FILE: src/lib/utils/imei-reconciliation.ts
// ========================================

export interface ReconciliationResult {
  unmatched: Array<{
    id:                string;
    brand:             string;
    model:             string;
    license_plate:     string;
    traccar_unique_id: string;
  }>;
}

/**
 * Compares the IMEI set from Traccar with local vehicles that have a registered IMEI.
 * Returns vehicles whose IMEI is not present in the Traccar device list.
 * Soft-deleted vehicles (deleted_at !== null) are excluded from the result.
 */
export async function reconcileVehicleImeis(
  traccarDevices: Array<{ uniqueId: string }>,
  localVehicles: Array<{
    id:                string;
    brand:             string;
    model:             string;
    license_plate:     string;
    traccar_unique_id: string | null;
    deleted_at:        string | null;
  }>
): Promise<ReconciliationResult> {
  const traccarImeis = new Set(traccarDevices.map(d => d.uniqueId));
  const unmatched = localVehicles.filter(
    v => v.traccar_unique_id && !v.deleted_at && !traccarImeis.has(v.traccar_unique_id)
  ) as ReconciliationResult['unmatched'];
  return { unmatched };
}
