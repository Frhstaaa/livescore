import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Shield, UploadCloud, Image as ImageIcon, Users, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTeams({ teams }) {
    const [editingTeam, setEditingTeam] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [squadModalTeam, setSquadModalTeam] = useState(null);

    // Form Team
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        short_name: '',
        coach_name: '',
        founded_year: 2020,
        logo_url: '',
        logo_file: null,
    });

    // Form Quick Add Player into Team
    const {
        data: playerData,
        setData: setPlayerData,
        post: postPlayer,
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

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus tim ini?')) {
            destroy(`/admin/teams/${id}`);
        }
    };

    const handleOpenSquadModal = (team) => {
        setSquadModalTeam(team);
        setPlayerData({
            team_id: team.id,
            name: '',
            jersey_number: (team.players?.length || 0) + 1,
            position: 'Flank',
        });
    };

    const handleAddPlayerToSquad = (e) => {
        e.preventDefault();
        postPlayer('/admin/players', {
            onSuccess: () => {
                resetPlayer();
                // Refresh modal state with updated team data
                const updatedTeam = teams.find(t => t.id === squadModalTeam.id);
                if (updatedTeam) {
                    setSquadModalTeam(updatedTeam);
                }
            }
        });
    };

    const handleDeletePlayer = (playerId) => {
        if (confirm('Yakin ingin menghapus pemain ini dari skuad?')) {
            destroy(`/admin/players/${playerId}`, {
                onSuccess: () => {
                    const updatedTeam = teams.find(t => t.id === squadModalTeam.id);
                    if (updatedTeam) {
                        setSquadModalTeam(updatedTeam);
                    }
                }
            });
        }
    };

    return (
        <AdminLayout title="Kelola Tim & Skuad Pemain">
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
                                            <button
                                                onClick={() => handleOpenSquadModal(t)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Kelola Skuad Pemain"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(t)}
                                                className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="Edit Tim"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* MODAL KELOLA SKUAD PEMAIN TIM */}
            <AnimatePresence>
                {squadModalTeam && (
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
                                        {squadModalTeam.logo_url ? (
                                            <img src={squadModalTeam.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            <span className="font-black text-xs text-gray-700">{squadModalTeam.short_name}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 leading-tight">
                                            Kelola Skuad Pemain
                                        </h3>
                                        <p className="text-xs font-bold text-brand-600">{squadModalTeam.name} ({squadModalTeam.players?.length || 0} Pemain)</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSquadModalTeam(null)}
                                    className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quick Add Player Form */}
                            <form onSubmit={handleAddPlayerToSquad} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80 mb-4 text-xs space-y-3">
                                <h4 className="font-black text-gray-700 text-xs flex items-center">
                                    <UserPlus className="w-4 h-4 text-brand-500 mr-1.5" />
                                    + Tambah Pemain Baru ke {squadModalTeam.name}
                                </h4>

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
                                        + Tambah Pemain
                                    </button>
                                </div>
                            </form>

                            {/* Squad Roster Table */}
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                DAFTAR SKUAD RESMI ({squadModalTeam.players?.length || 0})
                            </h4>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
                                {squadModalTeam.players && squadModalTeam.players.length > 0 ? (
                                    squadModalTeam.players.map((player) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-xs"
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

                                            <button
                                                onClick={() => handleDeletePlayer(player.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus Pemain dari Skuad"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
        </AdminLayout>
    );
}
