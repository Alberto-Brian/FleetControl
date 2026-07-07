// ========================================
// PROJECT: fleetcontrol
// FILE: src/components/LicenseGuard.tsx
// ========================================
import React, { useRef, useEffect } from 'react';
import { LicenseActivationDialog } from '@/components/LicenseActivationDialog';
import { useLicense }              from '@/hooks/useLicense';
import { getAccessToken }          from '@/helpers/license-helpers';
import { Loader2 }                 from 'lucide-react';
import { useTracking }             from '@/contexts/TrackingContext';

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

  return (
    <>
      {children}
    </>
  );
}