// ========================================
// FILE: src/contexts/DriversContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DriverStatus, DriverAvailability } from "@/lib/db/schemas/drivers";

// ==================== TYPES ====================
export interface Driver {
  id: string;
  name: string;
  tax_id: string | null;
  id_number: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  hire_date: string | null;
  status: DriverStatus;
  availability: DriverAvailability;
  photo: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DriversState {
  drivers: Driver[];
  selectedDriver: Driver | null;
  isLoading: boolean;
}

type DriversAction =
  | { type: 'SET_DRIVERS'; payload: Driver[] }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'DELETE_DRIVER'; payload: string }
  | { type: 'SELECT_DRIVER'; payload: Driver | null }
  | { type: 'SET_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function driversReducer(state: DriversState, action: DriversAction): DriversState {
  switch (action.type) {
    case 'SET_DRIVERS':
      return {
        ...state,
        drivers: action.payload,
        isLoading: false,
      };

    case 'ADD_DRIVER':
      return {
        ...state,
        drivers: [action.payload, ...state.drivers],
      };

    case 'UPDATE_DRIVER': {
      const updatedDrivers = state.drivers.map(d =>
        d.id === action.payload.id ? action.payload : d
      );
      
      const updatedSelected = state.selectedDriver?.id === action.payload.id
        ? action.payload
        : state.selectedDriver;

      return {
        ...state,
        drivers: updatedDrivers,
        selectedDriver: updatedSelected,
      };
    }

    case 'DELETE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.filter(d => d.id !== action.payload),
        selectedDriver: state.selectedDriver?.id === action.payload
          ? null
          : state.selectedDriver,
      };

    case 'SELECT_DRIVER':
      return {
        ...state,
        selectedDriver: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface DriversContextType {
  state: DriversState;
  dispatch: React.Dispatch<DriversAction>;
  // Helper functions
  setDrivers: (drivers: Driver[]) => void;
  addDriver: (driver: Driver) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  selectDriver: (driver: Driver | null) => void;
  setLoading: (loading: boolean) => void;
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface DriversProviderProps {
  children: ReactNode;
}

export function DriversProvider({ children }: DriversProviderProps) {
  const [state, dispatch] = useReducer(driversReducer, {
    drivers: [],
    selectedDriver: null,
    isLoading: true,
  });

  const helpers = {
    setDrivers: (drivers: Driver[]) => 
      dispatch({ type: 'SET_DRIVERS', payload: drivers }),
    
    addDriver: (driver: Driver) => 
      dispatch({ type: 'ADD_DRIVER', payload: driver }),
    
    updateDriver: (driver: Driver) => 
      dispatch({ type: 'UPDATE_DRIVER', payload: driver }),
    
    deleteDriver: (id: string) => 
      dispatch({ type: 'DELETE_DRIVER', payload: id }),
    
    selectDriver: (driver: Driver | null) => 
      dispatch({ type: 'SELECT_DRIVER', payload: driver }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };

  return (
    <DriversContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </DriversContext.Provider>
  );
}

// ==================== HOOK ====================
export function useDrivers() {
  const context = useContext(DriversContext);
  if (context === undefined) {
    throw new Error('useDrivers must be used within a DriversProvider');
  }
  return context;
}