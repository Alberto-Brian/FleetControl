// ========================================
// FILE: src/lib/types/refueling.ts
// ========================================
import { FuelType } from '../db/schemas/refuelings';

// ─────────────────────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────────────────────

export interface IRefueling {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  trip_id: string | null;
  station_id: string | null;
  refueling_date: string;
  fuel_type: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  current_mileage: number;
  is_full_tank: boolean;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Vehicle
  vehicle_license?: string;
  vehicle_brand?: string;
  vehicle_model?: string;

  // Driver
  driver_name?: string;

  // Fuel Station
  station_name?: string;
  station_brand?: string;
  station_city?: string;

  // Trip
  trip_code?: string;
  trip_destination?: string;
  trip_origin?: string;
  trip_start_date?: string;
  trip_status?: string;
  trip_driver_id?: string;

  // Route
  route_name?: string;
  route_origin?: string;
  route_destination?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

export interface ICreateRefueling {
  vehicle_id: string;
  driver_id?: string;
  trip_id?: string;
  station_id?: string;
  fuel_type: FuelType;
  liters: number;
  price_per_liter: number;
  current_mileage: number;
  is_full_tank: boolean;
  invoice_number?: string;
  notes?: string;
  /** Omitir para usar now() — útil para importações históricas */
  refueling_date?: string;
}

export type IUpdateRefueling = Partial<Omit<
  ICreateRefueling,
  'vehicle_id'              // veículo não pode mudar após criação
>>;

// ─────────────────────────────────────────────────────────────────────────────
// Pagination / Filters
// ─────────────────────────────────────────────────────────────────────────────

export interface IRefuelingsPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Filtrar por tipo de combustível */
  fuel_type?: FuelType | 'all';
  /** Filtrar por veículo */
  vehicle_id?: string;
  /** Filtrar por motorista */
  driver_id?: string;
  /** Filtrar por posto */
  station_id?: string;
  /** Apenas abastecimentos com tanque cheio */
  full_tank_only?: boolean;
  /** Data início (YYYY-MM-DD) */
  from_date?: string;
  /** Data fim (YYYY-MM-DD) */
  to_date?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats (usadas pelo FuelReportPDF e dashboards)
// ─────────────────────────────────────────────────────────────────────────────

export interface IRefuelingStats {
  totalCount: number;
  totalLiters: number;
  totalCost: number;
  avgPricePerLiter: number;
  avgLitersPerRefueling: number;
  /** Top veículos por litros consumidos */
  topVehicles: { vehicle_id: string; vehicle_license: string; totalLiters: number; totalCost: number }[];
  /** Top postos por litros abastecidos */
  topStations: { station_id: string; station_name: string; totalLiters: number; totalCost: number }[];
  /** Consumo por tipo de combustível */
  byFuelType: { fuel_type: string; totalLiters: number; totalCost: number; count: number }[];
  /** Evolução mensal (últimos 12 meses) */
  byMonth: { month: string; totalLiters: number; totalCost: number; count: number }[];
}