import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { UserPlus, Trash2, Edit2, Shield, Filter } from 'lucide-react';

export default function AdminPlayers({ players, teams, selectedTeamId }) {
    const [editingPlayer, setEditingPlayer] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        team_id: selectedTeamId || (teams[0] ? teams[0].id : ''),
        name: '',
        jersey_number: 10,
        position: 'Flank',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editingPlayer) {
            put(`/admin/players/${editingPlayer.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingPlayer(null);
                }
            });
        } else {
            post('/admin/players', {
                onSuccess: () => reset()
            });
        }
    };

    const handleEdit = (p) => {
        setEditingPlayer(p);
        setData({
            team_id: p.team_id,
            name: p.name,
            jersey_number: p.jersey_number,
            position: p.position || 'Flank',
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus pemain ini?')) {
            destroy(`/admin/players/${id}`);
        }
    };

    const handleFilterTeam = (teamId) => {
        router.get('/admin/players', teamId ? { team_id: teamId } : {}, { preserveState: true });
    };

    return (
        <AdminLayout title="Kelola Pemain & Skuad Futsal">
            {/* Filter Tim Selector */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-gray-700">Filter Berdasarkan Tim:</span>
                </div>
                <select
                    value={selectedTeamId || ''}
                    onChange={(e) => handleFilterTeam(e.target.value)}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xs text-gray-900 outline-none"
                >
                    <option value="">Semua Tim Futsal</option>
                    {teams?.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Add / Edit Player */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 text-brand-500 mr-2" />
                        {editingPlayer ? 'Edit Pemain Futsal' : 'Tambah Pemain Futsal Baru'}
                    </h3>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Pilih Tim Futsal</label>
                            <select
                                value={data.team_id}
                                onChange={(e) => setData('team_id', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            >
                                <option value="">-- Pilih Tim --</option>
                                {teams?.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.team_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.team_id}</span>}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Nama Pemain</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Ardiansyah Runtuboy"
                                required
                            />
                            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">No. Punggung</label>
                                <input
                                    type="number"
                                    value={data.jersey_number}
                                    onChange={(e) => setData('jersey_number', parseInt(e.target.value))}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-black text-center text-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Posisi Bermain</label>
                                <select
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                >
                                    <option value="GK">🧤 Goalkeeper (GK)</option>
                                    <option value="Anchor">🛡️ Anchor (Bertahan)</option>
                                    <option value="Flank">⚡ Flank (Sayap)</option>
                                    <option value="Pivot">⚽ Pivot (Penyerang)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                            >
                                {editingPlayer ? 'Perbarui Pemain' : '+ Simpan Pemain Baru'}
                            </button>
                            {editingPlayer && (
                                <button
                                    type="button"
                                    onClick={() => { reset(); setEditingPlayer(null); }}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Players Table & Mobile Cards */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Pemain</h3>

                    {/* Mobile Cards (< md) */}
                    <div className="block md:hidden space-y-3">
                        {players?.map((p) => (
                            <div key={p.id} className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                        #{p.jersey_number}
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 leading-tight">{p.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-semibold">{p.team?.name} • {p.position}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="p-2 text-brand-500 bg-white border border-gray-200 rounded-xl transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-2 text-red-500 bg-white border border-gray-200 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-3 w-10 text-center">#No</th>
                                    <th className="py-3 px-4">Nama Pemain</th>
                                    <th className="py-3 px-4">Tim</th>
                                    <th className="py-3 px-3 text-center">Posisi</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {players?.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-3 text-center font-black text-gray-600">
                                            #{p.jersey_number}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                                        <td className="py-3 px-4 text-gray-500 font-medium">{p.team?.name}</td>
                                        <td className="py-3 px-3 text-center">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px]">
                                                {p.position}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(p)}
                                                className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
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
