// ========================================
// PROJECT: fleetcontrol-desktop
// FILE: src/components/SyncNotifier.tsx
// ========================================
//
// Montado uma vez (LicenseGuard) — ouve window._service_powersync.
// onDataChanged e reage com som e/ou toast, conforme as preferências em
// Definições > Sincronização (src/helpers/sync-notifications.ts). Não
// renderiza nada de visível por si — é o "ouvido" da app para chegadas de
// dados; o toast em si é despachado via sonner (toast.custom), que já tem
// o seu próprio Toaster montado em App.tsx.
//
// Substituiu SyncSoundNotifier (só som) — agora junta som+toast na mesma
// janela de rajada, para não tocar/mostrar duas vezes por uma sync que
// mexe em várias tabelas de seguida (ex. veículo + a sua categoria).
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import {
  isSyncSoundEnabled, playSyncSound,
  isSyncToastEnabled, getSyncToastPosition, formatSyncToastMessage,
} from '@/helpers/sync-notifications';

const BURST_WINDOW_MS = 600;

function SyncToast({ message }: { message: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#ffffff', color: '#111827',
        padding: '8px 12px', borderRadius: 8,
        fontSize: 12, fontWeight: 500, lineHeight: 1.3,
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <RefreshCw size={13} style={{ color: '#0ea5e9', flexShrink: 0 }} />
      {message}
    </div>
  );
}

export function SyncNotifier() {
  const { i18n } = useTranslation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTablesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return window._service_powersync.onDataChanged((changedTables) => {
      changedTables.forEach((t) => burstTablesRef.current.add(t));
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const tables = Array.from(burstTablesRef.current);
        burstTablesRef.current.clear();
        timerRef.current = null;

        if (isSyncSoundEnabled()) playSyncSound();

        if (isSyncToastEnabled()) {
          const locale = i18n.language.startsWith('en') ? 'en' : 'pt';
          const message = formatSyncToastMessage(tables, locale);
          if (message) {
            toast.custom(() => <SyncToast message={message} />, {
              position: getSyncToastPosition() === 'own-corner' ? 'top-right' : undefined,
              duration: 3500,
              unstyled: true,
            });
          }
        }
      }, BURST_WINDOW_MS);
    });
  }, [i18n.language]);

  return null;
}
