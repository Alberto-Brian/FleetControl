// ========================================
// FILE: src/renderer/src/App.tsx
// ========================================
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import SetupPage from "./pages/SetupPage";
import LoginPage from "./pages/LoginPage";
import BaseLayout from "./layouts/BaseLayout";
import { hasUsers as CheckIfHasUsers } from "./helpers/service-auth-helpers";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LicenseGuard } from "./components/LicenseGuard";
import { Toaster } from "./components/ui/toaster";
import { syncThemeWithLocal } from "./helpers/theme-helpers";
import { updateAppLanguage } from "./helpers/language-helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";


function AppContent() {
    const { i18n } = useTranslation();
    const { isAuthenticated, isLoading } = useAuth();
    const [hasUsers, setHasUsers] = useState<boolean | null>(null);
    const [checkingSetup, setCheckingSetup] = useState(true);

    // Inicializar tema e idioma
    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
    }, [i18n]);

    // Verificar se já existe usuário no sistema
    useEffect(() => {
        async function checkSetup() {
            try {
                const users = await CheckIfHasUsers();
                setHasUsers(users);
            } catch (error) {
                console.error('Erro ao verificar setup:', error);
                setHasUsers(false);
            } finally {
                setCheckingSetup(false);
            }
        }
        checkSetup();
    }, []);

    // Loading state
    if (isLoading || checkingSetup) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    // 1. Se não tem usuários → Setup (primeira vez)
    if (!hasUsers) {
        return <SetupPage onSetupComplete={() => setHasUsers(true)} />;
    }

    // 2. Se tem usuários mas não está autenticado → Login
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // 3. Usuário autenticado → App principal com LicenseGuard
    return (
        <LicenseGuard>
            <BaseLayout>
                <HomePage />
            </BaseLayout>
        </LicenseGuard>
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