// ========================================
// FILE: src/lib/db/queries/maintenances.queries.ts (ATUALIZADO)
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { maintenances, vehicles, maintenance_categories, workshops } from '@/lib/db/schemas';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateMaintenance, IUpdateMaintenance, IMaintenance } from '@/lib/types/maintenance';

/**
 * ✅ Busca manutenção por ID completo (com joins)
 */
export async function getMaintenanceById(maintenanceId: string): Promise<IMaintenance | null> {
    const { db } = useDb();
    
    const result = await db
        .select({
            id: maintenances.id,
            vehicle_id: maintenances.vehicle_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            category_id: maintenances.category_id,
            category_name: maintenance_categories.name,
            category_type: maintenance_categories.type,
            category_color: maintenance_categories.color,
            workshop_id: maintenances.workshop_id,
            workshop_name: workshops.name,
            type: maintenances.type,
            entry_date: maintenances.entry_date,
            exit_date: maintenances.exit_date,
            vehicle_mileage: maintenances.vehicle_mileage,
            description: maintenances.description,
            diagnosis: maintenances.diagnosis,
            solution: maintenances.solution,
            parts_cost: maintenances.parts_cost,
            labor_cost: maintenances.labor_cost,
            total_cost: maintenances.total_cost,
            status: maintenances.status,
            priority: maintenances.priority,
            work_order_number: maintenances.work_order_number,
            notes: maintenances.notes,
            created_at: maintenances.created_at,
            updated_at: maintenances.updated_at,
        })
        .from(maintenances)
        .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
        .leftJoin(maintenance_categories, eq(maintenances.category_id, maintenance_categories.id))
        .leftJoin(workshops, eq(maintenances.workshop_id, workshops.id))
        .where(
            and(
                eq(maintenances.id, maintenanceId),
                isNull(maintenances.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

/**
 * Cria nova manutenção
 */
export async function createMaintenance(maintenanceData: ICreateMaintenance): Promise<IMaintenance> {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

    // Calcular custo total
    const partsCost = maintenanceData.parts_cost || 0;
    const laborCost = maintenanceData.labor_cost || 0;
    const totalCost = partsCost + laborCost;

    // Determinar status (padrão: scheduled, ou o fornecido)
    const status = maintenanceData.status || 'scheduled';

    await db.insert(maintenances).values({
        id,
        entry_date: new Date().toISOString(),
        status: status,
        priority: maintenanceData.priority || 'normal',
        parts_cost: partsCost,
        labor_cost: laborCost,
        total_cost: totalCost,
        work_order_number: maintenanceData.work_order_number || null,
        vehicle_id: maintenanceData.vehicle_id,
        category_id: maintenanceData.category_id,
        workshop_id: maintenanceData.workshop_id || null,
        type: maintenanceData.type,
        vehicle_mileage: maintenanceData.vehicle_mileage,
        description: maintenanceData.description,
        notes: maintenanceData.notes || null,
    });

    // Atualizar status do veículo se status for in_progress
    if (status === 'in_progress') {
        await db
            .update(vehicles)
            .set({ status: 'maintenance', updated_at: new Date().toISOString() })
            .where(eq(vehicles.id, maintenanceData.vehicle_id));
    }

    // ✅ Retornar manutenção completa
    return await getMaintenanceById(id) as IMaintenance;
}

/**
 * Obtém todas as manutenções
 */
export async function getAllMaintenances(): Promise<IMaintenance[]> {
    const { db } = useDb();
    const result = await db
        .select({
            id: maintenances.id,
            vehicle_id: maintenances.vehicle_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            category_id: maintenances.category_id,
            category_name: maintenance_categories.name,
            category_type: maintenance_categories.type,
            category_color: maintenance_categories.color,
            workshop_id: maintenances.workshop_id,
            workshop_name: workshops.name,
            type: maintenances.type,
            entry_date: maintenances.entry_date,
            exit_date: maintenances.exit_date,
            vehicle_mileage: maintenances.vehicle_mileage,
            description: maintenances.description,
            diagnosis: maintenances.diagnosis,
            solution: maintenances.solution,
            parts_cost: maintenances.parts_cost,
            labor_cost: maintenances.labor_cost,
            total_cost: maintenances.total_cost,
            status: maintenances.status,
            priority: maintenances.priority,
            work_order_number: maintenances.work_order_number,
            notes: maintenances.notes,
            created_at: maintenances.created_at,
            updated_at: maintenances.updated_at,
        })
        .from(maintenances)
        .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
        .leftJoin(maintenance_categories, eq(maintenances.category_id, maintenance_categories.id))
        .leftJoin(workshops, eq(maintenances.workshop_id, workshops.id))
        .where(isNull(maintenances.deleted_at))
        .orderBy(desc(maintenances.created_at));

    return result;
}

/**
 * Atualiza manutenção
 */
export async function updateMaintenance(maintenanceId: string, maintenanceData: IUpdateMaintenance): Promise<IMaintenance | null> {
    const { db } = useDb();
    
    // Buscar a manutenção actual
    const current = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, maintenanceId))
        .limit(1);

    if (!current[0]) {
        throw new Error('maintenances:errors.maintenanceNotFound');
    }

    // Calcular total se parts_cost ou labor_cost foram fornecidos
    let updateData: any = { ...maintenanceData };
    
    if (maintenanceData.parts_cost !== undefined || maintenanceData.labor_cost !== undefined) {
        const partsCost = maintenanceData.parts_cost ?? current[0].parts_cost;
        const laborCost = maintenanceData.labor_cost ?? current[0].labor_cost;
        updateData.total_cost = partsCost + laborCost;
    }

    // Atualizar a manutenção
    await db
        .update(maintenances)
        .set({
            ...updateData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId));

    // Se o status mudou para in_progress, atualizar veículo para maintenance
    if (maintenanceData.status === 'in_progress' && current[0].status !== 'in_progress') {
        await db
            .update(vehicles)
            .set({ status: 'maintenance', updated_at: new Date().toISOString() })
            .where(eq(vehicles.id, current[0].vehicle_id));
    }

    // ✅ Retornar manutenção completa
    return await getMaintenanceById(maintenanceId);
}

/**
 * Completa manutenção
 */
export async function completeMaintenance(maintenanceId: string, completeData: IUpdateMaintenance): Promise<IMaintenance | null> {
    const { db } = useDb();
    
    const maintenance = await db
        .select()
        .from(maintenances)
        .where(eq(maintenances.id, maintenanceId))
        .limit(1);

    if (!maintenance[0]) {
        throw new Error('maintenances:errors.maintenanceNotFound');
    }

    // Calcular total final
    const partsCost = completeData.parts_cost ?? maintenance[0].parts_cost;
    const laborCost = completeData.labor_cost ?? maintenance[0].labor_cost;
    const totalCost = partsCost + laborCost;

    await db
        .update(maintenances)
        .set({
            ...completeData,
            parts_cost: partsCost,
            labor_cost: laborCost,
            total_cost: totalCost,
            exit_date: new Date().toISOString(),
            status: 'completed',
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId));

    // Retornar veículo para disponível
    await db
        .update(vehicles)
        .set({ status: 'available', updated_at: new Date().toISOString() })
        .where(eq(vehicles.id, maintenance[0].vehicle_id));

    // ✅ Retornar manutenção completa
    return await getMaintenanceById(maintenanceId);
}

export async function getMaintenancesByWorkshop(workshopId: string) {
    const { db } = useDb();
    const result = await db
        .select()
        .from(maintenances)
        .where(and(
            eq(maintenances.workshop_id, workshopId),
            isNull(maintenances.deleted_at)
        ));
    return result;
}

/**
 * Deleta (soft delete) manutenção
 */
export async function deleteMaintenance(maintenanceId: string): Promise<string> {
    const { db } = useDb();
    
    await db
        .update(maintenances)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(maintenances.id, maintenanceId));

    return maintenanceId;
}

/**
 * Obtém manutenções activas
 */
export async function getActiveMaintenances(): Promise<IMaintenance[]> {
    const { db } = useDb();
    const result = await db
        .select({
             id: maintenances.id,
            vehicle_id: maintenances.vehicle_id,
            vehicle_license: vehicles.license_plate,
            vehicle_brand: vehicles.brand,
            vehicle_model: vehicles.model,
            category_id: maintenances.category_id,
            category_name: maintenance_categories.name,
            category_type: maintenance_categories.type,
            category_color: maintenance_categories.color,
            workshop_id: maintenances.workshop_id,
            workshop_name: workshops.name,
            type: maintenances.type,
            entry_date: maintenances.entry_date,
            exit_date: maintenances.exit_date,
            vehicle_mileage: maintenances.vehicle_mileage,
            description: maintenances.description,
            diagnosis: maintenances.diagnosis,
            solution: maintenances.solution,
            parts_cost: maintenances.parts_cost,
            labor_cost: maintenances.labor_cost,
            total_cost: maintenances.total_cost,
            status: maintenances.status,
            priority: maintenances.priority,
            work_order_number: maintenances.work_order_number,
            notes: maintenances.notes,
            created_at: maintenances.created_at,
            updated_at: maintenances.updated_at,
        })
        .from(maintenances)
        .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
        .leftJoin(maintenance_categories, eq(maintenances.category_id, maintenance_categories.id))
        .where(
            and(
                eq(maintenances.status, 'in_progress'),
                isNull(maintenances.deleted_at)
            )
        )
        .orderBy(desc(maintenances.entry_date));

    return result;
}