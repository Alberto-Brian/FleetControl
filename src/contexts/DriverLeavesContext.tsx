// ========================================
// FILE: src/contexts/DriverLeavesContext.tsx
// ========================================
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { IDriverLeave } from '@/lib/types/driver-leave';

interface DriverLeavesState {
  leaves:         IDriverLeave[];
  selectedLeave:  IDriverLeave | null;
  isLoading:      boolean;
}

type DriverLeavesAction =
  | { type: 'SET_LEAVES';   payload: IDriverLeave[] }
  | { type: 'ADD_LEAVE';    payload: IDriverLeave }
  | { type: 'UPDATE_LEAVE'; payload: IDriverLeave }
  | { type: 'REMOVE_LEAVE'; payload: string }          // by id (cancel/delete)
  | { type: 'SELECT_LEAVE'; payload: IDriverLeave | null }
  | { type: 'SET_LOADING';  payload: boolean };

function leavesReducer(
  state: DriverLeavesState,
  action: DriverLeavesAction
): DriverLeavesState {
  switch (action.type) {
    case 'SET_LEAVES':
      return { ...state, leaves: action.payload, isLoading: false };

    case 'ADD_LEAVE':
      return { ...state, leaves: [action.payload, ...state.leaves] };

    case 'UPDATE_LEAVE':
      return {
        ...state,
        leaves: state.leaves.map(l =>
          l.id === action.payload.id ? action.payload : l
        ),
        selectedLeave:
          state.selectedLeave?.id === action.payload.id
            ? action.payload
            : state.selectedLeave,
      };

    case 'REMOVE_LEAVE':
      return {
        ...state,
        leaves: state.leaves.filter(l => l.id !== action.payload),
        selectedLeave:
          state.selectedLeave?.id === action.payload ? null : state.selectedLeave,
      };

    case 'SELECT_LEAVE':
      return { ...state, selectedLeave: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

interface DriverLeavesContextType {
  state:        DriverLeavesState;
  dispatch:     React.Dispatch<DriverLeavesAction>;
  setLeaves:    (leaves: IDriverLeave[]) => void;
  addLeave:     (leave: IDriverLeave) => void;
  updateLeave:  (leave: IDriverLeave) => void;
  removeLeave:  (id: string) => void;
  selectLeave:  (leave: IDriverLeave | null) => void;
  setLoading:   (loading: boolean) => void;
}

const DriverLeavesContext = createContext<DriverLeavesContextType | undefined>(undefined);

export function DriverLeavesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leavesReducer, {
    leaves:        [],
    selectedLeave: null,
    isLoading:     true,
  });

  const helpers: Omit<DriverLeavesContextType, 'state' | 'dispatch'> = {
    setLeaves:   (leaves)  => dispatch({ type: 'SET_LEAVES',   payload: leaves }),
    addLeave:    (leave)   => dispatch({ type: 'ADD_LEAVE',    payload: leave }),
    updateLeave: (leave)   => dispatch({ type: 'UPDATE_LEAVE', payload: leave }),
    removeLeave: (id)      => dispatch({ type: 'REMOVE_LEAVE', payload: id }),
    selectLeave: (leave)   => dispatch({ type: 'SELECT_LEAVE', payload: leave }),
    setLoading:  (loading) => dispatch({ type: 'SET_LOADING',  payload: loading }),
  };

  return (
    <DriverLeavesContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </DriverLeavesContext.Provider>
  );
}

export function useDriverLeaves() {
  const ctx = useContext(DriverLeavesContext);
  if (!ctx) throw new Error('useDriverLeaves must be used within DriverLeavesProvider');
  return ctx;
}