// ========================================
// PROJECT: fleetcontrol
// FILE: src/components/LicenseGuard.tsx
// ========================================
import React, { useRef, useEffect } from 'react';
import { LicenseActivationDialog } from '@/components/LicenseActivationDialog';
import { useLicense }              from '@/hooks/useLicense';
import { getAccessToken, SESSION_TOKEN_READY_EVENT } from '@/helpers/license-helpers';
import { Loader2 }                 from 'lucide-react';
import { useTracking }             from '@/contexts/TrackingContext';
import { SyncNotifier }            from '@/components/SyncNotifier';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const { license, loading: licenseLoading, refreshLicense } = useLicense();
  const hasConnected = useRef(false);

  const { connect, disconnect } = useTracking();

  useEffect(() => {
    if (licenseLoading || !license?.isValid) {
      disconnect();
      hasConnected.current = false;
      return;
    }

    if (!hasConnected.current) {
      const token = getAccessToken();
      if (token) {
        hasConnected.current = true;
        connect(token);
      } else {
        console.warn('[LicenseGuard] JWT ainda não disponível');
      }
    }
  }, [license, licenseLoading]);

  // Achado real (2026-09-08): o efeito acima só corre de novo se `license`/
  // `licenseLoading` mudarem — nunca só porque um token passou a existir.
  // Se getAccessToken() ainda era null no único momento em que o efeito
  // chegou a correr (isAuthenticated já true via restauro local, mas o
  // token online ainda a caminho — login/reactivação em segundo plano, ou
  // o retry de 60s de tryRefreshOrReactivate() após uma falha transitória),
  // a app ficava sem ligação de tracking pelo resto da sessão, mesmo que a
  // sessão ficasse válida segundos depois. Ouve SESSION_TOKEN_READY_EVENT
  // (disparado sempre que license-helpers.ts obtém um access_token novo com
  // sucesso) e tenta connect() de novo — no-op se já estiver ligado.
  useEffect(() => {
    function handleTokenReady() {
      if (hasConnected.current || licenseLoading || !license?.isValid) return;
      const token = getAccessToken();
      if (token) {
        hasConnected.current = true;
        connect(token);
      }
    }
    window.addEventListener(SESSION_TOKEN_READY_EVENT, handleTokenReady);
    return () => window.removeEventListener(SESSION_TOKEN_READY_EVENT, handleTokenReady);
  }, [license, licenseLoading, connect]);

  const handleActivationSuccess = async () => {
    await refreshLicense();
  };

  if (licenseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">A verificar licença...</p>
        </div>
      </div>
    );
  }

  // Sem licença válida — mostra apenas o ecrã de activação, nada mais
  if (!license?.isValid) {
    return (
      <div className="min-h-screen bg-background">
        <LicenseActivationDialog
          open={true}
          onOpenChange={() => {}}
          onSuccess={handleActivationSuccess}
        />
      </div>
    );
  }

  // O estado da sessão (offline-cache-*/no-session) já é mostrado como
  // texto pequeno na barra de título (ver SessionStatusLabel em
  // BaseLayout.tsx, ao lado do estado de ligação) — não duplicar aqui com
  // um banner de largura total.
  return (
    <>
      <SyncNotifier />
      {children}
    </>
  );
}