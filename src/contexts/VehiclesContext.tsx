// ========================================
// FILE: src/contexts/VehiclesContext.tsx (EXPANDIDO)
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

export interface VehicleCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VehiclesState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  // ✨ NOVO: Categorias
  categories: VehicleCategory[];
  selectedCategory: VehicleCategory | null;
  isCategoriesLoading: boolean;
}

type VehiclesAction =
  // Veículos
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SELECT_VEHICLE'; payload: Vehicle | null }
  | { type: 'SET_LOADING'; payload: boolean }
  // ✨ NOVO: Categorias
  | { type: 'SET_CATEGORIES'; payload: VehicleCategory[] }
  | { type: 'ADD_CATEGORY'; payload: VehicleCategory }
  | { type: 'UPDATE_CATEGORY'; payload: VehicleCategory }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SELECT_CATEGORY'; payload: VehicleCategory | null }
  | { type: 'SET_CATEGORIES_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function vehiclesReducer(state: VehiclesState, action: VehiclesAction): VehiclesState {
  switch (action.type) {
    // ========== VEÍCULOS ==========
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

    // ========== ✨ CATEGORIAS ==========
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        isCategoriesLoading: false,
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [action.payload, ...state.categories],
      };

    case 'UPDATE_CATEGORY': {
      const updatedCategories = state.categories.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      
      const updatedSelectedCategory = state.selectedCategory?.id === action.payload.id
        ? action.payload
        : state.selectedCategory;

      return {
        ...state,
        categories: updatedCategories,
        selectedCategory: updatedSelectedCategory,
      };
    }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
        selectedCategory: state.selectedCategory?.id === action.payload
          ? null
          : state.selectedCategory,
      };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case 'SET_CATEGORIES_LOADING':
      return {
        ...state,
        isCategoriesLoading: action.payload,
      };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface VehiclesContextType {
  state: VehiclesState;
  dispatch: React.Dispatch<VehiclesAction>;
  // Veículos
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
  setLoading: (loading: boolean) => void;
  // ✨ NOVO: Categorias
  setCategories: (categories: VehicleCategory[]) => void;
  addCategory: (category: VehicleCategory) => void;
  updateCategory: (category: VehicleCategory) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (category: VehicleCategory | null) => void;
  setCategoriesLoading: (loading: boolean) => void;
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
    // ✨ NOVO: Estado inicial das categorias
    categories: [],
    selectedCategory: null,
    isCategoriesLoading: true,
  });

  const helpers = {
    // Veículos
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

    // ✨ NOVO: Categorias
    setCategories: (categories: VehicleCategory[]) => 
      dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    
    addCategory: (category: VehicleCategory) => 
      dispatch({ type: 'ADD_CATEGORY', payload: category }),
    
    updateCategory: (category: VehicleCategory) => 
      dispatch({ type: 'UPDATE_CATEGORY', payload: category }),
    
    deleteCategory: (id: string) => 
      dispatch({ type: 'DELETE_CATEGORY', payload: id }),
    
    selectCategory: (category: VehicleCategory | null) => 
      dispatch({ type: 'SELECT_CATEGORY', payload: category }),
    
    setCategoriesLoading: (loading: boolean) => 
      dispatch({ type: 'SET_CATEGORIES_LOADING', payload: loading }),
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