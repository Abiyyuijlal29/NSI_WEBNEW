import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '@/lib/translations';

export type Language = 'en' | 'id';
export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

// ============================================================
// Theme helpers (no React state needed - just DOM manipulation)
// ============================================================
const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
return;
}

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const prefersDark = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const isDarkMode = (mode: Appearance) =>
    mode === 'dark' || (mode === 'system' && prefersDark());

const applyTheme = (mode: Appearance): void => {
    if (typeof document === 'undefined') {
return;
}

    const dark = isDarkMode(mode);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
};

// ============================================================
// Context
// ============================================================
type SettingsContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    appearance: Appearance;
    setAppearance: (mode: Appearance) => void;
    resolvedAppearance: ResolvedAppearance;
    t: (key: keyof typeof translations['en']) => string;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

// ============================================================
// Provider — place this in the layout that wraps all admin pages
// ============================================================
export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window === 'undefined') {
return 'en';
}

        return (localStorage.getItem('language') as Language) || 'en';
    });

    const [appearance, setAppearanceState] = useState<Appearance>(() => {
        if (typeof window === 'undefined') {
return 'system';
}

        return (localStorage.getItem('appearance') as Appearance) || 'system';
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    }, []);

    const setAppearance = useCallback((mode: Appearance) => {
        setAppearanceState(mode);
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    const t = useCallback((key: keyof typeof translations['en']): string => {
        return translations[language]?.[key] || translations['en'][key] || key;
    }, [language]);

    const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance) ? 'dark' : 'light';

    return (
        <SettingsContext.Provider value={{ language, setLanguage, appearance, setAppearance, resolvedAppearance, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

// ============================================================
// Hook
// ============================================================
export function useSettings() {
    const ctx = useContext(SettingsContext);

    if (!ctx) {
throw new Error('useSettings must be used inside <SettingsProvider>');
}

    return ctx;
}
