import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm, router } from '@inertiajs/react';
import { Trophy, Plus, Trash2, Edit2, CheckCircle2, Clock, Users, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCompetitions({ competitions, allTeams }) {
    const [editingComp, setEditingComp] = useState(null);
    const [teamModalComp, setTeamModalComp] = useState(null);
    const [selectedTeamIds, setSelectedTeamIds] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        season: '2026',
        type: 'league',
        match_duration_minutes: 40,
        half_duration_minutes: 20,
        half_time_duration_minutes: 5,
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        start_date: '',
        end_date: '',
        is_active: false,
        show_draft_bubble: true,
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
            half_time_duration_minutes: c.half_time_duration_minutes || 5,
            points_win: c.points_win || 3,
            points_draw: c.points_draw || 1,
            points_loss: c.points_loss || 0,
            start_date: c.start_date || '',
            end_date: c.end_date || '',
            is_active: c.is_active || false,
            show_draft_bubble: c.show_draft_bubble !== undefined ? Boolean(c.show_draft_bubble) : true,
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

    const handleDelete = (comp) => {
        setDeleteModal({ isOpen: true, id: comp.id, name: comp.name });
    };

    const confirmDeleteComp = () => {
        if (!deleteModal.id) return;
        destroy(`/admin/competitions/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' })
        });
    };

    const handleToggleDraftBubble = (comp) => {
        router.post(`/admin/competitions/${comp.id}/toggle-draft-bubble`, {
            show_draft_bubble: comp.show_draft_bubble !== false ? false : true
        });
    };

    // Preset Durasi Selector
    const applyDurationPreset = (halfMin, htMin) => {
        setData((prev) => ({
            ...prev,
            half_duration_minutes: halfMin,
            match_duration_minutes: halfMin * 2,
            half_time_duration_minutes: htMin,
        }));
    };

    return (
        <AdminLayout title="Pengaturan Turnamen Futsal">
            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Turnamen & Kompetisi</h2>
                        <p className="text-xs text-gray-500">Kelola turnamen futsal, sistem pertandingan, durasi babak, dan visibilitas publik.</p>
                    </div>
                </div>

                {/* Main Grid: Form (Left 1 Col) & List (Right 2 Cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left Form: Create / Edit Competition */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm sticky top-6">
                        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
                            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {editingComp ? 'Edit Turnamen' : 'Tambah Turnamen Baru'}
                                </h3>
                                <p className="text-[11px] text-gray-400">Atur parameter dan format pertandingan.</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-3.5">
                            <div>
                                <label className="block font-bold text-gray-700 text-xs mb-1">Nama Turnamen</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: RS LIVASYA CUP 2026"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                                    required
                                />
                                {errors.name && <span className="text-red-500 text-[10px]">{errors.name}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 text-xs mb-1">Musim / Tahun</label>
                                    <input
                                        type="text"
                                        value={data.season}
                                        onChange={(e) => setData('season', e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 text-xs mb-1">Sistem Kompetisi</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white cursor-pointer"
                                    >
                                        <option value="league">Liga (Klasemen)</option>
                                        <option value="knockout">Sistem Gugur</option>
                                        <option value="group">Fase Grup + Gugur</option>
                                    </select>
                                </div>
                            </div>

                            {/* Public Draft Bubble Checkbox */}
                            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 flex items-center justify-between">
                                <div className="pr-2">
                                    <label className="block font-black text-gray-800 text-xs">
                                        🎲 Tampilkan Bubble Tim di Publik
                                    </label>
                                    <span className="text-[10px] text-gray-500 block">
                                        Pengunjung dapat melihat bagan & hasil undian tim secara realtime.
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={data.show_draft_bubble}
                                    onChange={(e) => setData('show_draft_bubble', e.target.checked)}
                                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                                />
                            </div>

                            {/* Durasi Pertandingan Presets */}
                            <div className="p-3 bg-brand-50/40 rounded-xl border border-brand-100 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                                        <span>Pengaturan Waktu Pertandingan</span>
                                    </span>
                                    <span className="text-[10px] text-brand-600 font-bold bg-brand-100/70 px-2 py-0.5 rounded-full">
                                        Standar Futsal
                                    </span>
                                </div>

                                {/* Preset Buttons */}
                                <div>
                                    <span className="text-[10px] text-gray-400 font-semibold block mb-1">Pilihan Cepat (Preset):</span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[
                                            { label: "10' (5x2)", half: 5, ht: 3 },
                                            { label: "20' (10x2)", half: 10, ht: 3 },
                                            { label: "30' (15x2)", half: 15, ht: 5 },
                                            { label: "40' (20x2)", half: 20, ht: 5 },
                                        ].map((p, idx) => {
                                            const isMatch = data.half_duration_minutes === p.half && data.half_time_duration_minutes === p.ht;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => applyDurationPreset(p.half, p.ht)}
                                                    className={`py-1.5 px-1 rounded-xl text-[10px] font-black border text-center transition-all ${
                                                        isMatch
                                                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-brand-50'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Detailed Inputs */}
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {/* Durasi Per Babak */}
                                    <div>
                                        <label className="block font-bold text-gray-700 text-[10px] mb-1">Per Babak</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={5}
                                                max={90}
                                                value={data.half_duration_minutes}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 5;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        half_duration_minutes: val,
                                                        match_duration_minutes: val * 2
                                                    }));
                                                }}
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl font-black text-center text-gray-900 text-xs focus:ring-2 focus:ring-brand-500"
                                                required
                                            />
                                            <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">mnt</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {[5, 10, 15, 20, 25, 30].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setData(prev => ({ ...prev, half_duration_minutes: m, match_duration_minutes: m * 2 }))}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${data.half_duration_minutes === m ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                                                >
                                                    {m}'
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Durasi */}
                                    <div>
                                        <label className="block font-bold text-gray-700 text-[10px] mb-1">Total Main</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={5}
                                                max={180}
                                                value={data.match_duration_minutes}
                                                onChange={(e) => setData('match_duration_minutes', parseInt(e.target.value) || 10)}
                                                className="w-full p-2 bg-gray-100 border border-gray-200 rounded-xl font-black text-center text-gray-700 text-xs cursor-not-allowed"
                                                readOnly
                                            />
                                            <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">mnt</span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 block mt-1 text-center font-medium">Otomatis (2x Babak)</span>
                                    </div>

                                    {/* Jeda Istirahat (Half Time) */}
                                    <div>
                                        <label className="block font-bold text-gray-700 text-[10px] mb-1">Jeda HT</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={1}
                                                max={60}
                                                value={data.half_time_duration_minutes}
                                                onChange={(e) => setData('half_time_duration_minutes', parseInt(e.target.value) || 5)}
                                                className="w-full p-2 bg-white border border-gray-200 rounded-xl font-black text-center text-gray-900 text-xs focus:ring-2 focus:ring-brand-500"
                                                required
                                            />
                                            <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">mnt</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {[5, 10, 15, 20].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setData('half_time_duration_minutes', m)}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${data.half_time_duration_minutes === m ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                                                >
                                                    {m}'
                                                </button>
                                            ))}
                                        </div>
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
                                                ⏱️ {c.match_duration_minutes || 40}' ({c.half_duration_minutes || 20}'x2 • HT {c.half_time_duration_minutes || 5}')
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
                                            onClick={() => handleDelete(c)}
                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
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
                                                <div>
                                                    <span className="font-black text-gray-900">{c.match_duration_minutes || 40}'</span>
                                                    <span className="text-[10px] text-gray-400 block font-medium">({c.half_duration_minutes || 20}'x2 • HT {c.half_time_duration_minutes || 5}')</span>
                                                </div>
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
                                                    onClick={() => handleDelete(c)}
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

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Turnamen / Kompetisi"
                message={`Apakah Anda yakin ingin menghapus turnamen "${deleteModal.name}"? Semua data jadwal pertandingan, klasemen, dan statistik terkait turnamen ini akan ikut terhapus.`}
                confirmText="Ya, Hapus Turnamen"
                onConfirm={confirmDeleteComp}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
            />
        </AdminLayout>
    );
}
