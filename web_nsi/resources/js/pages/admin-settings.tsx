import { Head } from '@inertiajs/react';
import { Edit2, ChevronDown, Shield, ChevronRight, Plus, User, Moon, Sun, Monitor } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { Language } from '@/lib/translations';

export default function AdminSettings() {
    const { language, setLanguage, appearance, setAppearance, t } = useSettings();

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Head title={t('admin_settings')} />

            <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('admin_settings')}</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('admin_settings_desc', 'Manage your account credentials, preferences, and team access.')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Left Column */}
                    <div className="flex-1 flex flex-col gap-10">
                        {/* Profile Settings */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('profile_settings')}</h2>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                        <img src="https://i.pravatar.cc/150?img=68" alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <button type="button" className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700">
                                        <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-slate-300" />
                                    </button>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full">
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">{t('full_name')}</label>
                                        <input type="text" defaultValue="Admin Rani" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">{t('role')}</label>
                                        <input type="text" defaultValue="Super Administrator" readOnly className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-700 rounded-md text-sm text-gray-500 dark:text-slate-400 focus:outline-none cursor-not-allowed" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">{t('email_address')}</label>
                                        <input type="email" defaultValue="rani.admin@nsi-networks.com" className="w-full md:w-[60%] px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-4 mt-2">
                                        <button type="button" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium">{t('cancel')}</button>
                                        <button type="button" className="text-sm text-gray-900 dark:text-white hover:text-black dark:hover:text-slate-300 font-medium">{t('save_changes')}</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-200 dark:border-slate-800" />

                        {/* System Preferences */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('system_preferences')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">{t('interface_language')}</label>
                                    <div className="relative">
                                        <select 
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value as Language)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm appearance-none bg-white dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="id">Bahasa Indonesia</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5">{t('timezone')}</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm appearance-none bg-white dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer">
                                            <option>(UTC-08:00) Pacific Time</option>
                                            <option>(UTC+07:00) Jakarta</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="sm:col-span-2 mt-4">
                                    <label className="block text-sm text-gray-700 dark:text-slate-300 mb-3">{t('appearance')}</label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'light', icon: Sun, label: t('light_mode') },
                                            { id: 'dark', icon: Moon, label: t('dark_mode') },
                                            { id: 'system', icon: Monitor, label: t('system_mode') }
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setAppearance(item.id as any)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                                                        appearance === item.id 
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                                            : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-200 dark:border-slate-800" />

                        {/* Notification Channels */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('notification_channels')}</h2>
                            <div className="flex flex-col gap-0 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden max-w-2xl bg-white dark:bg-slate-900 transition-colors">
                                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('email_notifications')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t('email_notifications_desc', 'Receive daily digests and critical alerts via email.')}</p>
                                    </div>
                                    <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 cursor-pointer relative shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-full shadow absolute right-0.5 top-0.5"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('desktop_push')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t('desktop_push_desc', 'Browser notifications for real-time monitoring events.')}</p>
                                    </div>
                                    <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 cursor-pointer relative shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-full shadow absolute right-0.5 top-0.5"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-5">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('mobile_sms')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t('mobile_sms_desc', 'Only for Level 1 severity incidents.')}</p>
                                    </div>
                                    <div className="w-11 h-6 bg-gray-300 dark:bg-slate-700 rounded-full p-0.5 cursor-pointer relative shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-full shadow absolute left-0.5 top-0.5"></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-10">
                        <section>
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-800 pb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('security')}</h2>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{t('change_password')}</h3>
                                    <div className="flex flex-col gap-3">
                                        <input type="password" placeholder={t('current_password')} className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        <input type="password" placeholder={t('new_password')} className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        <input type="password" placeholder={t('confirm_new_password')} className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        <button type="button" className="mt-2 text-sm text-gray-900 dark:text-slate-300 font-medium text-center hover:underline">{t('update_password')}</button>
                                    </div>
                                </div>

                                <hr className="border-gray-200 dark:border-slate-800" />

                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('two_factor')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 pr-4">{t('two_factor_desc', 'Require an extra step for login.')}</p>
                                    </div>
                                    <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 cursor-pointer relative shrink-0">
                                        <div className="w-5 h-5 bg-white rounded-full shadow absolute right-0.5 top-0.5"></div>
                                    </div>
                                </div>

                                <hr className="border-gray-200 dark:border-slate-800" />

                                <div className="flex items-center justify-between cursor-pointer group">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{t('session_management')}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('session_management_desc', 'View active sessions across devices.')}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-slate-600 group-hover:text-blue-600 transition-colors shrink-0" />
                                </div>
                            </div>
                        </section>

                        <section className="mt-2">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-slate-800 pb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('team_management')}</h2>
                                <button type="button" className="text-sm font-medium text-blue-500 hover:text-blue-700">{t('view_all')}</button>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">MJ</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Marcus Johnson</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">m.johnson@nsi...</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] font-semibold rounded-full shrink-0">Admin</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-slate-800">
                                        <img src="https://i.pravatar.cc/150?img=11" alt="David Chen" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">David Chen</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">d.chen@nsi-net...</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] font-semibold rounded-full shrink-0">Analyst</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">SW</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Sarah Williams</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">s.williams@nsi...</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-[10px] font-semibold rounded-full shrink-0">Support</span>
                                </div>

                                <button type="button" className="mt-2 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 dark:border-slate-700 rounded-md text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                    {t('invite_member')}
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

AdminSettings.layout = {
    breadcrumbs: [],
};
