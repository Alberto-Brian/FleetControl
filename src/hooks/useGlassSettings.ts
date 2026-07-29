import { useState, useEffect, useCallback } from 'react';

export interface GlassSettings {
  opacity: number; // 0.4 – 1.0
  blur:    number; // 0   – 40 px
}

// Hardcoded per-theme defaults
export const DARK_DEFAULTS:  GlassSettings = { opacity: 0.95, blur: 15 };
export const LIGHT_DEFAULTS: GlassSettings = { opacity: 0.48, blur: 13 };

const STORAGE_ACTIVE      = 'fleetcontrol-glass';
const STORAGE_USER_DARK   = 'fleetcontrol-glass-user-dark';
const STORAGE_USER_LIGHT  = 'fleetcontrol-glass-user-light';
const STORAGE_THEME_RESET = 'fleetcontrol-glass-theme-reset';

function applyGlass(s: GlassSettings) {
  const el = document.documentElement;
  el.style.setProperty('--glass-bg',     `rgba(var(--glass-rgb), ${s.opacity})`);
  el.style.setProperty('--glass-filter', `blur(${s.blur}px) saturate(1.4)`);
}

function currentIsDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

function getEffectiveDefaults(isDark: boolean): GlassSettings {
  const storageKey = isDark ? STORAGE_USER_DARK : STORAGE_USER_LIGHT;
  const hardcoded  = isDark ? DARK_DEFAULTS : LIGHT_DEFAULTS;
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...hardcoded, ...JSON.parse(saved) } : hardcoded;
  } catch {
    return hardcoded;
  }
}

function loadActive(): GlassSettings {
  try {
    const saved = localStorage.getItem(STORAGE_ACTIVE);
    if (saved) return { ...getEffectiveDefaults(currentIsDark()), ...JSON.parse(saved) };
  } catch { /* ignore */ }
  return getEffectiveDefaults(currentIsDark());
}

export function initGlassSettings() {
  try {
    applyGlass(loadActive());
  } catch {
    applyGlass(DARK_DEFAULTS);
  }
}

export function useGlassSettings() {
  const [settings, setSettings] = useState<GlassSettings>(loadActive);

  const [resetOnThemeChange, setResetOnThemeChangeState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_THEME_RESET) === 'true';
  });

  // Track current theme reactively for the UI
  const [isDark, setIsDark] = useState<boolean>(currentIsDark);

  useEffect(() => {
    applyGlass(settings);
  }, [settings]);

  // MutationObserver: detect theme class changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const dark = currentIsDark();
      setIsDark(dark);
      if (resetOnThemeChange) {
        const defaults = getEffectiveDefaults(dark);
        localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(defaults));
        setSettings(defaults);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [resetOnThemeChange]);

  function update(patch: Partial<GlassSettings>) {
    const next = { ...settings, ...patch };
    localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(next));
    setSettings(next);
  }

  const resetToDark = useCallback(() => {
    const defaults = getEffectiveDefaults(true);
    localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(defaults));
    setSettings(defaults);
  }, []);

  const resetToLight = useCallback(() => {
    const defaults = getEffectiveDefaults(false);
    localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(defaults));
    setSettings(defaults);
  }, []);

  function saveAsDefault(dark: boolean) {
    const key = dark ? STORAGE_USER_DARK : STORAGE_USER_LIGHT;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  function setResetOnThemeChange(value: boolean) {
    localStorage.setItem(STORAGE_THEME_RESET, value ? 'true' : 'false');
    setResetOnThemeChangeState(value);
  }

  return {
    settings,
    update,
    resetToDark,
    resetToLight,
    saveAsDefault,
    resetOnThemeChange,
    setResetOnThemeChange,
    isDark,
    darkDefaults:  getEffectiveDefaults(true),
    lightDefaults: getEffectiveDefaults(false),
    // compat: kept for any callers using the old `reset` name
    reset: () => (currentIsDark() ? resetToDark() : resetToLight()),
    defaults: currentIsDark() ? DARK_DEFAULTS : LIGHT_DEFAULTS,
  };
}
