// ========================================
// FILE: src/contexts/RefuelingsContext.tsx (ATUALIZADO)
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== TYPES ====================

export interface Refueling {
  // Core fields
  id: string;
  vehicle_id: string;
  driver_id?: string | null;
  station_id?: string | null;
  trip_id?: string | null;
  refueling_date: string;
  fuel_type: string;
  liters: number;
  price_per_liter: number;
  total_cost: number;
  current_mileage: number;
  is_full_tank: boolean;
  invoice_number?: string | null;
  notes?: string | null;
  created_at: string;
  
  // Vehicle relations
  vehicle_license?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  
  // Driver relations
  driver_name?: string;
  
  // Fuel Station relations
  station_name?: string;
  station_brand?: string;
  station_city?: string;
  
  // Trip relations (NOVO)
  trip_code?: string;
  trip_destination?: string;
  trip_origin?: string;
  trip_start_date?: string;
  trip_status?: string;
  trip_driver_id?: string;
  
  // Route relations (NOVO)
  route_name?: string;
  route_origin?: string;
  route_destination?: string;
}

export interface FuelStation {
  id: string;
  name: string;
  brand?: string;
  phone?: string;
  address?: string;
  city?: string;
  fuel_types?: string;
  has_convenience_store: string;
  has_car_wash: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

interface RefuelingsState {
  refuelings: Refueling[];
  fuelStations: FuelStation[];
  selectedRefueling: Refueling | null;
  selectedFuelStation: FuelStation | null;
  isLoading: boolean;
  isFuelStationsLoading: boolean;
}

type RefuelingsAction =
  | { type: 'SET_REFUELINGS'; payload: Refueling[] }
  | { type: 'ADD_REFUELING'; payload: Refueling }
  | { type: 'UPDATE_REFUELING'; payload: Refueling }
  | { type: 'DELETE_REFUELING'; payload: string }
  | { type: 'SELECT_REFUELING'; payload: Refueling | null }
  | { type: 'SET_FUEL_STATIONS'; payload: FuelStation[] }
  | { type: 'ADD_FUEL_STATION'; payload: FuelStation }
  | { type: 'UPDATE_FUEL_STATION'; payload: FuelStation }
  | { type: 'DELETE_FUEL_STATION'; payload: string }
  | { type: 'SELECT_FUEL_STATION'; payload: FuelStation | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FUEL_STATIONS_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function refuelingsReducer(state: RefuelingsState, action: RefuelingsAction): RefuelingsState {
  switch (action.type) {
    case 'SET_REFUELINGS':
      return { ...state, refuelings: action.payload, isLoading: false };

    case 'ADD_REFUELING':
      return { ...state, refuelings: [action.payload, ...state.refuelings] };

    case 'UPDATE_REFUELING': {
      const updatedRefuelings = state.refuelings.map(r =>
        r.id === action.payload.id ? action.payload : r
      );
      const updatedSelected = state.selectedRefueling?.id === action.payload.id
        ? action.payload
        : state.selectedRefueling;
      return { ...state, refuelings: updatedRefuelings, selectedRefueling: updatedSelected };
    }

    case 'DELETE_REFUELING':
      return {
        ...state,
        refuelings: state.refuelings.filter(r => r.id !== action.payload),
        selectedRefueling: state.selectedRefueling?.id === action.payload ? null : state.selectedRefueling,
      };

    case 'SELECT_REFUELING':
      return { ...state, selectedRefueling: action.payload };

    case 'SET_FUEL_STATIONS':
      return { ...state, fuelStations: action.payload, isFuelStationsLoading: false };

    case 'ADD_FUEL_STATION':
      return { ...state, fuelStations: [action.payload, ...state.fuelStations] };

    case 'UPDATE_FUEL_STATION': {
      const updatedStations = state.fuelStations.map(s =>
        s.id === action.payload.id ? action.payload : s
      );
      const updatedSelectedStation = state.selectedFuelStation?.id === action.payload.id
        ? action.payload
        : state.selectedFuelStation;
      return { ...state, fuelStations: updatedStations, selectedFuelStation: updatedSelectedStation };
    }

    case 'DELETE_FUEL_STATION':
      return {
        ...state,
        fuelStations: state.fuelStations.filter(s => s.id !== action.payload),
        selectedFuelStation: state.selectedFuelStation?.id === action.payload ? null : state.selectedFuelStation,
      };

    case 'SELECT_FUEL_STATION':
      return { ...state, selectedFuelStation: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_FUEL_STATIONS_LOADING':
      return { ...state, isFuelStationsLoading: action.payload };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface RefuelingsContextType {
  state: RefuelingsState;
  dispatch: React.Dispatch<RefuelingsAction>;
  // Refuelings
  setRefuelings: (refuelings: Refueling[]) => void;
  addRefueling: (refueling: Refueling) => void;
  updateRefueling: (refueling: Refueling) => void;
  deleteRefueling: (id: string) => void;
  selectRefueling: (refueling: Refueling | null) => void;
  // Fuel Stations
  setFuelStations: (stations: FuelStation[]) => void;
  addFuelStation: (station: FuelStation) => void;
  updateFuelStation: (station: FuelStation) => void;
  deleteFuelStation: (id: string) => void;
  selectFuelStation: (station: FuelStation | null) => void;
  // Loading
  setLoading: (loading: boolean) => void;
  setFuelStationsLoading: (loading: boolean) => void;
}

const RefuelingsContext = createContext<RefuelingsContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface RefuelingsProviderProps {
  children: ReactNode;
}

export function RefuelingsProvider({ children }: RefuelingsProviderProps) {
  const [state, dispatch] = useReducer(refuelingsReducer, {
    refuelings: [],
    fuelStations: [],
    selectedRefueling: null,
    selectedFuelStation: null,
    isLoading: true,
    isFuelStationsLoading: true,
  });

  const helpers = {
    // Refuelings
    setRefuelings: (refuelings: Refueling[]) => 
      dispatch({ type: 'SET_REFUELINGS', payload: refuelings }),
    addRefueling: (refueling: Refueling) => 
      dispatch({ type: 'ADD_REFUELING', payload: refueling }),
    updateRefueling: (refueling: Refueling) => 
      dispatch({ type: 'UPDATE_REFUELING', payload: refueling }),
    deleteRefueling: (id: string) => 
      dispatch({ type: 'DELETE_REFUELING', payload: id }),
    selectRefueling: (refueling: Refueling | null) => 
      dispatch({ type: 'SELECT_REFUELING', payload: refueling }),
    
    // Fuel Stations
    setFuelStations: (stations: FuelStation[]) => 
      dispatch({ type: 'SET_FUEL_STATIONS', payload: stations }),
    addFuelStation: (station: FuelStation) => 
      dispatch({ type: 'ADD_FUEL_STATION', payload: station }),
    updateFuelStation: (station: FuelStation) => 
      dispatch({ type: 'UPDATE_FUEL_STATION', payload: station }),
    deleteFuelStation: (id: string) => 
      dispatch({ type: 'DELETE_FUEL_STATION', payload: id }),
    selectFuelStation: (station: FuelStation | null) => 
      dispatch({ type: 'SELECT_FUEL_STATION', payload: station }),
    
    // Loading
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setFuelStationsLoading: (loading: boolean) => 
      dispatch({ type: 'SET_FUEL_STATIONS_LOADING', payload: loading }),
  };

  return (
    <RefuelingsContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </RefuelingsContext.Provider>
  );
}

// ==================== HOOK ====================
export function useRefuelings() {
  const context = useContext(RefuelingsContext);
  if (context === undefined) {
    throw new Error('useRefuelings must be used within a RefuelingsProvider');
  }
  return context;
}