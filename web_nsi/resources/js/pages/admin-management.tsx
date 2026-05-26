import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search, Plus, Pencil, Trash2, KeyRound,
    ShieldCheck, Shield, X, Eye, EyeOff, CheckCircle, AlertCircle, Users
} from 'lucide-react';

interface Admin {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'superadmin';
    created_at: string;
    is_self: boolean;
}

interface Props {
    admins: Admin[];
    search: string;
    total: number;
}

type ModalType = 'create' | 'edit' | 'delete' | 'reset-password' | null;

function RoleBadge({ role }: { role: string }) {
    if (role === 'superadmin') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <ShieldCheck className="w-3 h-3" />
                Superadmin
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Shield className="w-3 h-3" />
            Admin
        </span>
    );
}

function InitialsAvatar({ name, role }: { name: string; role: string }) {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const cls = role === 'superadmin'
        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${cls}`}>
            {initials}
        </div>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

function PasswordInput({ name, placeholder, value, onChange }: {
    name: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all"
            />
            <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );
}

export default function AdminManagement({ admins, search, total }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } }; flash?: { success?: string } }>().props;
    const flash = (usePage().props as any).flash as { success?: string } | undefined;

    const [modal, setModal] = useState<ModalType>(null);
    const [selected, setSelected] = useState<Admin | null>(null);
    const [searchVal, setSearchVal] = useState(search);

    // Create form
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'admin' });
    // Edit form
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'admin' });
    // Reset password form
    const [pwForm, setPwForm] = useState({ password: '', password_confirmation: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const openEdit = (admin: Admin) => {
        setSelected(admin);
        setEditForm({ name: admin.name, email: admin.email, role: admin.role });
        setErrors({});
        setModal('edit');
    };

    const openDelete = (admin: Admin) => { setSelected(admin); setModal('delete'); };
    const openReset = (admin: Admin) => {
        setSelected(admin);
        setPwForm({ password: '', password_confirmation: '' });
        setErrors({});
        setModal('reset-password');
    };
    const closeModal = () => { setModal(null); setSelected(null); setErrors({}); };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin-management', { search: searchVal }, { preserveState: true, replace: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/admin-management', form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onSuccess: () => { closeModal(); setForm({ name: '', email: '', password: '', password_confirmation: '', role: 'admin' }); setProcessing(false); },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setProcessing(true);
        router.put(`/admin-management/${selected.id}`, editForm, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onSuccess: () => { closeModal(); setProcessing(false); },
        });
    };

    const handleDelete = () => {
        if (!selected) return;
        setProcessing(true);
        router.delete(`/admin-management/${selected.id}`, {
            onSuccess: () => { closeModal(); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setProcessing(true);
        router.post(`/admin-management/${selected.id}/reset-password`, pwForm, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onSuccess: () => { closeModal(); setProcessing(false); },
        });
    };

    const superadminCount = admins.filter(a => a.role === 'superadmin').length;
    const adminCount = admins.filter(a => a.role === 'admin').length;

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300">
            <Head title="Admin Management" />

            <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6">
                {/* Flash Success */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Management</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage administrator accounts, roles, and access permissions.</p>
                    </div>
                    <button
                        id="btn-add-admin"
                        onClick={() => { setErrors({}); setModal('create'); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] hover:bg-[#1a3d9e] text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Admin
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Admins', value: total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-slate-900', icon: Users },
                        { label: 'Superadmins', value: superadminCount, color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: ShieldCheck },
                        { label: 'Regular Admins', value: adminCount, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Shield },
                    ].map(({ label, value, color, bg, icon: Icon }) => (
                        <div key={label} className={`${bg} rounded-xl border border-gray-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{label}</p>
                                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                    {/* Table Header with Search */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">All Administrators <span className="text-gray-400 dark:text-slate-500 font-normal">({total})</span></p>
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 pr-4 py-2 w-64 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] transition-all"
                            />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                                {admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400 dark:text-slate-500">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-40" />
                                            No administrators found.
                                        </td>
                                    </tr>
                                ) : admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <InitialsAvatar name={admin.name} role={admin.role} />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {admin.name}
                                                        {admin.is_self && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">YOU</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-slate-500">ID #{admin.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700 dark:text-slate-300">{admin.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={admin.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{admin.created_at}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(admin)}
                                                    title="Edit"
                                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openReset(admin)}
                                                    title="Reset Password"
                                                    className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                {!admin.is_self && (
                                                    <button
                                                        onClick={() => openDelete(admin)}
                                                        title="Delete"
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── CREATE MODAL ── */}
            {modal === 'create' && (
                <Modal title="Add New Admin" onClose={closeModal}>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. John Doe"
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="admin@example.com"
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all" />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Role</label>
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all appearance-none bg-white">
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                            <PasswordInput name="password" placeholder="Min. 8 characters" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                            <PasswordInput name="password_confirmation" placeholder="Repeat password" value={form.password_confirmation} onChange={v => setForm(f => ({ ...f, password_confirmation: v }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-[#122b7a] hover:bg-[#1a3d9e] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60">
                                {processing ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── EDIT MODAL ── */}
            {modal === 'edit' && selected && (
                <Modal title="Edit Admin" onClose={closeModal}>
                    <form onSubmit={handleEdit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all" />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Role</label>
                            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:text-white transition-all appearance-none bg-white">
                                <option value="admin">Admin</option>
                                <option value="superadmin">Superadmin</option>
                            </select>
                            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-[#122b7a] hover:bg-[#1a3d9e] text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60">
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── RESET PASSWORD MODAL ── */}
            {modal === 'reset-password' && selected && (
                <Modal title={`Reset Password — ${selected.name}`} onClose={closeModal}>
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            This will immediately change the password for <strong>{selected.email}</strong>.
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">New Password</label>
                            <PasswordInput name="password" placeholder="Min. 8 characters" value={pwForm.password} onChange={v => setPwForm(f => ({ ...f, password: v }))} />
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                            <PasswordInput name="password_confirmation" placeholder="Repeat password" value={pwForm.password_confirmation} onChange={v => setPwForm(f => ({ ...f, password_confirmation: v }))} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60">
                                {processing ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ── DELETE MODAL ── */}
            {modal === 'delete' && selected && (
                <Modal title="Delete Admin Account" onClose={closeModal}>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col items-center gap-3 py-2">
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete <span className="text-red-600">{selected.name}</span>?</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">This action cannot be undone. The account <strong>{selected.email}</strong> will be permanently removed.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={handleDelete} disabled={processing} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60">
                                {processing ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

AdminManagement.layout = {
    breadcrumbs: [],
};
