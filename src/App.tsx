// ========================================
// FILE: src/renderer/src/App.tsx
// ========================================
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordRequiredPage from "./pages/ChangePasswordRequiredPage";
import BaseLayout from "./layouts/BaseLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LicenseProvider } from "./contexts/LicenseContext";
import { useLicense } from "./hooks/useLicense";
import { LicenseGuard } from "./components/LicenseGuard";
import { LicenseActivationScreen } from "./components/LicenseActivationDialog";
import { TrackingProvider }    from '@/contexts/TrackingContext';
import { LayoutProvider }      from '@/contexts/LayoutContext';
import { HistoricalDbProvider } from '@/contexts/HistoricalDbContext';
import { Toaster } from "./components/ui/sooner";
import { syncThemeWithLocal } from "./helpers/theme-helpers";
import { updateAppLanguage } from "./helpers/language-helpers";
import { initFont, initFontSize } from "./hooks/useFontFamily";
import { initGlassSettings } from "./hooks/useGlassSettings";
import { requestNotificationPermission } from "@/helpers/notifications";
import { useTranslation } from "react-i18next";
import './styles/scrollbar-styles.css';
import "./localization/i18n";

initFont();
initFontSize();
initGlassSettings();

function AppContent() {
    const { i18n } = useTranslation();
    const { isAuthenticated, isLoading, mustChangePassword } = useAuth();
    const { license, loading: licenseLoading, refreshLicense } = useLicense();

    // Inicializar tema e idioma
    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        requestNotificationPermission();
    }, [i18n]);

    // Achado real (2026-09-0X): LicenseProvider só montava DEPOIS de
    // isAuthenticated===true (dentro do ramo autenticado abaixo) — no
    // arranque a frio de um dispositivo já licenciado (o caso mais comum),
    // o LoginPage aparecia sem a licença alguma vez ter sido consultada, e
    // getLicensedOrganizationId() (license-helpers.ts) ficava sempre `null`
    // para o primeiro login da sessão. O portão em AuthContext.login() —
    // "só utilizadores da Organization licenciada neste dispositivo podem
    // entrar" — falha aberto de propósito quando a licença é desconhecida
    // (para nunca bloquear um dispositivo por activar), o que na prática
    // deixava entrar qualquer utilizador de qualquer Organization sempre
    // que a app tinha acabado de arrancar. Esperar aqui por licenseLoading
    // (agora que LicenseProvider está montado desde o início, ver App())
    // garante que a licença já foi consultada — e o portão já está armado —
    // antes de o ecrã de login sequer aparecer.
    if (licenseLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    // Achado real (2026-09-12): sem isto, remover a licença (que agora
    // também faz logout — ver removeLicense()/SESSION_REVOKED_EVENT em
    // license-helpers.ts) caía directo no ecrã de LOGIN antes de pedir a
    // licença nova — sem licença nenhuma, entrar não faz sentido, e
    // AuthContext.login() "falha aberto" de propósito quando a licença é
    // desconhecida (deixaria entrar sem confirmar a Organization). A
    // licença é sempre o primeiro portão, independentemente de haver ou não
    // uma sessão local — só depois de válida é que o ecrã de login (ou o
    // resto da app, se já houver sessão) sequer aparece. Mesmo bloco que já
    // existia dentro de LicenseGuard (só alcançável depois do login) — aqui
    // cobre também o caso de ainda não haver ninguém autenticado.
    if (!license?.isValid) {
        return (
            <LicenseActivationScreen onSuccess={() => { void refreshLicense(); }} />
        );
    }

    // Connected-first: a identidade vem sempre de /api/auth/login (Fase
    // 11B.8), nunca de um utilizador local criado antecipadamente — o
    // "SetupPage" (criar o primeiro utilizador local antes de poder entrar)
    // era um resquício do modelo Standalone. Login online cria o registo
    // local automaticamente (syncLocalUser, "cadeado do cache"); login
    // offline sem nenhum utilizador local ainda cacheado falha correctamente
    // (limitação já aceite desde a Fase 11B.9).
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Password temporária de bootstrap (Fase 8B.3) ainda por trocar — bloqueia
    // tudo antes mesmo da licença, é um estado da SESSÃO, não da instalação.
    if (mustChangePassword) {
        return <ChangePasswordRequiredPage />;
    }

    // Utilizador autenticado → App principal com LicenseGuard (LicenseProvider
    // já está montado desde App(), acima de tudo — ver nota acima).
    return (
        <HistoricalDbProvider>
        <LayoutProvider>
        <TrackingProvider>
        <LicenseGuard>
            <BaseLayout>
                <HomePage />
            </BaseLayout>
        </LicenseGuard>
        </TrackingProvider>
        </LayoutProvider>
        </HistoricalDbProvider>
    );
}

export default function App() {
    return (
        <AuthProvider>
        <LicenseProvider>
            <AppContent />
            <Toaster />
        </LicenseProvider>
        </AuthProvider>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
