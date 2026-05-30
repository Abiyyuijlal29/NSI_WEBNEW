import { Head } from '@inertiajs/react';
import AppearanceTabs, { LanguageSwitcher } from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';
import { useLanguage } from '@/hooks/use-appearance';
import { Globe, Palette } from 'lucide-react';

export default function Appearance() {
    const { t } = useLanguage();

    return (
        <>
            <Head title={t('appearance_settings')} />

            <h1 className="sr-only">{t('appearance_settings')}</h1>

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title={t('appearance_settings')}
                    description={t('appearance_description')}
                />

                {/* Theme Section */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <Palette className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('theme_setting')}
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {t('theme_description')}
                            </p>
                        </div>
                    </div>
                    <AppearanceTabs />
                </div>

                {/* Language Section */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('language_setting')}
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {t('language_description')}
                            </p>
                        </div>
                    </div>
                    <LanguageSwitcher />
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
