import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm, router } from '@inertiajs/react';
import { Newspaper, Plus, Trash2, Edit2, Sparkles, Image as ImageIcon, Eye, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminEvents({ events }) {
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });

    const form = useForm({
        title: '',
        content: '',
        image_url: '',
        author_name: 'Panitia Turnamen Livasya',
        is_published: true,
    });

    const submitForm = (e) => {
        e.preventDefault();
        if (editingEvent) {
            form.put(`/admin/events/${editingEvent.id}`, {
                onSuccess: () => {
                    form.reset();
                    setEditingEvent(null);
                }
            });
        } else {
            form.post('/admin/events', {
                onSuccess: () => form.reset()
            });
        }
    };

    const handleEdit = (ev) => {
        setEditingEvent(ev);
        form.setData({
            title: ev.title || '',
            content: ev.content || '',
            image_url: ev.image_url || '',
            author_name: ev.author_name || 'Panitia Turnamen Livasya',
            is_published: ev.is_published,
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
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Konten / Deskripsi <span className="text-red-500">*</span></label>
                            <textarea
                                rows={5}
                                placeholder="Tuliskan berita, informasi, atau pengumuman lengkap di sini..."
                                value={form.data.content}
                                onChange={(e) => form.setData('content', e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">URL Foto / Media (Opsional)</label>
                            <input
                                type="url"
                                placeholder="https://example.com/foto-event.jpg"
                                value={form.data.image_url}
                                onChange={(e) => form.setData('image_url', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
                            />
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
