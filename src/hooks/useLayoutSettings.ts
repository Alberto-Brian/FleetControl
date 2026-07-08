import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fc-sidebar-collapsed';

// Estado e listeners ao nível do módulo — sobrevivem a múltiplas instâncias do hook
let _collapsed  = localStorage.getItem(STORAGE_KEY) === 'true';
const _listeners = new Set<(v: boolean) => void>();

function _broadcast(v: boolean) {
  _collapsed = v;
  localStorage.setItem(STORAGE_KEY, String(v));
  _listeners.forEach(fn => fn(v));
}

export function useLayoutSettings() {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => _collapsed);

  useEffect(() => {
    const handler = (v: boolean) => setSidebarCollapsedState(v);
    _listeners.add(handler);
    return () => { _listeners.delete(handler); };
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    _broadcast(v);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    _broadcast(!_collapsed);
  }, []);

  return { sidebarCollapsed, setSidebarCollapsed, toggleSidebarCollapsed };
}
