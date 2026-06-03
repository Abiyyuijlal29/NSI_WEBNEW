import { Head, useForm, router } from '@inertiajs/react';
import {
    Users, MessageCircle, AlertCircle, Clock,
    Search, Send, X, Plus,
    UserCheck, UserX, Hourglass, Inbox, MessageSquare,
    ArrowUpRight, Phone, Mail, Hash,
} from 'lucide-react';
import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive' | 'pending';
    initials: string;
    avatar_url?: string;
}

interface Complaint {
    id: number;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    open_complaints: number;
}

interface Props {
    customers: Customer[];
    complaints: Complaint[];
    stats: Stats;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AvatarCircle({ initials, name, avatarUrl }: { initials: string; name: string; avatarUrl?: string }) {
    if (avatarUrl) {
        return (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }
    const palette = [
        'bg-blue-100 text-blue-700',
        'bg-violet-100 text-violet-700',
        'bg-rose-100 text-rose-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
    ];
    const idx = (initials || 'U').charCodeAt(0) % palette.length;
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${palette[idx]}`}>
            {initials || name.slice(0, 2).toUpperCase()}
        </div>
    );
}

const STATUS_CONFIG = {
    active:   { label: 'Aktif',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    inactive: { label: 'Nonaktif', cls: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500'     },
    pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-500'   },
};

const COMPLAINT_STATUS = {
    open:        { label: 'Terbuka',         cls: 'bg-red-50 text-red-700 border-red-200'       },
    in_progress: { label: 'Diproses',        cls: 'bg-blue-50 text-blue-700 border-blue-200'    },
    resolved:    { label: 'Selesai',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    closed:      { label: 'Ditutup',         cls: 'bg-gray-100 text-gray-500 border-gray-200'   },
};

const PRIORITY_CONFIG = {
    low:    { label: 'Rendah', cls: 'text-emerald-600' },
    medium: { label: 'Sedang', cls: 'text-amber-600'   },
    high:   { label: 'Tinggi', cls: 'text-red-600'     },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function ComplaintBadge({ status }: { status: string }) {
    const cfg = COMPLAINT_STATUS[status as keyof typeof COMPLAINT_STATUS] ?? COMPLAINT_STATUS.open;
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${cfg.cls}`}>{cfg.label}</span>;
}

function PriorityLabel({ priority }: { priority: string }) {
    const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.medium;
    return <span className={`text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>;
}

function formatDate(str: string) {
    if (!str) return '-';
    return new Date(str).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// ─── Modal: Status Update ────────────────────────────────────────────────────

function StatusModal({ customer, onClose }: { customer: Customer; onClose: () => void }) {
    const { data, setData, post, processing } = useForm({ status: customer.status });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/customer-service/update-status/${customer.id}`, {
            onSuccess: onClose,
        });
    }

    return (
        <Overlay onClose={onClose}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Ubah Status Pelanggan</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
                Mengubah status untuk <span className="font-semibold text-gray-800 dark:text-white">{customer.name}</span>
            </p>
            <form onSubmit={submit} className="space-y-4">
                {(['active', 'inactive', 'pending'] as const).map((s) => (
                    <label
                        key={s}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                            data.status === s
                                ? 'border-[#122b7a] bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <input
                            type="radio"
                            name="status"
                            value={s}
                            checked={data.status === s}
                            onChange={() => setData('status', s)}
                            className="hidden"
                        />
                        <span className={`w-3 h-3 rounded-full ${STATUS_CONFIG[s].dot}`} />
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{STATUS_CONFIG[s].label}</span>
                    </label>
                ))}
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                        Batal
                    </button>
                    <button type="submit" disabled={processing}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#122b7a] text-white hover:bg-[#1a3d9e] disabled:opacity-60 transition-all shadow-sm">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </Overlay>
    );
}

// ─── Modal: Add Complaint ─────────────────────────────────────────────────────

function ComplaintModal({ customers, onClose }: { customers: Customer[]; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        customer_name: '',
        customer_email: '',
        subject: '',
        message: '',
        priority: 'medium',
    });

    function selectCustomer(c: Customer) {
        setData({ ...data, customer_id: c.id, customer_name: c.name, customer_email: c.email });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/customer-service/complaint', { onSuccess: onClose });
    }

    return (
        <Overlay onClose={onClose} wide>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Catat Keluhan Customer</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Isi detail keluhan yang diterima dari pelanggan.</p>
            <form onSubmit={submit} className="space-y-4">
                {/* Customer select */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Pilih Pelanggan</label>
                    <select
                        value={data.customer_id}
                        onChange={(e) => {
                            const c = customers.find(x => x.id === e.target.value);
                            if (c) selectCustomer(c);
                        }}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a]"
                    >
                        <option value="">-- Pilih Pelanggan --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subjek</label>
                        <input value={data.subject} onChange={e => setData('subject', e.target.value)}
                            placeholder="Masukkan subjek keluhan..."
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a]" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Prioritas</label>
                        <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a]">
                            <option value="low">Rendah</option>
                            <option value="medium">Sedang</option>
                            <option value="high">Tinggi</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Isi Keluhan</label>
                    <textarea value={data.message} onChange={e => setData('message', e.target.value)}
                        placeholder="Tuliskan detail keluhan pelanggan..."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                        Batal
                    </button>
                    <button type="submit" disabled={processing}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#122b7a] text-white hover:bg-[#1a3d9e] disabled:opacity-60 transition-all shadow-sm">
                        {processing ? 'Menyimpan...' : 'Catat Keluhan'}
                    </button>
                </div>
            </form>
        </Overlay>
    );
}

// ─── Overlay wrapper ──────────────────────────────────────────────────────────

function Overlay({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 w-full ${wide ? 'max-w-lg' : 'max-w-sm'} animate-slide-up`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
                {children}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'customers' | 'complaints';

export default function Notifications({ customers, complaints, stats }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('customers');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [statusModal, setStatusModal] = useState<Customer | null>(null);
    const [complaintModal, setComplaintModal] = useState(false);

    // Filtered customers
    const filteredCustomers = customers.filter(c => {
        const q = search.toLowerCase();
        const matchSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Filtered complaints
    const filteredComplaints = complaints.filter(c => {
        const q = search.toLowerCase();
        return c.customer_name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    });

    function updateComplaintStatus(id: number, status: string) {
        router.post(`/customer-service/complaint/${id}/status`, { status }, { preserveScroll: true });
    }

    const statCards = [
        { icon: Users,     label: 'Total Pelanggan', value: stats.total,           color: 'from-blue-500 to-blue-600'    },
        { icon: UserCheck, label: 'Aktif',            value: stats.active,          color: 'from-emerald-500 to-emerald-600' },
        { icon: UserX,     label: 'Nonaktif',         value: stats.inactive,        color: 'from-red-500 to-red-600'      },
        { icon: Hourglass, label: 'Pending',           value: stats.pending,         color: 'from-amber-500 to-amber-600'  },
        { icon: Inbox,     label: 'Keluhan Terbuka',  value: stats.open_complaints, color: 'from-violet-500 to-violet-600' },
    ];

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Customer Service" />

            {/* Modals */}
            {statusModal   && <StatusModal    customer={statusModal} onClose={() => setStatusModal(null)} />}
            {complaintModal && <ComplaintModal customers={customers} onClose={() => setComplaintModal(false)} />}

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#122b7a] to-blue-500 flex items-center justify-center shadow-sm">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Customer Service</h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Kelola status pelanggan, terima keluhan, dan kirim pesan ke customer.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setComplaintModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Catat Keluhan
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statCards.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all">
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}>
                                    <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── Tabs + Toolbar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex gap-1 bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1">
                        {([
                            { key: 'customers',   label: 'Pelanggan',  icon: Users          },
                            { key: 'complaints',  label: 'Keluhan',    icon: AlertCircle    },
                        ] as const).map(t => {
                            const TIcon = t.icon;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                                        activeTab === t.key
                                            ? 'bg-white dark:bg-slate-900 text-[#122b7a] dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    <TIcon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari..."
                                className="pl-9 pr-4 py-2 w-52 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Status filter - only on customers tab */}
                        {activeTab === 'customers' && (
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#122b7a] transition-all"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                                <option value="pending">Pending</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* ══ TAB: Customers ══════════════════════════════════════════ */}
                {activeTab === 'customers' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pelanggan</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Kontak</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center text-gray-400 dark:text-slate-500 text-sm">
                                                Tidak ada pelanggan ditemukan.
                                            </td>
                                        </tr>
                                    ) : filteredCustomers.map((c, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarCircle initials={c.initials} name={c.name} avatarUrl={c.avatar_url} />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                                            <Hash className="w-3 h-3" />{c.id.toString().slice(0, 12)}…
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" />{c.email || '—'}
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <Phone className="w-3 h-3" />{c.phone || '—'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={c.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setStatusModal(c)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#122b7a]/10 text-[#122b7a] dark:bg-blue-900/30 dark:text-blue-400 hover:bg-[#122b7a]/20 transition-all"
                                                    >
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        Ubah Status
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (c.phone) {
                                                                const formatted = c.phone.replace(/^0/, '62');
                                                                window.open(`https://wa.me/${formatted}`, '_blank');
                                                            } else {
                                                                alert('Nomor HP pelanggan tidak tersedia.');
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all"
                                                        title="Hubungi via WhatsApp"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                        WhatsApp
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-xs text-gray-400 dark:text-slate-500">
                                Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
                            </p>
                        </div>
                    </div>
                )}

                {/* ══ TAB: Complaints ═════════════════════════════════════════ */}
                {activeTab === 'complaints' && (
                    <div className="flex flex-col gap-4">
                        {filteredComplaints.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-gray-400 dark:text-slate-500 text-sm">Belum ada keluhan yang dicatat.</p>
                                <button
                                    onClick={() => setComplaintModal(true)}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#122b7a] text-white hover:bg-[#1a3d9e] transition-all mx-auto"
                                >
                                    <Plus className="w-4 h-4" /> Catat Keluhan Baru
                                </button>
                            </div>
                        ) : filteredComplaints.map((c) => (
                            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs font-mono text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                #{c.id}
                                            </span>
                                            <ComplaintBadge status={c.status} />
                                            <PriorityLabel priority={c.priority} />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{c.subject}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{c.message}</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {c.customer_name}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDate(c.created_at)}
                                            </span>
                                            {c.customer_phone && (
                                                <button
                                                    onClick={() => {
                                                        const formatted = (c.customer_phone as string).replace(/^0/, '62');
                                                        window.open(`https://wa.me/${formatted}`, '_blank');
                                                    }}
                                                    className="inline-flex ml-2 items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                                                    title="Hubungi via WhatsApp"
                                                >
                                                    <MessageCircle className="w-3 h-3" /> HUBUNGI CUSTOMER
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Ubah Status</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(['open','in_progress','resolved','closed'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateComplaintStatus(c.id, s)}
                                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                                        c.status === s
                                                            ? COMPLAINT_STATUS[s].cls + ' shadow-sm'
                                                            : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-600'
                                                    }`}
                                                >
                                                    {COMPLAINT_STATUS[s].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Inline animations */}
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
                .animate-slide-up { animation: slide-up 0.2s ease-out both; }
                .animate-in { animation: fade-in 0.15s ease both; }
                @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
            `}</style>
        </div>
    );
}

Notifications.layout = {
    breadcrumbs: [],
};
