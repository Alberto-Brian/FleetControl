import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fc-layout-padding';
const EVENT_KEY   = 'fc-layout-padding-changed';

export function useLayoutPadding() {
  const [hasPadding, setHasPaddingState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });

  // Sincroniza com outras instâncias do hook (ex: SettingsDialog → HomePage)
  useEffect(() => {
    const handler = (e: CustomEvent) => setHasPaddingState(e.detail as boolean);
    window.addEventListener(EVENT_KEY, handler as EventListener);
    return () => window.removeEventListener(EVENT_KEY, handler as EventListener);
  }, []);

  const setHasPadding = useCallback((v: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(v));
    setHasPaddingState(v);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: v }));
  }, []);

  return { hasPadding, setHasPadding };
}
