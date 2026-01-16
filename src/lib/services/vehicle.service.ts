import { db } from '@/lib/db/db_client';
import { vehicles, vehicle_documents } from '@/lib/db/schemas';
import { eq, and, isNull } from 'drizzle-orm';
import { generateUuid } from '@/lib//utils/cripto';
import { createAuditLog } from '@/hooks/audit';

export class VehicleService {
  static async create(data: any, userId?: string) {
    const id = generateUuid();
    
    const [vehicle] = await db.insert(vehicles).values({
      ...data,
      id,
      created_by: userId,
      updated_by: userId,
    }).returning();

    await createAuditLog({
      userId,
      tableName: 'vehicles',
      recordId: id,
      action: 'create',
      newData: vehicle,
    });

    return vehicle;
  }

  static async findById(id: string) {
    return db.query.vehicles.findFirst({
      where: (vehicles, { eq, isNull }) => 
        and(eq(vehicles.id, id), isNull(vehicles.deleted_at)),
      with: {
        category: true,
      },
    });
  }

  static async findAll(includeInactive = false) {
    return db.query.vehicles.findMany({
      where: includeInactive 
        ? undefined 
        : (vehicles, { isNull }) => isNull(vehicles.deleted_at),
      with: {
        category: true,
      },
      orderBy: (vehicles, { desc }) => [desc(vehicles.created_at)],
    });
  }

  static async update(id: string, data: any, userId?: string) {
    const previous = await this.findById(id);
    if (!previous) throw new Error('Vehicle not found');

    const [updated] = await db
      .update(vehicles)
      .set({
        ...data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .where(eq(vehicles.id, id))
      .returning();

    await createAuditLog({
      userId,
      tableName: 'vehicles',
      recordId: id,
      action: 'update',
      previousData: previous,
      newData: updated,
    });

    return updated;
  }

  static async delete(id: string, userId?: string) {
    const previous = await this.findById(id);
    if (!previous) throw new Error('Vehicle not found');

    await db
      .update(vehicles)
      .set({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
        updated_at: new Date().toISOString(),
      })
      .where(eq(vehicles.id, id));

    await createAuditLog({
      userId,
      tableName: 'vehicles',
      recordId: id,
      action: 'delete',
      previousData: previous,
    });
  }

  static async getExpiringDocuments(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return db.query.vehicle_documents.findMany({
      where: (docs, { and, lte, isNull, gte }) => 
        and(
          isNull(docs.deleted_at),
          gte(docs.expiry_date, new Date().toISOString()),
          lte(docs.expiry_date, futureDate.toISOString())
        ),
      with: {
        vehicle: true,
      },
    });
  }
}