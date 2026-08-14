import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm, router } from '@inertiajs/react';
import { Newspaper, Plus, Trash2, Edit2, Sparkles, Image as ImageIcon, Eye, CheckCircle2, XCircle, UploadCloud, Link as LinkIcon, X } from 'lucide-react';

export default function AdminEvents({ events }) {
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'
    const [previewUrl, setPreviewUrl] = useState(null);

    const form = useForm({
        title: '',
        content: '',
        image_url: '',
        image_file: null,
        author_name: 'Panitia Turnamen Livasya',
        is_published: true,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            form.setData('image_file', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        form.setData((prev) => ({ ...prev, image_file: null, image_url: '' }));
        setPreviewUrl(null);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (editingEvent) {
            form.post(`/admin/events/${editingEvent.id}`, {
                headers: { 'X-HTTP-Method-Override': 'PUT' },
                forceFormData: true,
                onSuccess: () => {
                    form.reset();
                    setEditingEvent(null);
                    setPreviewUrl(null);
                }
            });
        } else {
            form.post('/admin/events', {
                forceFormData: true,
                onSuccess: () => {
                    form.reset();
                    setPreviewUrl(null);
                }
            });
        }
    };

    const handleEdit = (ev) => {
        setEditingEvent(ev);
        setPreviewUrl(ev.image_url || null);
        setImageMode(ev.image_url && ev.image_url.startsWith('http') && !ev.image_url.includes('127.0.0.1') ? 'url' : 'upload');
        form.setData({
            title: ev.title || '',
            content: ev.content || '',
            image_url: ev.image_url || '',
            image_file: null,
            author_name: ev.author_name || 'Panitia Turnamen Livasya',
            is_published: !!ev.is_published,
        });
    };

    const handleDelete = (ev) => {
        setDeleteModal({ isOpen: true, id: ev.id, title: ev.title });
    };

    const confirmDeleteEvent = () => {
        if (!deleteModal.id) return;
        router.delete(`/admin/events/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, title: '' })
        });
    };

    const cancelEdit = () => {
        setEditingEvent(null);
        setPreviewUrl(null);
        form.reset();
    };

    return (
        <AdminLayout title="Kelola Postingan Event">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                        <Newspaper className="w-6 h-6 text-brand-500 mr-2.5" />
                        Kelola Event & Berita
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Buat dan publish postingan kegiatan, pengumuman, dan highlight turnamen di aplikasi publik.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Create / Edit Form */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-fit">
                    <h2 className="text-sm font-black text-slate-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="flex items-center">
                            <Sparkles className="w-4 h-4 text-brand-500 mr-2" />
                            {editingEvent ? 'Edit Postingan Event' : 'Tambah Event Baru'}
                        </span>
                        {editingEvent && (
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="text-[11px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded-lg"
                            >
                                Batal Edit
                            </button>
                        )}
                    </h2>

                    <form onSubmit={submitForm} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Event / Postingan</label>
                            <input
                                type="text"
                                placeholder="Contoh: Pembukaan Resmi Turnamen 2026"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
                            />
                            {form.errors.title && <span className="text-red-500 text-[10px] mt-1 block">{form.errors.title}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Konten / Deskripsi <span className="text-red-500">*</span></label>
                            <textarea
                                rows={4}
                                placeholder="Tuliskan berita, informasi, atau pengumuman lengkap di sini..."
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium leading-relaxed"
                            />
                            {form.errors.content && <span className="text-red-500 text-[10px] mt-1 block">{form.errors.content}</span>}
                        </div>

                        {/* Image Upload / URL Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700">Foto / Banner Event</label>
                                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setImageMode('upload')}
                                        className={`px-2 py-0.5 rounded-md transition-all ${
                                            imageMode === 'upload' ? 'bg-white text-brand-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageMode('url')}
                                        className={`px-2 py-0.5 rounded-md transition-all ${
                                            imageMode === 'url' ? 'bg-white text-brand-600 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Link URL
                                    </button>
                                </div>
                            </div>

                            {imageMode === 'upload' ? (
                                <div className="space-y-2">
                                    <label className="border-2 border-dashed border-gray-200 hover:border-brand-400 bg-gray-50 hover:bg-brand-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-brand-500 mb-2 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-brand-600">
                                            {form.data.image_file ? form.data.image_file.name : 'Pilih Foto dari Komputer / HP'}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                                            PNG, JPG, WebP (Otomatis dikonversi ke .webp)
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/foto-event.jpg"
                                        value={form.data.image_url}
                                        onChange={(e) => {
                                            form.setData('image_url', e.target.value);
                                            setPreviewUrl(e.target.value || null);
                                        }}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
                                    />
                                </div>
                            )}

                            {/* Live Thumbnail Preview */}
                            {previewUrl && (
                                <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 p-1 group">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-xl"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors shadow-md backdrop-blur-xs"
                                        title="Hapus foto ini"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                                        Preview Foto Event
                                    </div>
                                </div>
                            )}
                            {form.errors.image_file && <span className="text-red-500 text-[10px] mt-1 block">{form.errors.image_file}</span>}
                            {form.errors.image_url && <span className="text-red-500 text-[10px] mt-1 block">{form.errors.image_url}</span>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penulis / Redaksi</label>
                            <input
                                type="text"
                                placeholder="Panitia Turnamen Livasya"
                                value={form.data.author_name}
                                onChange={(e) => form.setData('author_name', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
                            />
                            {form.errors.author_name && <span className="text-red-500 text-[10px] mt-1 block">{form.errors.author_name}</span>}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={form.data.is_published}
                                onChange={(e) => form.setData('is_published', e.target.checked)}
                                className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                            />
                            <label htmlFor="is_published" className="text-xs font-bold text-slate-700 cursor-pointer">
                                Dipublikasikan (Tampilkan di Public)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{editingEvent ? 'Simpan Perubahan Event' : 'Terbitkan Postingan Event'}</span>
                        </button>
                    </form>
                </div>

                {/* Right Column: List Table of Event Posts */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900">Daftar Event & Berita ({events?.length || 0})</h2>
                    </div>

                    <div className="divide-y divide-gray-100 overflow-y-auto max-h-[650px]">
                        {events && events.length > 0 ? (
                            events.map((ev) => (
                                <div key={ev.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start space-x-3.5 flex-1">
                                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {ev.image_url ? (
                                                <img src={ev.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                    ev.is_published ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {ev.is_published ? 'Published' : 'Draft'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {new Date(ev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{ev.title || 'Tanpa Judul'}</h3>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ev.content}</p>
                                            <p className="text-[10px] font-bold text-brand-600 mt-1">Penulis: {ev.author_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 self-end sm:self-start">
                                        <button
                                            onClick={() => handleEdit(ev)}
                                            className="p-2 text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-brand-50 rounded-xl transition-colors"
                                            title="Edit Post"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ev)}
                                            className="p-2 text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Hapus Post"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                Belum ada postingan event yang terdaftar. Gunakan form di sebelah kiri untuk menambah postingan baru.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Postingan Event"
                message={`Apakah Anda yakin ingin menghapus artikel "${deleteModal.title || 'ini'}"? Postingan ini akan dihapus dari halaman publik.`}
                confirmText="Ya, Hapus Post"
                onConfirm={confirmDeleteEvent}
                onClose={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
            />
        </AdminLayout>
    );
}
