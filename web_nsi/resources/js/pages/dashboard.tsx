import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
<<<<<<< Updated upstream
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
=======

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Chart Area */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 transition-colors">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Customer Growth (Last 6 Months)</h3>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Mock Chart Area */}
                        <div className="relative w-full h-[350px] mt-4">
                            {/* Y-Axis Labels & Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[
                                    { label: '1.5k', top: '0%' },
                                    { label: '1.0k', top: '33.33%' },
                                    { label: '500', top: '66.66%' },
                                    { label: '0', top: '100%' },
                                ].map((item, i) => (
                                    <div key={i} className="relative w-full flex items-end">
                                        <span className="absolute -left-1 text-[11px] font-medium text-gray-500 dark:text-slate-500 -translate-y-1/2">{item.label}</span>
                                        <div className="w-full h-[1px] bg-gray-100 dark:bg-slate-800/50 ml-8"></div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* SVG Chart Line */}
                            <svg className="w-full h-full absolute inset-0 ml-8" preserveAspectRatio="none" viewBox="0 0 800 350">
                                <path 
                                    d="M 0 330 C 150 280, 200 100, 350 150 S 550 -50, 800 60" 
                                    fill="none" 
                                    stroke="#122b7a" 
                                    strokeWidth="14" 
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_8px_12px_rgba(18,43,122,0.15)] transition-colors duration-300"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Right: Activity Log */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Recent Activity Log</h3>
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            <div className="flex flex-col">
                                {[
                                    { icon: UserPlus, text: 'New user: <span class="font-semibold">Rani Adelia</span> joined', time: '2 mins ago' },
                                    { icon: CheckCircle, text: 'Transaction <span class="font-semibold">#123</span> completed', time: '1 hour ago' },
                                    { icon: AlertTriangle, text: 'Server load threshold exceeded on <span class="font-semibold">Node-A</span>', time: '3 hours ago' },
                                    { icon: RefreshCw, text: 'System backup completed successfully', time: 'Yesterday' },
                                    { icon: Mail, text: 'Campaign "Spring Promo" launched', time: 'Yesterday' },
                                ].map((item, i) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={i} className="p-4 px-6 border-b border-gray-50 dark:border-slate-800 flex gap-4 items-start group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="mt-1">
                                                <Icon className="w-4 h-4 text-gray-700 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: item.text }} />
                                                <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">{item.time}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 text-center mt-auto">
                            <button className="text-xs font-bold text-gray-900 dark:text-white tracking-wider hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                                VIEW ALL ACTIVITY
                            </button>
                        </div>
                    </div>

>>>>>>> Stashed changes
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
