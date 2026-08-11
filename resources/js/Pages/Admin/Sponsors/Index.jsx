import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Edit2, HeartHandshake, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminSponsors({ sponsors, competition }) {
    const [editingSponsor, setEditingSponsor] = useState(null);

    // Form for About description
    const aboutForm = useForm({
        about_description: competition?.about_description || '',
    });

    // Form for Sponsor
    const sponsorForm = useForm({
        name: '',
        logo_url: '',
        tier: 'gold',
        website_url: '',
        order: 1,
    });

    const submitAbout = (e) => {
        e.preventDefault();
        aboutForm.post('/admin/sponsors/about');
    };

    const submitSponsor = (e) => {
        e.preventDefault();
        if (editingSponsor) {
            sponsorForm.put(`/admin/sponsors/${editingSponsor.id}`, {
                onSuccess: () => {
                    sponsorForm.reset();
                    setEditingSponsor(null);
                }
            });
        } else {
            sponsorForm.post('/admin/sponsors', {
                onSuccess: () => sponsorForm.reset()
            });
        }
    };

    const handleEdit = (s) => {
        setEditingSponsor(s);
        sponsorForm.setData({
            name: s.name,
            logo_url: s.logo_url || '',
            tier: s.tier,
            website_url: s.website_url || '',
            order: s.order || 1,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus sponsor ini?')) {
            sponsorForm.delete(`/admin/sponsors/${id}`);
        }
    };

    return (
        <AdminLayout title="Kelola Sponsor & About Page">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Edit About Text & Form Add Sponsor */}
                <div className="space-y-6">
                    
                    {/* About Description Form */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                            <FileText className="w-5 h-5 text-brand-500 mr-2" />
                            Deskripsi About Tournament
                        </h3>

                        <form onSubmit={submitAbout} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Teks Deskripsi / Profil Event</label>
                                <textarea
                                    rows="4"
                                    value={aboutForm.data.about_description}
                                    onChange={(e) => aboutForm.setData('about_description', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Tulis deskripsi event turnamen futsal RS LIVASYA..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center space-x-1"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Simpan Deskripsi About</span>
                            </button>
                        </form>
                    </div>

                    {/* Add / Edit Sponsor Form */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                            <HeartHandshake className="w-5 h-5 text-amber-500 mr-2" />
                            {editingSponsor ? 'Edit Data Sponsor' : 'Tambah Sponsor Baru'}
                        </h3>

                        <form onSubmit={submitSponsor} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Nama Sponsor / Perusahaan</label>
                                <input
                                    type="text"
                                    value={sponsorForm.data.name}
                                    onChange={(e) => sponsorForm.setData('name', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    placeholder="PT Livasya Medika"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Kategori / Tier Sponsor</label>
                                <select
                                    value={sponsorForm.data.tier}
                                    onChange={(e) => sponsorForm.setData('tier', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                >
                                    <option value="main">⭐ Main Sponsor (Sponsor Utama)</option>
                                    <option value="gold">🥇 Gold Sponsor</option>
                                    <option value="silver">🥈 Silver Sponsor</option>
                                    <option value="partner">🤝 Official Partner</option>
                                    <option value="media">📺 Media Partner</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">URL Logo Sponsor (Gambar/PNG)</label>
                                <input
                                    type="text"
                                    value={sponsorForm.data.logo_url}
                                    onChange={(e) => sponsorForm.setData('logo_url', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                    placeholder="https://domain.com/logo.png"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">URL Website Sponsor (Opsional)</label>
                                <input
                                    type="url"
                                    value={sponsorForm.data.website_url}
                                    onChange={(e) => sponsorForm.setData('website_url', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                    placeholder="https://sponsor.com"
                                />
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                                >
                                    {editingSponsor ? 'Perbarui Sponsor' : '+ Simpan Sponsor'}
                                </button>
                                {editingSponsor && (
                                    <button
                                        type="button"
                                        onClick={() => { sponsorForm.reset(); setEditingSponsor(null); }}
                                        className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                </div>

                {/* Right 2 Columns: Sponsors List Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Sponsor & Partner</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Nama Sponsor</th>
                                    <th className="py-3 px-4 text-center">Tier</th>
                                    <th className="py-3 px-4">Website</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sponsors?.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700 border">
                                                    {s.logo_url ? (
                                                        <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        s.name[0]
                                                    )}
                                                </div>
                                                <span>{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                s.tier === 'main' ? 'bg-amber-100 text-amber-800' :
                                                s.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                                s.tier === 'silver' ? 'bg-slate-200 text-slate-800' : 'bg-brand-50 text-brand-600'
                                            }`}>
                                                {s.tier}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 font-medium">
                                            {s.website_url ? (
                                                <a href={s.website_url} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
                                                    Lihat Site ↗
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
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
