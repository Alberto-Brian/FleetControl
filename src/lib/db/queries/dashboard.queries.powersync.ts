// ========================================
// FILE: src/lib/db/queries/dashboard.queries.powersync.ts
// ========================================
//
// Fase 6 (migração Standalone -> Connected-first) — reescrita do Dashboard,
// feita depois dos 7 domínios prioritários (Prompts 6.1-6.8) estarem todos
// em powersync.db. `dashboard.queries.ts` (Drizzle/app.db) não tocado,
// fica como backup/referência.
//
// Motivo desta reescrita não ter esperado pelo Prompt 6.9: `dashboard.
// queries.ts` fazia JOINs directos contra app.db cruzando vehicles/
// drivers/trips/refuelings/maintenances/expenses/categories — como estes
// 7 domínios só escrevem em powersync.db desde os Prompts 6.2-6.8, o
// Dashboard já estava a mostrar contagens/nomes desactualizados para
// qualquer registo criado depois desses cortes. Corrigido agora, de
// propósito, antes do Prompt 6.9 (que não tinha essa urgência — os
// domínios que falta cortar continuam correctos em app.db).
//
// `fines` cortou no Prompt 6.9 — sem seam nenhum neste ficheiro.
import { getPowerSyncDb } from '@/lib/powersync/client';

// ==================== STATS ====================
export async function getDashboardStats() {
  const db = await getPowerSyncDb();

  const vehicleStats = await db.get<{ total: number; active: number; inUse: number; inactive: number; maintenance: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as inUse,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
     FROM vehicles WHERE deleted_at IS NULL`,
  );

  const driverStats = await db.get<{ total: number; available: number; onTrip: number; offline: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN availability = 'available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN availability = 'on_trip' THEN 1 ELSE 0 END) as onTrip,
            SUM(CASE WHEN availability = 'offline' THEN 1 ELSE 0 END) as offline
     FROM drivers WHERE is_active = 1 AND deleted_at IS NULL`,
  );

  const tripStats = await db.get<{ total: number; active: number; completed: number; cancelled: number; totalDistance: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
            COALESCE(SUM(CASE WHEN end_mileage IS NOT NULL THEN end_mileage - start_mileage ELSE 0 END), 0) as totalDistance
     FROM trips WHERE deleted_at IS NULL`,
  );

  const refuelingStats = await db.get<{ total: number; totalCost: number; totalLiters: number; avgPrice: number }>(
    `SELECT COUNT(*) as total, COALESCE(SUM(total_cost),0) as totalCost,
            COALESCE(SUM(liters),0) as totalLiters, COALESCE(AVG(price_per_liter),0) as avgPrice
     FROM fuel WHERE deleted_at IS NULL`,
  );

  const maintenanceStats = await db.get<{ total: number; scheduled: number; inProgress: number; completed: number; totalCost: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            COALESCE(SUM(total_cost),0) as totalCost
     FROM maintenance WHERE deleted_at IS NULL`,
  );

  const expenseStats = await db.get<{ total: number; paid: number; pending: number; overdue: number; totalAmount: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
            COALESCE(SUM(amount),0) as totalAmount
     FROM expenses WHERE deleted_at IS NULL`,
  );

  const fineStats = await db.get<{ total: number; pending: number; paid: number; contested: number; overdue: number; totalAmount: number }>(
    `SELECT COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(CASE WHEN status = 'contested' THEN 1 ELSE 0 END) as contested,
            SUM(CASE WHEN status = 'pending' AND due_date < date('now') THEN 1 ELSE 0 END) as overdue,
            COALESCE(SUM(fine_amount),0) as totalAmount
     FROM fines WHERE deleted_at IS NULL`,
  );

  return {
    totalVehicles: Number(vehicleStats.total) || 0,
    activeVehicles: Number(vehicleStats.active) || 0,
    inUseVehicles: Number(vehicleStats.inUse) || 0,
    inactiveVehicles: Number(vehicleStats.inactive) || 0,
    maintenanceVehicles: Number(vehicleStats.maintenance) || 0,

    totalDrivers: Number(driverStats.total) || 0,
    availableDrivers: Number(driverStats.available) || 0,
    onTripDrivers: Number(driverStats.onTrip) || 0,
    offlineDrivers: Number(driverStats.offline) || 0,

    totalTrips: Number(tripStats.total) || 0,
    activeTrips: Number(tripStats.active) || 0,
    completedTrips: Number(tripStats.completed) || 0,
    cancelledTrips: Number(tripStats.cancelled) || 0,
    totalDistance: Number(tripStats.totalDistance) || 0,

    totalRefuelings: Number(refuelingStats.total) || 0,
    totalFuelCost: Number(refuelingStats.totalCost) || 0,
    totalFuelLiters: Number(refuelingStats.totalLiters) || 0,
    avgFuelPrice: Number(refuelingStats.avgPrice) || 0,

    totalMaintenances: Number(maintenanceStats.total) || 0,
    scheduledMaintenances: Number(maintenanceStats.scheduled) || 0,
    inProgressMaintenances: Number(maintenanceStats.inProgress) || 0,
    completedMaintenances: Number(maintenanceStats.completed) || 0,
    totalMaintenanceCost: Number(maintenanceStats.totalCost) || 0,

    totalExpenses: Number(expenseStats.total) || 0,
    paidExpenses: Number(expenseStats.paid) || 0,
    pendingExpenses: Number(expenseStats.pending) || 0,
    overdueExpenses: Number(expenseStats.overdue) || 0,
    totalExpenseAmount: Number(expenseStats.totalAmount) || 0,

    totalFines: Number(fineStats?.total) || 0,
    pendingFines: Number(fineStats?.pending) || 0,
    paidFines: Number(fineStats?.paid) || 0,
    contestedFines: Number(fineStats?.contested) || 0,
    overdueFines: Number(fineStats?.overdue) || 0,
    totalFineAmount: Number(fineStats?.totalAmount) || 0,
  };
}

// ==================== RECENT ACTIVITIES ====================
interface Activity {
  id: string; type: 'trip' | 'refueling' | 'maintenance' | 'expense' | 'fine' | 'vehicle' | 'driver';
  title: string; description: string; date: string; status?: string; amount?: number;
  vehicle?: string; driver?: string;
}

export async function getRecentActivities(limit: number = 10): Promise<Activity[]> {
  const db = await getPowerSyncDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  const recentTrips = await db.getAll<{ id: string; description: string; date: string; status: string; vehicle: string | null; driver: string | null }>(
    `SELECT t.id as id, (COALESCE(t.origin,'') || ' → ' || COALESCE(t.destination,'')) as description,
            t.created_at as date, t.status as status, v.license_plate as vehicle, d.name as driver
     FROM trips t
     LEFT JOIN vehicles v ON v.id = t.vehicle_id
     LEFT JOIN drivers d ON d.id = t.driver_id
     WHERE t.deleted_at IS NULL AND t.created_at >= ?
     ORDER BY t.created_at DESC LIMIT ?`, [since, limit],
  );

  const recentRefuelings = await db.getAll<{ id: string; description: string; date: string; amount: number; vehicle: string | null }>(
    `SELECT r.id as id, (CAST(r.liters as TEXT) || ' L') as description, r.created_at as date,
            r.total_cost as amount, v.license_plate as vehicle
     FROM fuel r
     LEFT JOIN vehicles v ON v.id = r.vehicle_id
     WHERE r.deleted_at IS NULL AND r.created_at >= ?
     ORDER BY r.created_at DESC LIMIT ?`, [since, limit],
  );

  const recentMaintenances = await db.getAll<{ id: string; description: string; date: string; amount: number; status: string; vehicle: string | null }>(
    `SELECT m.id as id, m.description as description, m.created_at as date,
            m.total_cost as amount, m.status as status, v.license_plate as vehicle
     FROM maintenance m
     LEFT JOIN vehicles v ON v.id = m.vehicle_id
     WHERE m.deleted_at IS NULL AND m.created_at >= ?
     ORDER BY m.created_at DESC LIMIT ?`, [since, limit],
  );

  const recentExpenses = await db.getAll<{ id: string; description: string; date: string; amount: number; status: string; vehicle: string | null }>(
    `SELECT e.id as id, (COALESCE(c.name,'') || ': ' || COALESCE(e.description,'')) as description,
            e.created_at as date, e.amount as amount, e.status as status, v.license_plate as vehicle
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id AND c.type = 'expense'
     LEFT JOIN vehicles v ON v.id = e.vehicle_id
     WHERE e.deleted_at IS NULL AND e.created_at >= ?
     ORDER BY e.created_at DESC LIMIT ?`, [since, limit],
  );

  const recentVehicles = await db.getAll<{ id: string; description: string; date: string; vehicle: string | null }>(
    `SELECT id, (brand || ' ' || model || ' (' || year || ')') as description, created_at as date, license_plate as vehicle
     FROM vehicles WHERE deleted_at IS NULL AND created_at >= ? ORDER BY created_at DESC LIMIT ?`, [since, limit],
  );

  const recentDrivers = await db.getAll<{ id: string; description: string; date: string; driver: string | null }>(
    `SELECT id, ('CNH: ' || license_number || ' - Cat. ' || license_category) as description, created_at as date, name as driver
     FROM drivers WHERE deleted_at IS NULL AND created_at >= ? ORDER BY created_at DESC LIMIT ?`, [since, limit],
  );

  const recentFines = await db.getAll<{ id: string; description: string; date: string; amount: number; status: string; vehicle: string | null; driver: string | null }>(
    `SELECT f.id as id, (COALESCE(f.infraction_type,'') || ' - ' || COALESCE(f.location,'')) as description,
            f.created_at as date, f.fine_amount as amount, f.status as status,
            v.license_plate as vehicle, d.name as driver
     FROM fines f
     LEFT JOIN vehicles v ON v.id = f.vehicle_id
     LEFT JOIN drivers d ON d.id = f.driver_id
     WHERE f.deleted_at IS NULL AND f.created_at >= ?
     ORDER BY f.created_at DESC LIMIT ?`, [since, limit],
  );

  const all: Activity[] = [
    ...recentTrips.map(t => ({ id: t.id, type: 'trip' as const, title: 'dashboard:recentActivities.newTripStarted', description: t.description, date: t.date, status: t.status, vehicle: t.vehicle ?? '', driver: t.driver ?? '' })),
    ...recentRefuelings.map(r => ({ id: r.id, type: 'refueling' as const, title: 'dashboard:recentActivities.refuelingDone', description: r.description, date: r.date, amount: r.amount, vehicle: r.vehicle ?? '' })),
    ...recentMaintenances.map(m => ({ id: m.id, type: 'maintenance' as const, title: 'dashboard:recentActivities.maintenanceScheduled', description: m.description, date: m.date, amount: m.amount, status: m.status, vehicle: m.vehicle ?? '' })),
    ...recentExpenses.map(e => ({ id: e.id, type: 'expense' as const, title: 'dashboard:recentActivities.newExpense', description: e.description, date: e.date, amount: e.amount, status: e.status, vehicle: e.vehicle ?? '' })),
    ...recentFines.map(f => ({ id: f.id, type: 'fine' as const, title: 'dashboard:recentActivities.newFine', description: f.description ?? '', date: f.date, amount: f.amount ?? undefined, status: f.status, vehicle: f.vehicle ?? '', driver: f.driver ?? '' })),
    ...recentVehicles.map(v => ({ id: v.id, type: 'vehicle' as const, title: 'dashboard:recentActivities.newVehicle', description: v.description, date: v.date, vehicle: v.vehicle ?? '' })),
    ...recentDrivers.map(d => ({ id: d.id, type: 'driver' as const, title: 'dashboard:recentActivities.newDriver', description: d.description, date: d.date, driver: d.driver ?? '' })),
  ];

  return all
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ==================== CHART DATA ====================
export async function getChartData() {
  const db = await getPowerSyncDb();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const since = sixMonthsAgo.toISOString();

  const fuelByMonth = await db.getAll<{ month: string; amount: number; liters: number }>(
    `SELECT strftime('%Y-%m', refueling_date) as month, COALESCE(SUM(total_cost),0) as amount, COALESCE(SUM(liters),0) as liters
     FROM fuel WHERE deleted_at IS NULL AND refueling_date >= ?
     GROUP BY month ORDER BY month`, [since],
  );

  const expensesByCategory = await db.getAll<{ category: string | null; amount: number; count: number }>(
    `SELECT c.name as category, COALESCE(SUM(e.amount),0) as amount, COUNT(*) as count
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.category_id AND c.type = 'expense'
     WHERE e.deleted_at IS NULL
     GROUP BY c.name ORDER BY amount DESC LIMIT 10`,
  );

  const maintenancesByType = await db.getAll<{ type: string; count: number; cost: number }>(
    `SELECT type, COUNT(*) as count, COALESCE(SUM(total_cost),0) as cost
     FROM maintenance WHERE deleted_at IS NULL GROUP BY type`,
  );

  const tripsByMonth = await db.getAll<{ month: string; count: number; distance: number }>(
    `SELECT strftime('%Y-%m', start_date) as month, COUNT(*) as count,
            COALESCE(SUM(CASE WHEN end_mileage IS NOT NULL THEN end_mileage - start_mileage ELSE 0 END),0) as distance
     FROM trips WHERE deleted_at IS NULL AND start_date >= ?
     GROUP BY month ORDER BY month`, [since],
  );

  const vehicleUtilization = await db.getAll<{ vehicle: string; trips: number; distance: number; fuel: number }>(
    `SELECT v.license_plate as vehicle, COUNT(t.id) as trips,
            COALESCE(SUM(CASE WHEN t.end_mileage IS NOT NULL THEN t.end_mileage - t.start_mileage ELSE 0 END),0) as distance,
            COALESCE((SELECT SUM(total_cost) FROM fuel WHERE fuel.vehicle_id = v.id AND fuel.deleted_at IS NULL),0) as fuel
     FROM vehicles v
     LEFT JOIN trips t ON t.vehicle_id = v.id AND t.deleted_at IS NULL
     WHERE v.deleted_at IS NULL
     GROUP BY v.id, v.license_plate
     ORDER BY trips DESC LIMIT 5`,
  );

  return {
    fuelByMonth: fuelByMonth.map(f => ({ month: f.month, amount: Number(f.amount) || 0, liters: Number(f.liters) || 0 })),
    expensesByCategory: expensesByCategory.map(e => ({ category: e.category || 'Outros', amount: Number(e.amount) || 0, count: Number(e.count) || 0 })),
    maintenancesByType: maintenancesByType.map(m => ({ type: m.type, count: Number(m.count) || 0, cost: Number(m.cost) || 0 })),
    tripsByMonth: tripsByMonth.map(t => ({ month: t.month, count: Number(t.count) || 0, distance: Number(t.distance) || 0 })),
    vehicleUtilization: vehicleUtilization.map(v => ({ vehicle: v.vehicle, trips: Number(v.trips) || 0, distance: Number(v.distance) || 0, fuel: Number(v.fuel) || 0 })),
  };
}
