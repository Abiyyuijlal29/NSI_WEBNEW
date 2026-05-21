import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Package as PackageIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_paket: '',
        harga: '',
        kecepatan: '',
        deskripsi: '',
    });

    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form for Edit
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        nama_paket: '',
        harga: '',
        kecepatan: '',
        deskripsi: '',
    });

    // Form for Delete
    const { delete: destroyPackage, processing: deleteProcessing } = useForm();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/content-manager', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const openViewModal = (pkg: Package) => {
        setSelectedPackage(pkg);
        setIsViewOpen(true);
    };

    const openEditModal = (pkg: Package) => {
        setSelectedPackage(pkg);
        setEditData({
            nama_paket: pkg.nama_paket,
            harga: pkg.harga.toString(),
            kecepatan: pkg.kecepatan || '',
            deskripsi: pkg.deskripsi,
        });
        setIsEditOpen(true);
    };

    const openDeleteModal = (pkg: Package) => {
        setSelectedPackage(pkg);
        setIsDeleteOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) return;
        putEdit(`/content-manager/${selectedPackage.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedPackage(null);
                resetEdit();
            },
        });
    };

    const handleDeleteConfirm = () => {
        if (!selectedPackage) return;
        destroyPackage(`/content-manager/${selectedPackage.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedPackage(null);
            },
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col bg-[#f8fafc] dark:bg-[#0a0a0a] font-sans transition-colors duration-300 overflow-x-hidden">
            <Head title="Package Manager" />

            <div className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Package Manager</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage internet service packages available for mobile app users.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search packages..."
                                className="pl-9 pr-4 py-2.5 w-56 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            New Package
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Total Packages</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{packages.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Active</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{packages.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Mobile Visibility</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mt-1">On</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Drafts</p>
                        <p className="text-2xl font-bold text-gray-400 dark:text-slate-600 mt-1">0</p>
                    </div>
                </div>

                {/* Package Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Package Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Monthly Price</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Actions</th>
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
                                                <button 
                                                    onClick={() => openViewModal(p)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer" 
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                                </button>
                                                <button 
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer" 
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(p)}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer" 
                                                    title="Delete"
                                                >
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

                {/* Modal Tambah Paket */}
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsModalOpen(false);
                        reset();
                    }
                }}>
                    <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-xl p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-[#122b7a] dark:text-blue-400 rounded-lg">
                                    <PackageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Tambah Paket Baru</DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                        Masukkan informasi detail paket internet baru yang akan ditampilkan di aplikasi seluler.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <div>
                                <label htmlFor="nama_paket" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Nama Paket *</label>
                                <input
                                    id="nama_paket"
                                    type="text"
                                    required
                                    value={data.nama_paket}
                                    onChange={(e) => setData('nama_paket', e.target.value)}
                                    placeholder="Contoh: Paket Super Cepat 50 Mbps"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                />
                                <InputError message={errors.nama_paket} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="harga" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Harga Bulanan (Rp) *</label>
                                    <input
                                        id="harga"
                                        type="number"
                                        required
                                        min="0"
                                        value={data.harga}
                                        onChange={(e) => setData('harga', e.target.value)}
                                        placeholder="Contoh: 350000"
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                    <InputError message={errors.harga} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="kecepatan" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Kecepatan</label>
                                    <input
                                        id="kecepatan"
                                        type="text"
                                        value={data.kecepatan}
                                        onChange={(e) => setData('kecepatan', e.target.value)}
                                        placeholder="Contoh: 50 Mbps"
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                    <InputError message={errors.kecepatan} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="deskripsi" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Deskripsi Paket *</label>
                                <textarea
                                    id="deskripsi"
                                    required
                                    rows={4}
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Jelaskan fitur dan keunggulan paket ini..."
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm resize-none"
                                ></textarea>
                                <InputError message={errors.deskripsi} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); reset(); }}
                                    className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#122b-7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={processing}
                                >
                                    {processing ? <Spinner className="w-4 h-4 text-white" /> : null}
                                    <span>Simpan Paket</span>
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal View Paket */}
                <Dialog open={isViewOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsViewOpen(false);
                        setSelectedPackage(null);
                    }
                }}>
                    <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-xl p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-[#122b7a] dark:text-blue-400 rounded-lg">
                                    <PackageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Detail Paket Internet</DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                        Informasi lengkap mengenai paket layanan internet.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedPackage && (
                            <div className="flex flex-col gap-4 mt-2 text-sm text-gray-700 dark:text-slate-300">
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Paket</span>
                                    <p className="font-semibold text-base text-gray-900 dark:text-white">{selectedPackage.nama_paket}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Harga Bulanan</span>
                                        <p className="font-bold text-[#122b7a] dark:text-blue-400">Rp {new Intl.NumberFormat('id-ID').format(selectedPackage.harga)}</p>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kecepatan</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedPackage.kecepatan || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status Layanan</span>
                                    <div className="mt-1">
                                        <ContentStatusBadge status="Active" />
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</span>
                                    <p className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                        {selectedPackage.deskripsi}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => { setIsViewOpen(false); setSelectedPackage(null); }}
                                className="px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit Paket */}
                <Dialog open={isEditOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsEditOpen(false);
                        setSelectedPackage(null);
                        resetEdit();
                    }
                }}>
                    <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-xl p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-[#122b7a] dark:text-blue-400 rounded-lg">
                                    <Edit className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Edit Paket Internet</DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                        Perbarui informasi detail paket internet yang sudah ada.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-2">
                            <div>
                                <label htmlFor="edit_nama_paket" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Nama Paket *</label>
                                <input
                                    id="edit_nama_paket"
                                    type="text"
                                    required
                                    value={editData.nama_paket}
                                    onChange={(e) => setEditData('nama_paket', e.target.value)}
                                    placeholder="Contoh: Paket Super Cepat 50 Mbps"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                />
                                <InputError message={editErrors.nama_paket} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit_harga" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Harga Bulanan (Rp) *</label>
                                    <input
                                        id="edit_harga"
                                        type="number"
                                        required
                                        min="0"
                                        value={editData.harga}
                                        onChange={(e) => setEditData('harga', e.target.value)}
                                        placeholder="Contoh: 350000"
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                    <InputError message={editErrors.harga} className="mt-1" />
                                </div>

                                <div>
                                    <label htmlFor="edit_kecepatan" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Kecepatan</label>
                                    <input
                                        id="edit_kecepatan"
                                        type="text"
                                        value={editData.kecepatan}
                                        onChange={(e) => setEditData('kecepatan', e.target.value)}
                                        placeholder="Contoh: 50 Mbps"
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm"
                                    />
                                    <InputError message={editErrors.kecepatan} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit_deskripsi" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Deskripsi Paket *</label>
                                <textarea
                                    id="edit_deskripsi"
                                    required
                                    rows={4}
                                    value={editData.deskripsi}
                                    onChange={(e) => setEditData('deskripsi', e.target.value)}
                                    placeholder="Jelaskan fitur dan keunggulan paket ini..."
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#122b7a] dark:focus:ring-blue-500 transition-all shadow-sm resize-none"
                                ></textarea>
                                <InputError message={editErrors.deskripsi} className="mt-1" />
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditOpen(false); setSelectedPackage(null); resetEdit(); }}
                                    className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                    disabled={editProcessing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#122b7a] text-white text-sm font-semibold rounded-lg hover:bg-[#1a3d9e] transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={editProcessing}
                                >
                                    {editProcessing ? <Spinner className="w-4 h-4 text-white" /> : null}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Hapus Paket */}
                <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                    if (!open) {
                        setIsDeleteOpen(false);
                        setSelectedPackage(null);
                    }
                }}>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl rounded-xl p-6">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Hapus Paket</DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                        Tindakan ini tidak dapat dibatalkan.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {selectedPackage && (
                            <div className="my-2 text-sm text-gray-600 dark:text-slate-400">
                                Apakah Anda yakin ingin menghapus paket <span className="font-bold text-gray-900 dark:text-white">{selectedPackage.nama_paket}</span>? Paket yang dihapus tidak akan lagi tersedia bagi pelanggan di aplikasi seluler.
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => { setIsDeleteOpen(false); setSelectedPackage(null); }}
                                className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                disabled={deleteProcessing}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={deleteProcessing}
                            >
                                {deleteProcessing ? <Spinner className="w-4 h-4 text-white" /> : null}
                                <span>Ya, Hapus Paket</span>
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

ContentManager.layout = {
    breadcrumbs: [],
};

