// ========================================
// FILE: src/contexts/DashboardContext.tsx (ATUALIZADO)
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== TYPES ====================
export interface DashboardStats {
  // Veículos (5 status)
  totalVehicles: number;
  activeVehicles: number;
  inUseVehicles: number;
  inactiveVehicles: number;
  maintenanceVehicles: number;
  
  // Motoristas (4 estados)
  totalDrivers: number;
  availableDrivers: number;
  onTripDrivers: number;
  offlineDrivers: number;
  
  // Viagens (5 status)
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalDistance: number;
  
  // Abastecimentos
  totalRefuelings: number;
  totalFuelCost: number;
  totalFuelLiters: number;
  avgFuelPrice: number;
  
  // Manutenções (4 status)
  totalMaintenances: number;
  scheduledMaintenances: number;
  inProgressMaintenances: number;
  completedMaintenances: number;
  totalMaintenanceCost: number;
  
  // Despesas (4 status)
  totalExpenses: number;
  paidExpenses: number;
  pendingExpenses: number;
  overdueExpenses: number;
  totalExpenseAmount: number;
  
  // Multas (5 status)
  totalFines: number;
  pendingFines: number;
  paidFines: number;
  contestedFines: number;
  overdueFines: number;
  totalFineAmount: number;
}

export interface RecentActivity {
  id: string;
  type: 'trip' | 'refueling' | 'maintenance' | 'expense' | 'fine' | 'vehicle' | 'driver';
  title: string;
  description: string;
  date: string;
  amount?: number;
  status?: string;
  vehicle?: string;
  driver?: string;
}

export interface ChartData {
  fuelByMonth: Array<{ month: string; amount: number; liters: number }>;
  expensesByCategory: Array<{ category: string; amount: number; count: number }>;
  maintenancesByType: Array<{ type: string; count: number; cost: number }>;
  tripsByMonth: Array<{ month: string; count: number; distance: number }>;
  vehicleUtilization: Array<{ vehicle: string; trips: number; distance: number; fuel: number }>;
}

interface DashboardState {
  stats: DashboardStats | null;
  recentActivities: RecentActivity[];
  chartData: ChartData | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

type DashboardAction =
  | { type: 'SET_STATS'; payload: DashboardStats }
  | { type: 'SET_ACTIVITIES'; payload: RecentActivity[] }
  | { type: 'SET_CHART_DATA'; payload: ChartData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_TIMESTAMP' };

// ==================== REDUCER ====================
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'SET_ACTIVITIES':
      return { ...state, recentActivities: action.payload };

    case 'SET_CHART_DATA':
      return { ...state, chartData: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_TIMESTAMP':
      return { ...state, lastUpdated: new Date() };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  setStats: (stats: DashboardStats) => void;
  setActivities: (activities: RecentActivity[]) => void;
  setChartData: (data: ChartData) => void;
  setLoading: (loading: boolean) => void;
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, {
    stats: null,
    recentActivities: [],
    chartData: null,
    isLoading: true,
    lastUpdated: null,
  });

  const helpers = {
    setStats: (stats: DashboardStats) => {
      dispatch({ type: 'SET_STATS', payload: stats });
      dispatch({ type: 'UPDATE_TIMESTAMP' });
    },
    setActivities: (activities: RecentActivity[]) => 
      dispatch({ type: 'SET_ACTIVITIES', payload: activities }),
    setChartData: (data: ChartData) => 
      dispatch({ type: 'SET_CHART_DATA', payload: data }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    refreshData: () => 
      dispatch({ type: 'UPDATE_TIMESTAMP' }),
  };

  return (
    <DashboardContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </DashboardContext.Provider>
  );
}

// ==================== HOOK ====================
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}