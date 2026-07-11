import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import { useLicense }   from "@/hooks/useLicense";
import { useTracking }  from "@/contexts/TrackingContext";
import { Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";

// ─── Badge de estado da ligação (lado direito da titlebar) ───────────────────
function ConnectionStatusBadge() {
    const { connState, traccarStatus } = useTracking();

    const isOnline     = connState === 'connected' && traccarStatus?.connected;
    const isApiOnly    = connState === 'connected' && !traccarStatus?.connected;
    const isConnecting = connState === 'connecting';
    const isError      = connState === 'error';

    return (
        <div className="flex items-center gap-1.5 select-none">
            {isOnline && (
                <><Wifi style={{ width: 11, height: 11, color: '#4ade80' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>Online</span></>
            )}
            {isApiOnly && (
                <><AlertCircle style={{ width: 11, height: 11, color: '#fbbf24' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24' }}>Traccar offline</span></>
            )}
            {isConnecting && (
                <><Loader2 style={{ width: 11, height: 11, color: '#60a5fa' }} className="animate-spin" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>A ligar...</span></>
            )}
            {isError && (
                <><AlertCircle style={{ width: 11, height: 11, color: '#f87171' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171' }}>Erro de ligação</span></>
            )}
            {!isOnline && !isApiOnly && !isConnecting && !isError && (
                <><WifiOff style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Offline</span></>
            )}
        </div>
    );
}

// ─── Layout base ─────────────────────────────────────────────────────────────
export default function BaseLayout({ children }: { children: React.ReactNode }) {
    const { license } = useLicense();
    const isMapMode   = license?.isValid && license.mode === 'connected';

    // O nav rail / sidebar usa position:fixed e cobre a parte esquerda da barra de drag.
    // A barra de drag permanece visível na parte direita (área arrastável + botões de janela).
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <DragWindowRegion
                title="FleetControl"
                dark={isMapMode}
                rightContent={isMapMode ? <ConnectionStatusBadge /> : undefined}
            />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
