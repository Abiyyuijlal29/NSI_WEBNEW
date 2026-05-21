<<<<<<< Updated upstream
import { useSyncExternalStore } from 'react';
=======
import { useSyncExternalStore, useEffect } from 'react';
import { translations } from '@/lib/translations';
>>>>>>> Stashed changes

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => applyTheme(currentAppearance);

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    currentAppearance = getStoredAppearance();
    applyTheme(currentAppearance);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance)
        ? 'dark'
        : 'light';

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
<<<<<<< Updated upstream
=======

// === LANGUAGE MANAGEMENT ===
const LANG_KEY = 'language';
const langListeners = new Set<() => void>();
let _currentLang: Language = 'en';

const subscribeLanguage = (cb: () => void) => {
    langListeners.add(cb);

    return () => langListeners.delete(cb);
};

const notifyLang = () => langListeners.forEach((l) => l());

export function useLanguage() {
    const language: Language = useSyncExternalStore(
        subscribeLanguage,
        () => _currentLang,
        () => 'en' as Language,
    );

    useEffect(() => {
        // Sync from localStorage on mount
        const stored = localStorage.getItem(LANG_KEY) as Language;

        if (stored && stored !== _currentLang) {
            _currentLang = stored;
            notifyLang();
        }
    }, []);

    const setLanguage = (lang: Language): void => {
        _currentLang = lang;
        localStorage.setItem(LANG_KEY, lang);
        notifyLang();
    };

    const t = (key: keyof typeof translations['en']): string =>
        translations[language]?.[key] || translations['en'][key] || key;

    return { language, setLanguage, t } as const;
}
>>>>>>> Stashed changes
