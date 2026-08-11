import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { Trophy, Plus, Trash2, Edit2, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function AdminCompetitions({ competitions }) {
    const [editingComp, setEditingComp] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        season: '2026',
        type: 'league',
        match_duration_minutes: 40,
        half_duration_minutes: 20,
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        start_date: '',
        end_date: '',
        is_active: false,
    });

    const submit = (e) => {
        e.preventDefault();
        if (editingComp) {
            put(`/admin/competitions/${editingComp.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingComp(null);
                }
            });
        } else {
            post('/admin/competitions', {
                onSuccess: () => reset()
            });
        }
    };

    const handleEdit = (c) => {
        setEditingComp(c);
        setData({
            name: c.name,
            season: c.season,
            type: c.type,
            match_duration_minutes: c.match_duration_minutes || 40,
            half_duration_minutes: c.half_duration_minutes || 20,
            points_win: c.points_win || 3,
            points_draw: c.points_draw || 1,
            points_loss: c.points_loss || 0,
            start_date: c.start_date || '',
            end_date: c.end_date || '',
            is_active: c.is_active || false,
        });
    };

    const handleSetActive = (id) => {
        router.post(`/admin/competitions/${id}/active`);
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus kompetisi ini?')) {
            destroy(`/admin/competitions/${id}`);
        }
    };

    return (
        <AdminLayout title="Pengaturan Turnamen & Sistem Kompetisi">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Create / Edit Competition */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                        <Trophy className="w-5 h-5 text-brand-500 mr-2" />
                        {editingComp ? 'Edit Turnamen Futsal' : 'Tambah Turnamen Futsal Baru'}
                    </h3>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Nama Turnamen / Kompetisi</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="RS LIVASYA FUTSAL CUP 2026"
                                required
                            />
                            {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Musim / Season</label>
                                <input
                                    type="text"
                                    value={data.season}
                                    onChange={(e) => setData('season', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Sistem Turnamen</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                >
                                    <option value="league">🏆 League (Klasemen Poin)</option>
                                    <option value="knockout">🥊 Cup (Sistem Gugur)</option>
                                    <option value="group">🧩 Group Stage (Fase Grup)</option>
                                </select>
                            </div>
                        </div>

                        {/* Waktu Bermain Config */}
                        <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 space-y-3">
                            <h4 className="font-black text-brand-700 uppercase tracking-wider text-[11px] flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-brand-500" />
                                Waktu Bermain Match (Menit)
                            </h4>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold text-gray-600 text-[10px] mb-1">Total Durasi Match</label>
                                    <input
                                        type="number"
                                        value={data.match_duration_minutes}
                                        onChange={(e) => setData('match_duration_minutes', parseInt(e.target.value))}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-center text-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-600 text-[10px] mb-1">Menit per Babak</label>
                                    <input
                                        type="number"
                                        value={data.half_duration_minutes}
                                        onChange={(e) => setData('half_duration_minutes', parseInt(e.target.value))}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-center text-gray-900"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* System Points Config */}
                        {data.type === 'league' && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                <h4 className="font-bold text-gray-700 text-[11px]">Sistem Perhitungan Poin Klasemen</h4>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Menang</label>
                                        <input
                                            type="number"
                                            value={data.points_win}
                                            onChange={(e) => setData('points_win', parseInt(e.target.value))}
                                            className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-center font-bold text-emerald-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Seri</label>
                                        <input
                                            type="number"
                                            value={data.points_draw}
                                            onChange={(e) => setData('points_draw', parseInt(e.target.value))}
                                            className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-center font-bold text-amber-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-bold mb-1">Kalah</label>
                                        <input
                                            type="number"
                                            value={data.points_loss}
                                            onChange={(e) => setData('points_loss', parseInt(e.target.value))}
                                            className="w-full p-1.5 bg-white border border-gray-200 rounded-lg text-center font-bold text-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                            >
                                {editingComp ? 'Perbarui Turnamen' : '+ Buat Turnamen Baru'}
                            </button>
                            {editingComp && (
                                <button
                                    type="button"
                                    onClick={() => { reset(); setEditingComp(null); }}
                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right 2 Columns: Competitions List */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Turnamen Futsal</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Nama Turnamen</th>
                                    <th className="py-3 px-3 text-center">Sistem</th>
                                    <th className="py-3 px-3 text-center">Waktu Match</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {competitions?.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            <div>
                                                <span>{c.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium block">Season {c.season}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-brand-50 text-brand-600">
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-gray-700">
                                            {c.match_duration_minutes || 40}' ({c.half_duration_minutes || 20}' x 2)
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {c.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                                    ● AKTIFF
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetActive(c.id)}
                                                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-500 transition-colors"
                                                >
                                                    Aktifkan
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
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
