import { SidebarTrigger } from '@/components/ui/sidebar';
import { HelpCircle, UserCircle } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useSettings } from '@/contexts/settings-context';

export function AppSidebarHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { t } = useSettings();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 transition-all ease-linear bg-white dark:bg-[#111111] z-10">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                <img src="/nsi-logo.png" alt="NSI" className="h-8 w-8 object-contain rounded-lg" />
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">NSI</span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">Net Satu Internews</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-500 dark:text-slate-400">
                    <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 py-1 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {user ? user.name : 'Admin Rani'}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="w-5 h-5" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
