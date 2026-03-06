// ========================================
// FILE: src/contexts/ScheduledTripsContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { IScheduledTrip } from '@/lib/types/scheduled-trip';

interface ScheduledTripsState {
  scheduledTrips:  IScheduledTrip[];
  selectedTrip:    IScheduledTrip | null;
  isLoading:       boolean;
}

type ScheduledTripsAction =
  | { type: 'SET_TRIPS';   payload: IScheduledTrip[] }
  | { type: 'ADD_TRIP';    payload: IScheduledTrip }
  | { type: 'UPDATE_TRIP'; payload: IScheduledTrip }
  | { type: 'REMOVE_TRIP'; payload: string }
  | { type: 'SELECT_TRIP'; payload: IScheduledTrip | null }
  | { type: 'SET_LOADING'; payload: boolean };

function tripsReducer(
  state: ScheduledTripsState,
  action: ScheduledTripsAction
): ScheduledTripsState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, scheduledTrips: action.payload, isLoading: false };

    case 'ADD_TRIP':
      return { ...state, scheduledTrips: [action.payload, ...state.scheduledTrips] };

    case 'UPDATE_TRIP':
      return {
        ...state,
        scheduledTrips: state.scheduledTrips.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
        selectedTrip:
          state.selectedTrip?.id === action.payload.id
            ? action.payload
            : state.selectedTrip,
      };

    case 'REMOVE_TRIP':
      return {
        ...state,
        scheduledTrips: state.scheduledTrips.filter(t => t.id !== action.payload),
        selectedTrip:
          state.selectedTrip?.id === action.payload ? null : state.selectedTrip,
      };

    case 'SELECT_TRIP':
      return { ...state, selectedTrip: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

interface ScheduledTripsContextValue {
  state:            ScheduledTripsState;
  setTrips:         (trips: IScheduledTrip[]) => void;
  addTrip:          (trip:  IScheduledTrip)   => void;
  updateTrip:       (trip:  IScheduledTrip)   => void;
  removeTrip:       (id:    string)           => void;
  selectTrip:       (trip:  IScheduledTrip | null) => void;
  setLoading:       (v: boolean)              => void;
}

const ScheduledTripsContext = createContext<ScheduledTripsContextValue | null>(null);

export function ScheduledTripsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripsReducer, {
    scheduledTrips: [],
    selectedTrip:   null,
    isLoading:      false,
  });

  const value: ScheduledTripsContextValue = {
    state,
    setTrips:   (trips) => dispatch({ type: 'SET_TRIPS',   payload: trips }),
    addTrip:    (trip)  => dispatch({ type: 'ADD_TRIP',    payload: trip  }),
    updateTrip: (trip)  => dispatch({ type: 'UPDATE_TRIP', payload: trip  }),
    removeTrip: (id)    => dispatch({ type: 'REMOVE_TRIP', payload: id    }),
    selectTrip: (trip)  => dispatch({ type: 'SELECT_TRIP', payload: trip  }),
    setLoading: (v)     => dispatch({ type: 'SET_LOADING', payload: v     }),
  };

  return (
    <ScheduledTripsContext.Provider value={value}>
      {children}
    </ScheduledTripsContext.Provider>
  );
}

export function useScheduledTrips(): ScheduledTripsContextValue {
  const ctx = useContext(ScheduledTripsContext);
  if (!ctx) throw new Error('useScheduledTrips must be used inside ScheduledTripsProvider');
  return ctx;
}