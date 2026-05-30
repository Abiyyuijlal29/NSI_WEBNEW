import { Head, router } from '@inertiajs/react';
import { Plus, Search, Eye, Edit, Trash2, X, Package, Wifi, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Package {
    id: string;
    nama_paket: string;
    harga: number;
    deskripsi: string;
    kecepatan?: string;
}

interface Props {
    packages: Package[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

function Overlay({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}
                style={{ animation: 'slideUp 0.2s ease-out' }}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    {/* title injected by children via context trick — we use slot pattern */}
                </div>
                {children}
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px) scale(.97) } to { opacity:1; transform:none } }`}</style>
        </div>
    );
}

// ─── Modal: View ─────────────────────────────────────────────────────────────

function ViewModal({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
    return (
        <Overlay onClose={onClose}>
            <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#122b7a] to-blue-500 flex items-center justify-center shadow-sm shrink-0">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{pkg.nama_paket}</h2>
                        <p className="text-xs text-gray-400 dark:text-slate-500">ID: {pkg.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3.5">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Harga/Bulan
                        </p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{formatRupiah(pkg.harga)}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3.5">
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Wifi className="w-3 h-3" /> Kecepatan
                        </p>
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{pkg.kecepatan || '—'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3.5 mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Deskripsi
                    </p>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{pkg.deskripsi || '—'}</p>
                </div>

                <button onClick={onClose}
                    className="w-full py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                    Tutup
                </button>
            </div>
        </Overlay>
    );
}

// ─── Modal: Form (Create & Edit) ──────────────────────────────────────────────

function PackageFormModal({
    pkg,
    onClose,
}: {
    pkg?: Package;
    onClose: () => void;
}) {
    const isEdit = Boolean(pkg);
    const [form, setForm] = useState({
        nama_paket: pkg?.nama_paket ?? '',
        harga:      pkg?.harga?.toString() ?? '',
        deskripsi:  pkg?.deskripsi ?? '',
        kecepatan:  pkg?.kecepatan ?? '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    function validate() {
        const e: Record<string, string> = {};
        if (!form.nama_paket.trim()) e.nama_paket = 'Nama paket wajib diisi.';
        if (!form.harga || isNaN(Number(form.harga)) || Number(form.harga) < 0) e.harga = 'Harga harus angka positif.';
        if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi.';
        return e;
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setProcessing(true);
        setErrors({});

        const payload = { ...form, harga: Number(form.harga) };

        if (isEdit && pkg) {
            router.put(`/content-manager/${pkg.id}`, payload, {
                onSuccess: () => { setSuccess(true); setTimeout(onClose, 800); },
                onError:   (e) => { setErrors(e as any); setProcessing(false); },
                onFinish:  () => setProcessing(false),
            });
        } else {
            router.post('/content-manager', payload, {
                onSuccess: () => { setSuccess(true); setTimeout(onClose, 800); },
                onError:   (e) => { setErrors(e as any); setProcessing(false); },
                onFinish:  () => setProcessing(false),
            });
        }
    }

    const field = (key: keyof typeof form, label: string, type: string = 'text', placeholder: string = '') => (
        <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] resize-none transition-all"
                />
            ) : (
                <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] transition-all"
                />
            )}
            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
        </div>
    );

    return (
        <Overlay onClose={onClose} wide>
            <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#122b7a] to-blue-500 flex items-center justify-center shadow-sm shrink-0">
                        <Package className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Paket' : 'Tambah Paket Baru'}
                    </h2>
                </div>

                {success && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2.5 mb-4">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {isEdit ? 'Paket berhasil diperbarui!' : 'Paket berhasil ditambahkan!'}
                    </div>
                )}

                {errors.message && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 mb-4">
                        {errors.message}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {field('nama_paket', 'Nama Paket', 'text', 'e.g. Paket Fiber 20 Mbps')}
                    <div className="grid grid-cols-2 gap-3">
                        {field('harga', 'Harga (Rp)', 'number', '0')}
                        {field('kecepatan', 'Kecepatan', 'text', 'e.g. 20 Mbps')}
                    </div>
                    {field('deskripsi', 'Deskripsi', 'textarea', 'Tuliskan deskripsi paket...')}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={processing || success}
                            className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#122b7a] text-white hover:bg-[#1a3d9e] disabled:opacity-60 transition-all shadow-sm active:scale-95">
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Paket'}
                        </button>
                    </div>
                </form>
            </div>
        </Overlay>
    );
}

// ─── Modal: Delete Confirm ────────────────────────────────────────────────────

function DeleteModal({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
    const [processing, setProcessing] = useState(false);

    function confirm() {
        setProcessing(true);
        router.delete(`/content-manager/${pkg.id}`, {
            onSuccess: onClose,
            onFinish:  () => setProcessing(false),
        });
    }

    return (
        <Overlay onClose={onClose}>
            <div className="px-6 py-5">
                <div className="flex flex-col items-center gap-3 mb-5 pt-2">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Hapus Paket?</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Paket <span className="font-semibold text-gray-800 dark:text-white">"{pkg.nama_paket}"</span> akan dihapus permanen dan tidak dapat dikembalikan.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                        Batal
                    </button>
                    <button onClick={confirm} disabled={processing}
                        className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all shadow-sm">
                        {processing ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </Overlay>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContentManager({ packages }: Props) {
    const [search, setSearch]       = useState('');
    const [viewPkg, setViewPkg]     = useState<Package | null>(null);
    const [editPkg, setEditPkg]     = useState<Package | null>(null);
    const [deletePkg, setDeletePkg] = useState<Package | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const flash = (window as any).__page?.props?.flash as { success?: string } | undefined;

    const filtered = packages.filter(p =>
        p.nama_paket.toLowerCase().includes(search.toLowerCase()) ||
        (p.deskripsi ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Package Manager" />

            {/* Modals */}
            {viewPkg    && <ViewModal       pkg={viewPkg}   onClose={() => setViewPkg(null)}    />}
            {editPkg    && <PackageFormModal pkg={editPkg}  onClose={() => setEditPkg(null)}    />}
            {deletePkg  && <DeleteModal      pkg={deletePkg} onClose={() => setDeletePkg(null)} />}
            {showCreate && <PackageFormModal              onClose={() => setShowCreate(false)}   />}

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#122b7a] to-blue-500 flex items-center justify-center shadow-sm">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Package Manager</h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            Kelola paket layanan internet yang tersedia untuk pengguna aplikasi.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari paket..."
                                className="pl-9 pr-4 py-2.5 w-56 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        <button
                            id="btn-new-package"
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Package
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Paket',       value: packages.length,   color: 'text-gray-900 dark:text-white' },
                        { label: 'Aktif',             value: packages.length,   color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Hasil Pencarian',   value: filtered.length,   color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Draft',             value: 0,                  color: 'text-gray-400 dark:text-slate-500' },
                    ].map(s => (
                        <div key={s.label} className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                            <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Nama Paket</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Harga/Bulan</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Kecepatan</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <Package className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                                            <p className="text-sm text-gray-400 dark:text-slate-500">
                                                {search ? `Tidak ada paket dengan kata kunci "${search}"` : 'Belum ada paket.'}
                                            </p>
                                            {!search && (
                                                <button
                                                    onClick={() => setShowCreate(true)}
                                                    className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#122b7a] text-white hover:bg-[#1a3d9e] transition-all mx-auto"
                                                >
                                                    <Plus className="w-4 h-4" /> Tambah Paket Pertama
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : filtered.map((p) => (
                                    <tr key={p.id} className="border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#122b7a]/10 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                    <Wifi className="w-4 h-4 text-[#122b7a] dark:text-blue-400" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.nama_paket}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-bold text-[#122b7a] dark:text-blue-400">
                                                {formatRupiah(p.harga)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                <Wifi className="w-3 h-3" />
                                                {p.kecepatan || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-500 dark:text-slate-400 max-w-[220px] block truncate">
                                                {p.deskripsi || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setViewPkg(p)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditPkg(p)}
                                                    className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletePkg(p)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-800">
                            <p className="text-xs text-gray-400 dark:text-slate-500">
                                Menampilkan {filtered.length} dari {packages.length} paket
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

ContentManager.layout = {
    breadcrumbs: [],
};
