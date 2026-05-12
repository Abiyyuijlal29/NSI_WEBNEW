import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Bell, HelpCircle, UserCircle } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useSettings } from '@/contexts/settings-context';

export function AppSidebarHeader() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { t } = useSettings();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 transition-all ease-linear bg-white dark:bg-[#111111] z-10">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    NSI Admin Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="relative hidden md:flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={t('search') + "..."}
                        className="pl-9 pr-4 py-1.5 w-64 rounded-full border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-500 dark:text-slate-400">
                    <button className="hover:text-gray-900 dark:hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#111111]"></span>
                    </button>
                    <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 py-1 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {user ? user.name : 'Admin Rani'}
                    </span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 flex items-center justify-center">
                        <img src="https://i.pravatar.cc/150?img=68" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
    );
}
