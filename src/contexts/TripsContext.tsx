// ========================================
// FILE: src/contexts/TripsContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TripStatus } from '@/lib/db/schemas/trips';

// ==================== TYPES ====================
export interface Trip {
  id: string;
  trip_code: string;
  vehicle_id: string;
  driver_id: string;
  route_id: string | null;
  route_name?: string;
  vehicle_license?: string;  // vindo de um relacionamento
  vehicle_brand?: string;    // vindo de um relacionamento
  vehicle_model?: string;    // vindo de um relacionamento
  driver_name?: string;     // vindo de um relacionamento
  driver_license_number?: string;     // vindo de um relacionamento
  driver_email?: string;     // vindo de um relacionamento
  start_date: string;
  end_date: string | null;
  start_mileage: number;
  end_mileage: number | null;
  origin: string |  null;
  destination: string |  null;
  purpose: string | null;
  status: TripStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TripsState {
  trips: Trip[];
  selectedTrip: Trip | null;
  isLoading: boolean;
}

type TripsAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SELECT_TRIP'; payload: Trip | null }
  | { type: 'SET_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function tripsReducer(state: TripsState, action: TripsAction): TripsState {
  switch (action.type) {
    case 'SET_TRIPS':
      return {
        ...state,
        trips: action.payload,
        isLoading: false,
      };

    case 'ADD_TRIP':
      return {
        ...state,
        trips: [action.payload, ...state.trips],
      };

    case 'UPDATE_TRIP': {
      const updatedTrips = state.trips.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      
      const updatedSelected = state.selectedTrip?.id === action.payload.id
        ? action.payload
        : state.selectedTrip;

      return {
        ...state,
        trips: updatedTrips,
        selectedTrip: updatedSelected,
      };
    }

    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload),
        selectedTrip: state.selectedTrip?.id === action.payload
          ? null
          : state.selectedTrip,
      };

    case 'SELECT_TRIP':
      return {
        ...state,
        selectedTrip: action.payload,
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
interface TripsContextType {
  state: TripsState;
  dispatch: React.Dispatch<TripsAction>;
  // Helper functions
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  selectTrip: (trip: Trip | null) => void;
  setLoading: (loading: boolean) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface TripsProviderProps {
  children: ReactNode;
}

export function TripsProvider({ children }: TripsProviderProps) {
  const [state, dispatch] = useReducer(tripsReducer, {
    trips: [],
    selectedTrip: null,
    isLoading: true,
  });

  const helpers = {
    setTrips: (trips: Trip[]) => 
      dispatch({ type: 'SET_TRIPS', payload: trips }),
    
    addTrip: (trip: Trip) => 
      dispatch({ type: 'ADD_TRIP', payload: trip }),
    
    updateTrip: (trip: Trip) => 
      dispatch({ type: 'UPDATE_TRIP', payload: trip }),
    
    deleteTrip: (id: string) => 
      dispatch({ type: 'DELETE_TRIP', payload: id }),
    
    selectTrip: (trip: Trip | null) => 
      dispatch({ type: 'SELECT_TRIP', payload: trip }),
    
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };

  return (
    <TripsContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </TripsContext.Provider>
  );
}

// ==================== HOOK ====================
export function useTrips() {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
}