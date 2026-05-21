import { useSyncExternalStore } from 'react';
import { translations, Language } from '@/lib/translations';

const listeners = new Set<() => void>();
let currentLanguage: Language = 'en';

const getStoredLanguage = (): Language => {
    if (typeof window === 'undefined') {
        return 'en';
    }
    return (localStorage.getItem('language') as Language) || 'en';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

export function initializeLanguage(): void {
    if (typeof window === 'undefined') {
        return;
    }
    currentLanguage = getStoredLanguage();
}

export function useLanguage() {
    const language: Language = useSyncExternalStore(
        subscribe,
        () => currentLanguage,
        () => 'en',
    );

    const updateLanguage = (lang: Language): void => {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        notify();
    };

    const t = (key: keyof typeof translations['en']): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return { language, updateLanguage, t } as const;
}
