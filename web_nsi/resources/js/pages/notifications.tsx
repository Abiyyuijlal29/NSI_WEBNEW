import { Head } from '@inertiajs/react';
import { AlertTriangle, UserPlus, Server, Shield, Settings } from 'lucide-react';
import { useState } from 'react';

const tabs = ['All', 'System Alerts', 'Customer Activity', 'Service Updates'];

const notifications = [
    {
        icon: AlertTriangle,
        iconBg: 'bg-red-50 text-red-600',
        borderColor: 'border-l-red-500',
        title: 'Critical: Database Latency Spike',
        unread: true,
        description: 'Cluster DB-East-01 is experiencing unusual latency patterns exceeding 500ms threshold.',
        time: '2 mins ago',
        actions: [
            { label: 'View Details', primary: true },
            { label: 'Dismiss', primary: false },
        ],
    },
    {
        icon: UserPlus,
        iconBg: 'bg-blue-50 text-blue-600',
        borderColor: 'border-l-blue-500',
        title: 'New Customer Registered',
        unread: true,
        description: 'Acme Corp Ltd. has completed the onboarding flow and activated their Enterprise plan.',
        time: '14 mins ago',
        actions: [
            { label: 'Review Account', primary: false },
        ],
    },
    {
        icon: Server,
        iconBg: 'bg-gray-100 text-gray-600',
        borderColor: 'border-l-transparent',
        title: 'Scheduled Maintenance Completed',
        unread: false,
        description: 'Routine patching for Node-Alpha cluster finished successfully without downtime.',
        time: 'Oct 24, 02:00 AM',
        actions: [],
    },
    {
        icon: Shield,
        iconBg: 'bg-gray-100 text-gray-600',
        borderColor: 'border-l-transparent',
        title: 'Firewall Rule Updated',
        unread: false,
        description: "Admin 'J.Doe' modified inbound rules for subnet 10.0.4.0/24.",
        time: 'Oct 23, 16:45 PM',
        actions: [],
    },
];

export default function Notifications() {
    const [activeTab, setActiveTab] = useState('All');

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Notifications" />

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Monitor system health, customer activities, and security alerts across the network.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-sm font-semibold text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                            <Server className="w-4 h-4" />
                            Mark all as read
                        </button>
                        <button className="p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                            <Settings className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${
                                activeTab === tab
                                    ? 'bg-[#122b7a] dark:bg-blue-600 text-white border-[#122b7a] dark:border-blue-600 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                <div className="flex flex-col gap-4">
                    {notifications.map((n, i) => {
                        const Icon = n.icon;

                        return (
                            <div
                                key={i}
                                className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 border-l-4 ${n.borderColor} hover:shadow-md transition-all`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.iconBg} dark:bg-slate-800`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {n.title}
                                                    {n.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{n.description}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">{n.time}</span>
                                        </div>
                                        {n.actions.length > 0 && (
                                            <div className="flex gap-3 mt-4">
                                                {n.actions.map((a, j) => (
                                                    <button
                                                        key={j}
                                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                                            a.primary
                                                                ? 'bg-[#122b7a] dark:bg-blue-600 text-white hover:bg-[#1a3d9e] dark:hover:bg-blue-700 shadow-sm'
                                                                : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        {a.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More */}
                <div className="text-center">
                    <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-sm font-semibold text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                        Load More Notifications
                    </button>
                </div>
            </div>
        </div>
    );
}

Notifications.layout = {
    breadcrumbs: [],
};
