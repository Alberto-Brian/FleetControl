// src/lib/db/queries/vehicles.queries.ts
import { dbManager, db } from '@/lib/db/db_client';
import { vehicles, VehicleStatus } from '@/lib/db/schemas/vehicles';
import { vehicle_categories } from '@/lib/db/schemas/vehicle_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { ICreateVehicle, IUpdateVehicle } from '@/lib/types/vehicle';

/**
 * Criar novo veículo
 */
export async function createVehicle(vehicleData: ICreateVehicle) {
    const id = generateUuid();
    
    // Verificar se precisa rotacionar antes de inserir
    if (dbManager.shouldRotate()) {
        console.log('🔄 Limite atingido, rotacionando...');
        dbManager.rotate();
    }

    const result = await db
        .insert(vehicles)
        .values({
            id: id,
            category_id: vehicleData.category_id,
            license_plate: vehicleData.license_plate,
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year,
            color: vehicleData.color,
            chassis_number: vehicleData.chassis_number,
            engine_number: vehicleData.engine_number,
            fuel_tank_capacity: vehicleData.fuel_tank_capacity,
            current_mileage: vehicleData.current_mileage || 0,
            acquisition_date: vehicleData.acquisition_date,
            acquisition_value: vehicleData.acquisition_value,
            status: 'available',
            photo: vehicleData.photo,
            notes: vehicleData.notes,
            is_active: true,
        })
        .returning({
            id: vehicles.id,
            category_id: vehicles.category_id,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            year: vehicles.year,
            color: vehicles.color,
            current_mileage: vehicles.current_mileage,
            status: vehicles.status,
            photo: vehicles.photo,
            created_at: vehicles.created_at,
        });

    return result[0];
}

/**
 * Buscar todos os veículos (ativos)
 */
export async function getAllVehicles() {
    const result = await db
        .select({
            id: vehicles.id,
            category_id: vehicles.category_id,
            category_name: vehicle_categories.name,
            category_color: vehicle_categories.color,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            year: vehicles.year,
            color: vehicles.color,
            current_mileage: vehicles.current_mileage,
            status: vehicles.status,
            photo: vehicles.photo,
            is_active: vehicles.is_active,
            created_at: vehicles.created_at,
        })
        .from(vehicles)
        .leftJoin(vehicle_categories, eq(vehicles.category_id, vehicle_categories.id))
        .where(isNull(vehicles.deleted_at))
        .orderBy(desc(vehicles.created_at));

    return result;
}

/**
 * Buscar veículo por ID
 */
export async function getVehicleById(vehicleId: string) {
    const result = await db
        .select({
            id: vehicles.id,
            category_id: vehicles.category_id,
            category_name: vehicle_categories.name,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            year: vehicles.year,
            color: vehicles.color,
            chassis_number: vehicles.chassis_number,
            engine_number: vehicles.engine_number,
            fuel_tank_capacity: vehicles.fuel_tank_capacity,
            current_mileage: vehicles.current_mileage,
            acquisition_date: vehicles.acquisition_date,
            acquisition_value: vehicles.acquisition_value,
            status: vehicles.status,
            photo: vehicles.photo,
            notes: vehicles.notes,
            is_active: vehicles.is_active,
            created_at: vehicles.created_at,
            updated_at: vehicles.updated_at,
        })
        .from(vehicles)
        .leftJoin(vehicle_categories, eq(vehicles.category_id, vehicle_categories.id))
        .where(
            and(
                eq(vehicles.id, vehicleId),
                isNull(vehicles.deleted_at)
            )
        )
        .limit(1);

    return result[0] || null;
}

/**
 * Atualizar veículo
 */
export async function updateVehicle(vehicleId: string, vehicleData: IUpdateVehicle) {
    const result = await db
        .update(vehicles)
        .set({
            ...vehicleData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId))
        .returning({
            id: vehicles.id,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            status: vehicles.status,
            updated_at: vehicles.updated_at,
        });

    return result[0];
}

/**
 * Deletar veículo (soft delete)
 */
export async function deleteVehicle(vehicleId: string) {
    await db
        .update(vehicles)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId));

    return vehicleId;
}

/**
 * Buscar veículos disponíveis
 */
export async function getAvailableVehicles() {
    const result = await db
        .select({
            id: vehicles.id,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            year: vehicles.year,
            category_name: vehicle_categories.name,
        })
        .from(vehicles)
        .leftJoin(vehicle_categories, eq(vehicles.category_id, vehicle_categories.id))
        .where(
            and(
                eq(vehicles.status, 'available'),
                isNull(vehicles.deleted_at)
            )
        );

    return result;
}

/**
 * Atualizar status do veículo
 */
export async function updateVehicleStatus(vehicleId: string, status: VehicleStatus) {
    const result = await db
        .update(vehicles)
        .set({
            status: status,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId))
        .returning({
            id: vehicles.id,
            status: vehicles.status,
        });

    return result[0];
}

/**
 * Atualizar quilometragem
 */
export async function updateVehicleMileage(vehicleId: string, newMileage: number) {
    const result = await db
        .update(vehicles)
        .set({
            current_mileage: newMileage,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId))
        .returning({
            id: vehicles.id,
            current_mileage: vehicles.current_mileage,
        });

    return result[0];
}

/**
 * Buscar veículos por categoria
 */
export async function getVehiclesByCategory(categoryId: string) {
    const result = await db
        .select({
            id: vehicles.id,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            model: vehicles.model,
            year: vehicles.year,
            status: vehicles.status,
        })
        .from(vehicles)
        .where(
            and(
                eq(vehicles.category_id, categoryId),
                isNull(vehicles.deleted_at)
            )
        );

    return result;
}

/**
 * Contar veículos por status
 */
export async function countVehiclesByStatus() {
    const result = await db
        .select({
            status: vehicles.status,
            // count: db.$count(vehicles.id),
            count: db.count(vehicles.id).as("vehicle_count"),
        })
        .from(vehicles)
        .where(isNull(vehicles.deleted_at))
        .groupBy(vehicles.status);
    return result;
}