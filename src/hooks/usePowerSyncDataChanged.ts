// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/hooks/usePowerSyncDataChanged.ts
// ========================================
//
// Achado real (2026-09-0X): os dados chegavam ao ficheiro local (upload/
// download reais, confirmados no ecrã de diagnóstico "Estado do
// PowerSync"), mas as páginas só voltavam a consultar powersync.db quando
// o próprio utilizador fazia alguma acção (montar a página, premir
// Actualizar) — nada as avisava de que uma sincronização em segundo plano
// tinha trazido algo novo. Este hook liga qualquer página/contexto a esse
// aviso (window._service_powersync.onDataChanged, ver
// powersync-service-context.ts) com uma linha, filtrando só as tabelas que
// interessam a quem chama.
import { useEffect, useRef } from 'react';

export function usePowerSyncDataChanged(tables: string[], onChanged: () => void) {
  // Refs para o efeito não precisar de reexecutar (e por isso re-subscrever
  // ao IPC) só porque `tables`/`onChanged` são um array/função novos a cada
  // render — só a MONTAGEM/DESMONTAGEM do componente deve (re)subscrever.
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    const unsubscribe = window._service_powersync.onDataChanged((changedTables) => {
      if (changedTables.some((t) => tablesRef.current.includes(t))) {
        onChangedRef.current();
      }
    });
    return unsubscribe;
  }, []);
}
