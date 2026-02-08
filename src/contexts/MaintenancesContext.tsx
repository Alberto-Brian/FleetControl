// ========================================
// FILE: src/contexts/MaintenancesContext.tsx (ATUALIZADO COM WORKSHOPS)
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MaintenanceStatus, MaintenancePriority } from '@/lib/db/schemas/maintenances';

// ==================== TYPES ====================
export interface Maintenance {
  id: string;
  vehicle_id: string;
  vehicle_license?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  category_id: string;
  category_name?: string;
  category_type?: string;
  category_color?: string;
  workshop_id?: string | null;
  workshop_name?: string;
  type: 'preventive' | 'corrective';
  entry_date: string;
  exit_date?: string | null;
  vehicle_mileage: number;
  description: string;
  diagnosis?: string | null;
  solution?: string | null;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  work_order_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  type: 'preventive' | 'corrective';
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface Workshop {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  specialties?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

interface MaintenancesState {
  maintenances: Maintenance[];
  categories: MaintenanceCategory[];
  workshops: Workshop[]; // ✨ NOVO
  selectedMaintenance: Maintenance | null;
  selectedCategory: MaintenanceCategory | null;
  selectedWorkshop: Workshop | null; // ✨ NOVO
  isLoading: boolean;
  isCategoriesLoading: boolean;
  isWorkshopsLoading: boolean; // ✨ NOVO
}

type MaintenancesAction =
  | { type: 'SET_MAINTENANCES'; payload: Maintenance[] }
  | { type: 'ADD_MAINTENANCE'; payload: Maintenance }
  | { type: 'UPDATE_MAINTENANCE'; payload: Maintenance }
  | { type: 'DELETE_MAINTENANCE'; payload: string }
  | { type: 'SELECT_MAINTENANCE'; payload: Maintenance | null }
  | { type: 'SET_CATEGORIES'; payload: MaintenanceCategory[] }
  | { type: 'ADD_CATEGORY'; payload: MaintenanceCategory }
  | { type: 'UPDATE_CATEGORY'; payload: MaintenanceCategory }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SELECT_CATEGORY'; payload: MaintenanceCategory | null }
  | { type: 'SET_WORKSHOPS'; payload: Workshop[] } // ✨ NOVO
  | { type: 'ADD_WORKSHOP'; payload: Workshop } // ✨ NOVO
  | { type: 'UPDATE_WORKSHOP'; payload: Workshop } // ✨ NOVO
  | { type: 'DELETE_WORKSHOP'; payload: string } // ✨ NOVO
  | { type: 'SELECT_WORKSHOP'; payload: Workshop | null } // ✨ NOVO
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORIES_LOADING'; payload: boolean }
  | { type: 'SET_WORKSHOPS_LOADING'; payload: boolean }; // ✨ NOVO

// ==================== REDUCER ====================
function maintenancesReducer(state: MaintenancesState, action: MaintenancesAction): MaintenancesState {
  switch (action.type) {
    case 'SET_MAINTENANCES':
      return { ...state, maintenances: action.payload, isLoading: false };

    case 'ADD_MAINTENANCE':
      return { ...state, maintenances: [action.payload, ...state.maintenances] };

    case 'UPDATE_MAINTENANCE': {
      const updatedMaintenances = state.maintenances.map(m =>
        m.id === action.payload.id ? action.payload : m
      );
      const updatedSelected = state.selectedMaintenance?.id === action.payload.id
        ? action.payload
        : state.selectedMaintenance;
      return { ...state, maintenances: updatedMaintenances, selectedMaintenance: updatedSelected };
    }

    case 'DELETE_MAINTENANCE':
      return {
        ...state,
        maintenances: state.maintenances.filter(m => m.id !== action.payload),
        selectedMaintenance: state.selectedMaintenance?.id === action.payload ? null : state.selectedMaintenance,
      };

    case 'SELECT_MAINTENANCE':
      return { ...state, selectedMaintenance: action.payload };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, isCategoriesLoading: false };

    case 'ADD_CATEGORY':
      return { ...state, categories: [action.payload, ...state.categories] };

    case 'UPDATE_CATEGORY': {
      const updatedCategories = state.categories.map(c =>
        c.id === action.payload.id ? action.payload : c
      );
      const updatedSelectedCategory = state.selectedCategory?.id === action.payload.id
        ? action.payload
        : state.selectedCategory;
      return { ...state, categories: updatedCategories, selectedCategory: updatedSelectedCategory };
    }

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
        selectedCategory: state.selectedCategory?.id === action.payload ? null : state.selectedCategory,
      };

    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    // ✨ WORKSHOPS ACTIONS
    case 'SET_WORKSHOPS':
      return { ...state, workshops: action.payload, isWorkshopsLoading: false };

    case 'ADD_WORKSHOP':
      return { ...state, workshops: [action.payload, ...state.workshops] };

    case 'UPDATE_WORKSHOP': {
      const updatedWorkshops = state.workshops.map(w =>
        w.id === action.payload.id ? action.payload : w
      );
      const updatedSelectedWorkshop = state.selectedWorkshop?.id === action.payload.id
        ? action.payload
        : state.selectedWorkshop;
      return { ...state, workshops: updatedWorkshops, selectedWorkshop: updatedSelectedWorkshop };
    }

    case 'DELETE_WORKSHOP':
      return {
        ...state,
        workshops: state.workshops.filter(w => w.id !== action.payload),
        selectedWorkshop: state.selectedWorkshop?.id === action.payload ? null : state.selectedWorkshop,
      };

    case 'SELECT_WORKSHOP':
      return { ...state, selectedWorkshop: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CATEGORIES_LOADING':
      return { ...state, isCategoriesLoading: action.payload };

    case 'SET_WORKSHOPS_LOADING':
      return { ...state, isWorkshopsLoading: action.payload };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface MaintenancesContextType {
  state: MaintenancesState;
  dispatch: React.Dispatch<MaintenancesAction>;
  // Maintenances
  setMaintenances: (maintenances: Maintenance[]) => void;
  addMaintenance: (maintenance: Maintenance) => void;
  updateMaintenance: (maintenance: Maintenance) => void;
  deleteMaintenance: (id: string) => void;
  selectMaintenance: (maintenance: Maintenance | null) => void;
  // Categories
  setCategories: (categories: MaintenanceCategory[]) => void;
  addCategory: (category: MaintenanceCategory) => void;
  updateCategory: (category: MaintenanceCategory) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (category: MaintenanceCategory | null) => void;
  // ✨ Workshops
  setWorkshops: (workshops: Workshop[]) => void;
  addWorkshop: (workshop: Workshop) => void;
  updateWorkshop: (workshop: Workshop) => void;
  deleteWorkshop: (id: string) => void;
  selectWorkshop: (workshop: Workshop | null) => void;
  // Loading
  setLoading: (loading: boolean) => void;
  setCategoriesLoading: (loading: boolean) => void;
  setWorkshopsLoading: (loading: boolean) => void;
}

const MaintenancesContext = createContext<MaintenancesContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface MaintenancesProviderProps {
  children: ReactNode;
}

export function MaintenancesProvider({ children }: MaintenancesProviderProps) {
  const [state, dispatch] = useReducer(maintenancesReducer, {
    maintenances: [],
    categories: [],
    workshops: [],
    selectedMaintenance: null,
    selectedCategory: null,
    selectedWorkshop: null,
    isLoading: true,
    isCategoriesLoading: true,
    isWorkshopsLoading: true,
  });

  const helpers = {
    // Maintenances
    setMaintenances: (maintenances: Maintenance[]) => 
      dispatch({ type: 'SET_MAINTENANCES', payload: maintenances }),
    addMaintenance: (maintenance: Maintenance) => 
      dispatch({ type: 'ADD_MAINTENANCE', payload: maintenance }),
    updateMaintenance: (maintenance: Maintenance) => 
      dispatch({ type: 'UPDATE_MAINTENANCE', payload: maintenance }),
    deleteMaintenance: (id: string) => 
      dispatch({ type: 'DELETE_MAINTENANCE', payload: id }),
    selectMaintenance: (maintenance: Maintenance | null) => 
      dispatch({ type: 'SELECT_MAINTENANCE', payload: maintenance }),
    
    // Categories
    setCategories: (categories: MaintenanceCategory[]) => 
      dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    addCategory: (category: MaintenanceCategory) => 
      dispatch({ type: 'ADD_CATEGORY', payload: category }),
    updateCategory: (category: MaintenanceCategory) => 
      dispatch({ type: 'UPDATE_CATEGORY', payload: category }),
    deleteCategory: (id: string) => 
      dispatch({ type: 'DELETE_CATEGORY', payload: id }),
    selectCategory: (category: MaintenanceCategory | null) => 
      dispatch({ type: 'SELECT_CATEGORY', payload: category }),
    
    // ✨ Workshops
    setWorkshops: (workshops: Workshop[]) => 
      dispatch({ type: 'SET_WORKSHOPS', payload: workshops }),
    addWorkshop: (workshop: Workshop) => 
      dispatch({ type: 'ADD_WORKSHOP', payload: workshop }),
    updateWorkshop: (workshop: Workshop) => 
      dispatch({ type: 'UPDATE_WORKSHOP', payload: workshop }),
    deleteWorkshop: (id: string) => 
      dispatch({ type: 'DELETE_WORKSHOP', payload: id }),
    selectWorkshop: (workshop: Workshop | null) => 
      dispatch({ type: 'SELECT_WORKSHOP', payload: workshop }),
    
    // Loading
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setCategoriesLoading: (loading: boolean) => 
      dispatch({ type: 'SET_CATEGORIES_LOADING', payload: loading }),
    setWorkshopsLoading: (loading: boolean) => 
      dispatch({ type: 'SET_WORKSHOPS_LOADING', payload: loading }),
  };

  return (
    <MaintenancesContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </MaintenancesContext.Provider>
  );
}

// ==================== HOOK ====================
export function useMaintenances() {
  const context = useContext(MaintenancesContext);
  if (context === undefined) {
    throw new Error('useMaintenances must be used within a MaintenancesProvider');
  }
  return context;
}