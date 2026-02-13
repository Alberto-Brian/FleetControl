// ========================================
// FILE: src/contexts/FinesContext.tsx (ATUALIZADO COM TIPOS EXPANDIDOS)
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== TYPES ====================
export interface Fine {
  id: string;
  vehicle_id: string;
  driver_id?: string | null;
  
  // ✅ Campos expandidos do JOIN (sempre presentes após queries)
  vehicle_license?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  driver_name?: string | null;
  
  fine_number: string;
  fine_date: string;
  infraction_type: string;
  description: string;
  location?: string | null;
  fine_amount: number;
  due_date?: string | null;
  payment_date?: string | null;
  status: string;
  points?: number | null;
  authority?: string | null;
  notes?: string | null;
  created_at: string;
}

interface FinesState {
  fines: Fine[];
  selectedFine: Fine | null;
  isLoading: boolean;
}

type FinesAction =
  | { type: 'SET_FINES'; payload: Fine[] }
  | { type: 'ADD_FINE'; payload: Fine }
  | { type: 'UPDATE_FINE'; payload: Fine }
  | { type: 'DELETE_FINE'; payload: string }
  | { type: 'SELECT_FINE'; payload: Fine | null }
  | { type: 'SET_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function finesReducer(state: FinesState, action: FinesAction): FinesState {
  switch (action.type) {
    case 'SET_FINES':
      return { ...state, fines: action.payload, isLoading: false };

    case 'ADD_FINE':
      return { ...state, fines: [action.payload, ...state.fines] };

    case 'UPDATE_FINE': {
      // ✅ IMPORTANTE: Preservar todos os dados expandidos
      const updatedFines = state.fines.map(f =>
        f.id === action.payload.id ? action.payload : f
      );
      
      // ✅ Se a multa atualizada é a selecionada, atualizar também
      const updatedSelected = state.selectedFine?.id === action.payload.id
        ? action.payload
        : state.selectedFine;
      
      return { 
        ...state, 
        fines: updatedFines, 
        selectedFine: updatedSelected 
      };
    }

    case 'DELETE_FINE':
      return {
        ...state,
        fines: state.fines.filter(f => f.id !== action.payload),
        selectedFine: state.selectedFine?.id === action.payload ? null : state.selectedFine,
      };

    case 'SELECT_FINE':
      return { ...state, selectedFine: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface FinesContextType {
  state: FinesState;
  dispatch: React.Dispatch<FinesAction>;
  setFines: (fines: Fine[]) => void;
  addFine: (fine: Fine) => void;
  updateFine: (fine: Fine) => void;
  deleteFine: (id: string) => void;
  selectFine: (fine: Fine | null) => void;
  setLoading: (loading: boolean) => void;
}

const FinesContext = createContext<FinesContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface FinesProviderProps {
  children: ReactNode;
}

export function FinesProvider({ children }: FinesProviderProps) {
  const [state, dispatch] = useReducer(finesReducer, {
    fines: [],
    selectedFine: null,
    isLoading: true,
  });

  const helpers = {
    setFines: (fines: Fine[]) => 
      dispatch({ type: 'SET_FINES', payload: fines }),
    addFine: (fine: Fine) => 
      dispatch({ type: 'ADD_FINE', payload: fine }),
    updateFine: (fine: Fine) => 
      dispatch({ type: 'UPDATE_FINE', payload: fine }),
    deleteFine: (id: string) => 
      dispatch({ type: 'DELETE_FINE', payload: id }),
    selectFine: (fine: Fine | null) => 
      dispatch({ type: 'SELECT_FINE', payload: fine }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };

  return (
    <FinesContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </FinesContext.Provider>
  );
}

// ==================== HOOK ====================
export function useFines() {
  const context = useContext(FinesContext);
  if (context === undefined) {
    throw new Error('useFines must be used within a FinesProvider');
  }
  return context;
}