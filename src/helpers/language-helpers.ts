import type { i18n } from "i18next";

export const languageLocalStorageKey = "lang";

export function setAppLanguage(lang: string, i18n: i18n) {
    localStorage.setItem(languageLocalStorageKey, lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
}

export function updateAppLanguage(i18n: i18n) {
    let localLang = localStorage.getItem(languageLocalStorageKey);
    if (!localLang) return;

    // Migração: pt-BR → pt-PT
    if (localLang === 'pt-BR') {
        localLang = 'pt-PT';
        localStorage.setItem(languageLocalStorageKey, localLang);
    }

    i18n.changeLanguage(localLang);
    document.documentElement.lang = localLang;
}
