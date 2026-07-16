// ========================================
// FILE: src/lib/db/queries/reports.queries.ts
// ========================================
import { useDb, checkAndRotate } from '@/lib/db/db_helpers';
import { 
  vehicles, 
  vehicle_categories, 
  trips, 
  drivers, 
  refuelings, 
  maintenances, 
  expenses, 
  expense_categories, 
  fines } from '@/lib/db/schemas';
import { eq, and, gte, lte, isNull, isNotNull, sql, count, desc, sum } from 'drizzle-orm';

// ==================== VEHICLES REPORT ====================

export async function getVehiclesReportData(startDate: string, endDate: string) {
  
  //  // await checkAndRotate();
   const { db } = useDb();
    // Lista de veículos
  const vehiclesList = await db
    .select({
      id: vehicles.id,
      license_plate: vehicles.license_plate,
      brand: vehicles.brand,
      model: vehicles.model,
      year: vehicles.year,
      status: vehicles.status,
      current_mileage: vehicles.current_mileage,
      category_name: vehicle_categories.name,
      category_color: vehicle_categories.color,
    })
    .from(vehicles)
    .leftJoin(vehicle_categories, eq(vehicles.category_id, vehicle_categories.id))
    .where(and(
        isNull(vehicles.deleted_at),
        eq(vehicles.is_active, true)
    ))
    .orderBy(vehicles.license_plate);

  // Stats
  const totalMileage = vehiclesList.reduce((sum, v) => sum + (v.current_mileage || 0), 0);
  
  const stats = {
    total: vehiclesList.length,
    available: vehiclesList.filter(v => v.status === 'available').length,
    inUse: vehiclesList.filter(v => v.status === 'in_use').length,
    maintenance: vehiclesList.filter(v => v.status === 'maintenance').length,
    inactive: vehiclesList.filter(v => v.status === 'inactive').length,
    totalMileage,
    
    // Por categoria
    byCategory: Object.values(
      vehiclesList.reduce((acc: any, v) => {
        const cat = v.category_name || 'Sem Categoria';
        if (!acc[cat]) {
          acc[cat] = { name: cat, color: v.category_color, count: 0 };
        }
        acc[cat].count++;
        return acc;
      }, {})
    ).map((c: any) => ({
      ...c,
      percentage: (c.count / vehiclesList.length) * 100,
    })),
    
    // Por status
    byStatus: [
      { status: 'available', count: vehiclesList.filter(v => v.status === 'available').length },
      { status: 'in_use', count: vehiclesList.filter(v => v.status === 'in_use').length },
      { status: 'maintenance', count: vehiclesList.filter(v => v.status === 'maintenance').length },
      { status: 'inactive', count: vehiclesList.filter(v => v.status === 'inactive').length },
    ].map(s => ({
      ...s,
      percentage: (s.count / vehiclesList.length) * 100,
    })),
  };

  return {
    vehicles: vehiclesList,
    stats,
  };
}

export async function getDriversReportData(startDate: string, endDate: string) {
  try {
    const { db } = useDb();

    // Buscar apenas motoristas ATIVOS NO SISTEMA (is_active = true)
    // Isso exclui registros "apagados"
    const allDrivers = await db
      .select()
      .from(drivers)
      .where(eq(drivers.is_active, true));  // ✅ Filtro de existência

    // Se não houver motoristas, retornar estrutura vazia
  if (allDrivers.length === 0) {
      return {
        drivers: [],
        stats: {
          total: 0,
          active: 0,
          onLeave: 0,
          terminated: 0,  // ✅ Renomeado de 'inactive' para 'terminated'
          available: 0,
          onTrip: 0,
          offline: 0,
          totalTrips: 0,
          totalDistance: 0,
          topDrivers: [],
          byAvailability: [],
        },
      };
    }

    // Buscar viagens EM ANDAMENTO (para determinar quem está on_trip agora)
    const activeTrips = await db
      .select({
        driver_id: trips.driver_id,
      })
      .from(trips)
      .where(
        and(
          eq(trips.status, 'in_progress'),
          isNotNull(trips.driver_id),
          isNull(trips.end_date)
        )
      );

    const driversOnTripNow = new Set(activeTrips.map(t => t.driver_id));

    // Buscar viagens do PERÍODO solicitado (para estatísticas)
    const tripsByDriver = await db
      .select({
        driver_id: trips.driver_id,
        trip_count: count(trips.id),
        total_km: sql<number>`COALESCE(SUM(${trips.end_mileage} - ${trips.start_mileage}), 0)`,
      })
      .from(trips)
      .where(
        and(
          gte(trips.start_date, startDate),
          lte(trips.start_date, endDate),
          isNotNull(trips.driver_id)
        )
      )
      .groupBy(trips.driver_id);

    const tripsMap = new Map(
      tripsByDriver.map(t => [
        t.driver_id,
        {
          total_trips: Number(t.trip_count) || 0,
          total_distance: Number(t.total_km) || 0,
        }
      ])
    );

    // Processar motoristas com lógica correta de estados
    const driversList = allDrivers.map(driver => {
      // Determinar availability REAL baseada nas regras de negócio
      let realAvailability: 'available' | 'on_trip' | 'offline';
      
      if (driver.status === 'terminated') {
        // Terminado = sempre offline (não trabalha mais)
        realAvailability = 'offline';
      } else if (driver.status === 'on_leave') {
        // De licença = sempre offline (afastado)
        realAvailability = 'offline';
      } else if (driversOnTripNow.has(driver.id)) {
        // Em viagem ativa agora
        realAvailability = 'on_trip';
      } else {
        // Usar availability do DB ou default offline
        const dbAvailability = driver.availability as 'available' | 'on_trip' | 'offline' | null;
        realAvailability = dbAvailability && dbAvailability !== 'on_trip' 
          ? dbAvailability 
          : 'offline';
      }

      return {
        id: String(driver.id),
        name: String(driver.name || ''),
        license_number: String(driver.license_number || ''),
        phone: String(driver.phone || ''),
        status: String(driver.status || 'active') as 'active' | 'on_leave' | 'terminated',
        availability: realAvailability,
        total_trips: Number(tripsMap.get(driver.id)?.total_trips || 0),
        total_distance: Number(tripsMap.get(driver.id)?.total_distance || 0),
      };
    }).sort((a, b) => b.total_distance - a.total_distance);

    // ESTATÍSTICAS CONTRATUAIS (todos os is_active = true)
    const totalDrivers = allDrivers.length;
    const activeCount = allDrivers.filter(d => d.status === 'active').length;
    const onLeaveCount = allDrivers.filter(d => d.status === 'on_leave').length;
    const terminatedCount = allDrivers.filter(d => d.status === 'terminated').length;

    // ESTATÍSTICAS DE AVAILABILITY (apenas status = active)
    const activeContractDrivers = driversList.filter(d => d.status === 'active');
    const onTripCount = activeContractDrivers.filter(d => d.availability === 'on_trip').length;
    const availableCount = activeContractDrivers.filter(d => d.availability === 'available').length;
    const offlineCount = activeContractDrivers.filter(d => d.availability === 'offline').length;

    // Total de viagens no período
    const totalTripsResult = await db
      .select({
        count: count(),
        distance: sql<number>`COALESCE(SUM(${trips.end_mileage} - ${trips.start_mileage}), 0)`,
      })
      .from(trips)
      .where(
        and(
          gte(trips.start_date, startDate),
          lte(trips.start_date, endDate)
        )
      );

    const totalTrips = Number(totalTripsResult[0]?.count || 0);
    const totalDistance = Number(totalTripsResult[0]?.distance || 0);

    // Top 5 motoristas (com viagens no período)
    const topDrivers = driversList
      .filter(d => d.total_trips > 0)
      .slice(0, 5)
      .map(d => ({
        name: String(d.name),
        totalTrips: Number(d.total_trips),
        totalDistance: Number(d.total_distance),
      }));

    // Dados para gráfico de availability (apenas ativos contratualmente)
    const byAvailability = [
      {
        status: 'available',
        count: availableCount,
        percentage: Math.round((availableCount / (activeCount || 1)) * 100 * 10) / 10,
      },
      {
        status: 'on_trip',
        count: onTripCount,
        percentage: Math.round((onTripCount / (activeCount || 1)) * 100 * 10) / 10,
      },
      {
        status: 'offline',
        count: offlineCount,
        percentage: Math.round((offlineCount / (activeCount || 1)) * 100 * 10) / 10,
      },
    ].filter(s => s.count > 0);

    return {
      drivers: driversList,
      stats: {
        // Status contratuais (todos is_active = true)
        total: totalDrivers,
        active: activeCount,
        onLeave: onLeaveCount,
        terminated: terminatedCount,  // ✅ Terminado, não "inativo genérico"
        
        // Availability (apenas status = active)
        available: availableCount,
        onTrip: onTripCount,
        offline: offlineCount,
        
        // Métricas
        totalTrips,
        totalDistance,
        topDrivers,
        byAvailability,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados de motoristas:', error);
    throw error;
  }
}
// ==================== TRIPS REPORT ====================

export async function getTripsReportData(startDate: string, endDate: string) {
  
     // await checkAndRotate();
     const { db } = useDb();

    const tripsList = await db
    .select({
      id: trips.id,
      origin: trips.origin,
      destination: trips.destination,
      start_date: trips.start_date,
      end_date: trips.end_date,
      status: trips.status,
      start_mileage: trips.start_mileage,
      end_mileage: trips.end_mileage,
      vehicle_plate: vehicles.license_plate,
      driver_name: drivers.name,
    })
    .from(trips)
    .leftJoin(vehicles, eq(trips.vehicle_id, vehicles.id))
    .leftJoin(drivers, eq(trips.driver_id, drivers.id))
    .where(
      and(
        isNull(trips.deleted_at),
        gte(trips.start_date, startDate),
        lte(trips.start_date, endDate)
      )
    )
    .orderBy(trips.start_date);

  // Calcular distâncias
  const tripsWithDistance = tripsList.map(t => ({
    ...t,
    distance: t.end_mileage && t.start_mileage ? t.end_mileage - t.start_mileage : 0,
  }));

  const totalDistance = tripsWithDistance.reduce((sum, t) => sum + t.distance, 0);

  const stats = {
    total: tripsList.length,
    completed: tripsList.filter(t => t.status === 'completed').length,
    inProgress: tripsList.filter(t => t.status === 'in_progress').length,
    cancelled: tripsList.filter(t => t.status === 'cancelled').length,
    totalDistance,
    avgDistance: tripsList.length > 0 ? totalDistance / tripsList.length : 0,
  };

  return {
    trips: tripsWithDistance,
    stats,
  };
}

// ==================== FUEL REPORT ====================

export async function getFuelReportData(startDate: string, endDate: string) {
  
     // await checkAndRotate();
     const { db } = useDb();

    const refuelingsList = await db
    .select({
      id: refuelings.id,
      refueling_date: refuelings.refueling_date,
      liters: refuelings.liters,
      price_per_liter: refuelings.price_per_liter,
      total_cost: refuelings.total_cost,
    //   mileage: vehicles.mileage,
      vehicle_plate: vehicles.license_plate,
    })
    .from(refuelings)
    .leftJoin(vehicles, eq(refuelings.vehicle_id, vehicles.id))
    .where(
      and(
        isNull(refuelings.deleted_at),
        gte(refuelings.refueling_date, startDate),
        lte(refuelings.refueling_date, endDate)
      )
    )
    .orderBy(refuelings.refueling_date);

  const totalLiters = refuelingsList.reduce((sum, r) => sum + (r.liters || 0), 0);
  const totalCost = refuelingsList.reduce((sum, r) => sum + (r.total_cost || 0), 0);

  // Top veículos
  const vehicleMap = refuelingsList.reduce((acc: any, r) => {
    const plate = r.vehicle_plate || 'Sem Veículo';
    if (!acc[plate]) {
      acc[plate] = { vehicle_plate: plate, totalLiters: 0, totalCost: 0 };
    }
    acc[plate].totalLiters += r.liters || 0;
    acc[plate].totalCost += r.total_cost || 0;
    return acc;
  }, {});

  const topVehicles = Object.values(vehicleMap).sort((a: any, b: any) => b.totalCost - a.totalCost);

  const stats = {
    total: refuelingsList.length,
    totalLiters,
    totalCost,
    topVehicles,
  };

  return {
    refuelings: refuelingsList,
    stats,
  };
}

// ==================== MAINTENANCE REPORT ====================

export async function getMaintenanceReportData(startDate: string, endDate: string) {
  
     // await checkAndRotate();
     const { db } = useDb();
  
    const maintenancesList = await db
    .select({
      id: maintenances.id,
      entry_date: maintenances.entry_date,
      description: maintenances.description,
      type: maintenances.type,
      status: maintenances.status,
      total_cost: maintenances.total_cost,
      vehicle_plate: vehicles.license_plate,
    })
    .from(maintenances)
    .leftJoin(vehicles, eq(maintenances.vehicle_id, vehicles.id))
    .where(
      and(
        isNull(maintenances.deleted_at),
        gte(maintenances.entry_date, startDate),
        lte(maintenances.entry_date, endDate)
      )
    )
    .orderBy(maintenances.entry_date);

  const totalCost = maintenancesList.reduce((sum, m) => sum + (m.total_cost || 0), 0);

  const stats = {
    total: maintenancesList.length,
    preventive: maintenancesList.filter(m => m.type === 'preventive').length,
    corrective: maintenancesList.filter(m => m.type === 'corrective').length,
    completed: maintenancesList.filter(m => m.status === 'completed').length,
    inProgress: maintenancesList.filter(m => m.status === 'in_progress').length,
    totalCost,
  };

  console.log(stats)

  return {
    maintenances: maintenancesList,
    stats,
  };
}

// ==================== FINANCIAL REPORT ====================

export async function getFinancialReportData(startDate: string, endDate: string) {
  
   // await checkAndRotate();
    const { db } = useDb();

    // Despesas
  const expensesList = await db
    .select({
      id: expenses.id,
      expense_date: expenses.expense_date,
      description: expenses.description,
      amount: expenses.amount,
      status: expenses.status,
      category_name: expense_categories.name,
    })
    .from(expenses)
    .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
    .where(
      and(
        isNull(expenses.deleted_at),
        gte(expenses.expense_date, startDate),
        lte(expenses.expense_date, endDate)
      )
    )
    .orderBy(expenses.expense_date);

  // Combustível
  const fuelData = await getFuelReportData(startDate, endDate);
  
  // Manutenções
  const maintenanceData = await getMaintenanceReportData(startDate, endDate);
  
  // Multas
  const finesList = await db
    .select({
      total_cost: sql<number>`sum(${fines.fine_amount})`,
    })
    .from(fines)
    .where(
      and(
        isNull(fines.deleted_at),
        gte(fines.fine_date, startDate),
        lte(fines.fine_date, endDate)
      )
    );

  const finesTotal = finesList[0]?.total_cost || 0;
  const expensesTotal = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Por categoria
  const categoryMap = expensesList.reduce((acc: any, e) => {
    const cat = e.category_name || 'Sem Categoria';
    if (!acc[cat]) {
      acc[cat] = { name: cat, count: 0, total: 0 };
    }
    acc[cat].count++;
    acc[cat].total += e.amount || 0;
    return acc;
  }, {});

  const byCategory = Object.values(categoryMap).map((c: any) => ({
    ...c,
    percentage: (c.total / expensesTotal) * 100,
  }));

  const stats = {
    fuel: fuelData.stats.totalCost,
    maintenance: maintenanceData.stats.totalCost,
    expenses: expensesTotal,
    fines: finesTotal,
    total: fuelData.stats.totalCost + maintenanceData.stats.totalCost + expensesTotal + finesTotal,
    byCategory,
  };

  return {
    expenses: expensesList,
    stats,
  };
}

// ==================== EXPENSES DETAILED REPORT ====================

export type ExpenseDateField = 'expense_date' | 'due_date' | 'payment_date' | 'created_at';

export async function getExpensesReportData(
  startDate: string,
  endDate: string,
  dateField: ExpenseDateField = 'expense_date',
) {
  const { db } = useDb();

  const fieldCol = {
    expense_date:  expenses.expense_date,
    due_date:      expenses.due_date,
    payment_date:  expenses.payment_date,
    created_at:    expenses.created_at,
  }[dateField];

  const expensesList = await db
    .select({
      id:              expenses.id,
      expense_date:    expenses.expense_date,
      due_date:        expenses.due_date,
      payment_date:    expenses.payment_date,
      created_at:      expenses.created_at,
      description:     expenses.description,
      amount:          expenses.amount,
      status:          expenses.status,
      supplier:        expenses.supplier,
      document_number: expenses.document_number,
      category_name:   expense_categories.name,
      category_color:  expense_categories.color,
    })
    .from(expenses)
    .leftJoin(expense_categories, eq(expenses.category_id, expense_categories.id))
    .where(and(
      isNull(expenses.deleted_at),
      gte(fieldCol, startDate),
      lte(fieldCol, endDate),
    ))
    .orderBy(fieldCol);

  const total = expensesList.reduce((s, e) => s + (e.amount ?? 0), 0);

  const catMap = new Map<string, { name: string; color?: string | null; total: number; count: number }>();
  for (const e of expensesList) {
    const key = e.category_name ?? 'Sem Categoria';
    const cur = catMap.get(key) ?? { name: key, color: e.category_color, total: 0, count: 0 };
    cur.total += e.amount ?? 0;
    cur.count++;
    catMap.set(key, cur);
  }
  const byCategory = Array.from(catMap.values())
    .sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, percentage: total > 0 ? (c.total / total) * 100 : 0 }));

  const byStatus = {
    paid:      expensesList.filter(e => e.status === 'paid').reduce((s, e) => s + (e.amount ?? 0), 0),
    pending:   expensesList.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount ?? 0), 0),
    overdue:   expensesList.filter(e => e.status === 'overdue').reduce((s, e) => s + (e.amount ?? 0), 0),
    cancelled: expensesList.filter(e => e.status === 'cancelled').reduce((s, e) => s + (e.amount ?? 0), 0),
  };

  return {
    expenses: expensesList,
    dateField,
    stats: { total, count: expensesList.length, byCategory, byStatus },
  };
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

  return {
    dashboard,
  };
}