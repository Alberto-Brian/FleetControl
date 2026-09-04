// ========================================
// FILE: src/lib/db/queries/reports.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first) — reescrita do módulo de
// Relatórios, feita a par do Dashboard (ver dashboard.queries.powersync.ts
// para o motivo de não ter esperado pelo Prompt 6.9). `reports.queries.ts`
// (Drizzle/app.db) não tocado, fica como backup/referência.
//
// `fines` cortou no Prompt 6.9 — sem seam nenhum neste ficheiro.
// `vehicle_categories` local tornou-se a tabela unificada `categories`
// (type='vehicle') no Prompt 6.4 — os JOINs abaixo já reflectem isso.
import { getPowerSyncDb } from '@/lib/powersync/client';

// ==================== VEHICLES REPORT ====================

export async function getVehiclesReportData(startDate: string, endDate: string) {
  const db = await getPowerSyncDb();

  const vehiclesList = await db.getAll<{
    id: string; license_plate: string; brand: string; model: string; year: number; status: string;
    current_mileage: number; category_name: string | null; category_color: string | null;
  }>(
    `SELECT v.id, v.license_plate, v.brand, v.model, v.year, v.status, v.current_mileage,
            c.name as category_name, c.color as category_color
     FROM vehicles v
     LEFT JOIN categories c ON c.id = v.category_id AND c.type = 'vehicle'
     WHERE v.deleted_at IS NULL AND v.is_active = 1 AND v.created_at >= ? AND v.created_at <= ?
     ORDER BY v.license_plate`,
    [startDate, endDate + ' 23:59:59'],
  );

  const totalMileage = vehiclesList.reduce((sum, v) => sum + (v.current_mileage || 0), 0);

  const byCategoryMap = new Map<string, { name: string; color: string | null; count: number }>();
  for (const v of vehiclesList) {
    const cat = v.category_name || 'Sem Categoria';
    const cur = byCategoryMap.get(cat) ?? { name: cat, color: v.category_color, count: 0 };
    cur.count++;
    byCategoryMap.set(cat, cur);
  }

  const stats = {
    total: vehiclesList.length,
    available: vehiclesList.filter(v => v.status === 'available').length,
    inUse: vehiclesList.filter(v => v.status === 'in_use').length,
    maintenance: vehiclesList.filter(v => v.status === 'maintenance').length,
    inactive: vehiclesList.filter(v => v.status === 'inactive').length,
    totalMileage,
    byCategory: Array.from(byCategoryMap.values()).map(c => ({ ...c, percentage: (c.count / vehiclesList.length) * 100 })),
    byStatus: [
      { status: 'available', count: vehiclesList.filter(v => v.status === 'available').length },
      { status: 'in_use', count: vehiclesList.filter(v => v.status === 'in_use').length },
      { status: 'maintenance', count: vehiclesList.filter(v => v.status === 'maintenance').length },
      { status: 'inactive', count: vehiclesList.filter(v => v.status === 'inactive').length },
    ].map(s => ({ ...s, percentage: (s.count / vehiclesList.length) * 100 })),
  };

  return { vehicles: vehiclesList, stats };
}

// ==================== DRIVERS REPORT ====================

export async function getDriversReportData(startDate: string, endDate: string) {
  try {
    const db = await getPowerSyncDb();

    const allDrivers = await db.getAll<{
      id: string; name: string; license_number: string; phone: string | null; status: string; availability: string;
    }>(`SELECT id, name, license_number, phone, status, availability FROM drivers WHERE is_active = 1`);

    if (allDrivers.length === 0) {
      return {
        drivers: [],
        stats: {
          total: 0, active: 0, onLeave: 0, terminated: 0, available: 0, onTrip: 0, offline: 0,
          totalTrips: 0, totalDistance: 0, topDrivers: [], byAvailability: [],
        },
      };
    }

    const activeTrips = await db.getAll<{ driver_id: string }>(
      `SELECT driver_id FROM trips WHERE status = 'in_progress' AND driver_id IS NOT NULL AND end_date IS NULL`,
    );
    const driversOnTripNow = new Set(activeTrips.map(t => t.driver_id));

    const tripsByDriver = await db.getAll<{ driver_id: string; trip_count: number; total_km: number }>(
      `SELECT driver_id, COUNT(id) as trip_count, COALESCE(SUM(end_mileage - start_mileage),0) as total_km
       FROM trips WHERE start_date >= ? AND start_date <= ? AND driver_id IS NOT NULL
       GROUP BY driver_id`, [startDate, endDate],
    );
    const tripsMap = new Map(tripsByDriver.map(t => [t.driver_id, { total_trips: Number(t.trip_count) || 0, total_distance: Number(t.total_km) || 0 }]));

    const driversList = allDrivers.map(driver => {
      let realAvailability: 'available' | 'on_trip' | 'offline';
      if (driver.status === 'terminated' || driver.status === 'on_leave') {
        realAvailability = 'offline';
      } else if (driversOnTripNow.has(driver.id)) {
        realAvailability = 'on_trip';
      } else {
        const dbAvailability = driver.availability as 'available' | 'on_trip' | 'offline' | null;
        realAvailability = dbAvailability && dbAvailability !== 'on_trip' ? dbAvailability : 'offline';
      }

      return {
        id: driver.id, name: driver.name || '', license_number: driver.license_number || '', phone: driver.phone || '',
        status: (driver.status || 'active') as 'active' | 'on_leave' | 'terminated', availability: realAvailability,
        total_trips: tripsMap.get(driver.id)?.total_trips || 0, total_distance: tripsMap.get(driver.id)?.total_distance || 0,
      };
    }).sort((a, b) => b.total_distance - a.total_distance);

    const totalDrivers = allDrivers.length;
    const activeCount = allDrivers.filter(d => d.status === 'active').length;
    const onLeaveCount = allDrivers.filter(d => d.status === 'on_leave').length;
    const terminatedCount = allDrivers.filter(d => d.status === 'terminated').length;

    const activeContractDrivers = driversList.filter(d => d.status === 'active');
    const onTripCount = activeContractDrivers.filter(d => d.availability === 'on_trip').length;
    const availableCount = activeContractDrivers.filter(d => d.availability === 'available').length;
    const offlineCount = activeContractDrivers.filter(d => d.availability === 'offline').length;

    const totalTripsResult = await db.get<{ count: number; distance: number }>(
      `SELECT COUNT(*) as count, COALESCE(SUM(end_mileage - start_mileage),0) as distance
       FROM trips WHERE start_date >= ? AND start_date <= ?`, [startDate, endDate],
    );
    const totalTrips = Number(totalTripsResult.count || 0);
    const totalDistance = Number(totalTripsResult.distance || 0);

    const topDrivers = driversList.filter(d => d.total_trips > 0).slice(0, 5)
      .map(d => ({ name: d.name, totalTrips: d.total_trips, totalDistance: d.total_distance }));

    const byAvailability = [
      { status: 'available', count: availableCount, percentage: Math.round((availableCount / (activeCount || 1)) * 100 * 10) / 10 },
      { status: 'on_trip', count: onTripCount, percentage: Math.round((onTripCount / (activeCount || 1)) * 100 * 10) / 10 },
      { status: 'offline', count: offlineCount, percentage: Math.round((offlineCount / (activeCount || 1)) * 100 * 10) / 10 },
    ].filter(s => s.count > 0);

    return {
      drivers: driversList,
      stats: {
        total: totalDrivers, active: activeCount, onLeave: onLeaveCount, terminated: terminatedCount,
        available: availableCount, onTrip: onTripCount, offline: offlineCount,
        totalTrips, totalDistance, topDrivers, byAvailability,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados de motoristas:', error);
    throw error;
  }
}

// ==================== TRIPS REPORT ====================

export async function getTripsReportData(startDate: string, endDate: string) {
  const db = await getPowerSyncDb();

  const tripsList = await db.getAll<{
    id: string; origin: string | null; destination: string | null; start_date: string; end_date: string | null;
    status: string; start_mileage: number; end_mileage: number | null; vehicle_plate: string | null; driver_name: string | null;
  }>(
    `SELECT t.id, t.origin, t.destination, t.start_date, t.end_date, t.status, t.start_mileage, t.end_mileage,
            v.license_plate as vehicle_plate, d.name as driver_name
     FROM trips t
     LEFT JOIN vehicles v ON v.id = t.vehicle_id
     LEFT JOIN drivers d ON d.id = t.driver_id
     WHERE t.deleted_at IS NULL AND t.start_date >= ? AND t.start_date <= ?
     ORDER BY t.start_date`, [startDate, endDate],
  );

  const tripsWithDistance = tripsList.map(t => ({ ...t, distance: t.end_mileage && t.start_mileage ? t.end_mileage - t.start_mileage : 0 }));
  const totalDistance = tripsWithDistance.reduce((sum, t) => sum + t.distance, 0);

  const stats = {
    total: tripsList.length,
    completed: tripsList.filter(t => t.status === 'completed').length,
    inProgress: tripsList.filter(t => t.status === 'in_progress').length,
    cancelled: tripsList.filter(t => t.status === 'cancelled').length,
    totalDistance,
    avgDistance: tripsList.length > 0 ? totalDistance / tripsList.length : 0,
  };

  return { trips: tripsWithDistance, stats };
}

// ==================== FUEL REPORT ====================

export async function getFuelReportData(startDate: string, endDate: string) {
  const db = await getPowerSyncDb();

  const refuelingsList = await db.getAll<{
    id: string; refueling_date: string; liters: number; price_per_liter: number; total_cost: number; vehicle_plate: string | null;
  }>(
    `SELECT r.id, r.refueling_date, r.liters, r.price_per_liter, r.total_cost, v.license_plate as vehicle_plate
     FROM fuel r
     LEFT JOIN vehicles v ON v.id = r.vehicle_id
     WHERE r.deleted_at IS NULL AND r.refueling_date >= ? AND r.refueling_date <= ?
     ORDER BY r.refueling_date`, [startDate, endDate],
  );

  const totalLiters = refuelingsList.reduce((sum, r) => sum + (r.liters || 0), 0);
  const totalCost = refuelingsList.reduce((sum, r) => sum + (r.total_cost || 0), 0);

  const vehicleMap = new Map<string, { vehicle_plate: string; totalLiters: number; totalCost: number }>();
  for (const r of refuelingsList) {
    const plate = r.vehicle_plate || 'Sem Veículo';
    const cur = vehicleMap.get(plate) ?? { vehicle_plate: plate, totalLiters: 0, totalCost: 0 };
    cur.totalLiters += r.liters || 0;
    cur.totalCost += r.total_cost || 0;
    vehicleMap.set(plate, cur);
  }
  const topVehicles = Array.from(vehicleMap.values()).sort((a, b) => b.totalCost - a.totalCost);

  return { refuelings: refuelingsList, stats: { total: refuelingsList.length, totalLiters, totalCost, topVehicles } };
}

// ==================== MAINTENANCE REPORT ====================

export async function getMaintenanceReportData(startDate: string, endDate: string) {
  const db = await getPowerSyncDb();

  const maintenancesList = await db.getAll<{
    id: string; entry_date: string; description: string; type: string; status: string; total_cost: number; vehicle_plate: string | null;
  }>(
    `SELECT m.id, m.entry_date, m.description, m.type, m.status, m.total_cost, v.license_plate as vehicle_plate
     FROM maintenance m
     LEFT JOIN vehicles v ON v.id = m.vehicle_id
     WHERE m.deleted_at IS NULL AND m.entry_date >= ? AND m.entry_date <= ?
     ORDER BY m.entry_date`, [startDate, endDate],
  );

  const totalCost = maintenancesList.reduce((sum, m) => sum + (m.total_cost || 0), 0);

  const stats = {
    total: maintenancesList.length,
    preventive: maintenancesList.filter(m => m.type === 'preventive').length,
    corrective: maintenancesList.filter(m => m.type === 'corrective').length,
    completed: maintenancesList.filter(m => m.status === 'completed').length,
    inProgress: maintenancesList.filter(m => m.status === 'in_progress').length,
    totalCost,
  };

  return { maintenances: maintenancesList, stats };
}

// ==================== FINANCIAL REPORT ====================

export async function getFinancialReportData(startDate: string, endDate: string) {
  const db = await getPowerSyncDb();

  const expensesList = await db.getAll<{
    id: string; expense_date: string; description: string; amount: number; status: string; category_name: string | null;
  }>(
    `SELECT e.id, e.expense_date, e.description, e.amount, e.status, c.name as category_name
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id AND c.type = 'expense'
     WHERE e.deleted_at IS NULL AND e.expense_date >= ? AND e.expense_date <= ?
     ORDER BY e.expense_date`, [startDate, endDate],
  );

  const fuelData = await getFuelReportData(startDate, endDate);
  const maintenanceData = await getMaintenanceReportData(startDate, endDate);

  const finesRow = await db.get<{ total_cost: number }>(
    `SELECT COALESCE(SUM(fine_amount),0) as total_cost FROM fines WHERE deleted_at IS NULL AND fine_date >= ? AND fine_date <= ?`,
    [startDate, endDate],
  );
  const finesTotal = finesRow?.total_cost || 0;

  const expensesTotal = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryMap = new Map<string, { name: string; count: number; total: number }>();
  for (const e of expensesList) {
    const cat = e.category_name || 'Sem Categoria';
    const cur = categoryMap.get(cat) ?? { name: cat, count: 0, total: 0 };
    cur.count++;
    cur.total += e.amount || 0;
    categoryMap.set(cat, cur);
  }
  const byCategory = Array.from(categoryMap.values()).map(c => ({ ...c, percentage: expensesTotal > 0 ? (c.total / expensesTotal) * 100 : 0 }));

  const stats = {
    fuel: fuelData.stats.totalCost,
    maintenance: maintenanceData.stats.totalCost,
    expenses: expensesTotal,
    fines: finesTotal,
    total: fuelData.stats.totalCost + maintenanceData.stats.totalCost + expensesTotal + finesTotal,
    byCategory,
  };

  return { expenses: expensesList, stats };
}

// ==================== EXPENSES DETAILED REPORT ====================

export type ExpenseDateField = 'expense_date' | 'due_date' | 'payment_date' | 'created_at';

export async function getExpensesReportData(
  startDate: string,
  endDate: string,
  dateField: ExpenseDateField = 'expense_date',
) {
  const db = await getPowerSyncDb();

  // dateField vem sempre de um conjunto fixo de literais (nunca do
  // utilizador directamente) — seguro interpolar o nome da coluna.
  const expensesList = await db.getAll<{
    id: string; expense_date: string; due_date: string | null; payment_date: string | null; created_at: string;
    description: string; amount: number; status: string; supplier: string | null; document_number: string | null;
    category_name: string | null; category_color: string | null;
  }>(
    `SELECT e.id, e.expense_date, e.due_date, e.payment_date, e.created_at, e.description, e.amount, e.status,
            e.supplier, e.document_number, c.name as category_name, c.color as category_color
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id AND c.type = 'expense'
     WHERE e.deleted_at IS NULL AND e.${dateField} >= ? AND e.${dateField} <= ?
     ORDER BY e.${dateField}`, [startDate, endDate],
  );

  const total = expensesList.reduce((s, e) => s + (e.amount ?? 0), 0);

  const catMap = new Map<string, { name: string; color?: string | null; total: number; count: number }>();
  for (const e of expensesList) {
    const key = e.category_name ?? 'Sem Categoria';
    const cur = catMap.get(key) ?? { name: key, color: e.category_color, total: 0, count: 0 };
    cur.total += e.amount ?? 0;
    cur.count++;
    catMap.set(key, cur);
  }
  const byCategory = Array.from(catMap.values()).sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }));

  const byStatus = {
    paid: expensesList.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount ?? 0), 0),
    pending: expensesList.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount ?? 0), 0),
    overdue: expensesList.filter(e => e.status === 'overdue').reduce((s, e) => s + (e.amount ?? 0), 0),
    cancelled: expensesList.filter(e => e.status === 'cancelled').reduce((s, e) => s + (e.amount ?? 0), 0),
  };

  return { expenses: expensesList, dateField, stats: { total, count: expensesList.length, byCategory, byStatus } };
}

// ==================== GENERAL REPORT ====================

export async function getGeneralReportData(startDate: string, endDate: string) {
  const vehiclesData = await getVehiclesReportData(startDate, endDate);
  const tripsData = await getTripsReportData(startDate, endDate);
  const financialData = await getFinancialReportData(startDate, endDate);

  const dashboard = {
    totalVehicles: vehiclesData.stats.total,
    availableVehicles: vehiclesData.stats.available,
    inUseVehicles: vehiclesData.stats.inUse,
    maintenanceVehicles: vehiclesData.stats.maintenance,
    inactiveVehicles: vehiclesData.stats.inactive,
    totalTrips: tripsData.stats.total,
    totalDistance: tripsData.stats.totalDistance,
    fuelCost: financialData.stats.fuel,
    maintenanceCost: financialData.stats.maintenance,
    expensesCost: financialData.stats.expenses,
    finesCost: financialData.stats.fines,
    totalCost: financialData.stats.total,
  };

  return { dashboard };
}
