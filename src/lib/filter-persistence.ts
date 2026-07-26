// ── Preferência: guardar filtros das listagens ──────────────────────────────
// Chave: 'app_persist_filters' — default false

export function filterPersistEnabled(): boolean {
  return localStorage.getItem('app_persist_filters') === 'true';
}

export function readPersistedFilter<T extends string>(page: string, key: string, fallback: T): T {
  if (!filterPersistEnabled()) return fallback;
  const val = localStorage.getItem(`${page}_filter_${key}`);
  return (val !== null ? val : fallback) as T;
}

export function writePersistedFilter(page: string, key: string, value: string): void {
  if (filterPersistEnabled()) localStorage.setItem(`${page}_filter_${key}`, value);
}

// ── Preferência: guardar modo de visualização ───────────────────────────────
// Chave: 'app_persist_viewmode' — default true

export function viewModePersistEnabled(): boolean {
  return localStorage.getItem('app_persist_viewmode') !== 'false';
}

export function readPersistedViewMode<T extends string>(page: string, fallback: T): T {
  if (!viewModePersistEnabled()) return fallback;
  const val = localStorage.getItem(`${page}_filter_viewMode`);
  return (val !== null ? val : fallback) as T;
}

export function writePersistedViewMode(page: string, value: string): void {
  if (viewModePersistEnabled()) localStorage.setItem(`${page}_filter_viewMode`, value);
}
