import { dbManager, db } from '@/lib/db/db_client';
import { vehicles, maintenances } from '@/lib/db/schemas';

import { eq } from 'drizzle-orm';

// Atualiza quilometragem do veículo após viagem
export async function updateVehicleMileage(vehicleId: string, newMileage: number) {
  await db
    .update(vehicles)
    .set({ 
      current_mileage: newMileage,
      updated_at: new Date().toISOString(),
    })
    .where(eq(vehicles.id, vehicleId));
}

// Atualiza status do veículo baseado em manutenções ativas
export async function updateVehicleStatusByMaintenance(vehicleId: string) {
  const activeMaintenance = await db.query.maintenances.findFirst({
    where: (maintenances, { eq, and, or }) => 
      and(
        eq(maintenances.vehicle_id, vehicleId),
        or(
          eq(maintenances.status, 'scheduled'),
          eq(maintenances.status, 'in_progress')
        )
      ),
  });

  const newStatus = activeMaintenance ? 'maintenance' : 'available';

  await db
    .update(vehicles)
    .set({ 
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .where(eq(vehicles.id, vehicleId));
}

// Calcula total de manutenção baseado nos itens
export async function calculateMaintenanceTotal(maintenanceId: string) {
  const items = await db.query.maintenance_items.findMany({
    where: (items, { eq, isNull }) => 
      eq(items.maintenance_id, maintenanceId) && isNull(items.deleted_at),
  });

  const totalParts = items
    .filter(item => item.type === 'part')
    .reduce((sum, item) => sum + item.total_price, 0);

  const totalLabor = items
    .filter(item => item.type === 'service')
    .reduce((sum, item) => sum + item.total_price, 0);

  const totalCost = totalParts + totalLabor;

  await db
    .update(maintenances)
    .set({ 
      parts_cost: totalParts,
      labor_cost: totalLabor,
      total_cost: totalCost,
      updated_at: new Date().toISOString(),
    })
    .where(eq(maintenances.id, maintenanceId));
}