// ========================================
// FILE: src/contexts/ExpensesContext.tsx
// ========================================
import { ExpenseCategoryType } from '@/lib/db/schemas/expense_categories';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ==================== TYPES ====================
export interface Expense {
  id: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  vehicle_id?: string | null;
  vehicle_license?: string;
  driver_id?: string | null;
  trip_id?: string | null;
  description: string;
  amount: number;
  expense_date: string;
  due_date?: string | null;
  payment_date?: string | null;
  payment_method?: string | null;
  status: string;
  document_number?: string | null;
  supplier?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  type: ExpenseCategoryType;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface ExpensesState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  selectedExpense: Expense | null;
  selectedCategory: ExpenseCategory | null;
  isLoading: boolean;
  isCategoriesLoading: boolean;
}

type ExpensesAction =
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SELECT_EXPENSE'; payload: Expense | null }
  | { type: 'SET_CATEGORIES'; payload: ExpenseCategory[] }
  | { type: 'ADD_CATEGORY'; payload: ExpenseCategory }
  | { type: 'UPDATE_CATEGORY'; payload: ExpenseCategory }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SELECT_CATEGORY'; payload: ExpenseCategory | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORIES_LOADING'; payload: boolean };

// ==================== REDUCER ====================
function expensesReducer(state: ExpensesState, action: ExpensesAction): ExpensesState {
  switch (action.type) {
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, isLoading: false };

    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };

    case 'UPDATE_EXPENSE': {
      const updatedExpenses = state.expenses.map(e =>
        e.id === action.payload.id ? action.payload : e
      );
      const updatedSelected = state.selectedExpense?.id === action.payload.id
        ? action.payload
        : state.selectedExpense;
      return { ...state, expenses: updatedExpenses, selectedExpense: updatedSelected };
    }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
        selectedExpense: state.selectedExpense?.id === action.payload ? null : state.selectedExpense,
      };

    case 'SELECT_EXPENSE':
      return { ...state, selectedExpense: action.payload };

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

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CATEGORIES_LOADING':
      return { ...state, isCategoriesLoading: action.payload };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================
interface ExpensesContextType {
  state: ExpensesState;
  dispatch: React.Dispatch<ExpensesAction>;
  // Expenses
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  selectExpense: (expense: Expense | null) => void;
  // Categories
  setCategories: (categories: ExpenseCategory[]) => void;
  addCategory: (category: ExpenseCategory) => void;
  updateCategory: (category: ExpenseCategory) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (category: ExpenseCategory | null) => void;
  // Loading
  setLoading: (loading: boolean) => void;
  setCategoriesLoading: (loading: boolean) => void;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

// ==================== PROVIDER ====================
interface ExpensesProviderProps {
  children: ReactNode;
}

export function ExpensesProvider({ children }: ExpensesProviderProps) {
  const [state, dispatch] = useReducer(expensesReducer, {
    expenses: [],
    categories: [],
    selectedExpense: null,
    selectedCategory: null,
    isLoading: true,
    isCategoriesLoading: true,
  });

  const helpers = {
    // Expenses
    setExpenses: (expenses: Expense[]) => 
      dispatch({ type: 'SET_EXPENSES', payload: expenses }),
    addExpense: (expense: Expense) => 
      dispatch({ type: 'ADD_EXPENSE', payload: expense }),
    updateExpense: (expense: Expense) => 
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense }),
    deleteExpense: (id: string) => 
      dispatch({ type: 'DELETE_EXPENSE', payload: id }),
    selectExpense: (expense: Expense | null) => 
      dispatch({ type: 'SELECT_EXPENSE', payload: expense }),
    
    // Categories
    setCategories: (categories: ExpenseCategory[]) => 
      dispatch({ type: 'SET_CATEGORIES', payload: categories }),
    addCategory: (category: ExpenseCategory) => 
      dispatch({ type: 'ADD_CATEGORY', payload: category }),
    updateCategory: (category: ExpenseCategory) => 
      dispatch({ type: 'UPDATE_CATEGORY', payload: category }),
    deleteCategory: (id: string) => 
      dispatch({ type: 'DELETE_CATEGORY', payload: id }),
    selectCategory: (category: ExpenseCategory | null) => 
      dispatch({ type: 'SELECT_CATEGORY', payload: category }),
    
    // Loading
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setCategoriesLoading: (loading: boolean) => 
      dispatch({ type: 'SET_CATEGORIES_LOADING', payload: loading }),
  };

  return (
    <ExpensesContext.Provider value={{ state, dispatch, ...helpers }}>
      {children}
    </ExpensesContext.Provider>
  );
}

// ==================== HOOK ====================
export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
}