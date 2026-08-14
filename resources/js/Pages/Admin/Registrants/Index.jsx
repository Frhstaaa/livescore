import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Shuffle, Users, CheckCircle, Clock, Plus, Trash2, Filter,
    Sparkles, UserCheck, Shield, Award, Phone, ArrowRight,
    Play, FastForward, RotateCcw, Trophy, Check, Zap, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAM_THEMES = [
    { name: 'Tim Garuda', short: 'GAR', color: 'from-red-500 to-rose-600', border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    { name: 'Tim Elang', short: 'ELG', color: 'from-blue-500 to-cyan-600', border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    { name: 'Tim Rajawali', short: 'RJW', color: 'from-emerald-500 to-teal-600', border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    { name: 'Tim Harimau', short: 'HRM', color: 'from-amber-500 to-orange-600', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    { name: 'Tim Singa', short: 'SNG', color: 'from-purple-500 to-indigo-600', border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    { name: 'Tim Badak', short: 'BDK', color: 'from-zinc-600 to-slate-700', border: 'border-zinc-300', bg: 'bg-zinc-50', text: 'text-zinc-700', badge: 'bg-zinc-100 text-zinc-800' },
];

export default function Index({ registrants = [], competitions = [], teams = [], filters = {} }) {
    const { flash } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [assigningId, setAssigningId] = useState(null);
    const [selectedTeamToAssign, setSelectedTeamToAssign] = useState('');

    // ROULETTE / DRAFT STATE
    const [showRouletteModal, setShowRouletteModal] = useState(false);
    const [rouletteStage, setRouletteStage] = useState('setup'); // 'setup' | 'spinning' | 'finished'
    const [teamCount, setTeamCount] = useState(2);
    const [customTeamNames, setCustomTeamNames] = useState(['', '', '', '']);
    const [draftQueue, setDraftQueue] = useState([]);
    const [draftedTeams, setDraftedTeams] = useState([]);
    const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteActiveTeamIndex, setRouletteActiveTeamIndex] = useState(0);
    const [autoSpin, setAutoSpin] = useState(false);
    const [lastDraftedPlayer, setLastDraftedPlayer] = useState(null);

    const spinTimerRef = useRef(null);
    const autoSpinTimeoutRef = useRef(null);

    const selectedCompId = filters.competition_id || (competitions.length > 0 ? competitions[0].id : '');

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
        setCreateData('competition_id', compId);
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

    // ==========================================
    // ROULETTE LOGIC & ANIMATION CONTROLS
    // ==========================================
    const openRoulette = () => {
        const pool = pendingRegistrants.length >= 2 ? pendingRegistrants : registrants;
        if (pool.length < 2) return;
        
        // Shuffle initial pool order
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setDraftQueue(shuffled);
        setCurrentDraftIndex(0);
        setRouletteStage('setup');
        setAutoSpin(false);
        setLastDraftedPlayer(null);

        // Prepare Initial Team Buckets
        const count = Math.min(Math.max(2, teamCount), pool.length);
        const initialTeams = Array.from({ length: count }, (_, idx) => {
            const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
            return {
                id: idx,
                name: customTeamNames[idx] || theme.name,
                short_name: theme.short,
                theme: theme,
                players: [],
            };
        });
        setDraftedTeams(initialTeams);
        setShowRouletteModal(true);
    };

    const startRouletteDraft = () => {
        // Initialize teams based on selected teamCount
        const count = Math.min(Math.max(2, teamCount), draftQueue.length);
        const initialTeams = Array.from({ length: count }, (_, idx) => {
            const theme = TEAM_THEMES[idx % TEAM_THEMES.length];
            return {
                id: idx,
                name: customTeamNames[idx] || theme.name,
                short_name: theme.short,
                theme: theme,
                players: [],
            };
        });
        setDraftedTeams(initialTeams);
        setCurrentDraftIndex(0);
        setRouletteStage('spinning');
        setLastDraftedPlayer(null);
    };

    // Single step spin for current player
    const executeSpin = (queueIdx, currentTeams, isAuto = false) => {
        if (queueIdx >= draftQueue.length || isSpinning) return;

        setIsSpinning(true);
        const player = draftQueue[queueIdx];
        const numTeams = currentTeams.length;

        // Balanced team selection (find teams with fewest players)
        const minPlayers = Math.min(...currentTeams.map(t => t.players.length));
        const eligibleTeams = currentTeams
            .map((t, idx) => ({ idx, count: t.players.length }))
            .filter(t => t.count === minPlayers)
            .map(t => t.idx);
        
        const targetTeamIndex = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];

        // Rapid roulette animation cycle
        let currentStep = 0;
        const totalSteps = 16 + (targetTeamIndex % numTeams);
        let speed = 50;

        const animateCycle = () => {
            currentStep++;
            setRouletteActiveTeamIndex((prev) => (prev + 1) % numTeams);

            if (currentStep < totalSteps) {
                speed += 12; // Deceleration
                spinTimerRef.current = setTimeout(animateCycle, speed);
            } else {
                // Landed on target team!
                setRouletteActiveTeamIndex(targetTeamIndex);
                setIsSpinning(false);

                // Add player to team
                const updatedTeams = currentTeams.map((t, idx) => {
                    if (idx === targetTeamIndex) {
                        return { ...t, players: [...t.players, player] };
                    }
                    return t;
                });

                setDraftedTeams(updatedTeams);
                setLastDraftedPlayer({ player, team: updatedTeams[targetTeamIndex] });

                const nextIdx = queueIdx + 1;
                setCurrentDraftIndex(nextIdx);

                if (nextIdx >= draftQueue.length) {
                    // Draft Finished!
                    setRouletteStage('finished');
                    setAutoSpin(false);
                } else if (isAuto) {
                    autoSpinTimeoutRef.current = setTimeout(() => {
                        executeSpin(nextIdx, updatedTeams, true);
                    }, 800);
                }
            }
        };

        animateCycle();
    };

    const handleNextSpin = () => {
        executeSpin(currentDraftIndex, draftedTeams, false);
    };

    const toggleAutoSpin = () => {
        if (autoSpin) {
            setAutoSpin(false);
            if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
        } else {
            setAutoSpin(true);
            executeSpin(currentDraftIndex, draftedTeams, true);
        }
    };

    const handleInstantFinish = () => {
        if (isSpinning) return;
        if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
        if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);

        let teamsCopy = draftedTeams.map(t => ({ ...t, players: [...t.players] }));
        for (let i = currentDraftIndex; i < draftQueue.length; i++) {
            const player = draftQueue[i];
            const minPlayers = Math.min(...teamsCopy.map(t => t.players.length));
            const eligible = teamsCopy.map((t, idx) => ({ idx, count: t.players.length })).filter(t => t.count === minPlayers);
            const chosen = eligible[Math.floor(Math.random() * eligible.length)].idx;
            teamsCopy[chosen].players.push(player);
        }

        setDraftedTeams(teamsCopy);
        setCurrentDraftIndex(draftQueue.length);
        setRouletteStage('finished');
        setAutoSpin(false);
    };

    const saveRouletteResult = () => {
        const payload = draftedTeams.map(t => ({
            name: t.name,
            short_name: t.short_name,
            registrant_ids: t.players.map(p => p.id),
        }));

        router.post('/admin/registrants/randomize', {
            competition_id: selectedCompId,
            custom_teams: payload,
        }, {
            onSuccess: () => {
                setShowRouletteModal(false);
            }
        });
    };

    useEffect(() => {
        return () => {
            if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
            if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
        };
    }, []);

    const currentPlayer = draftQueue[currentDraftIndex];

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

                    {/* Interactive Roulette Draft Button */}
                    <button
                        type="button"
                        onClick={openRoulette}
                        disabled={registrants.length < 2}
                        className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-amber-500 to-orange-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 animate-pulse"
                    >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        🎰 Putar Roulette Pembagian Tim ({pendingCount > 0 ? pendingCount : registrants.length})
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

            {/* ======================================================== */}
            {/* 🎰 FULL INTERACTIVE ROULETTE DRAFT LOTTERY MODAL */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showRouletteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white border border-gray-100 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
                        >
                            {/* Modal Header */}
                            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between border-b border-slate-700/50">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                                        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                                            ROULETTE DRAFT PEMBAGIAN TIM
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full">
                                                Interactive
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                                            Undian acak pemain ke dalam tim secara transparan dan visual.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRouletteModal(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1 bg-[#F8F9FD] space-y-6">

                                {/* STAGE 1: SETUP */}
                                {rouletteStage === 'setup' && (
                                    <div className="space-y-6 max-w-xl mx-auto py-2">
                                        <div className="text-center space-y-1">
                                            <span className="text-4xl">🎲</span>
                                            <h4 className="text-lg font-black text-gray-900">Persiapan Undian Tim</h4>
                                            <p className="text-xs text-gray-500">
                                                Tentukan jumlah tim yang akan dibentuk untuk menampung <strong>{draftQueue.length} pemain</strong>.
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                                                    Pilih Jumlah Tim:
                                                </label>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {[2, 3, 4, 5, 6].map(num => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setTeamCount(num)}
                                                            className={`py-2.5 rounded-xl font-black text-sm border transition-all ${
                                                                teamCount === num
                                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-105'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {num} Tim
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex justify-between items-center">
                                                <span>Pemain per Tim:</span>
                                                <span className="font-black text-sm">
                                                    ±{Math.floor(draftQueue.length / teamCount)} - {Math.ceil(draftQueue.length / teamCount)} Pemain
                                                </span>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <label className="block text-xs font-black uppercase text-gray-700">
                                                    Nama Tim (Opsional):
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Array.from({ length: teamCount }).map((_, idx) => {
                                                        const defaultName = TEAM_THEMES[idx % TEAM_THEMES.length].name;
                                                        return (
                                                            <input
                                                                key={idx}
                                                                type="text"
                                                                placeholder={`Nama Tim ${idx + 1} (${defaultName})`}
                                                                value={customTeamNames[idx] || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...customTeamNames];
                                                                    updated[idx] = e.target.value;
                                                                    setCustomTeamNames(updated);
                                                                }}
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowRouletteModal(false)}
                                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={startRouletteDraft}
                                                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 shadow-md shadow-brand-500/20 flex items-center gap-2 active:scale-95"
                                            >
                                                <Play className="w-4 h-4 fill-white" />
                                                Mulai Roulette Draft
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 2: LIVE SPINNING / DRAFTING */}
                                {rouletteStage === 'spinning' && (
                                    <div className="space-y-6">
                                        {/* Progress Bar & Header */}
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500 pb-1">
                                            <span>
                                                Pemain <strong className="text-brand-600">{currentDraftIndex + 1}</strong> dari <strong>{draftQueue.length}</strong>
                                            </span>
                                            <span>
                                                {Math.round((currentDraftIndex / draftQueue.length) * 100)}% Selesai
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-300 rounded-full"
                                                style={{ width: `${(currentDraftIndex / draftQueue.length) * 100}%` }}
                                            />
                                        </div>

                                        {/* Roulette Center Arena */}
                                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md text-center relative overflow-hidden">
                                            {/* Glow backdrop */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                                            {currentPlayer ? (
                                                <div className="space-y-4 relative z-10">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                                                        Pemain Sedang Diundi
                                                    </span>

                                                    {/* Player Card */}
                                                    <motion.div
                                                        key={currentPlayer.id}
                                                        initial={{ scale: 0.85, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-4 rounded-2xl border-2 border-brand-500/40 shadow-md"
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                                                            {currentPlayer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="text-base font-black text-gray-900">{currentPlayer.name}</h4>
                                                            <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                                <span>Posisi:</span>
                                                                <span className="font-bold text-brand-600">
                                                                    {positionBadges[currentPlayer.position]?.icon} {currentPlayer.position}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </motion.div>

                                                    {/* Spinning Team Roulette Carousel */}
                                                    <div className="pt-3">
                                                        <span className="text-[11px] font-bold text-gray-400 block mb-2">
                                                            Memilih Tim Tujuan:
                                                        </span>
                                                        <div className="flex items-center justify-center gap-2.5 flex-wrap">
                                                            {draftedTeams.map((t, idx) => {
                                                                const isActive = rouletteActiveTeamIndex === idx;
                                                                return (
                                                                    <motion.div
                                                                        key={t.id}
                                                                        animate={{
                                                                            scale: isActive ? 1.12 : 0.95,
                                                                            y: isActive ? -4 : 0,
                                                                        }}
                                                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                                        className={`px-4 py-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center space-x-2 ${
                                                                            isActive
                                                                                ? `bg-gradient-to-r ${t.theme.color} text-white border-white shadow-xl ring-4 ring-brand-500/30`
                                                                                : `${t.theme.bg} ${t.theme.text} ${t.theme.border} opacity-50`
                                                                        }`}
                                                                    >
                                                                        <Trophy className="w-4 h-4" />
                                                                        <span>{t.name}</span>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Last Draft Result Banner */}
                                                    {lastDraftedPlayer && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 6 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-4 rounded-xl inline-flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                            <span>
                                                                <strong>{lastDraftedPlayer.player.name}</strong> resmi masuk ke <strong>{lastDraftedPlayer.team.name}</strong>!
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Action Control Buttons */}
                                            <div className="flex items-center justify-center gap-3 pt-6 relative z-10 border-t border-gray-100 mt-5">
                                                <button
                                                    type="button"
                                                    onClick={handleNextSpin}
                                                    disabled={isSpinning || currentDraftIndex >= draftQueue.length}
                                                    className="px-6 py-3 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                                >
                                                    <Play className="w-4 h-4 fill-white" />
                                                    {isSpinning ? 'Sedang Memutar...' : 'Putar Pemain Ini'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={toggleAutoSpin}
                                                    className={`px-5 py-3 rounded-2xl text-xs font-black border flex items-center gap-2 transition-all ${
                                                        autoSpin
                                                            ? 'bg-amber-500 text-white border-amber-500 animate-pulse'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <FastForward className="w-4 h-4" />
                                                    {autoSpin ? 'Hentikan Auto-Spin' : '⚡ Auto-Spin Cepat'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleInstantFinish}
                                                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-bold"
                                                >
                                                    Selesaikan Instan ⏩
                                                </button>
                                            </div>
                                        </div>

                                        {/* Real-time Team Buckets Display */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-black uppercase tracking-wider text-gray-500">
                                                Hasil Pembagian Tim Sementara:
                                            </h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {draftedTeams.map((t) => (
                                                    <div
                                                        key={t.id}
                                                        className={`bg-white rounded-2xl p-3.5 border ${t.theme.border} shadow-sm space-y-2.5`}
                                                    >
                                                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                            <div className="flex items-center space-x-2">
                                                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${t.theme.color}`} />
                                                                <h6 className="text-xs font-black text-gray-900">{t.name}</h6>
                                                            </div>
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.theme.badge}`}>
                                                                {t.players.length} Pemain
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                                            {t.players.length > 0 ? (
                                                                t.players.map((p, pIdx) => (
                                                                    <div
                                                                        key={p.id || pIdx}
                                                                        className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-800"
                                                                    >
                                                                        <span className="truncate">{p.name}</span>
                                                                        <span className="text-[9px] font-black text-gray-500 uppercase shrink-0">
                                                                            {p.position}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 italic block py-2 text-center">
                                                                    Menunggu pemain...
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 3: FINISHED & CONFIRMATION */}
                                {rouletteStage === 'finished' && (
                                    <div className="space-y-6">
                                        <div className="text-center space-y-1.5">
                                            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                                                <Trophy className="w-8 h-8 text-emerald-600 animate-bounce" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900">
                                                🎉 Roulette Draft Selesai!
                                            </h4>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Seluruh <strong>{draftQueue.length} pemain</strong> telah berhasil diundi ke dalam <strong>{draftedTeams.length} tim</strong>.
                                            </p>
                                        </div>

                                        {/* Final Roster Display Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                            {draftedTeams.map((t) => (
                                                <div
                                                    key={t.id}
                                                    className={`bg-white rounded-3xl p-4 border-2 ${t.theme.border} shadow-md space-y-3`}
                                                >
                                                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                                                        <div className="flex items-center space-x-2.5">
                                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${t.theme.color} text-white flex items-center justify-center font-black text-xs shadow-sm`}>
                                                                {t.short_name}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-black text-gray-900">{t.name}</h5>
                                                                <span className="text-[10px] text-gray-400 font-semibold">
                                                                    Skuad Resmi
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${t.theme.badge}`}>
                                                            {t.players.length} Pemain
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                        {t.players.map((p, pIdx) => (
                                                            <div
                                                                key={p.id || pIdx}
                                                                className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs font-bold text-gray-800"
                                                            >
                                                                <div className="flex items-center space-x-2 min-w-0 pr-1">
                                                                    <span className="text-[10px] text-gray-400 font-bold">#{pIdx + 1}</span>
                                                                    <span className="truncate">{p.name}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white text-gray-700 border border-gray-200 uppercase shrink-0">
                                                                    {p.position}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Final Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={openRoulette}
                                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-1.5"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Putar Ulang (Re-Roll)
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRouletteModal(false)}
                                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50"
                                                >
                                                    Tutup
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={saveRouletteResult}
                                                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Simpan Hasil Undian ke Database
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Tambah Pendaftar Manual */}
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
