import { useState, useEffect } from 'react';

export interface GlassSettings {
  opacity: number; // 0.4 – 1.0  (background opacity of glass panels)
  blur:    number; // 0   – 40   (backdrop-filter blur in px)
}

const DEFAULTS: GlassSettings = { opacity: 0.88, blur: 20 };
const STORAGE_KEY = 'fleetcontrol-glass';

function applyGlass(s: GlassSettings) {
  const el = document.documentElement;
  el.style.setProperty('--glass-bg',     `rgba(var(--glass-rgb), ${s.opacity})`);
  el.style.setProperty('--glass-filter', `blur(${s.blur}px) saturate(1.4)`);
}

export function initGlassSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const s: GlassSettings = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    applyGlass(s);
  } catch {
    applyGlass(DEFAULTS);
  }
}

export function useGlassSettings() {
  const [settings, setSettings] = useState<GlassSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    applyGlass(settings);
  }, [settings]);

  function update(patch: Partial<GlassSettings>) {
    const next = { ...settings, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULTS);
  }

  return { settings, update, reset, defaults: DEFAULTS };
}
