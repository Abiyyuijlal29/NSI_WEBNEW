import { Head } from '@inertiajs/react';
import { Plus, Search, FileText, Image, Video, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';

interface Package {
    id: string;
    nama_paket: string;
    harga: number;
    deskripsi: string;
    kecepatan?: string;
}

interface ContentManagerProps {
    packages: Package[];
}

function ContentStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        Active: 'bg-green-50 text-green-700 border-green-200',
        Disabled: 'bg-gray-50 text-gray-600 border-gray-200',
    };
    return (
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${colors[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
}

export default function ContentManager({ packages }: ContentManagerProps) {
    const { t } = useSettings();

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title={t('package_manager')} />

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('package_manager')}</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('manage_internet_packages')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('search_packages')}
                                className="pl-9 pr-4 py-2.5 w-56 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95">
                            <Plus className="w-4 h-4" />
                            {t('new_package')}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('total_packages')}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{packages.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('active')}</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{packages.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('mobile_visibility')}</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mt-1">{t('on')}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('drafts')}</p>
                        <p className="text-2xl font-bold text-gray-400 dark:text-slate-600 mt-1">0</p>
                    </div>
                </div>

                {/* Package Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('package_name')}</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('monthly_price')}</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('status')}</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('description')}</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((p, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.nama_paket}</p>
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="text-sm font-bold text-[#122b7a] dark:text-blue-400">Rp {new Intl.NumberFormat('id-ID').format(p.harga)}</span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <ContentStatusBadge status="Active" />
                                        </td>
                                        <td className="px-4 py-5">
                                            <span className="text-sm text-gray-500 dark:text-slate-400 max-w-xs block truncate">{p.deskripsi}</span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title="View">
                                                    <Eye className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

ContentManager.layout = {
    breadcrumbs: [],
};
