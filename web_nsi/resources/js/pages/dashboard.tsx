import { Head } from '@inertiajs/react';
import { Users, Server, Ticket, DollarSign, MoreHorizontal, UserPlus, CheckCircle, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';

interface DashboardProps {
    stats: {
        totalCustomers: number;
        totalPackages: number;
        pendingPayments: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const { t } = useSettings();

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title={t('dashboard')} />
            
            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-8">
                
                {/* Header Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Welcome back. Here is your daily system summary.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Users className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">{t('customer_management')}</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers.toLocaleString()}</p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Server className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">ACTIVE PACKAGES</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPackages}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Ticket className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                            <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider border dark:border-slate-700">Action Needed</span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">BILLING RECORDS</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments}</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <DollarSign className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">EST. REVENUE</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp 2.5M</p>
                    </div>
                </div>

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

                </div>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [],
};
