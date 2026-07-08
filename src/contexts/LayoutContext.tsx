import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'fc-sidebar-collapsed';

interface LayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebarCollapsed: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const setSidebarCollapsed = useCallback((v: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(v));
    setSidebarCollapsedState(v);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsedState(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutSettings() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayoutSettings must be used inside LayoutProvider');
  return ctx;
}
