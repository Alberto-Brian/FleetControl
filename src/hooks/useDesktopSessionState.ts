// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/useDesktopSessionState.ts
// ========================================
//
// Fase 11B.11 — expõe o estado online/offline x sessão (getDesktopSessionState,
// license-helpers.ts) como um hook reactivo, para a UI poder ser honesta sobre
// o que está realmente a acontecer, em vez de dar a entender que uma sessão
// em cache é uma verificação ao vivo.

import { useEffect, useState } from 'react';
import { getDesktopSessionState, type DesktopSessionInfo } from '@/helpers/license-helpers';

const POLL_INTERVAL_MS = 20_000;

export function useDesktopSessionState(): DesktopSessionInfo {
  const [info, setInfo] = useState<DesktopSessionInfo>({ state: 'online-valid', isOnline: true });

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const next = await getDesktopSessionState();
      if (!cancelled) setInfo(next);
    };

    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);

  return info;
}
