import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Shield, UploadCloud, Image as ImageIcon, Users, X, UserPlus, CheckCircle2, Printer, Activity, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTeams({ teams, pendingRegistrants = [] }) {
    const [editingTeam, setEditingTeam] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [squadModalTeam, setSquadModalTeam] = useState(null);
    const [editingPlayer, setEditingPlayer] = useState(null);

    // Form Team
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        short_name: '',
        coach_name: '',
        founded_year: 2020,
        logo_url: '',
        logo_file: null,
    });

    // Form Player (Add / Edit)
    const {
        data: playerData,
        setData: setPlayerData,
        post: postPlayer,
        put: putPlayer,
        reset: resetPlayer,
        errors: playerErrors
    } = useForm({
        team_id: '',
        name: '',
        jersey_number: 10,
        position: 'Flank',
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

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: 'team', id: null, name: '' });

    const handleDelete = (team) => {
        setDeleteModal({ isOpen: true, type: 'team', id: team.id, name: team.name });
    };

    const handleOpenSquadModal = (team) => {
        setSquadModalTeam(team);
        setEditingPlayer(null);
        setPlayerData({
            team_id: team.id,
            name: '',
            jersey_number: (team.players?.length || 0) + 1,
            position: 'Flank',
        });
    };

    const handleEditPlayerClick = (player) => {
        setEditingPlayer(player);
        setPlayerData({
            team_id: squadModalTeam.id,
            name: player.name,
            jersey_number: player.jersey_number,
            position: player.position || 'Flank',
        });
    };

    const handleSavePlayer = (e) => {
        e.preventDefault();
        if (editingPlayer) {
            putPlayer(`/admin/players/${editingPlayer.id}`, {
                onSuccess: () => {
                    setEditingPlayer(null);
                    setPlayerData({
                        team_id: squadModalTeam.id,
                        name: '',
                        jersey_number: (squadModalTeam.players?.length || 0) + 1,
                        position: 'Flank',
                    });
                }
            });
        } else {
            postPlayer('/admin/players', {
                onSuccess: () => {
                    setPlayerData({
                        team_id: squadModalTeam.id,
                        name: '',
                        jersey_number: (squadModalTeam.players?.length || 0) + 2,
                        position: 'Flank',
                    });
                }
            });
        }
    };

    const handleDeletePlayer = (player) => {
        setDeleteModal({ isOpen: true, type: 'player', id: player.id, name: player.name });
    };

    const confirmDeleteAction = () => {
        if (!deleteModal.id) return;
        if (deleteModal.type === 'team') {
            destroy(`/admin/teams/${deleteModal.id}`, {
                onSuccess: () => setDeleteModal({ isOpen: false, type: 'team', id: null, name: '' })
            });
        } else {
            router.delete(`/admin/players/${deleteModal.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingPlayer && editingPlayer.id === deleteModal.id) {
                        setEditingPlayer(null);
                    }
                    setDeleteModal({ isOpen: false, type: 'player', id: null, name: '' });
                }
            });
        }
    };

    const currentActiveTeam = squadModalTeam ? (teams.find(t => t.id === squadModalTeam.id) || squadModalTeam) : null;

    return (
        <AdminLayout title="Kelola Tim & Skuad Pemain">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Add / Edit Team */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
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

                {/* Team List Table & Mobile Cards */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Daftar Tim & Logo (.webp)</h3>
                            <p className="text-[10px] text-gray-400">Total {teams?.length || 0} tim terdaftar</p>
                        </div>
                        <a
                            href="/admin/teams/print"
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                            title="Cetak Laporan Lengkap Semua Skuad Tim"
                        >
                            <Printer className="w-3.5 h-3.5 text-amber-400" />
                            <span>🖨️ Cetak Laporan Skuad (PDF)</span>
                        </a>
                    </div>

                    {/* Mobile Cards (Visible < md) */}
                    <div className="block md:hidden space-y-3">
                        {teams?.map((t) => (
                            <div key={t.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 overflow-hidden shadow-sm">
                                            {t.logo_url ? (
                                                <img src={t.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                t.short_name
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-gray-900 leading-tight">{t.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold">KODE: {t.short_name} • Pelatih: {t.coach_name || '-'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleOpenSquadModal(t)}
                                        className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-50 text-brand-600 border border-brand-200"
                                    >
                                        {t.players_count || t.players?.length || 0} Pemain
                                    </button>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200/60 flex-wrap gap-y-1.5">
                                    <a
                                        href={`/players?team_id=${t.id}&tab=squad`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                                        title="Lihat Detail Statistik Skuad"
                                    >
                                        <Activity className="w-3.5 h-3.5 text-brand-600" />
                                        <span>Statistik</span>
                                    </a>
                                    <a
                                        href={`/admin/teams/print?team_id=${t.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center space-x-1"
                                        title="Cetak Skuad Tim Ini"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-700" />
                                        <span>Cetak</span>
                                    </a>
                                    <button
                                        onClick={() => handleOpenSquadModal(t)}
                                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Kelola Skuad</span>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="px-2.5 py-1.5 bg-gray-50 text-gray-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="px-2.5 py-1.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table (Visible >= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Logo & Tim</th>
                                    <th className="py-3 px-4">Pelatih</th>
                                    <th className="py-3 px-4 text-center">Skuad Pemain</th>
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
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => handleOpenSquadModal(t)}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-200 transition-colors space-x-1"
                                                title="Kelola Skuad Pemain Tim Ini"
                                            >
                                                <Users className="w-3 h-3" />
                                                <span>{t.players_count || t.players?.length || 0} Pemain</span>
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-1">
                                            <a
                                                href={`/players?team_id=${t.id}&tab=squad`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-block align-middle"
                                                title="Lihat Detail Statistik Skuad Turnamen"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={`/admin/teams/print?team_id=${t.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors inline-block align-middle"
                                                title="Cetak Laporan Skuad Tim Ini (PDF)"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleOpenSquadModal(t)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block align-middle"
                                                title="Kelola Skuad Pemain"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors inline-block align-middle"
                                                title="Edit Tim"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block align-middle"
                                                title="Hapus Tim"
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

            {/* MODAL KELOLA SKUAD PEMAIN TIM (FULL ADD/EDIT/DELETE) */}
            <AnimatePresence>
                {currentActiveTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {currentActiveTeam.logo_url ? (
                                            <img src={currentActiveTeam.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            <span className="font-black text-xs text-gray-700">{currentActiveTeam.short_name}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 leading-tight">
                                            Kelola Skuad Pemain
                                        </h3>
                                        <p className="text-xs font-bold text-brand-600">{currentActiveTeam.name} ({currentActiveTeam.players?.length || 0} Pemain)</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1.5">
                                    <a
                                        href={`/players?team_id=${currentActiveTeam.id}&tab=squad`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                                        title="Lihat Statistik Skuad Turnamen"
                                    >
                                        <Activity className="w-3.5 h-3.5 text-brand-600" />
                                        <span>Statistik</span>
                                    </a>
                                    <a
                                        href={`/admin/teams/print?team_id=${currentActiveTeam.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors"
                                        title="Cetak Skuad Tim Ini (PDF)"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-700" />
                                        <span>Cetak</span>
                                    </a>
                                    <button
                                        onClick={() => setSquadModalTeam(null)}
                                        className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Quick Import from Pending Registrants */}
                            {pendingRegistrants && pendingRegistrants.length > 0 && !editingPlayer && (
                                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 mb-3 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                                            <span>📥 Ambil dari Pendaftar Belum Masuk Tim:</span>
                                            <span className="px-1.5 py-0.5 text-[9px] bg-amber-200 text-amber-950 font-black rounded-md">
                                                {pendingRegistrants.length} Pemain
                                            </span>
                                        </span>
                                    </div>
                                    <select
                                        className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                        defaultValue=""
                                        onChange={(e) => {
                                            const regId = e.target.value;
                                            const found = pendingRegistrants.find(r => String(r.id) === String(regId));
                                            if (found) {
                                                setPlayerData({
                                                    team_id: currentActiveTeam.id,
                                                    name: found.name,
                                                    jersey_number: (currentActiveTeam.players?.length || 0) + 1,
                                                    position: found.position || 'Flank',
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">-- Pilih Pemain untuk Mengisi Otomatis --</option>
                                        {pendingRegistrants.map((reg) => (
                                            <option key={reg.id} value={reg.id}>
                                                {reg.name} ({reg.position}) {reg.phone ? `• ${reg.phone}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Add / Edit Player Form */}
                            <form onSubmit={handleSavePlayer} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 mb-4 text-xs space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-black text-gray-700 text-xs flex items-center">
                                        <UserPlus className="w-4 h-4 text-brand-500 mr-1.5" />
                                        {editingPlayer ? `Edit Pemain: ${editingPlayer.name}` : `+ Tambah Pemain Baru ke ${currentActiveTeam.name}`}
                                    </h4>
                                    {editingPlayer && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPlayer(null);
                                                setPlayerData({
                                                    team_id: currentActiveTeam.id,
                                                    name: '',
                                                    jersey_number: (currentActiveTeam.players?.length || 0) + 1,
                                                    position: 'Flank',
                                                });
                                            }}
                                            className="text-[10px] font-bold text-red-500 hover:underline"
                                        >
                                            Batal Edit
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Nama Pemain</label>
                                        <input
                                            type="text"
                                            value={playerData.name}
                                            onChange={(e) => setPlayerData('name', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                            placeholder="Ardiansyah Runtuboy"
                                            required
                                        />
                                        {playerErrors.name && <span className="text-red-500 text-[10px] mt-0.5 block">{playerErrors.name}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-1">No. Punggung</label>
                                        <input
                                            type="number"
                                            value={playerData.jersey_number}
                                            onChange={(e) => setPlayerData('jersey_number', parseInt(e.target.value))}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl font-black text-center text-gray-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-600 mb-1">Posisi Bermain</label>
                                        <select
                                            value={playerData.position}
                                            onChange={(e) => setPlayerData('position', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900"
                                        >
                                            <option value="GK">🧤 Goalkeeper (GK)</option>
                                            <option value="Anchor">🛡️ Anchor (Bertahan)</option>
                                            <option value="Flank">⚡ Flank (Sayap)</option>
                                            <option value="Pivot">⚽ Pivot (Penyerang)</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs shrink-0"
                                    >
                                        {editingPlayer ? 'Simpan Perubahan' : '+ Tambah Pemain'}
                                    </button>
                                </div>
                            </form>

                            {/* Squad Roster Table */}
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                DAFTAR SKUAD RESMI ({currentActiveTeam.players?.length || 0})
                            </h4>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
                                {currentActiveTeam.players && currentActiveTeam.players.length > 0 ? (
                                    currentActiveTeam.players.map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-xs hover:border-brand-200 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="w-7 h-7 rounded-lg bg-brand-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                                                    #{player.jersey_number}
                                                </span>
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{player.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{player.position}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleEditPlayerClick(player)}
                                                    className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                                    title="Edit Pemain Ini"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlayer(player)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Pemain dari Skuad"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-6 bg-gray-50 rounded-2xl">
                                        Belum ada pemain di skuad ini. Gunakan form di atas untuk menambah pemain baru.
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => setSquadModalTeam(null)}
                                className="w-full mt-4 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                            >
                                Selesai
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title={deleteModal.type === 'team' ? 'Hapus Tim Futsal' : 'Hapus Pemain dari Skuad'}
                message={deleteModal.type === 'team'
                    ? `Apakah Anda yakin ingin menghapus tim "${deleteModal.name}"? Seluruh pemain di dalam tim ini akan terhapus.`
                    : `Apakah Anda yakin ingin menghapus "${deleteModal.name}" dari skuad tim ini?`
                }
                confirmText={deleteModal.type === 'team' ? 'Ya, Hapus Tim' : 'Ya, Hapus Pemain'}
                onConfirm={confirmDeleteAction}
                onClose={() => setDeleteModal({ isOpen: false, type: 'team', id: null, name: '' })}
            />
        </AdminLayout>
    );
}
