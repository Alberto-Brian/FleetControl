// ========================================
// FILE: src/lib/db/queries/dashboard.queries.ts (CORRIGIDO)
// ========================================
import { useDb } from '@/lib/db/db_helpers';
import { vehicles, drivers, trips, refuelings, maintenances, expenses, fines, expense_categories } from '@/lib/db/schemas';
import { eq, isNull, sql, and, gte, desc } from 'drizzle-orm';

// ==================== STATS ====================
export async function getDashboardStats() {
  const { db } = useDb();

  // ✅ Veículos (status correto: available, in_use, maintenance, inactive)
  const [vehicleStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${vehicles.status} = 'available' then 1 else 0 end)`,
      inUse: sql<number>`sum(case when ${vehicles.status} = 'in_use' then 1 else 0 end)`,
      inactive: sql<number>`sum(case when ${vehicles.status} = 'inactive' then 1 else 0 end)`,
      maintenance: sql<number>`sum(case when ${vehicles.status} = 'maintenance' then 1 else 0 end)`,
    })
    .from(vehicles)
    .where(isNull(vehicles.deleted_at));

  // ✅ Motoristas (status: active, on_leave, terminated)
  const [driverStats] = await db
    .select({
      total: sql<number>`count(*)`,
      available: sql<number>`sum(case when ${drivers.availability} = 'available' then 1 else 0 end)`,
      onTrip: sql<number>`sum(case when ${drivers.availability} = 'on_trip' then 1 else 0 end)`,
      offline: sql<number>`sum(case when ${drivers.availability} = 'offline' then 1 else 0 end)`,
    })
    .from(drivers)
    .where(and(eq(drivers.is_active, true), isNull(drivers.deleted_at)));

  // ✅ Viagens (NÃO TEM distance_traveled - calcular com end_mileage - start_mileage)
  const [tripStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${trips.status} = 'in_progress' then 1 else 0 end)`,
      completed: sql<number>`sum(case when ${trips.status} = 'completed' then 1 else 0 end)`,
      cancelled: sql<number>`sum(case when ${trips.status} = 'cancelled' then 1 else 0 end)`,
      // ✅ Distância calculada (apenas viagens concluídas com end_mileage)
      totalDistance: sql<number>`sum(case when ${trips.end_mileage} is not null then ${trips.end_mileage} - ${trips.start_mileage} else 0 end)`,
    })
    .from(trips)
    .where(isNull(trips.deleted_at));

  // ✅ Abastecimentos (correto)
  const [refuelingStats] = await db
    .select({
      total: sql<number>`count(*)`,
      totalCost: sql<number>`sum(${refuelings.total_cost})`,
      totalLiters: sql<number>`sum(${refuelings.liters})`,
      avgPrice: sql<number>`avg(${refuelings.price_per_liter})`,
    })
    .from(refuelings)
    .where(isNull(refuelings.deleted_at));

  // ✅ Manutenções (status correto: scheduled, in_progress, completed, cancelled)
  const [maintenanceStats] = await db
    .select({
      total: sql<number>`count(*)`,
      scheduled: sql<number>`sum(case when ${maintenances.status} = 'scheduled' then 1 else 0 end)`,
      inProgress: sql<number>`sum(case when ${maintenances.status} = 'in_progress' then 1 else 0 end)`,
      completed: sql<number>`sum(case when ${maintenances.status} = 'completed' then 1 else 0 end)`,
      totalCost: sql<number>`sum(${maintenances.total_cost})`,
    })
    .from(maintenances)
    .where(isNull(maintenances.deleted_at));

  // ✅ Despesas (status correto: pending, paid, overdue, cancelled)
  const [expenseStats] = await db
    .select({
      total: sql<number>`count(*)`,
      paid: sql<number>`sum(case when ${expenses.status} = 'paid' then 1 else 0 end)`,
      pending: sql<number>`sum(case when ${expenses.status} = 'pending' then 1 else 0 end)`,
      overdue: sql<number>`sum(case when ${expenses.status} = 'overdue' then 1 else 0 end)`,
      totalAmount: sql<number>`sum(${expenses.amount})`,
    })
    .from(expenses)
    .where(isNull(expenses.deleted_at));

  // ✅ Multas (correto)
  const [fineStats] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`sum(case when ${fines.status} = 'pending' then 1 else 0 end)`,
      paid: sql<number>`sum(case when ${fines.status} = 'paid' then 1 else 0 end)`,
      contested: sql<number>`sum(case when ${fines.status} = 'contested' then 1 else 0 end)`,
      overdue: sql<number>`sum(case when ${fines.status} = 'pending' and ${fines.due_date} < date('now') then 1 else 0 end)`,
      totalAmount: sql<number>`sum(${fines.fine_amount})`,
    })
    .from(fines)
    .where(isNull(fines.deleted_at));

  return {
    // Veículos
    totalVehicles: Number(vehicleStats.total) || 0,
    activeVehicles: Number(vehicleStats.active) || 0,
    inUseVehicles: Number(vehicleStats.inUse) || 0,
    inactiveVehicles: Number(vehicleStats.inactive) || 0,
    maintenanceVehicles: Number(vehicleStats.maintenance) || 0,

    // Motoristas
    totalDrivers: Number(driverStats.total) || 0,
    availableDrivers: Number(driverStats.available) || 0,
    onTripDrivers: Number(driverStats.onTrip) || 0,
    offlineDrivers: Number(driverStats.offline) || 0,

    // Viagens
    totalTrips: Number(tripStats.total) || 0,
    activeTrips: Number(tripStats.active) || 0,
    completedTrips: Number(tripStats.completed) || 0,
    cancelledTrips: Number(tripStats.cancelled) || 0,
    totalDistance: Number(tripStats.totalDistance) || 0,

    // Abastecimentos
    totalRefuelings: Number(refuelingStats.total) || 0,
    totalFuelCost: Number(refuelingStats.totalCost) || 0,
    totalFuelLiters: Number(refuelingStats.totalLiters) || 0,
    avgFuelPrice: Number(refuelingStats.avgPrice) || 0,

    // Manutenções
    totalMaintenances: Number(maintenanceStats.total) || 0,
    scheduledMaintenances: Number(maintenanceStats.scheduled) || 0,
    inProgressMaintenances: Number(maintenanceStats.inProgress) || 0,
    completedMaintenances: Number(maintenanceStats.completed) || 0,
    totalMaintenanceCost: Number(maintenanceStats.totalCost) || 0,

    // Despesas
    totalExpenses: Number(expenseStats.total) || 0,
    paidExpenses: Number(expenseStats.paid) || 0,
    pendingExpenses: Number(expenseStats.pending) || 0,
    overdueExpenses: Number(expenseStats.overdue) || 0,
    totalExpenseAmount: Number(expenseStats.totalAmount) || 0,

    // Multas
    totalFines: Number(fineStats.total) || 0,
    pendingFines: Number(fineStats.pending) || 0,
    paidFines: Number(fineStats.paid) || 0,
    contestedFines: Number(fineStats.contested) || 0,
    overdueFines: Number(fineStats.overdue) || 0,
    totalFineAmount: Number(fineStats.totalAmount) || 0,
  };
}

// ==================== RECENT ACTIVITIES ====================
export async function getRecentActivities(limit: number = 10) {
  const { db } = useDb();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Viagens recentes
  const recentTrips = await db
    .select({
      id: trips.id,
      type: sql<string>`'trip'`,
      title: sql<string>`'dashboard:recentActivities.newTripStarted'`,
      description: sql<string>`${trips.origin} || ' → ' || ${trips.destination}`,
      date: trips.created_at,
      status: trips.status,
      vehicle: vehicles.license_plate,
      driver: drivers.name,
    })
    .from(trips)
    .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
    .leftJoin(drivers, eq(trips.driver_id, drivers.id))
    .where(and(
      isNull(trips.deleted_at),
      gte(trips.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(trips.created_at))
    .limit(limit);

  // 2. Abastecimentos recentes
  const recentRefuelings = await db
    .select({
      id: refuelings.id,
      type: sql<string>`'refueling'`,
      title: sql<string>`'dashboard:recentActivities.refuelingDone'`,
      description: sql<string>`cast(${refuelings.liters} as text) || ' L'`,
      date: refuelings.created_at,
      amount: refuelings.total_cost,
      vehicle: vehicles.license_plate,
    })
    .from(refuelings)
    .leftJoin(vehicles, eq(refuelings.vehicle_id, vehicles.id))
    .where(and(
      isNull(refuelings.deleted_at),
      gte(refuelings.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(refuelings.created_at))
    .limit(limit);

  // 3. Manutenções recentes
  const recentMaintenances = await db
    .select({
      id: maintenances.id,
      type: sql<string>`'maintenance'`,
      title: sql<string>`'dashboard:recentActivities.maintenanceScheduled'`,
      description: maintenances.description,
      date: maintenances.created_at,
      amount: maintenances.total_cost,
      status: maintenances.status,
      vehicle: vehicles.license_plate,
    })
    .from(maintenances)
    .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
    .where(and(
      isNull(maintenances.deleted_at),
      gte(maintenances.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(maintenances.created_at))
    .limit(limit);

  // 4. Despesas recentes ✅ NOVO
  const recentExpenses = await db
    .select({
      id: expenses.id,
      type: sql<string>`'expense'`,
      title: sql<string>`'dashboard:recentActivities.newExpense'`,
      description: sql<string>`${expense_categories.name} || ': ' || ${expenses.description}`,
      date: expenses.created_at,
      amount: expenses.amount,
      status: expenses.status,
      vehicle: vehicles.license_plate,
    })
    .from(expenses)
    .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
    .leftJoin(vehicles, eq(expenses.vehicle_id, vehicles.id))
    .where(and(
      isNull(expenses.deleted_at),
      gte(expenses.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(expenses.created_at))
    .limit(limit);

  // 5. Multas recentes ✅ NOVO
  const recentFines = await db
    .select({
      id: fines.id,
      type: sql<string>`'fine'`,
      title: sql<string>`'dashboard:recentActivities.newFine'`,
      description: sql<string>`${fines.infraction_type} || ' - ' || ${fines.location}`,
      date: fines.created_at,
      amount: fines.fine_amount,
      status: fines.status,
      vehicle: vehicles.license_plate,
      driver: drivers.name,
    })
    .from(fines)
    .leftJoin(vehicles, eq(fines.vehicle_id, vehicles.id))
    .leftJoin(drivers, eq(fines.driver_id, drivers.id))
    .where(and(
      isNull(fines.deleted_at),
      gte(fines.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(fines.created_at))
    .limit(limit);

  // 6. Veículos recentes ✅ NOVO
  const recentVehicles = await db
    .select({
      id: vehicles.id,
      type: sql<string>`'vehicle'`,
      title: sql<string>`'dashboard:recentActivities.newVehicle'`,
      description: sql<string>`${vehicles.brand} || ' ' || ${vehicles.model} || ' (' || ${vehicles.year} || ')'`,
      date: vehicles.created_at,
      vehicle: vehicles.license_plate,
    })
    .from(vehicles)
    .where(and(
      isNull(vehicles.deleted_at),
      gte(vehicles.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(vehicles.created_at))
    .limit(limit);

  // 7. Motoristas recentes ✅ NOVO
  const recentDrivers = await db
    .select({
      id: drivers.id,
      type: sql<string>`'driver'`,
      title: sql<string>`'dashboard:recentActivities.newDriver'`,
      description: sql<string>`'CNH: ' || ${drivers.license_number} || ' - Cat. ' || ${drivers.license_category}`,
      date: drivers.created_at,
      driver: drivers.name,
    })
    .from(drivers)
    .where(and(
      isNull(drivers.deleted_at),
      gte(drivers.created_at, thirtyDaysAgo.toISOString())
    ))
    .orderBy(desc(drivers.created_at))
    .limit(limit);

  // Combinar e ordenar todas as atividades
  const allActivities = [
    ...recentTrips.map(t => ({
      id: t.id,
      type: 'trip' as const,
      title: t.title,
      description: t.description || '',
      date: t.date,
      status: t.status,
      vehicle: t.vehicle || '',
      driver: t.driver || '',
    })),
    ...recentRefuelings.map(r => ({
      id: r.id,
      type: 'refueling' as const,
      title: r.title,
      description: r.description || '',
      date: r.date,
      amount: r.amount,
      vehicle: r.vehicle || '',
    })),
    ...recentMaintenances.map(m => ({
      id: m.id,
      type: 'maintenance' as const,
      title: m.title,
      description: m.description,
      date: m.date,
      amount: m.amount,
      status: m.status,
      vehicle: m.vehicle || '',
    })),
    ...recentExpenses.map(e => ({
      id: e.id,
      type: 'expense' as const,
      title: e.title,
      description: e.description || '',
      date: e.date,
      amount: e.amount,
      status: e.status,
      vehicle: e.vehicle || '',
    })),
    ...recentFines.map(f => ({
      id: f.id,
      type: 'fine' as const,
      title: f.title,
      description: f.description || '',
      date: f.date,
      amount: f.amount,
      status: f.status,
      vehicle: f.vehicle || '',
      driver: f.driver || '',
    })),
    ...recentVehicles.map(v => ({
      id: v.id,
      type: 'vehicle' as const,
      title: v.title,
      description: v.description || '',
      date: v.date,
      vehicle: v.vehicle || '',
    })),
    ...recentDrivers.map(d => ({
      id: d.id,
      type: 'driver' as const,
      title: d.title,
      description: d.description || '',
      date: d.date,
      driver: d.driver || '',
    })),
  ];

  return allActivities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ==================== CHART DATA ====================
export async function getChartData() {
  const { db } = useDb();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Combustível por mês (últimos 6 meses)
  const fuelByMonth = await db
    .select({
      month: sql<string>`strftime('%Y-%m', ${refuelings.refueling_date})`,
      amount: sql<number>`sum(${refuelings.total_cost})`,
      liters: sql<number>`sum(${refuelings.liters})`,
    })
    .from(refuelings)
    .where(and(
      isNull(refuelings.deleted_at),
      gte(refuelings.refueling_date, sixMonthsAgo.toISOString())
    ))
    .groupBy(sql`strftime('%Y-%m', ${refuelings.refueling_date})`)
    .orderBy(sql`strftime('%Y-%m', ${refuelings.refueling_date})`);

  // ✅ Despesas por categoria (JOIN com expense_categories para pegar o nome)
  const expensesByCategory = await db
    .select({
      category: expense_categories.name,
      amount: sql<number>`sum(${expenses.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(expenses)
    .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
    .where(isNull(expenses.deleted_at))
    .groupBy(expense_categories.name)
    .orderBy(desc(sql`sum(${expenses.amount})`))
    .limit(10);

  // Manutenções por tipo
  const maintenancesByType = await db
    .select({
      type: maintenances.type,
      count: sql<number>`count(*)`,
      cost: sql<number>`sum(${maintenances.total_cost})`,
    })
    .from(maintenances)
    .where(isNull(maintenances.deleted_at))
    .groupBy(maintenances.type);

  // ✅ Viagens por mês (calcular distância com end_mileage - start_mileage)
  const tripsByMonth = await db
    .select({
      month: sql<string>`strftime('%Y-%m', ${trips.start_date})`,
      count: sql<number>`count(*)`,
      distance: sql<number>`sum(case when ${trips.end_mileage} is not null then ${trips.end_mileage} - ${trips.start_mileage} else 0 end)`,
    })
    .from(trips)
    .where(and(
      isNull(trips.deleted_at),
      gte(trips.start_date, sixMonthsAgo.toISOString())
    ))
    .groupBy(sql`strftime('%Y-%m', ${trips.start_date})`)
    .orderBy(sql`strftime('%Y-%m', ${trips.start_date})`);

  // ✅ Top 5 veículos por utilização (distância calculada)
  const vehicleUtilization = await db
    .select({
      vehicle: vehicles.license_plate,
      trips: sql<number>`count(${trips.id})`,
      distance: sql<number>`sum(case when ${trips.end_mileage} is not null then ${trips.end_mileage} - ${trips.start_mileage} else 0 end)`,
      fuel: sql<number>`coalesce(sum(${refuelings.total_cost}), 0)`,
    })
    .from(vehicles)
    .leftJoin(trips, and(
      eq(vehicles.id, trips.vehicle_id),
      isNull(trips.deleted_at)
    ))
    .leftJoin(refuelings, and(
      eq(vehicles.id, refuelings.vehicle_id),
      isNull(refuelings.deleted_at)
    ))
    .where(isNull(vehicles.deleted_at))
    .groupBy(vehicles.id, vehicles.license_plate)
    .orderBy(desc(sql`count(${trips.id})`))
    .limit(5);

  return {
    fuelByMonth: fuelByMonth.map(f => ({
      month: f.month,
      amount: Number(f.amount) || 0,
      liters: Number(f.liters) || 0,
    })),
    expensesByCategory: expensesByCategory.map(e => ({
      category: e.category || 'Outros',
      amount: Number(e.amount) || 0,
      count: Number(e.count) || 0,
    })),
    maintenancesByType: maintenancesByType.map(m => ({
      type: m.type,
      count: Number(m.count) || 0,
      cost: Number(m.cost) || 0,
    })),
    tripsByMonth: tripsByMonth.map(t => ({
      month: t.month,
      count: Number(t.count) || 0,
      distance: Number(t.distance) || 0,
    })),
    vehicleUtilization: vehicleUtilization.map(v => ({
      vehicle: v.vehicle,
      trips: Number(v.trips) || 0,
      distance: Number(v.distance) || 0,
      fuel: Number(v.fuel) || 0,
    })),
  };
}