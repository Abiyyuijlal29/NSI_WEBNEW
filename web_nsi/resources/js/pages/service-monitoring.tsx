import { Head } from '@inertiajs/react';
import { Heart, Server, Zap, ShieldCheck, MoreHorizontal, Filter } from 'lucide-react';

export default function ServiceMonitoring() {
    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Service Monitoring" />

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Service Monitoring</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Real-time infrastructure health and system performance.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">System Health</span>
                            <Heart className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-500">Operational</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Active Servers</span>
                            <Server className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">24/24</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">All nodes responding</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Avg Latency</span>
                            <Zap className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">12ms</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">↓ 2ms vs last hour</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10_rgba(0,0,0,0.02)] transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-slate-400">Security Alerts</span>
                            <ShieldCheck className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-500">Clear</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Chart + Server Infra */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* System Load Chart */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">System Load Average (24h)</h3>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative w-full h-[180px]">
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 180">
                                    <defs>
                                        <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#122b7a" stopOpacity="0.08" />
                                            <stop offset="100%" stopColor="#122b7a" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M 0 120 C 100 100, 150 90, 200 95 S 300 110, 400 80 S 500 60, 600 70 S 700 50, 800 55" fill="none" stroke="#122b7a" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M 0 120 C 100 100, 150 90, 200 95 S 300 110, 400 80 S 500 60, 600 70 S 700 50, 800 55 L 800 180 L 0 180 Z" fill="url(#loadGrad)" />
                                </svg>
                            </div>
                        </div>

                        {/* Server Infrastructure */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Server Infrastructure</h3>
                                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <Filter className="w-3 h-3" />
                                    Filter
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Node A */}
                                <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Node-A (Primary)</span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-slate-500">Up 14d</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-slate-500 font-medium">CPU</span>
                                                <span className="text-gray-800 dark:text-slate-200 font-bold">42%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className="bg-[#122b7a] dark:bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-slate-500 font-medium">RAM</span>
                                                <span className="text-gray-800 dark:text-slate-200 font-bold">68%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className="bg-[#122b7a] dark:bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <button className="text-xs font-semibold text-[#122b7a] hover:underline">View Logs</button>
                                    </div>
                                </div>

                                {/* Node B */}
                                <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Node-B (Replica)</span>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-slate-500">Up 14d</span>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-slate-500 font-medium">CPU</span>
                                                <span className="text-gray-800 dark:text-slate-200 font-bold">28%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className="bg-[#122b7a] dark:bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500 dark:text-slate-500 font-medium">RAM</span>
                                                <span className="text-gray-800 dark:text-slate-200 font-bold">45%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                                                <div className="bg-[#122b7a] dark:bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-right">
                                        <button className="text-xs font-semibold text-[#122b7a] dark:text-blue-400 hover:underline">View Logs</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Incident History */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col transition-colors">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Incident History</h3>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Recent events and resolutions.</p>
                        </div>
                        <div className="flex-1 p-6 flex flex-col gap-6">
                            {/* Incident 1 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 bg-emerald-400 rounded-full mt-1"></span>
                                    <div className="w-0.5 flex-1 bg-gray-100 mt-1"></div>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-500 font-medium">Today, 10:42 AM</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">Database Sync Completed</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">Routine synchronization finished without errors across all nodes.</p>
                                </div>
                            </div>
                            {/* Incident 2 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 bg-amber-400 rounded-full mt-1"></span>
                                    <div className="w-0.5 flex-1 bg-gray-100 mt-1"></div>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-500 font-medium">Yesterday, 14:15 PM</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">High Latency Warning</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">Spike to 140ms on Node-C. Auto-scaling triggered and resolved within 5 mins.</p>
                                </div>
                            </div>
                            {/* Incident 3 */}
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="w-3 h-3 bg-emerald-400 rounded-full mt-1"></span>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500 font-medium">Oct 24, 02:00 AM</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">Scheduled Maintenance</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Security patches applied to core infrastructure. No downtime recorded.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-slate-800 text-center">
                            <button className="text-xs font-bold text-[#122b7a] dark:text-blue-400 hover:underline">View All Incidents</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

ServiceMonitoring.layout = {
    breadcrumbs: [],
};
