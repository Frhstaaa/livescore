import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Shuffle, Users, CheckCircle, Clock, Plus, Trash2, Filter, Sparkles, UserCheck, Shield, Award, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ registrants = [], competitions = [], teams = [], filters = {} }) {
    const { flash } = usePage().props;
    const [showRandomizeModal, setShowRandomizeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const [selectedTeamToAssign, setSelectedTeamToAssign] = useState('');

    const selectedCompId = filters.competition_id || (competitions.length > 0 ? competitions[0].id : '');

    // Form for Randomizing
    const { data: randData, setData: setRandData, post: postRandomize, processing: randProcessing, errors: randErrors } = useForm({
        competition_id: selectedCompId,
        teams_count: 2,
    });

    // Form for Creating Manual Registrant
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        competition_id: selectedCompId,
        name: '',
        phone: '',
        position: 'MID',
    });

    const handleFilterChange = (e) => {
        const compId = e.target.value;
        router.get('/admin/registrants', compId ? { competition_id: compId } : {}, { preserveState: true });
        setRandData('competition_id', compId);
        setCreateData('competition_id', compId);
    };

    const handleRandomize = (e) => {
        e.preventDefault();
        postRandomize('/admin/registrants/randomize', {
            onSuccess: () => setShowRandomizeModal(false),
        });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        postCreate('/admin/registrants', {
            onSuccess: () => {
                resetCreate('name', 'phone');
                setShowCreateModal(false);
            },
        });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus pendaftar "${name}"?`)) {
            router.delete(`/admin/registrants/${id}`);
        }
    };

    const handleToggleStatus = (registrant) => {
        const nextStatus = registrant.status === 'pending' ? 'assigned' : 'pending';
        router.put(`/admin/registrants/${registrant.id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    const handleAssignToTeam = (registrantId) => {
        if (!selectedTeamToAssign) return;
        router.post(`/admin/registrants/${registrantId}/assign`, { team_id: selectedTeamToAssign }, {
            preserveScroll: true,
            onSuccess: () => {
                setAssigningId(null);
                setSelectedTeamToAssign('');
            }
        });
    };

    const pendingRegistrants = registrants.filter(r => r.status === 'pending');
    const assignedRegistrants = registrants.filter(r => r.status === 'assigned');
    const pendingCount = pendingRegistrants.length;
    const assignedCount = assignedRegistrants.length;

    // Position breakdown
    const posCounts = {
        GK: registrants.filter(r => r.position === 'GK').length,
        DEF: registrants.filter(r => r.position === 'DEF').length,
        MID: registrants.filter(r => r.position === 'MID').length,
        FWD: registrants.filter(r => r.position === 'FWD').length,
    };

    const positionBadges = {
        GK: { label: 'Goalkeeper', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: '🧤' },
        DEF: { label: 'Defender', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🛡️' },
        MID: { label: 'Midfielder', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '⚡' },
        FWD: { label: 'Forward', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🎯' },
    };

    return (
        <AdminLayout title="Manajemen Pendaftar Individu">
            <Head title="Manajemen Pendaftar" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Header Title & Actions */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pendaftar Individu</h1>
                    <p className="text-gray-500 text-xs font-medium mt-1">
                        Kelola data pemain yang mendaftar secara individu dan acak pembagian tim secara otomatis.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
                    {/* Add Manual Registrant Button */}
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-brand-500" />
                        Tambah Pendaftar
                    </button>

                    {/* Randomize Button */}
                    <button
                        type="button"
                        onClick={() => setShowRandomizeModal(true)}
                        disabled={pendingCount < 2}
                        className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <Shuffle className="w-4 h-4" />
                        Acak Otomatis ke Tim ({pendingCount})
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Pendaftar</span>
                        <span className="text-2xl font-black text-gray-900 mt-1 block">{registrants.length}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Belum Masuk Tim (Pending)</span>
                        <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Sudah Masuk Tim (Assigned)</span>
                        <span className="text-2xl font-black text-emerald-600 mt-1 block">{assignedCount}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Sebaran Posisi</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">GK: {posCounts.GK}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">DEF: {posCounts.DEF}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">MID: {posCounts.MID}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200">FWD: {posCounts.FWD}</span>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-bold text-gray-700">Pilih Turnamen Futsal:</span>
                </div>
                <select
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white px-4 py-2 outline-none w-full sm:w-80 transition-all cursor-pointer"
                    value={selectedCompId}
                    onChange={handleFilterChange}
                >
                    {competitions.map(comp => (
                        <option key={comp.id} value={comp.id}>
                            🏆 {comp.name} ({comp.season || '2026'})
                        </option>
                    ))}
                </select>
            </div>

            {/* Light Mode Data Table */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="text-[11px] font-black uppercase tracking-wider bg-gray-50/80 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nama Pendaftar</th>
                                <th className="px-6 py-4">No. WhatsApp / HP</th>
                                <th className="px-6 py-4">Posisi</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tanggal Daftar</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {registrants.length > 0 ? (
                                registrants.map((registrant) => {
                                    const badge = positionBadges[registrant.position] || positionBadges.MID;
                                    const isAssigned = registrant.status === 'assigned';

                                    return (
                                        <tr key={registrant.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Name with Avatar */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                                                        {registrant.name ? registrant.name.charAt(0).toUpperCase() : 'P'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block leading-tight">
                                                            {registrant.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-semibold">
                                                            ID: #{registrant.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-6 py-4">
                                                {registrant.phone ? (
                                                    <a
                                                        href={`https://wa.me/${registrant.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        <Phone className="w-3 h-3 text-emerald-500" />
                                                        {registrant.phone}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>

                                            {/* Position */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${badge.bg}`}>
                                                    <span>{badge.icon}</span>
                                                    <span>{registrant.position}</span>
                                                </span>
                                            </td>

                                            {/* Status with clickable toggle */}
                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(registrant)}
                                                    title="Klik untuk mengubah status"
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                                                        isAssigned
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    {isAssigned ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Assigned</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                            <span>Pending</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-gray-500 text-[11px]">
                                                {new Date(registrant.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Quick Assign to Team */}
                                                    {assigningId === registrant.id ? (
                                                        <div className="flex items-center space-x-1">
                                                            <select
                                                                className="bg-white border border-brand-300 rounded-lg text-[11px] font-semibold py-1 px-2 text-gray-800 outline-none"
                                                                value={selectedTeamToAssign}
                                                                onChange={(e) => setSelectedTeamToAssign(e.target.value)}
                                                            >
                                                                <option value="">-- Pilih Tim --</option>
                                                                {teams.map(t => (
                                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAssignToTeam(registrant.id)}
                                                                disabled={!selectedTeamToAssign}
                                                                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                                                            >
                                                                OK
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAssigningId(null)}
                                                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAssigningId(registrant.id)}
                                                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors"
                                                            title="Masukkan ke tim"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(registrant.id, registrant.name)}
                                                        className="p-1.5 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Hapus pendaftar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
                                        <p className="font-bold text-gray-600 text-sm">Belum ada pendaftar di turnamen ini.</p>
                                        <p className="text-xs text-gray-400 mt-1">Pemain yang mendaftar via formulir publik atau admin akan muncul di sini.</p>
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-3 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Tambah Pendaftar Pertama
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal 1: Acak Pendaftar ke Tim (Randomize) */}
            {showRandomizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                                <Shuffle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">Acak Pendaftar ke Tim</h3>
                                <p className="text-gray-500 text-xs font-medium">Pembagian tim otomatis secara merata.</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100 text-xs space-y-1">
                            <div className="flex justify-between font-bold text-gray-700">
                                <span>Pendaftar Tersedia (Pending):</span>
                                <span className="text-brand-600 font-black">{pendingCount} Pemain</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Estimasi Pemain per Tim:</span>
                                <span className="font-bold text-gray-800">
                                    ±{Math.floor(pendingCount / (randData.teams_count || 2))} pemain
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleRandomize} className="space-y-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                                    Jumlah Tim yang Ingin Dibuat
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max={Math.max(2, pendingCount)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                                    value={randData.teams_count}
                                    onChange={e => setRandData('teams_count', e.target.value)}
                                    required
                                />
                                {randErrors.teams_count && (
                                    <p className="mt-1 text-xs text-red-500 font-semibold">{randErrors.teams_count}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRandomizeModal(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={randProcessing}
                                    className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    {randProcessing ? 'Mengacak Tim...' : 'Mulai Acak Sekarang'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal 2: Tambah Pendaftar Manual */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-900">Tambah Pendaftar Baru</h3>
                                <p className="text-gray-500 text-xs font-medium">Input data pemain secara manual.</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-3.5 pt-1">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Turnamen <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                    value={createData.competition_id}
                                    onChange={e => setCreateData('competition_id', e.target.value)}
                                >
                                    {competitions.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Nama Lengkap Pemain <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Tiyas Febrianto"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                    value={createData.name}
                                    onChange={e => setCreateData('name', e.target.value)}
                                    required
                                />
                                {createErrors.name && (
                                    <p className="mt-1 text-xs text-red-500">{createErrors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    No. WhatsApp / HP
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Contoh: 081234567890"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                    value={createData.phone}
                                    onChange={e => setCreateData('phone', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Posisi Bermain <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { code: 'GK', label: '🧤 Goalkeeper' },
                                        { code: 'DEF', label: '🛡️ Defender' },
                                        { code: 'MID', label: '⚡ Midfielder' },
                                        { code: 'FWD', label: '🎯 Forward' },
                                    ].map(pos => (
                                        <button
                                            key={pos.code}
                                            type="button"
                                            onClick={() => setCreateData('position', pos.code)}
                                            className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                                                createData.position === pos.code
                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                                >
                                    {createProcessing ? 'Menyimpan...' : 'Simpan Pendaftar'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
}
