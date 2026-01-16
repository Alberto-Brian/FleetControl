
import { 
  company_settings, 
  vehicle_categories, 
  maintenance_categories,
  expense_categories,
  users 
} from '../schemas';
import { dbManager, db } from '@/lib/db/db_client';
import { generateUuid } from '@/lib/utils/cripto';
import bcrypt from 'bcryptjs';
import { expenseCategoryType } from '../schemas/expense_categories';
import { maintenanceType } from '../schemas/maintenance_categories';

export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Criar usuário admin padrão
    const adminId = generateUuid();
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(users).values({
      id: adminId,
      name: 'Administrador',
      email: 'admin@fleet.local',
      password_hash: hashedPassword,
      is_active: true,
      created_by: adminId,
    });

    // Criar configurações da empresa
    await db.insert(company_settings).values({
      id: generateUuid(),
      company_name: 'Minha Empresa de Frotas',
      currency: 'AOA',
      timezone: 'Africa/Luanda',
    });

    // Categorias de veículos padrão
    const vehicleCategories = [
      { name: 'Passeio', description: 'Veículos de passeio', color: '#3B82F6' },
      { name: 'Utilitário', description: 'Veículos utilitários', color: '#10B981' },
      { name: 'Caminhão', description: 'Caminhões e veículos pesados', color: '#F59E0B' },
      { name: 'Moto', description: 'Motocicletas', color: '#8B5CF6' },
      { name: 'Van', description: 'Vans e micro-ônibus', color: '#EC4899' },
    ];

    for (const category of vehicleCategories) {
      await db.insert(vehicle_categories).values({
        id: generateUuid(),
        ...category,
        created_by: adminId,
      });
    }

    // Categorias de manutenção padrão
    const maintenanceCategories = [
      { name: 'Troca de Óleo', type: maintenanceType.PREVENTIVE, color: '#10B981' },
      { name: 'Revisão Geral', type: maintenanceType.PREVENTIVE, color: '#3B82F6' },
      { name: 'Alinhamento e Balanceamento', type: maintenanceType.PREVENTIVE, color: '#6366F1' },
      { name: 'Freios', type: maintenanceType.CORRECTIVE, color: '#F59E0B' },
      { name: 'Motor', type: maintenanceType.CORRECTIVE, color: '#EF4444' },
      { name: 'Suspensão', type: maintenanceType.CORRECTIVE, color: '#F97316' },
      { name: 'Elétrica', type: maintenanceType.CORRECTIVE, color: '#8B5CF6' },
    ];

    for (const category of maintenanceCategories) {
      await db.insert(maintenance_categories).values({
        id: generateUuid(),
        ...category,
        created_by: adminId,
      });
    }

    // Categorias de despesas padrão
    const expenseCategories = [
      { name: 'Combustível', type: expenseCategoryType.OPERATIONAL, color: '#10B981' },
      { name: 'Manutenção', type: expenseCategoryType.OPERATIONAL, color: '#F59E0B' },
      { name: 'Seguro', type: expenseCategoryType.OPERATIONAL, color: '#3B82F6' },
      { name: 'Licenciamento', type: expenseCategoryType.OPERATIONAL, color: '#6366F1' },
      { name: 'Pedágio', type: expenseCategoryType.OPERATIONAL, color: '#8B5CF6' },
      { name: 'Lavagem', type: expenseCategoryType.OPERATIONAL, color: '#14B8A6' },
      { name: 'Multas', type: expenseCategoryType.EXTRAORDINARY, color: '#EF4444' },
      { name: 'Salários', type: expenseCategoryType.ADMINISTRATIVE, color: '#EC4899' },
      { name: 'Outras Despesas', type: expenseCategoryType.ADMINISTRATIVE, color: '#64748B' },
    ];

    for (const category of expenseCategories) {
      await db.insert(expense_categories).values({
        id: generateUuid(),
        ...category,
        created_by: adminId,
      });
    }

    console.log('Database seeded successfully!');
    console.log('Default credentials: admin@fleet.local / admin123');
    
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}