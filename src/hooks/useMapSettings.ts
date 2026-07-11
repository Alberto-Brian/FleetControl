import { useState, useEffect } from 'react';

export type MapLabelType = 'plate' | 'brand_model' | 'both';

interface MapSettings {
  labelType:      MapLabelType;
  animateMarkers: boolean;
  pulseMarkers:   boolean;
}

const STORAGE_KEY = 'fc-map-settings';
const EVENT_KEY   = 'fc-map-settings-changed';
const DEFAULTS: MapSettings = { labelType: 'both', animateMarkers: false, pulseMarkers: false };

export function useMapSettings() {
  const [settings, setSettings] = useState<MapSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Sincroniza com outras instâncias do hook (ex: SettingsDialog → TrackingPageContent)
  useEffect(() => {
    const handler = (e: CustomEvent) => setSettings(e.detail as MapSettings);
    window.addEventListener(EVENT_KEY, handler as EventListener);
    return () => window.removeEventListener(EVENT_KEY, handler as EventListener);
  }, []);

  function update(patch: Partial<MapSettings>) {
    const next = { ...settings, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: next }));
  }

  return {
    labelType:         settings.labelType,
    animateMarkers:    settings.animateMarkers,
    pulseMarkers:      settings.pulseMarkers,
    setLabelType:      (v: MapLabelType) => update({ labelType: v }),
    setAnimateMarkers: (v: boolean) => update({ animateMarkers: v }),
    setPulseMarkers:   (v: boolean) => update({ pulseMarkers: v }),
  };
}
