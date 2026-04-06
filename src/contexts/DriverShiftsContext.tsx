// ========================================
// FILE: src/contexts/DriverShiftsContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { IDriverShift, IDriverShiftSummary } from '@/lib/types/driver-shift';

// ─────────────────────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────────────────────

interface DriverShiftsState {
  shifts:         IDriverShiftSummary[];
  selectedShift:  IDriverShift | null;
  isLoading:      boolean;
}

type DriverShiftsAction =
  | { type: 'SET_SHIFTS';    payload: IDriverShiftSummary[] }
  | { type: 'ADD_SHIFT';     payload: IDriverShift }
  | { type: 'UPDATE_SHIFT';  payload: IDriverShift }
  | { type: 'REMOVE_SHIFT';  payload: string }
  | { type: 'SELECT_SHIFT';  payload: IDriverShift | null }
  | { type: 'SET_LOADING';   payload: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────────

function toSummary(shift: IDriverShift): IDriverShiftSummary {
  return {
    id:           shift.id,
    name:         shift.name,
    description:  shift.description,
    start_date:   shift.start_date,
    end_date:     shift.end_date,
    start_time:   shift.start_time,
    end_time:     shift.end_time,
    status:       shift.status,
    notes:        shift.notes,
    created_at:   shift.created_at,
    updated_at:   shift.updated_at,
    member_count: shift.member_count,
    leader_name:  shift.leader_name,
  };
}

function reducer(state: DriverShiftsState, action: DriverShiftsAction): DriverShiftsState {
  switch (action.type) {
    case 'SET_SHIFTS':
      return { ...state, shifts: action.payload, isLoading: false };

    case 'ADD_SHIFT':
      return { ...state, shifts: [toSummary(action.payload), ...state.shifts] };

    case 'UPDATE_SHIFT': {
      const summary = toSummary(action.payload);
      return {
        ...state,
        shifts: state.shifts.map(s => s.id === action.payload.id ? summary : s),
        selectedShift: state.selectedShift?.id === action.payload.id
          ? action.payload
          : state.selectedShift,
      };
    }

    case 'REMOVE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.filter(s => s.id !== action.payload),
        selectedShift: state.selectedShift?.id === action.payload ? null : state.selectedShift,
      };

    case 'SELECT_SHIFT':
      return { ...state, selectedShift: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface DriverShiftsContextType {
  state: DriverShiftsState;
  setShifts:    (shifts: IDriverShiftSummary[]) => void;
  addShift:     (shift: IDriverShift)           => void;
  updateShift:  (shift: IDriverShift)           => void;
  removeShift:  (id: string)                    => void;
  selectShift:  (shift: IDriverShift | null)    => void;
  setLoading:   (loading: boolean)              => void;
}

const DriverShiftsContext = createContext<DriverShiftsContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function DriverShiftsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    shifts:        [],
    selectedShift: null,
    isLoading:     true,
  });

  const value: DriverShiftsContextType = {
    state,
    setShifts:   (shifts)  => dispatch({ type: 'SET_SHIFTS',   payload: shifts }),
    addShift:    (shift)   => dispatch({ type: 'ADD_SHIFT',    payload: shift  }),
    updateShift: (shift)   => dispatch({ type: 'UPDATE_SHIFT', payload: shift  }),
    removeShift: (id)      => dispatch({ type: 'REMOVE_SHIFT', payload: id    }),
    selectShift: (shift)   => dispatch({ type: 'SELECT_SHIFT', payload: shift  }),
    setLoading:  (loading) => dispatch({ type: 'SET_LOADING',  payload: loading }),
  };

  return (
    <DriverShiftsContext.Provider value={value}>
      {children}
    </DriverShiftsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDriverShifts() {
  const ctx = useContext(DriverShiftsContext);
  if (!ctx) throw new Error('useDriverShifts must be used within DriverShiftsProvider');
  return ctx;
}