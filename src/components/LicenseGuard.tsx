// ========================================
// PROJECT: fleetcontrol
// FILE: src/components/LicenseGuard.tsx
// ========================================
import React, { useState, useRef, useEffect } from 'react';
import { LicenseActivationDialog } from '@/components/LicenseActivationDialog';
import { useLicense }              from '@/hooks/useLicense';
import { useApiConnection }        from '@/hooks/useApiConnection';
import { getAccessToken }          from '@/helpers/license-helpers';
import { Loader2, WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTracking } from '@/contexts/TrackingContext';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const { license, loading: licenseLoading, refreshLicense } = useLicense();
  const hasConnected = useRef(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Usa o socket do contexto — não instancia um novo hook
  const { connState, connError, traccarStatus, connect, disconnect } = useTracking();

  useEffect(() => {
    if (licenseLoading || !license?.isValid) {
      disconnect();
      hasConnected.current = false;
      return;
    }

    if (license.mode === 'connected' && !hasConnected.current) {
      const token = getAccessToken();
      if (token) {
        hasConnected.current = true;
        connect(token);
      } else {
        console.warn('[LicenseGuard] JWT ainda não disponível');
      }
    } else if (license.mode !== 'connected') {
      disconnect();
      hasConnected.current = false;
    }
  }, [license, licenseLoading]);

  const handleActivationSuccess = async () => {
    await refreshLicense();
    // useEffect acima dispara de novo após refresh
  };

  async function handleReconnect() {
    const token = getAccessToken();
    if (!token) return;
    setIsReconnecting(true);
    hasConnected.current = false;
    try {
      disconnect();
      // Pequena pausa para o socket fechar antes de religar
      await new Promise(r => setTimeout(r, 500));
      hasConnected.current = true;
      connect(token);
    } finally {
      setIsReconnecting(false);
    }
  }

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

  return (
    <>
      {license.mode === 'connected' && (
        <div
          className="fixed top-8 right-20 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(8,14,28,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
          } as React.CSSProperties}
        >
          {connState === 'connected' && traccarStatus?.connected ? (
            <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Online</span></>
          ) : connState === 'connected' && !traccarStatus?.connected ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400">API OK • Traccar offline</span>
            </>
          ) : connState === 'connecting' || isReconnecting ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /><span className="text-blue-400">A ligar...</span></>
          ) : connState === 'error' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400" title={connError?.message}>Erro de ligação</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/40 ml-1"
                onClick={handleReconnect}
                disabled={isReconnecting}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reconectar
              </Button>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Offline</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 ml-1"
                onClick={handleReconnect}
                disabled={isReconnecting}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reconectar
              </Button>
            </>
          )}
        </div>
      )}

      {children}
    </>
  );
}