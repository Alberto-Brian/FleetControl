// ========================================
// PROJECT: fleetcontrol
// FILE: src/components/LicenseGuard.tsx
// ========================================
import React, { useState, useRef, useEffect } from 'react';
import { LicenseActivationDialog } from '@/components/LicenseActivationDialog';
import { useLicense }              from '@/hooks/useLicense';
import { useApiConnection }        from '@/hooks/useApiConnection';
import { getAccessToken }          from '@/helpers/license-helpers';
import { Loader2, WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { useTracking } from '@/contexts/TrackingContext';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const { license, loading: licenseLoading, refreshLicense } = useLicense();
  const hasConnected = useRef(false);

  // Usa o socket do contexto — não instancia um novo hook
  const { connState, connError, traccarStatus, connect, disconnect } = useTracking();

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (licenseLoading) return;

    if (!license?.isValid) {
      setShowDialog(true);
      disconnect();
      hasConnected.current = false;
      return;
    }

    setShowDialog(false);

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
    setShowDialog(false);
    // Após refresh, o useEffect acima dispara de novo com o token já disponível
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

  return (
    <>
      <LicenseActivationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleActivationSuccess}
      />

      {license?.mode === 'connected' && (
        <div className="fixed top-1 right-20 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border shadow-sm text-xs font-medium">
          {connState === 'connected' && traccarStatus?.connected ? (
            <><Wifi className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Online</span></>
          ) : connState === 'connected' && !traccarStatus?.connected ? (
            <><AlertCircle className="w-3.5 h-3.5 text-amber-500" /><span className="text-amber-600">API OK • Traccar offline</span></>
          ) : connState === 'connecting' ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /><span className="text-blue-600">A ligar...</span></>
          ) : connState === 'error' ? (
            <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600" title={connError?.message}>Erro de ligação</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5 text-slate-400" /><span className="text-slate-500">Offline</span></>
          )}
        </div>
      )}

      {children}
    </>
  );
}