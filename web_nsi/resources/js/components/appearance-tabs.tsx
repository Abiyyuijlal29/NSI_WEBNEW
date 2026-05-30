import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun, Globe, Check } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance, useLanguage } from '@/hooks/use-appearance';
import type { Language } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        appearance === value
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}

// ─── Language Switcher ────────────────────────────────────────────────────────

const languages: { value: Language; label: string; nativeLabel: string; flag: string }[] = [
    { value: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    { value: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { language, setLanguage } = useLanguage();

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {languages.map(({ value, label, nativeLabel, flag }) => (
                <button
                    key={value}
                    onClick={() => setLanguage(value)}
                    className={cn(
                        'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200',
                        language === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60',
                    )}
                >
                    <span className="text-2xl leading-none">{flag}</span>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{nativeLabel}</span>
                    </div>
                    {language === value && (
                        <Check className="ml-auto h-4 w-4 text-blue-500 dark:text-blue-400" />
                    )}
                </button>
            ))}
        </div>
    );
}
