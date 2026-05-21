import { Head } from '@inertiajs/react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    lastLogin: string;
    initials: string;
    avatar: boolean;
    avatar_url?: string;
}

interface CustomersProps {
    customers: Customer[];
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        Active: 'bg-green-50 text-green-700 border-green-200',
        Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Banned: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
}

function AvatarCircle({ initials, name, avatarUrl }: { initials: string; name: string; avatarUrl?: string }) {
    if (avatarUrl) {
        return (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }
    
    if (!initials) {
        return (
            <div className="w-10 h-10 rounded-full bg-[#122b7a] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {name.split(' ').map(n => n[0]).join('')}
            </div>
        );
    }

    const bgColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
    const colorIndex = initials.charCodeAt(0) % bgColors.length;

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${bgColors[colorIndex]}`}>
            {initials}
        </div>
    );
}

export default function Customers({ customers }: CustomersProps) {
    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Customer Management" />

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Customer Directory</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-md">
                            Manage user accounts, monitor statuses, and update contact information.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                className="pl-9 pr-4 py-2.5 w-64 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        {/* Add New User */}
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95">
                            <Plus className="w-4 h-4" />
                            Add New User
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <th className="w-12 px-4 py-4">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#122b7a] focus:ring-[#122b7a]" />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">User Details</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((c, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-5">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#122b7a] focus:ring-[#122b7a]" />
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-3">
                                                <AvatarCircle initials={c.initials} name={c.name} avatarUrl={c.avatar_url} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-500">ID: {c.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <p className="text-sm text-gray-900 dark:text-slate-300">{c.email}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-500">{c.phone}</p>
                                        </td>
                                        <td className="px-4 py-5">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="text-sm text-gray-500 dark:text-slate-400 whitespace-pre-line leading-relaxed">{c.lastLogin}</span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors">
                                                <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Showing 1 to 4 of 248 entries</p>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 rounded hover:bg-gray-100 transition-colors">&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white bg-[#122b7a] rounded">1</button>
                            <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 rounded hover:bg-gray-100 transition-colors">2</button>
                            <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 rounded hover:bg-gray-100 transition-colors">3</button>
                            <span className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">...</span>
                            <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-600 rounded hover:bg-gray-100 transition-colors">62</button>
                            <button className="w-8 h-8 flex items-center justify-center text-sm text-gray-400 rounded hover:bg-gray-100 transition-colors">&gt;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Customers.layout = {
    breadcrumbs: [],
};
