// ========================================
// FILE: src/lib/pdf/pdf-translations.ts
// ========================================

export type Language = 'pt' | 'en';

// ==================== TRADUÇÕES PT ====================

const ptTranslations = {
  // Headers
  companyName: 'FleetControl',
  companyTagline: 'Gestão de Frotas',
  
  // Report Titles
  reports: {
    vehicles: 'RELATÓRIO DE VEÍCULOS',
    drivers: 'RELATÓRIO DE MOTORISTAS',
    trips: 'RELATÓRIO DE VIAGENS',
    fuel: 'RELATÓRIO DE COMBUSTÍVEL',
    maintenance: 'RELATÓRIO DE MANUTENÇÕES',
    financial: 'RELATÓRIO FINANCEIRO',
    general: 'RELATÓRIO GERAL',
  },
  
  // Common
  period: 'Período',
  total: 'Total',
  generatedAt: 'Gerado em',
  page: 'Página',
  of: 'de',
  
  // Summary
  summary: 'Resumo',
  executiveSummary: 'Resumo Executivo',
  
  // Stats
  stats: {
    totalVehicles: 'Total de Veículos',
    available: 'Disponíveis',
    inUse: 'Em Uso',
    maintenance: 'Em Manutenção',
    inactive: 'Inactivos',
    totalMileage: 'Quilometragem Total',
    totalTrips: 'Viagens Realizadas',
    completed: 'Concluídas',
    inProgress: 'Em Andamento',
    cancelled: 'Canceladas',
    totalDistance: 'Distância Total',
    avgDistance: 'Distância Média',
    totalRefuelings: 'Total de Abastecimentos',
    totalLiters: 'Litros Totais',
    totalCost: 'Custo Total',
    avgPricePerLiter: 'Preço Médio/Litro',
    avgPerRefueling: 'Média por Abastecimento',
    preventive: 'Preventivas',
    corrective: 'Correctivas',
    totalMaintenances: 'Total de Manutenções',
    fuel: 'Combustível',
    maintenances: 'Manutenções',
    generalExpenses: 'Despesas Gerais',
    fines: 'Multas',
    totalGeneral: 'TOTAL GERAL',
    distanceTraveled: 'Distância Percorrida',
    totalDrivers: 'Total de Motoristas',
    active: 'Activos',
    onLeave: 'De Férias',
  },
  
  // Table Headers
  table: {
    licensePlate: 'Matrícula',
    vehicle: 'Veículo',
    category: 'Categoria',
    year: 'Ano',
    mileage: 'Km',
    status: 'Status',
    date: 'Data',
    route: 'Rota',
    driver: 'Motorista',
    distance: 'Distância',
    liters: 'Litros',
    pricePerLiter: 'Preço/L',
    description: 'Descrição',
    type: 'Tipo',
    cost: 'Custo',
    quantity: 'Quantidade',
    value: 'Valor',
    percentage: '%',
    amount: 'Montante',
    name: 'Nome',
    license: 'Carta',
    phone: 'Telefone',
    trips: 'Viagens',
  },
  
  // Sections
  sections: {
    vehicleList: 'Lista de Veículos',
    distributionByCategory: 'Distribuição por Categoria',
    distributionByStatus: 'Distribuição por Status',
    tripHistory: 'Histórico de Viagens',
    refuelingHistory: 'Histórico de Abastecimentos',
    topVehicles: 'Top 5 Veículos por Consumo',
    maintenanceHistory: 'Histórico de Manutenções',
    financialSummary: 'Resumo Financeiro',
    expensesByCategory: 'Despesas por Categoria',
    expenseDetails: 'Detalhamento de Despesas',
    costDistribution: 'Distribuição de Custos',
    fleetStatus: 'Status da Frota',
    driverList: 'Lista de Motoristas',
    topDrivers: 'Top 5 Motoristas por Distância',
  },
  
  // Status
  status: {
    available: 'DISPONÍVEL',
    in_use: 'EM USO',
    maintenance: 'MANUTENÇÃO',
    inactive: 'INACTIVO',
    pending: 'PENDENTE',
    completed: 'CONCLUÍDO',
    cancelled: 'CANCELADO',
    paid: 'PAGO',
    scheduled: 'AGENDADO',
    in_progress: 'EM ANDAMENTO',
    active: 'ACTIVO',
    on_leave: 'DE FÉRIAS',
  },
  
  // Types
  maintenanceTypes: {
    preventive: 'Preventiva',
    corrective: 'Correctiva',
  },
  
  // Empty State
  empty: {
    noData: 'Nenhum dado encontrado para o período selecionado',
  },
};

// ==================== TRADUÇÕES EN ====================

const enTranslations = {
  // Headers
  companyName: 'FleetControl',
  companyTagline: 'Fleet Management',
  
  // Report Titles
  reports: {
    vehicles: 'VEHICLES REPORT',
    drivers: 'DRIVERS REPORT',
    trips: 'TRIPS REPORT',
    fuel: 'FUEL REPORT',
    maintenance: 'MAINTENANCE REPORT',
    financial: 'FINANCIAL REPORT',
    general: 'GENERAL REPORT',
  },
  
  // Common
  period: 'Period',
  total: 'Total',
  generatedAt: 'Generated at',
  page: 'Page',
  of: 'of',
  
  // Summary
  summary: 'Summary',
  executiveSummary: 'Executive Summary',
  
  // Stats
  stats: {
    totalVehicles: 'Total Vehicles',
    available: 'Available',
    inUse: 'In Use',
    maintenance: 'In Maintenance',
    inactive: 'Inactive',
    totalMileage: 'Total Mileage',
    totalTrips: 'Total Trips',
    completed: 'Completed',
    inProgress: 'In Progress',
    cancelled: 'Cancelled',
    totalDistance: 'Total Distance',
    avgDistance: 'Average Distance',
    totalRefuelings: 'Total Refuelings',
    totalLiters: 'Total Liters',
    totalCost: 'Total Cost',
    avgPricePerLiter: 'Average Price/Liter',
    avgPerRefueling: 'Average per Refueling',
    preventive: 'Preventive',
    corrective: 'Corrective',
    totalMaintenances: 'Total Maintenances',
    fuel: 'Fuel',
    maintenances: 'Maintenances',
    generalExpenses: 'General Expenses',
    fines: 'Fines',
    totalGeneral: 'GRAND TOTAL',
    distanceTraveled: 'Distance Traveled',
    totalDrivers: 'Total Drivers',
    active: 'Active',
    onLeave: 'On Leave',
  },
  
  // Table Headers
  table: {
    licensePlate: 'License Plate',
    vehicle: 'Vehicle',
    category: 'Category',
    year: 'Year',
    mileage: 'Mileage',
    status: 'Status',
    date: 'Date',
    route: 'Route',
    driver: 'Driver',
    distance: 'Distance',
    liters: 'Liters',
    pricePerLiter: 'Price/L',
    description: 'Description',
    type: 'Type',
    cost: 'Cost',
    quantity: 'Quantity',
    value: 'Value',
    percentage: '%',
    amount: 'Amount',
    name: 'Name',
    license: 'License',
    phone: 'Phone',
    trips: 'Trips',
  },
  
  // Sections
  sections: {
    vehicleList: 'Vehicle List',
    distributionByCategory: 'Distribution by Category',
    distributionByStatus: 'Distribution by Status',
    tripHistory: 'Trip History',
    refuelingHistory: 'Refueling History',
    topVehicles: 'Top 5 Vehicles by Consumption',
    maintenanceHistory: 'Maintenance History',
    financialSummary: 'Financial Summary',
    expensesByCategory: 'Expenses by Category',
    expenseDetails: 'Expense Details',
    costDistribution: 'Cost Distribution',
    fleetStatus: 'Fleet Status',
    driverList: 'Driver List',
    topDrivers: 'Top 5 Drivers by Distance',
  },
  
  // Status
  status: {
    available: 'AVAILABLE',
    in_use: 'IN USE',
    maintenance: 'MAINTENANCE',
    inactive: 'INACTIVE',
    pending: 'PENDING',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    paid: 'PAID',
    scheduled: 'SCHEDULED',
    in_progress: 'IN PROGRESS',
    active: 'ACTIVE',
    on_leave: 'ON LEAVE',
  },
  
  // Types
  maintenanceTypes: {
    preventive: 'Preventive',
    corrective: 'Corrective',
  },
  
  // Empty State
  empty: {
    noData: 'No data found for the selected period',
  },
};

// ==================== EXPORT ====================

export type PDFTranslations = typeof ptTranslations;

const translations = {
  pt: ptTranslations,
  en: enTranslations,
};

// ==================== HELPER FUNCTION ====================

let currentLanguage: Language = 'pt';

export function setPDFLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getPDFLanguage(): Language {
  return currentLanguage;
}

export function t(): PDFTranslations {
  return translations[currentLanguage];
}

// Alias para facilitar uso
export const pdfT = t;