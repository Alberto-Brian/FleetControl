
// ========================================
// FILE: src/lib/db/seeds/index.ts
// ========================================
import { 
  company_settings,
  vehicle_categories,
  maintenance_categories,
  expense_categories,
  users,
  clients,
  vehicles,
  vehicle_documents,
  drivers,
  routes,
  trips,
  maintenances,
  maintenance_items,
  expenses,
  audit_logs,
  fines,
  fuel_stations,
  refuelings,
  workshops,
  systemInfo
} from '../schemas';
import { useDb } from '@/lib/db/db_helpers';
import { generateUuid } from '@/lib/utils/cripto';
import bcrypt from 'bcryptjs';
import { expenseCategoryType } from '../schemas/expense_categories';
import { maintenanceType } from '../schemas/maintenance_categories';
import { fuelType } from '../schemas/refuelings';
import { eq, and } from 'drizzle-orm';
import { maintenanceItemType } from '../schemas/maintenance_items';
import { auditAction } from '@/lib/db/schemas/audit_logs';

export async function seedDatabase(options?: { force?: boolean }) {
  console.log('Seeding database...');
  const { db } = useDb();
  try {
    const alreadySeeded = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'admin@fleet.local'));
    if (alreadySeeded.length && !options?.force) {
      console.log('Seed já aplicado. Pulando.');
      return;
    }

    const adminId = generateUuid();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'admin@fleet.local'));
    if (!adminExists.length) {
      await db.insert(users).values({
        id: adminId,
        name: 'Administrador',
        email: 'admin@fleet.local',
        password_hash: hashedPassword,
        is_active: true,
        created_by: adminId,
      });
    }

    const extraUsers = [
      { id: generateUuid(), name: 'Gestor', email: 'gestor@fleet.local' },
      { id: generateUuid(), name: 'Operador', email: 'operador@fleet.local' },
      { id: generateUuid(), name: 'Supervisor', email: 'supervisor@fleet.local' },
      { id: generateUuid(), name: 'Analista', email: 'analista@fleet.local' },
    ];
    for (const u of extraUsers) {
      const exists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, u.email));
      if (!exists.length) {
        await db.insert(users).values({
          id: u.id,
          name: u.name,
          email: u.email,
          password_hash: hashedPassword,
          is_active: true,
          created_by: adminId,
        });
      }
    }

    const companySettings = [
      { id: generateUuid(), company_name: 'Minha Empresa de Frotas', currency: 'AOA', timezone: 'Africa/Luanda' },
      { id: generateUuid(), company_name: 'Frotas Angola', currency: 'AOA', timezone: 'Africa/Luanda' },
      { id: generateUuid(), company_name: 'Transporte Express', currency: 'AOA', timezone: 'Africa/Luanda' },
      { id: generateUuid(), company_name: 'Logística Rápida', currency: 'AOA', timezone: 'Africa/Luanda' },
      { id: generateUuid(), company_name: 'Serviços Rodoviários', currency: 'AOA', timezone: 'Africa/Luanda' },
    ];
    for (const s of companySettings) {
      const exists = await db
        .select({ id: company_settings.id })
        .from(company_settings)
        .where(eq(company_settings.company_name, s.company_name));
      if (!exists.length) {
        await db.insert(company_settings).values(s);
      }
    }

    const vehicleCategories = [
      { id: generateUuid(), name: 'Passeio', description: 'Veículos de passeio', color: '#3B82F6', created_by: adminId },
      { id: generateUuid(), name: 'Utilitário', description: 'Veículos utilitários', color: '#10B981', created_by: adminId },
      { id: generateUuid(), name: 'Caminhão', description: 'Caminhões e veículos pesados', color: '#F59E0B', created_by: adminId },
      { id: generateUuid(), name: 'Moto', description: 'Motocicletas', color: '#8B5CF6', created_by: adminId },
      { id: generateUuid(), name: 'Van', description: 'Vans e micro-ônibus', color: '#EC4899', created_by: adminId },
    ];

    for (const category of vehicleCategories) {
      const exists = await db
        .select({ id: vehicle_categories.id })
        .from(vehicle_categories)
        .where(eq(vehicle_categories.name, category.name));
      if (!exists.length) {
        await db.insert(vehicle_categories).values({
          ...category
        });
      }
    }

    const maintenanceCategories = [
      { id: generateUuid(), name: 'Troca de Óleo', type: maintenanceType.PREVENTIVE, color: '#10B981', created_by: adminId },
      { id: generateUuid(), name: 'Revisão Geral', type: maintenanceType.PREVENTIVE, color: '#3B82F6', created_by: adminId },
      { id: generateUuid(), name: 'Alinhamento e Balanceamento', type: maintenanceType.PREVENTIVE, color: '#6366F1', created_by: adminId },
      { id: generateUuid(), name: 'Freios', type: maintenanceType.CORRECTIVE, color: '#F59E0B', created_by: adminId },
      { id: generateUuid(), name: 'Motor', type: maintenanceType.CORRECTIVE, color: '#EF4444', created_by: adminId },
      { id: generateUuid(), name: 'Suspensão', type: maintenanceType.CORRECTIVE, color: '#F97316', created_by: adminId },
      { id: generateUuid(), name: 'Elétrica', type: maintenanceType.CORRECTIVE, color: '#8B5CF6', created_by: adminId },
    ];

    for (const category of maintenanceCategories) {
      const exists = await db
        .select({ id: maintenance_categories.id })
        .from(maintenance_categories)
        .where(eq(maintenance_categories.name, category.name));
      if (!exists.length) {
        await db.insert(maintenance_categories).values({
          ...category
        });
      }
    }

    const expenseCategories = [
      { id: generateUuid(), name: 'Combustível', type: expenseCategoryType.OPERATIONAL, color: '#10B981', created_by: adminId },
      { id: generateUuid(), name: 'Manutenção', type: expenseCategoryType.OPERATIONAL, color: '#F59E0B', created_by: adminId },
      { id: generateUuid(), name: 'Seguro', type: expenseCategoryType.OPERATIONAL, color: '#3B82F6', created_by: adminId },
      { id: generateUuid(), name: 'Licenciamento', type: expenseCategoryType.OPERATIONAL, color: '#6366F1', created_by: adminId },
      { id: generateUuid(), name: 'Pedágio', type: expenseCategoryType.OPERATIONAL, color: '#8B5CF6', created_by: adminId },
      { id: generateUuid(), name: 'Lavagem', type: expenseCategoryType.OPERATIONAL, color: '#14B8A6', created_by: adminId },
      { id: generateUuid(), name: 'Multas', type: expenseCategoryType.EXTRAORDINARY, color: '#EF4444', created_by: adminId },
      { id: generateUuid(), name: 'Salários', type: expenseCategoryType.ADMINISTRATIVE, color: '#EC4899', created_by: adminId },
      { id: generateUuid(), name: 'Outras Despesas', type: expenseCategoryType.ADMINISTRATIVE, color: '#64748B', created_by: adminId },
    ];

    for (const category of expenseCategories) {
      const exists = await db
        .select({ id: expense_categories.id })
        .from(expense_categories)
        .where(eq(expense_categories.name, category.name));
      if (!exists.length) {
        await db.insert(expense_categories).values({
          ...category
        });
      }
    }

    const clientsList = [
      { id: generateUuid(), name: 'Cliente 1', email: 'cliente1@fleet.local' },
      { id: generateUuid(), name: 'Cliente 2', email: 'cliente2@fleet.local' },
      { id: generateUuid(), name: 'Cliente 3', email: 'cliente3@fleet.local' },
      { id: generateUuid(), name: 'Cliente 4', email: 'cliente4@fleet.local' },
      { id: generateUuid(), name: 'Cliente 5', email: 'cliente5@fleet.local' },
    ];
    for (const c of clientsList) {
      const exists = await db
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.email, c.email));
      if (!exists.length) {
        await db.insert(clients).values(c);
      }
    }

    const workshopsList = [
      { id: generateUuid(), name: 'Oficina Central', city: 'Luanda', created_by: adminId },
      { id: generateUuid(), name: 'Mecânica Rápida', city: 'Benguela', created_by: adminId },
      { id: generateUuid(), name: 'Auto Serviços', city: 'Huambo', created_by: adminId },
      { id: generateUuid(), name: 'Manutenção 24h', city: 'Lubango', created_by: adminId },
      { id: generateUuid(), name: 'Oficina Popular', city: 'Cabinda', created_by: adminId },
    ];
    for (const w of workshopsList) {
      const exists = await db
        .select({ id: workshops.id })
        .from(workshops)
        .where(and(eq(workshops.name, w.name), eq(workshops.city, w.city || '')));
      if (!exists.length) {
        await db.insert(workshops).values(w);
      }
    }

    const vehiclesList = [
      { id: generateUuid(), category_id: vehicleCategories[0].id, license_plate: 'ABC-1001', brand: 'Toyota', model: 'Corolla', year: 2018, color: 'Prata', current_mileage: 45000, created_by: adminId },
      { id: generateUuid(), category_id: vehicleCategories[1].id, license_plate: 'DEF-2002', brand: 'Ford', model: 'Ranger', year: 2020, color: 'Azul', current_mileage: 32000, created_by: adminId },
      { id: generateUuid(), category_id: vehicleCategories[2].id, license_plate: 'GHI-3003', brand: 'Volvo', model: 'FH', year: 2016, color: 'Branco', current_mileage: 120000, created_by: adminId },
      { id: generateUuid(), category_id: vehicleCategories[3].id, license_plate: 'JKL-4004', brand: 'Honda', model: 'CG 160', year: 2022, color: 'Vermelho', current_mileage: 8000, created_by: adminId },
      { id: generateUuid(), category_id: vehicleCategories[4].id, license_plate: 'MNO-5005', brand: 'Mercedes', model: 'Sprinter', year: 2019, color: 'Preto', current_mileage: 54000, created_by: adminId },
    ];
    for (const v of vehiclesList) {
      const exists = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(eq(vehicles.license_plate, v.license_plate));
      if (!exists.length) {
        await db.insert(vehicles).values(v);
      }
    }

    const driversList = [
      { id: generateUuid(), name: 'João Silva', license_number: 'DL-0001', license_category: 'B', license_expiry_date: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(), email: 'joao@fleet.local', phone: '900000001', created_by: adminId },
      { id: generateUuid(), name: 'Maria Santos', license_number: 'DL-0002', license_category: 'C', license_expiry_date: new Date(Date.now() + 500 * 24 * 60 * 60 * 1000).toISOString(), email: 'maria@fleet.local', phone: '900000002', created_by: adminId },
      { id: generateUuid(), name: 'Pedro Lima', license_number: 'DL-0003', license_category: 'D', license_expiry_date: new Date(Date.now() + 600 * 24 * 60 * 60 * 1000).toISOString(), email: 'pedro@fleet.local', phone: '900000003', created_by: adminId },
      { id: generateUuid(), name: 'Ana Costa', license_number: 'DL-0004', license_category: 'E', license_expiry_date: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000).toISOString(), email: 'ana@fleet.local', phone: '900000004', created_by: adminId },
      { id: generateUuid(), name: 'Carlos Rocha', license_number: 'DL-0005', license_category: 'A', license_expiry_date: new Date(Date.now() + 800 * 24 * 60 * 60 * 1000).toISOString(), email: 'carlos@fleet.local', phone: '900000005', created_by: adminId },
    ];
    for (const d of driversList) {
      const exists = await db
        .select({ id: drivers.id })
        .from(drivers)
        .where(eq(drivers.license_number, d.license_number));
      if (!exists.length) {
        await db.insert(drivers).values(d);
      }
    }

    const routesList = [
      { id: generateUuid(), name: 'Luanda - Benguela', origin: 'Luanda', destination: 'Benguela', distance_km: 600, created_by: adminId },
      { id: generateUuid(), name: 'Luanda - Huambo', origin: 'Luanda', destination: 'Huambo', distance_km: 700, created_by: adminId },
      { id: generateUuid(), name: 'Benguela - Lubango', origin: 'Benguela', destination: 'Lubango', distance_km: 300, created_by: adminId },
      { id: generateUuid(), name: 'Luanda - Cabinda', origin: 'Luanda', destination: 'Cabinda', distance_km: 400, created_by: adminId },
      { id: generateUuid(), name: 'Huambo - Kuito', origin: 'Huambo', destination: 'Kuito', distance_km: 150, created_by: adminId },
    ];
    for (const r of routesList) {
      const exists = await db
        .select({ id: routes.id })
        .from(routes)
        .where(and(eq(routes.name, r.name), eq(routes.origin, r.origin), eq(routes.destination, r.destination)));
      if (!exists.length) {
        await db.insert(routes).values(r);
      }
    }

    const tripCode = () => `VIA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const tripsList = [
      { id: generateUuid(), vehicle_id: vehiclesList[0].id, driver_id: driversList[0].id, route_id: routesList[0].id, trip_code: tripCode(), start_date: new Date().toISOString(), start_mileage: 45000, origin: 'Luanda', destination: 'Benguela', created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[1].id, driver_id: driversList[1].id, route_id: routesList[1].id, trip_code: tripCode(), start_date: new Date().toISOString(), start_mileage: 32000, origin: 'Luanda', destination: 'Huambo', created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[2].id, driver_id: driversList[2].id, route_id: routesList[2].id, trip_code: tripCode(), start_date: new Date().toISOString(), start_mileage: 120000, origin: 'Benguela', destination: 'Lubango', created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[3].id, driver_id: driversList[3].id, route_id: routesList[3].id, trip_code: tripCode(), start_date: new Date().toISOString(), start_mileage: 8000, origin: 'Luanda', destination: 'Cabinda', created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[4].id, driver_id: driversList[4].id, route_id: routesList[4].id, trip_code: tripCode(), start_date: new Date().toISOString(), start_mileage: 54000, origin: 'Huambo', destination: 'Kuito', created_by: adminId },
    ];
    for (const t of tripsList) {
      const exists = await db
        .select({ id: trips.id })
        .from(trips)
        .where(eq(trips.trip_code, t.trip_code));
      if (!exists.length) {
        await db.insert(trips).values(t);
      }
    }

    const maintenancesList = [
      { id: generateUuid(), vehicle_id: vehiclesList[0].id, category_id: maintenanceCategories[0].id, type: maintenanceCategories[0].type, entry_date: new Date().toISOString(), vehicle_mileage: 45200, description: 'Troca de óleo e filtros', workshop_id: workshopsList[0].id, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[1].id, category_id: maintenanceCategories[3].id, type: maintenanceCategories[3].type, entry_date: new Date().toISOString(), vehicle_mileage: 32500, description: 'Reparo nos freios', workshop_id: workshopsList[1].id, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[2].id, category_id: maintenanceCategories[1].id, type: maintenanceCategories[1].type, entry_date: new Date().toISOString(), vehicle_mileage: 120500, description: 'Revisão geral', workshop_id: workshopsList[2].id, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[3].id, category_id: maintenanceCategories[6].id, type: maintenanceCategories[6].type, entry_date: new Date().toISOString(), vehicle_mileage: 8100, description: 'Sistema elétrico', workshop_id: workshopsList[3].id, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[4].id, category_id: maintenanceCategories[5].id, type: maintenanceCategories[5].type, entry_date: new Date().toISOString(), vehicle_mileage: 54250, description: 'Suspensão dianteira', workshop_id: workshopsList[4].id, created_by: adminId },
    ];
    for (const m of maintenancesList) {
      const exists = await db
        .select({ id: maintenances.id })
        .from(maintenances)
        .where(and(eq(maintenances.vehicle_id, m.vehicle_id), eq(maintenances.entry_date, m.entry_date), eq(maintenances.description, m.description)));
      if (!exists.length) {
        await db.insert(maintenances).values(m);
      }
    }

    const maintenanceItemsList = [
      { id: generateUuid(), maintenance_id: maintenancesList[0].id, type: maintenanceItemType.PART, description: 'Filtro de óleo', quantity: 1, unit_price: 5000, total_price: 5000, created_by: adminId },
      { id: generateUuid(), maintenance_id: maintenancesList[0].id, type: maintenanceItemType.SERVICE, description: 'Mão de obra troca óleo', quantity: 1, unit_price: 7000, total_price: 7000, created_by: adminId },
      { id: generateUuid(), maintenance_id: maintenancesList[1].id, type: maintenanceItemType.PART, description: 'Pastilhas de freio', quantity: 1, unit_price: 8000, total_price: 8000, created_by: adminId },
      { id: generateUuid(), maintenance_id: maintenancesList[2].id, type: maintenanceItemType.SERVICE, description: 'Revisão completa', quantity: 1, unit_price: 15000, total_price: 15000, created_by: adminId },
      { id: generateUuid(), maintenance_id: maintenancesList[3].id, type: maintenanceItemType.SERVICE, description: 'Diagnóstico elétrico', quantity: 1, unit_price: 6000, total_price: 6000, created_by: adminId },
    ];
    for (const mi of maintenanceItemsList) {
      const exists = await db
        .select({ id: maintenance_items.id })
        .from(maintenance_items)
        .where(and(
          eq(maintenance_items.maintenance_id, mi.maintenance_id),
          eq(maintenance_items.description, mi.description),
          eq(maintenance_items.type, mi.type as 'part' | 'service')
        ));
      if (!exists.length) {
        await db.insert(maintenance_items).values(mi);
      }
    }

    const fuelStationsList = [
      { id: generateUuid(), name: 'Pumangol Central', brand: 'Pumangol', city: 'Luanda', created_by: adminId },
      { id: generateUuid(), name: 'Sonangol Luanda Sul', brand: 'Sonangol', city: 'Luanda', created_by: adminId },
      { id: generateUuid(), name: 'Total Benguela', brand: 'Total', city: 'Benguela', created_by: adminId },
      { id: generateUuid(), name: 'Pumangol Huambo', brand: 'Pumangol', city: 'Huambo', created_by: adminId },
      { id: generateUuid(), name: 'Sonangol Lubango', brand: 'Sonangol', city: 'Lubango', created_by: adminId },
    ];
    for (const fs of fuelStationsList) {
      const exists = await db
        .select({ id: fuel_stations.id })
        .from(fuel_stations)
        .where(and(eq(fuel_stations.name, fs.name), eq(fuel_stations.city, fs.city || '')));
      if (!exists.length) {
        await db.insert(fuel_stations).values(fs);
      }
    }

    const refuelingsList = [
      { id: generateUuid(), vehicle_id: vehiclesList[0].id, driver_id: driversList[0].id, station_id: fuelStationsList[0].id, refueling_date: new Date().toISOString(), fuel_type: fuelType.GASOLINE, liters: 40, price_per_liter: 200, total_cost: 8000, current_mileage: 45250, is_full_tank: true, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[1].id, driver_id: driversList[1].id, station_id: fuelStationsList[1].id, refueling_date: new Date().toISOString(), fuel_type: fuelType.DIESEL, liters: 60, price_per_liter: 180, total_cost: 10800, current_mileage: 32550, is_full_tank: true, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[2].id, driver_id: driversList[2].id, station_id: fuelStationsList[2].id, refueling_date: new Date().toISOString(), fuel_type: fuelType.DIESEL, liters: 120, price_per_liter: 170, total_cost: 20400, current_mileage: 120600, is_full_tank: true, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[3].id, driver_id: driversList[3].id, station_id: fuelStationsList[3].id, refueling_date: new Date().toISOString(), fuel_type: fuelType.GASOLINE, liters: 12, price_per_liter: 210, total_cost: 2520, current_mileage: 8150, is_full_tank: true, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[4].id, driver_id: driversList[4].id, station_id: fuelStationsList[4].id, refueling_date: new Date().toISOString(), fuel_type: fuelType.DIESEL, liters: 70, price_per_liter: 190, total_cost: 13300, current_mileage: 54300, is_full_tank: true, created_by: adminId },
    ];
    for (const rf of refuelingsList) {
      const exists = await db
        .select({ id: refuelings.id })
        .from(refuelings)
        .where(and(eq(refuelings.vehicle_id, rf.vehicle_id), eq(refuelings.refueling_date, rf.refueling_date), eq(refuelings.liters, rf.liters)));
      if (!exists.length) {
        await db.insert(refuelings).values(rf);
      }
    }

    const expensesList = [
      { id: generateUuid(), category_id: expenseCategories[0].id, description: 'Abastecimento gasolina', amount: 8000, expense_date: new Date().toISOString(), vehicle_id: vehiclesList[0].id, driver_id: driversList[0].id, created_by: adminId },
      { id: generateUuid(), category_id: expenseCategories[1].id, description: 'Troca de pastilhas', amount: 8000, expense_date: new Date().toISOString(), vehicle_id: vehiclesList[1].id, created_by: adminId },
      { id: generateUuid(), category_id: expenseCategories[2].id, description: 'Seguro anual', amount: 150000, expense_date: new Date().toISOString(), vehicle_id: vehiclesList[2].id, created_by: adminId },
      { id: generateUuid(), category_id: expenseCategories[5].id, description: 'Lavagem completa', amount: 3000, expense_date: new Date().toISOString(), vehicle_id: vehiclesList[3].id, created_by: adminId },
      { id: generateUuid(), category_id: expenseCategories[8].id, description: 'Materiais de escritório', amount: 5000, expense_date: new Date().toISOString(), created_by: adminId },
    ];
    for (const e of expensesList) {
      const exists = await db
        .select({ id: expenses.id })
        .from(expenses)
        .where(and(eq(expenses.description, e.description), eq(expenses.expense_date, e.expense_date), eq(expenses.amount, e.amount)));
      if (!exists.length) {
        await db.insert(expenses).values(e);
      }
    }

    const finesList = [
      { id: generateUuid(), vehicle_id: vehiclesList[0].id, driver_id: driversList[0].id, fine_number: `F-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, fine_date: new Date().toISOString(), infraction_type: 'Excesso de velocidade', description: 'Velocidade acima do limite', location: 'Luanda', fine_amount: 10000, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[1].id, driver_id: driversList[1].id, fine_number: `F-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, fine_date: new Date().toISOString(), infraction_type: 'Estacionamento irregular', description: 'Estacionado em local proibido', location: 'Huambo', fine_amount: 5000, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[2].id, driver_id: driversList[2].id, fine_number: `F-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, fine_date: new Date().toISOString(), infraction_type: 'Documentação vencida', description: 'Licença vencida', location: 'Benguela', fine_amount: 8000, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[3].id, driver_id: driversList[3].id, fine_number: `F-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, fine_date: new Date().toISOString(), infraction_type: 'Sem cinto', description: 'Condução sem cinto', location: 'Luanda', fine_amount: 3000, created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[4].id, driver_id: driversList[4].id, fine_number: `F-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, fine_date: new Date().toISOString(), infraction_type: 'Ultrapassagem indevida', description: 'Ultrapassagem proibida', location: 'Kuito', fine_amount: 7000, created_by: adminId },
    ];
    for (const f of finesList) {
      const exists = await db
        .select({ id: fines.id })
        .from(fines)
        .where(eq(fines.fine_number, f.fine_number));
      if (!exists.length) {
        await db.insert(fines).values(f);
      }
    }

    const vehicleDocumentsList = [
      { id: generateUuid(), vehicle_id: vehiclesList[0].id, document_type: 'license', document_number: 'LIC-0001', issue_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[1].id, document_type: 'insurance', document_number: 'INS-0002', issue_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[2].id, document_type: 'inspection', document_number: 'INSP-0003', issue_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[3].id, document_type: 'license', document_number: 'LIC-0004', issue_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), created_by: adminId },
      { id: generateUuid(), vehicle_id: vehiclesList[4].id, document_type: 'insurance', document_number: 'INS-0005', issue_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(), created_by: adminId },
    ];
    for (const vd of vehicleDocumentsList) {
      const exists = await db
        .select({ id: vehicle_documents.id })
        .from(vehicle_documents)
        .where(and(eq(vehicle_documents.vehicle_id, vd.vehicle_id), eq(vehicle_documents.document_type, vd.document_type), eq(vehicle_documents.document_number, vd.document_number || '')));
      if (!exists.length) {
        await db.insert(vehicle_documents).values(vd);
      }
    }

    const auditLogsList = [
      { id: generateUuid(), user_id: adminId, table_name: 'vehicles', record_id: vehiclesList[0].id, action: auditAction.CREATE },
      { id: generateUuid(), user_id: adminId, table_name: 'drivers', record_id: driversList[0].id, action: auditAction.CREATE },
      { id: generateUuid(), user_id: adminId, table_name: 'trips', record_id: tripsList[0].id, action: auditAction.CREATE },
      { id: generateUuid(), user_id: adminId, table_name: 'maintenances', record_id: maintenancesList[0].id, action: auditAction.CREATE },
      { id: generateUuid(), user_id: adminId, table_name: 'expenses', record_id: expensesList[0].id, action: auditAction.CREATE },
    ];
    for (const al of auditLogsList) {
      const exists = await db
        .select({ id: audit_logs.id })
        .from(audit_logs)
        .where(and(eq(audit_logs.table_name, al.table_name), eq(audit_logs.record_id, al.record_id), eq(audit_logs.action, al.action)));
      if (!exists.length) {
        await db.insert(audit_logs).values(al);
      }
    }

    // const systemInfoList = [
    //   { systemName: 'FleetControl', version: '1.0.0', installedAt: new Date().toISOString() },
    //   { systemName: 'FleetControl', version: '1.0.1', installedAt: new Date().toISOString() },
    //   { systemName: 'FleetControl', version: '1.0.2', installedAt: new Date().toISOString() },
    //   { systemName: 'FleetControl', version: '1.0.3', installedAt: new Date().toISOString() },
    //   { systemName: 'FleetControl', version: '1.0.4', installedAt: new Date().toISOString() },
    // ];
    // for (const si of systemInfoList) {
    //   const exists = await db
    //     .select({ id: systemInfo.id })
    //     .from(systemInfo)
    //     .where(and(eq(systemInfo.systemName, si.systemName), eq(systemInfo.version, si.version)));
    //   if (!exists.length) {
    //     await db.insert(systemInfo).values(si);
    //   }
    // }

    console.log('Database seeded successfully!');
    console.log('Default credentials: admin@fleet.local / admin123');
    
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}
