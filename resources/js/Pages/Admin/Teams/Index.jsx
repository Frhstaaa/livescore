import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Shield, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function AdminTeams({ teams }) {
    const [editingTeam, setEditingTeam] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        short_name: '',
        coach_name: '',
        founded_year: 2020,
        logo_url: '',
        logo_file: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo_file', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        // Use post with _method PUT for multipart form update in Laravel Inertia
        if (editingTeam) {
            post(`/admin/teams/${editingTeam.id}`, {
                headers: { 'X-HTTP-Method-Override': 'PUT' },
                onSuccess: () => {
                    reset();
                    setEditingTeam(null);
                    setPreviewUrl(null);
                }
            });
        } else {
            post('/admin/teams', {
                onSuccess: () => {
                    reset();
                    setPreviewUrl(null);
                }
            });
        }
    };

    const handleEdit = (team) => {
        setEditingTeam(team);
        setPreviewUrl(team.logo_url || null);
        setData({
            name: team.name,
            short_name: team.short_name,
            coach_name: team.coach_name || '',
            founded_year: team.founded_year || 2020,
            logo_url: team.logo_url || '',
            logo_file: null,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus tim ini?')) {
            destroy(`/admin/teams/${id}`);
        }
    };

    return (
        <AdminLayout title="Kelola Tim & Logo WebP">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Add / Edit Team */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 text-brand-500 mr-2" />
                        {editingTeam ? 'Edit Tim Futsal' : 'Tambah Tim Futsal Baru'}
                    </h3>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        {/* Logo Upload with Auto WebP Converter */}
                        <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-center">
                            <label className="block font-bold text-gray-700 mb-2 flex items-center justify-center">
                                <UploadCloud className="w-4 h-4 text-brand-500 mr-1" />
                                Upload Logo Tim (Auto WebP)
                            </label>
                            
                            <div className="flex items-center justify-center space-x-3 mb-2">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-inner flex items-center justify-center overflow-hidden">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white hover:file:bg-brand-600 cursor-pointer"
                                />
                            </div>
                            <span className="text-[10px] text-brand-600 font-semibold block">
                                ✨ Gambar otomatis dikonversi ke format .WebP performa tinggi.
                            </span>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Nama Tim</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="RS Livasya FC"
                                required
                            />
                            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Singkatan / Code (Max 5 Huruf)</label>
                            <input
                                type="text"
                                value={data.short_name}
                                onChange={(e) => setData('short_name', e.target.value.toUpperCase())}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="LIV"
                                maxLength={5}
                                required
                            />
                            {errors.short_name && <span className="text-red-500 text-[10px] mt-1 block">{errors.short_name}</span>}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Nama Pelatih / Coach</label>
                            <input
                                type="text"
                                value={data.coach_name}
                                onChange={(e) => setData('coach_name', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Coach Farhan"
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Tahun Berdiri</label>
                            <input
                                type="number"
                                value={data.founded_year}
                                onChange={(e) => setData('founded_year', parseInt(e.target.value))}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                            >
                                {editingTeam ? 'Perbarui Tim' : '+ Simpan Tim & Upload WebP'}
                            </button>
                            {editingTeam && (
                                <button
                                    type="button"
                                    onClick={() => { reset(); setEditingTeam(null); setPreviewUrl(null); }}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Team List Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Tim & Logo (.webp)</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Logo & Tim</th>
                                    <th className="py-3 px-4">Pelatih</th>
                                    <th className="py-3 px-4 text-center">Jumlah Pemain</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teams?.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-700 border border-gray-200 overflow-hidden shadow-sm">
                                                    {t.logo_url ? (
                                                        <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        t.short_name
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="block font-black">{t.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-semibold">{t.short_name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 font-medium">{t.coach_name || '-'}</td>
                                        <td className="py-3 px-4 text-center font-bold text-brand-600">{t.players_count || 0} Pemain</td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
