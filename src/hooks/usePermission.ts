// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/usePermission.ts
// ========================================
//
// 2026-09-18 — expõe hasCachedPermission (license-helpers.ts) como um hook
// reactivo: até aqui nenhuma tela do Desktop escondia acções consoante a
// permissão de quem estava autenticado (ex. "Adicionar GPS"/"Remover GPS"
// visíveis a qualquer sessão válida, só recusadas pelo servidor no clique).
// Isto é só sinalização de UI — a autoridade real continua a ser sempre o
// backend (AuthorizationEngine, em cada UseCase).

import { useEffect, useState } from 'react';
import { hasCachedPermission, PERMISSIONS_READY_EVENT } from '@/helpers/license-helpers';

export function usePermission(code: string): boolean {
  const [allowed, setAllowed] = useState(() => hasCachedPermission(code));

  useEffect(() => {
    const refresh = () => setAllowed(hasCachedPermission(code));
    refresh();
    window.addEventListener(PERMISSIONS_READY_EVENT, refresh);
    return () => window.removeEventListener(PERMISSIONS_READY_EVENT, refresh);
  }, [code]);

  return allowed;
}
