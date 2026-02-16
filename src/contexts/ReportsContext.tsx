// ========================================
// FILE: src/contexts/ReportsContext.tsx (SEGUINDO PADRÃO CORRETO)
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { ReportType } from '@/lib/pdf/pdf-generator-react';
import type { DateRange } from '@/helpers/report-helpers';

// ==================== TYPES ====================

interface ReportsState {
  selectedReportType: ReportType | null;
  dateRange: DateRange;
  isGenerating: boolean;
  error: string | null;
}

type ReportsAction =
  | { type: 'SELECT_REPORT'; payload: ReportType }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// ==================== REDUCER ====================

function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
  switch (action.type) {
    case 'SELECT_REPORT':
      return { ...state, selectedReportType: action.payload, error: null };

    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload, error: null };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isGenerating: false };

    case 'RESET':
      return {
        ...state,
        selectedReportType: null,
        isGenerating: false,
        error: null,
      };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================

interface ReportsContextType {
  state: ReportsState;
  dispatch: React.Dispatch<ReportsAction>;
  selectReport: (type: ReportType) => void;
  setDateRange: (range: DateRange) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// ==================== PROVIDER ====================

interface ReportsProviderProps {
  children: ReactNode;
}

export function ReportsProvider({ children }: ReportsProviderProps) {
  // Estado inicial: último mês
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const [state, dispatch] = useReducer(reportsReducer, {
    selectedReportType: null,
    dateRange: {
      start: lastMonth.toISOString().split('T')[0],
      end: lastMonthEnd.toISOString().split('T')[0],
    },
    isGenerating: false,
    error: null,
  });

  const helpers = {
    selectReport: (type: ReportType) => 
      dispatch({ type: 'SELECT_REPORT', payload: type }),
    
    setDateRange: (range: DateRange) => 
      dispatch({ type: 'SET_DATE_RANGE', payload: range }),
    
    setGenerating: (generating: boolean) => 
      dispatch({ type: 'SET_GENERATING', payload: generating }),
    
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    
    reset: () => 
      dispatch({ type: 'RESET' }),
  };

  return (
    <ReportsContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </ReportsContext.Provider>
  );
}

// ==================== HOOK ====================

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}