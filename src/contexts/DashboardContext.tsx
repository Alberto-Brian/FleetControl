// ========================================
// FILE: src/contexts/DashboardContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { loadDashboardData } from '@/helpers/dashboard-helpers';
import { usePowerSyncDataChanged } from '@/hooks/usePowerSyncDataChanged';

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
  refreshData: () => Promise<void>;
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

  // `silent` — achado do utilizador (2026-09-0X): uma sync do PowerSync em
  // segundo plano disparava loadData(), que começava sempre por
  // SET_LOADING:true — DashboardPageContent troca a tela inteira por um
  // spinner enquanto isLoading é true, por isso uma actualização silenciosa
  // em segundo plano fazia o ecrã inteiro "piscar" (só visível quando o
  // Dashboard calhava estar em ecrã nesse momento — daí parecer aleatório).
  // Uma actualização em segundo plano nunca deve mostrar loading — só
  // trocar os dados quando estiverem prontos.
  const loadData = useCallback(async (silent = false) => {
    if (!silent) dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await loadDashboardData();
      dispatch({ type: 'SET_STATS', payload: data.stats });
      dispatch({ type: 'SET_ACTIVITIES', payload: data.activities });
      dispatch({ type: 'SET_CHART_DATA', payload: data.chartData });
      dispatch({ type: 'UPDATE_TIMESTAMP' });
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      if (!silent) dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ponto único (este Context, montado uma vez em App.tsx) — cobre todos
  // os consumidores de useDashboard() de uma só vez, sem precisar de
  // repetir isto em cada página. silent:true — ver nota acima.
  usePowerSyncDataChanged(
    ['vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'expenses'],
    () => loadData(true),
  );

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
    refreshData: loadData,
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