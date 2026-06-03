import { Head } from '@inertiajs/react';
import { Users, Server, Ticket, DollarSign, MoreHorizontal, UserPlus, CheckCircle, AlertTriangle, RefreshCw, Mail, Activity } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { useMemo } from 'react';

interface DashboardProps {
    stats: {
        totalCustomers: number;
        totalPackages: number;
        pendingPayments: number;
        estimatedRevenue: number;
    };
    chartData: { label: string; value: number }[];
    recentActivities: {
        type: string;
        title: string;
        time_ago: string;
    }[];
}

export default function Dashboard({ stats, chartData = [], recentActivities = [] }: DashboardProps) {
    const { t } = useSettings();

    // IDR Currency formatter
    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    // Activity Icon Mapping
    const getIcon = (type: string) => {
        switch (type) {
            case 'new_user': return UserPlus;
            case 'transaction': return CheckCircle;
            default: return Activity;
        }
    };

    // --- Dynamic SVG Chart Calculation ---
    const { pathData, maxVal, yLabels } = useMemo(() => {
        // Fallback for empty data
        if (!chartData || chartData.length === 0) {
            return { pathData: "M 0 330 L 800 330", maxVal: 5, yLabels: [] };
        }

        const max = Math.max(...chartData.map(d => d.value), 5); // default axis scale to avoid div by 0
        const stepX = 800 / (chartData.length - 1 || 1);

        const path = chartData.reduce((acc, d, i) => {
            const x = i * stepX;
            // Map value to Y axis (10 to 330, drawing from bottom)
            const y = 330 - (d.value / max) * 300; 

            if (i === 0) return `M ${x} ${y}`;
            
            // Generate smooth Bezier curve
            const prevX = (i - 1) * stepX;
            const prevY = 330 - (chartData[i - 1].value / max) * 300;
            const cp1x = prevX + stepX / 3;
            const cp2x = x - stepX / 3;
            
            return `${acc} C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
        }, "");

        // Y-axis labels
        const labels = [
            { label: max.toString(), top: '0%' },
            { label: Math.round(max * 0.66).toString(), top: '33.33%' },
            { label: Math.round(max * 0.33).toString(), top: '66.66%' },
            { label: '0', top: '100%' },
        ];

        return { pathData: path, maxVal: max, yLabels: labels };
    }, [chartData]);


    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title={t('dashboard')} />
            
            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-8">
                
                {/* Header Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Dashboard Overview</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Welcome back. Here is your daily system summary based on live metrics.</p>
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPackages.toLocaleString()}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col relative overflow-hidden transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <Ticket className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                            {stats.pendingPayments > 0 && (
                                <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider border dark:border-slate-700">Action Needed</span>
                            )}
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">PENDING BILLING</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingPayments.toLocaleString()}</p>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <DollarSign className="w-5 h-5 text-gray-700 dark:text-slate-400" />
                        </div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-slate-500 tracking-wider mb-1 uppercase">EST. REVENUE (PAID)</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatIDR(stats.estimatedRevenue)}</p>
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
                        
                        {/* Dynamic Chart Area */}
                        <div className="relative w-full h-[350px] mt-4">
                            {/* Y-Axis Labels & Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {yLabels.map((item, i) => (
                                    <div key={i} className="relative w-full flex items-end">
                                        <span className="absolute -left-1 text-[11px] font-medium text-gray-500 dark:text-slate-500 -translate-y-1/2">{item.label}</span>
                                        <div className="w-full h-[1px] bg-gray-100 dark:bg-slate-800/50 ml-8"></div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* SVG Chart Line */}
                            <svg className="w-full h-full absolute inset-0 ml-8" preserveAspectRatio="none" viewBox="0 0 800 350">
                                <path 
                                    d={pathData} 
                                    fill="none" 
                                    stroke="#122b7a" 
                                    strokeWidth="10" 
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_8px_12px_rgba(18,43,122,0.15)] transition-all duration-500"
                                />
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-[-30px] left-8 right-0 flex justify-between">
                                {chartData.map((d, i) => (
                                    <span key={i} className="text-[11px] font-medium text-gray-500 dark:text-slate-500 text-center w-8 -ml-4">
                                        {d.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity Log */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Recent Activity Log</h3>
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            <div className="flex flex-col">
                                {recentActivities.length > 0 ? recentActivities.map((item, i) => {
                                    const Icon = getIcon(item.type);
                                    return (
                                        <div key={i} className="p-4 px-6 border-b border-gray-50 dark:border-slate-800 flex gap-4 items-start group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="mt-1">
                                                <Icon className="w-4 h-4 text-gray-700 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-800 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: item.title }} />
                                                <p className="text-[11px] text-gray-500 dark:text-slate-500 mt-1">{item.time_ago}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-8 text-center text-sm text-gray-500">
                                        No recent activities found.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 text-center mt-auto">
                            <button className="text-xs font-bold text-gray-900 dark:text-white tracking-wider hover:text-gray-600 dark:hover:text-slate-400 transition-colors"
                            onClick={() => window.location.reload()}
                            >
                                REFRESH DATA
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
