// ========================================
// FILE: src/helpers/ipc/reports/reports-channels.ts
// ========================================

export const REPORTS_CHANNELS = {
  // Gerar relatórios
  GENERATE_VEHICLES: 'reports:generateVehicles',
  GENERATE_TRIPS: 'reports:generateTrips',
  GENERATE_FUEL: 'reports:generateFuel',
  GENERATE_MAINTENANCE: 'reports:generateMaintenance',
  GENERATE_FINANCIAL: 'reports:generateFinancial',
  GENERATE_GENERAL: 'reports:generateGeneral',
  
  // Buscar dados
  GET_VEHICLES_DATA: 'reports:getVehiclesData',
  GET_TRIPS_DATA: 'reports:getTripsData',
  GET_FUEL_DATA: 'reports:getFuelData',
  GET_MAINTENANCE_DATA: 'reports:getMaintenanceData',
  GET_FINANCIAL_DATA: 'reports:getFinancialData',
  GET_GENERAL_DATA: 'reports:getGeneralData',
  
  // Salvar PDF
  SAVE_PDF: 'reports:savePdf',
} as const;

export type ReportsChannels = typeof REPORTS_CHANNELS;