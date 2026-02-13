// src/lib/db/queries/vehicles.queries.ts
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { vehicles, VehicleStatus, vehicleStatus } from '@/lib/db/schemas/vehicles';
import { vehicle_categories } from '@/lib/db/schemas/vehicle_categories';
import { generateUuid } from '@/lib/utils/cripto';
import { eq, and, isNull, desc, or, like, count, SQL } from 'drizzle-orm';
import { ICreateVehicle, IUpdateVehicle, IVehicle, IUpdateStatus } from '@/lib/types/vehicle';
import { IPaginatedResult, IPaginationParams } from '@/lib/types/pagination';

/**
 * Criar novo veículo
 */
export async function createVehicle(vehicleData: ICreateVehicle): Promise<IVehicle> {
    await checkAndRotate();
    const { db } = useDb();
    const id = generateUuid();

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
            status: vehicles.status,
            is_active: vehicles.is_active,
            photo: vehicles.photo,
            notes: vehicles.notes,
            fuel_tank_capacity: vehicles.fuel_tank_capacity,
            chassis_number: vehicles.chassis_number,
            engine_number: vehicles.engine_number,
            current_mileage: vehicles.current_mileage,
            acquisition_date: vehicles.acquisition_date,
            acquisition_value: vehicles.acquisition_value,
            updated_at: vehicles.updated_at,
            created_at: vehicles.created_at,
            deleted_at: vehicles.deleted_at
        });

    return result[0];
}


export async function findVehicleByLicensePlate(license_plate: string) {
    const { db } = useDb();
    const result = await db 
        .select({
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
        })
        .from(vehicles)
        .where(eq(vehicles.license_plate, license_plate))
    return result[0];
}

/**
 * Buscar todos os veículos com paginação e filtros
 */
export async function getAllVehicles(params: IPaginationParams = {}): Promise<IPaginatedResult<IVehicle>> {
    const { db } = useDb();
    
    // Valores padrão para paginação
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    // Construir condições de filtro
    const conditions: SQL[] = [isNull(vehicles.deleted_at)];

    // Filtro de busca (procura em license_plate, brand, model)
    if (params.search && params.search.trim()) {
        const searchTerm = `%${params.search.toLowerCase()}%`;
        conditions.push(
            or(
                like(vehicles.license_plate, searchTerm),
                like(vehicles.brand, searchTerm),
                like(vehicles.model, searchTerm)
            )!
        );
    }

    // Filtro de status
    if (params.status && params.status !== 'all') {
        conditions.push(eq(vehicles.status, params.status));
    }

    // Filtro de categoria
    if (params.category_id && params.category_id !== 'all') {
        conditions.push(eq(vehicles.category_id, params.category_id));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Contar total de registros
    const [countResult] = await db
        .select({ total: count() })
        .from(vehicles)
        .where(whereClause);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    // Buscar dados paginados
    const data = await db
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
            status: vehicles.status,
            photo: vehicles.photo,
            is_active: vehicles.is_active,
            notes: vehicles.notes,
            fuel_tank_capacity: vehicles.fuel_tank_capacity,
            chassis_number: vehicles.chassis_number,
            engine_number: vehicles.engine_number,
            current_mileage: vehicles.current_mileage,
            acquisition_date: vehicles.acquisition_date,
            acquisition_value: vehicles.acquisition_value,
            updated_at: vehicles.updated_at,
            created_at: vehicles.created_at,
        })
        .from(vehicles)
        .leftJoin(vehicle_categories, eq(vehicles.category_id, vehicle_categories.id))
        .where(whereClause)
        .orderBy(desc(vehicles.created_at))
        .limit(limit)
        .offset(offset);

    return {
        data: data as IVehicle[],
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
}

/**
 * Buscar veículo por ID
 */
export async function findVehicleById(vehicleId: string) {
    const { db } = useDb();
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
 * Actualizar veículo
 */
export async function updateVehicle(vehicleId: string, vehicleData: IUpdateVehicle) {

    console.log("Update Vehicle: ", vehicleData);
    const { db } = useDb();
    const result = await db
        .update(vehicles)
        .set({
            ...vehicleData,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId))

    return await findVehicleById(vehicleId);
}


/**
 * Deletar veículo (soft delete)
 */
export async function deleteVehicle(vehicleId: string) {
    const { db } = useDb();
    await db
        .update(vehicles)
        .set({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: vehicleStatus.INACTIVE
        })
        .where(eq(vehicles.id, vehicleId));

    return vehicleId;
}

/**
 * Buscar veículos disponíveis
 */
export async function getAvailableVehicles() {
    const { db } = useDb();
    const result = await db
        .select({
            id: vehicles.id,
            license_plate: vehicles.license_plate,
            brand: vehicles.brand,
            current_mileage: vehicles.current_mileage,
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
 * Actualizar status do veículo
 */
export async function updateVehicleStatus(vehicleId: string, data: IUpdateStatus) {
    const { db } = useDb();
    const result = await db
        .update(vehicles)
        .set({
            status: data.status,
            notes: data.notes,
            updated_at: new Date().toISOString(),
        })
        .where(eq(vehicles.id, vehicleId))


    return await findVehicleById(vehicleId);
}

/**
 * Atualizar quilometragem
 */
export async function updateVehicleMileage(vehicleId: string, newMileage: number) {
    const { db } = useDb();
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
    const { db } = useDb();
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
    const { db } = useDb();
    const result = await db
        .select({
            status: vehicles.status,
            count: count(vehicles.id).as("vehicle_count"),
        })
        .from(vehicles)
        .where(isNull(vehicles.deleted_at))
        .groupBy(vehicles.status);
    return result;
}