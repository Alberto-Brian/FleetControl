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
import { LicenseGuard } from "./components/LicenseGuard";
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

    // Inicializar tema e idioma
    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
        requestNotificationPermission();
    }, [i18n]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
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

    // Utilizador autenticado → App principal com LicenseGuard
    // LicenseProvider por cima de tudo: uma única verificação de licença
    // partilhada por LicenseGuard, HomePage e todos os outros consumidores
    // de useLicense() — elimina o "flash" de modo standalone que aparecia
    // quando cada componente disparava a sua própria verificação do zero.
    return (
        <LicenseProvider>
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
        </LicenseProvider>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
            <Toaster />
        </AuthProvider>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
