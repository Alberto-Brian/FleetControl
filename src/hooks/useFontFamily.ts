import { useState, useEffect } from 'react';

// ─── Font family ─────────────────────────────────────────────────────────────

export type FontFamily = 'geist' | 'system' | 'serif' | 'mono';

export interface FontOption {
  id: FontFamily;
  label: string;
  description: string;
  stack: string;
  preview: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'geist',
    label: 'Geist',
    description: 'Moderna e clean',
    stack: '"Geist", ui-sans-serif, system-ui, sans-serif',
    preview: 'Aa Bb 123',
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Fonte nativa do SO',
    stack: '-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
    preview: 'Aa Bb 123',
  },
  {
    id: 'serif',
    label: 'Serif',
    description: 'Clássica e elegante',
    stack: 'Georgia, "Times New Roman", "Palatino Linotype", serif',
    preview: 'Aa Bb 123',
  },
  {
    id: 'mono',
    label: 'Monoespaço',
    description: 'Ideal para dados técnicos',
    stack: 'ui-monospace, "Cascadia Code", "Cascadia Mono", "Consolas", "Courier New", monospace',
    preview: 'Aa Bb 123',
  },
];

const STORAGE_KEY = 'fleetcontrol-font';

function applyFont(stack: string) {
  document.documentElement.style.setProperty('--app-font', stack);
}

export function initFont() {
  const saved = localStorage.getItem(STORAGE_KEY) as FontFamily | null;
  const option = FONT_OPTIONS.find(f => f.id === saved) ?? FONT_OPTIONS[0];
  applyFont(option.stack);
}

export function useFontFamily() {
  const [fontId, setFontId] = useState<FontFamily>(() => {
    return (localStorage.getItem(STORAGE_KEY) as FontFamily) ?? 'geist';
  });

  useEffect(() => {
    const option = FONT_OPTIONS.find(f => f.id === fontId) ?? FONT_OPTIONS[0];
    applyFont(option.stack);
  }, [fontId]);

  function setFont(id: FontFamily) {
    localStorage.setItem(STORAGE_KEY, id);
    setFontId(id);
  }

  return { fontId, setFont, options: FONT_OPTIONS };
}

// ─── Font size ────────────────────────────────────────────────────────────────

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface FontSizeOption {
  id: FontSize;
  label: string;
  size: string;
  description: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'sm', label: 'Pequeno',       size: '13px', description: 'Compacto' },
  { id: 'md', label: 'Normal',        size: '16px', description: 'Padrão' },
  { id: 'lg', label: 'Grande',        size: '18px', description: 'Confortável' },
  { id: 'xl', label: 'Extra grande',  size: '20px', description: 'Acessível' },
];

const FONT_SIZE_KEY = 'fleetcontrol-font-size';

export function initFontSize() {
  const saved = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
  const option = FONT_SIZE_OPTIONS.find(f => f.id === saved) ?? FONT_SIZE_OPTIONS.find(f => f.id === 'md')!;
  document.documentElement.style.setProperty('--app-font-size', option.size);
}

export function useFontSize() {
  const [sizeId, setSizeId] = useState<FontSize>(() => {
    return (localStorage.getItem(FONT_SIZE_KEY) as FontSize) ?? 'md';
  });

  useEffect(() => {
    const option = FONT_SIZE_OPTIONS.find(f => f.id === sizeId) ?? FONT_SIZE_OPTIONS[1];
    document.documentElement.style.setProperty('--app-font-size', option.size);
  }, [sizeId]);

  function setFontSize(id: FontSize) {
    localStorage.setItem(FONT_SIZE_KEY, id);
    setSizeId(id);
  }

  return { sizeId, setFontSize, sizeOptions: FONT_SIZE_OPTIONS };
}
