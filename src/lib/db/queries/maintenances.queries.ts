// ========================================
// FILE: src/lib/db/queries/maintenances_queries.ts
// ========================================
import { dbManager, db } from '@/lib/db/db_client';
import { maintenances, vehicles, maintenance_categories, workshops } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateMaintenance, IUpdateMaintenance } from '@/lib/types/maintenance';

export async function createMaintenance(maintenanceData: ICreateMaintenance) {
    const id = generateUuid();
    
    if (dbManager.shouldRotate()) {
        dbManager.rotate();
    }

    const result = await db
        .insert(maintenances)
        .values({
            id,
            entry_date: new Date().toISOString(),
            status: 'scheduled',
            priority: maintenanceData.priority || 'normal',
            parts_cost: 0,
            labor_cost: 0,
            total_cost: 0,
            ...maintenanceData,
        })
        .returning();

    // Atualizar status do veículo
    await db
        .update(vehicles)
        .set({ status: 'maintenance', updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, maintenanceData.vehicle_id));

    return result[0];
}

export async function getAllMaintenances() {
    const result = await db
        .select({
            id: maintenances.id,
            vehicle_id: maintenances.vehicle_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            category_name: maintenance_categories.name,
            category_type: maintenance_categories.type,
            category_color: maintenance_categories.color,
            workshop_name: workshops.name,
            type: maintenances.type,
            entry_date: maintenances.entry_date,
            exit_date: maintenances.exit_date,
            vehicle_mileage: maintenances.vehicle_mileage,
            description: maintenances.description,
            total_cost: maintenances.total_cost,
            status: maintenances.status,
            priority: maintenances.priority,
            created_at: maintenances.created_at,
        })
        .from(maintenances)
        .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
        .leftJoin(maintenance_categories, eq(maintenances.category_id, maintenance_categories.id))
        .leftJoin(workshops, eq(maintenances.workshop_id, workshops.id))
        .where(isNull(maintenances.deleted_at))
        .orderBy(desc(maintenances.created_at));

    return result;
}

export async function getMaintenanceById(maintenanceId: string) {
    const result = await db
        .select()
        .from(maintenances)
        .where(
            and(
                eq(maintenances.id, maintenanceId),
                isNull(maintenances.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

export async function updateMaintenance(maintenanceId: string, maintenanceData: IUpdateMaintenance) {
    const result = await db
        .update(maintenances)
        .set({
            ...maintenanceData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId))
        .returning();

    return result[0];
}

export async function completeMaintenance(maintenanceId: string, completeData: IUpdateMaintenance) {
    const maintenance = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, maintenanceId))
        .limit(1);

    if (!maintenance[0]) throw new Error('Manutenção não encontrada');

    const result = await db
        .update(maintenances)
        .set({
            ...completeData,
            exit_date: new Date().toISOString(),
            status: 'completed',
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId))
        .returning();

    // Retornar veículo para disponível
    await db
        .update(vehicles)
        .set({ status: 'available', updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, maintenance[0].vehicle_id));

    return result[0];
}

export async function deleteMaintenance(maintenanceId: string) {
    await db
        .update(maintenances)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId));

    return maintenanceId;
}

export async function getActiveMaintenances() {
    const result = await db
        .select()
        .from(maintenances)
        .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
        .where(
            and(
                eq(maintenances.status, 'in_progress'),
                isNull(maintenances.deleted_at)
            )
        );

    return result;
}