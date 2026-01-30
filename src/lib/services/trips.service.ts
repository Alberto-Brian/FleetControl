
import { getDb } from '@/lib/db/db_client';
import { trips, vehicles } from '@/lib/db/schemas';
import { updateVehicleMileage } from '@/hooks/calculations';
import { eq, and, isNull } from 'drizzle-orm';
import { generateUuid } from '@/lib//utils/cripto';
import { createAuditLog } from '@/hooks/audit';


export class TripService {
  static async create(data: any, userId?: string) {
    const id = generateUuid();
    const db = getDb();
    // Gera código único para viagem
    const tripCode = `VIA-${Date.now().toString().slice(-8)}`;

    const [trip] = await db.insert(trips).values({
      ...data,
      id,
      trip_code: tripCode,
      created_by: userId,
      updated_by: userId,
    }).returning();

    // Atualiza status do veículo
    await db
      .update(vehicles)
      .set({ 
        status: 'in_use',
        updated_at: new Date().toISOString(),
      })
      .where(eq(vehicles.id, data.vehicle_id));

    await createAuditLog({
      userId,
      tableName: 'trips',
      recordId: id,
      action: 'create',
      newData: trip,
    });

    return trip;
  }

  static async complete(id: string, endMileage: number, userId?: string) {
    const db = getDb();
    const trip = await db.query.trips.findFirst({
      where: (trips, { eq }) => eq(trips.id, id),
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.status === 'completed') throw new Error('Trip already completed');

    const [updated] = await db
      .update(trips)
      .set({
        end_mileage: endMileage,
        end_date: new Date().toISOString(),
        status: 'completed',
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .where(eq(trips.id, id))
      .returning();

    // Actualiza quilometragem do veículo
    await updateVehicleMileage(trip.vehicle_id, endMileage);

    // Retorna veículo para disponível
    await db
      .update(vehicles)
      .set({ 
        status: 'available',
        updated_at: new Date().toISOString(),
      })
      .where(eq(vehicles.id, trip.vehicle_id));

    await createAuditLog({
      userId,
      tableName: 'trips',
      recordId: id,
      action: 'update',
      previousData: trip,
      newData: updated,
    });

    return updated;
  }

  static async getActive() {
    const db = getDb();
    return db.query.trips.findMany({
      where: (trips, { eq, isNull }) => 
        and(eq(trips.status, 'in_progress'), isNull(trips.deleted_at)),
      with: {
        vehicle: true,
        driver: true,
        route: true,
      },
    });
  }
}