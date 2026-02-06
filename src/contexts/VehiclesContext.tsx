// ========================================
// FILE: src/contexts/VehiclesContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== TYPES ====================
export interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  status: 'available' | 'in_use' | 'maintenance' | 'inactive';
  current_mileage: number;
  notes: string | null;
  category_id: string;
  category_name?: string;
  category_color?: string;
  chassis_number: string | null;
  engine_number: string | null;
  fuel_tank_capacity: number | null;
  acquisition_date: string | null;
  acquisition_value: number | null;
  photo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface VehiclesState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
}

type VehiclesAction =
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SELECT_VEHICLE'; payload: Vehicle | null }
  | { type: 'SET_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function vehiclesReducer(state: VehiclesState, action: VehiclesAction): VehiclesState {
  switch (action.type) {
    case 'SET_VEHICLES':
      return {
        ...state,
        vehicles: action.payload,
        isLoading: false,
      };

    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [action.payload, ...state.vehicles],
      };

    case 'UPDATE_VEHICLE': {
      const updatedVehicles = state.vehicles.map(v =>
        v.id === action.payload.id ? action.payload : v
      );
      
      // ✅ Se o veículo selecionado foi atualizado, atualiza também
      const updatedSelected = state.selectedVehicle?.id === action.payload.id
        ? action.payload
        : state.selectedVehicle;

      return {
        ...state,
        vehicles: updatedVehicles,
        selectedVehicle: updatedSelected,
      };
    }

    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(v => v.id !== action.payload),
        selectedVehicle: state.selectedVehicle?.id === action.payload
          ? null
          : state.selectedVehicle,
      };

    case 'SELECT_VEHICLE':
      return {
        ...state,
        selectedVehicle: action.payload,
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
interface VehiclesContextType {
  state: VehiclesState;
  dispatch: React.Dispatch<VehiclesAction>;
  // Helper functions
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
  setLoading: (loading: boolean) => void;
}

const VehiclesContext = createContext<VehiclesContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface VehiclesProviderProps {
  children: ReactNode;
}

export function VehiclesProvider({ children }: VehiclesProviderProps) {
  const [state, dispatch] = useReducer(vehiclesReducer, {
    vehicles: [],
    selectedVehicle: null,
    isLoading: true,
  });

  // ✅ Helper functions para facilitar o uso
  const helpers = {
    setVehicles: (vehicles: Vehicle[]) => 
      dispatch({ type: 'SET_VEHICLES', payload: vehicles }),
    
    addVehicle: (vehicle: Vehicle) => 
      dispatch({ type: 'ADD_VEHICLE', payload: vehicle }),
    
    updateVehicle: (vehicle: Vehicle) => 
      dispatch({ type: 'UPDATE_VEHICLE', payload: vehicle }),
    
    deleteVehicle: (id: string) => 
      dispatch({ type: 'DELETE_VEHICLE', payload: id }),
    
    selectVehicle: (vehicle: Vehicle | null) => 
      dispatch({ type: 'SELECT_VEHICLE', payload: vehicle }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };

  return (
    <VehiclesContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </VehiclesContext.Provider>
  );
}

// ==================== HOOK ====================
export function useVehicles() {
  const context = useContext(VehiclesContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
}