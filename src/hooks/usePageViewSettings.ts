// ========================================
// FILE: src/hooks/usePageViewSettings.ts
// ========================================
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fc:page_view_settings';
const CHANGE_EVENT = 'fc:page-view-settings-changed';

export interface PageViewSettings {
  vehiclesAnalytics: boolean;
  tripsAnalytics: boolean;
  fuelAnalytics: boolean;
  maintenanceAnalytics: boolean;
  driversAnalytics: boolean;
  expensesAnalytics: boolean;
  analyticsLayout: 'horizontal' | 'vertical';
}

const DEFAULTS: PageViewSettings = {
  vehiclesAnalytics: true,
  tripsAnalytics: true,
  fuelAnalytics: true,
  maintenanceAnalytics: true,
  driversAnalytics: true,
  expensesAnalytics: true,
  analyticsLayout: 'vertical',
};

function loadFromStorage(): PageViewSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveToStorage(settings: PageViewSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {}
}

export function usePageViewSettings() {
  const [settings, setSettings] = useState<PageViewSettings>(loadFromStorage);

  // Reage a mudanças feitas em outras partes da UI (ex: SettingsDialog)
  useEffect(() => {
    const handler = () => setSettings(loadFromStorage());
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
  }, []);

  const toggle = useCallback((key: keyof PageViewSettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveToStorage(next);
      return next;
    });
  }, []);

  const set = useCallback((key: keyof PageViewSettings, value: boolean | string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  }, []);

  return { settings, toggle, set };
}
