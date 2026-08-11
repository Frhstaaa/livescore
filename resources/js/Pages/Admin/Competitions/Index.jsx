import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { Trophy, Plus, Trash2, Edit2, CheckCircle2, Clock, Users, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCompetitions({ competitions, allTeams }) {
    const [editingComp, setEditingComp] = useState(null);
    const [teamModalComp, setTeamModalComp] = useState(null);
    const [selectedTeamIds, setSelectedTeamIds] = useState([]);

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

    const handleOpenTeamModal = (c) => {
        setTeamModalComp(c);
        const currentIds = c.standings ? c.standings.map(s => s.team_id) : [];
        setSelectedTeamIds(currentIds);
    };

    const toggleTeamSelection = (teamId) => {
        if (selectedTeamIds.includes(teamId)) {
            setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
        } else {
            setSelectedTeamIds([...selectedTeamIds, teamId]);
        }
    };

    const handleSaveTeams = () => {
        if (!teamModalComp) return;
        router.post(`/admin/competitions/${teamModalComp.id}/sync-teams`, {
            team_ids: selectedTeamIds
        }, {
            onSuccess: () => setTeamModalComp(null)
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
        <AdminLayout title="Pengaturan Turnamen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Create / Edit Competition */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 truncate"
                                >
                                    <option value="league">🏆 League (Klasemen)</option>
                                    <option value="knockout">🥊 Cup (Gugur)</option>
                                    <option value="group">🧩 Group Stage</option>
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
                                    <label className="block font-semibold text-gray-600 text-[10px] mb-1">Total Durasi</label>
                                    <input
                                        type="number"
                                        value={data.match_duration_minutes}
                                        onChange={(e) => setData('match_duration_minutes', parseInt(e.target.value))}
                                        className="w-full p-2 bg-white border border-gray-200 rounded-lg font-black text-center text-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-600 text-[10px] mb-1">Menit/Babak</label>
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
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Turnamen Futsal</h3>

                    {/* Mobile Cards (Visible < md) */}
                    <div className="block md:hidden space-y-3">
                        {competitions?.map((c) => {
                            const participantCount = c.standings?.length || 0;
                            return (
                                <div key={c.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-black text-sm text-gray-900 leading-tight">{c.name}</h4>
                                            <span className="text-[10px] font-bold text-gray-400">Season {c.season}</span>
                                        </div>
                                        {c.is_active ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 shrink-0">
                                                ● AKTIFF
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSetActive(c.id)}
                                                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-gray-200 hover:bg-emerald-50 text-gray-600 shrink-0"
                                            >
                                                Aktifkan
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-50 text-brand-600">
                                                {c.type}
                                            </span>
                                            <span className="font-bold text-gray-700 text-[11px]">
                                                ⏱️ {c.match_duration_minutes || 40}' ({c.half_duration_minutes || 20}'x2)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleOpenTeamModal(c)}
                                            className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1"
                                        >
                                            <Users className="w-3 h-3" />
                                            <span>{participantCount} Tim</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200/60">
                                        <button
                                            onClick={() => handleOpenTeamModal(c)}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            <span>Kelola Tim</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="px-3 py-1.5 bg-brand-50 text-brand-600 font-bold rounded-xl text-xs flex items-center space-x-1"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table (Visible >= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Nama Turnamen</th>
                                    <th className="py-3 px-3 text-center">Tim Peserta</th>
                                    <th className="py-3 px-3 text-center">Sistem</th>
                                    <th className="py-3 px-3 text-center">Waktu Match</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {competitions?.map((c) => {
                                    const participantCount = c.standings?.length || 0;
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 font-bold text-gray-900">
                                                <div>
                                                    <span>{c.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium block">Season {c.season}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => handleOpenTeamModal(c)}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors space-x-1"
                                                    title="Atur Tim Peserta Turnamen Ini"
                                                >
                                                    <Users className="w-3 h-3" />
                                                    <span>{participantCount} Tim</span>
                                                </button>
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
                                            <td className="py-3 px-4 text-right space-x-1">
                                                <button
                                                    onClick={() => handleOpenTeamModal(c)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Kelola Tim Peserta"
                                                >
                                                    <Users className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(c)}
                                                    className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                                    title="Edit Turnamen"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Turnamen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* MODAL KELOLA TIM PESERTA TURNAMEN */}
            <AnimatePresence>
                {teamModalComp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 flex items-center">
                                        <Users className="w-5 h-5 text-brand-500 mr-2" />
                                        Kelola Tim Peserta Turnamen
                                    </h3>
                                    <p className="text-xs font-bold text-gray-500">{teamModalComp.name}</p>
                                </div>
                                <button
                                    onClick={() => setTeamModalComp(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-center bg-brand-50 p-3 rounded-2xl border border-brand-100 mb-3 text-xs font-bold text-brand-700">
                                <span>Pilih tim yang akan berlaga:</span>
                                <span className="bg-brand-500 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black">
                                    {selectedTeamIds.length} / {allTeams?.length || 0} Terpilih
                                </span>
                            </div>

                            {/* Checkbox Grid list of teams */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar my-2">
                                {allTeams?.map((t) => {
                                    const isSelected = selectedTeamIds.includes(t.id);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => toggleTeamSelection(t.id)}
                                            className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-brand-50/40 border-brand-500 shadow-sm'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                                                    {t.logo_url ? (
                                                        <img src={t.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        t.short_name
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900">{t.name}</h4>
                                                    <span className="text-[10px] text-gray-400 font-medium">{t.coach_name || 'Coach'}</span>
                                                </div>
                                            </div>

                                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                                isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 bg-white'
                                            }`}>
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex space-x-2 pt-3 border-t border-gray-100">
                                <button
                                    onClick={handleSaveTeams}
                                    className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
                                >
                                    Simpan Tim Peserta
                                </button>
                                <button
                                    onClick={() => setTeamModalComp(null)}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
