import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./pages/HomePage";
import BaseLayout from "./layouts/BaseLayout";
import { syncThemeWithLocal } from "./helpers/theme-helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { LicenseGuard } from "./components/LicenseGuard";
import { updateAppLanguage } from "./helpers/language-helpers";

export default function App() {
    const { i18n } = useTranslation();

    useEffect(() => {
        syncThemeWithLocal();
        updateAppLanguage(i18n);
    }, []);

    return (
        <LicenseGuard>
            <BaseLayout>
                <HomePage />
            </BaseLayout>
        </LicenseGuard>
    );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
