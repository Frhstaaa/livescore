import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, RefreshCw, Search, Shield, Trophy, Sparkles, ChevronRight, Check, Play, CheckCircle } from 'lucide-react';

const positionConfig = {
    GK: { label: 'Goalkeeper', icon: '🧤', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    DEF: { label: 'Defender', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
    MID: { label: 'Midfielder', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    FWD: { label: 'Forward', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
};

const TEAM_GRADIENTS = [
    'from-red-600 to-rose-500',
    'from-blue-600 to-cyan-500',
    'from-emerald-600 to-teal-500',
    'from-amber-500 to-yellow-400',
    'from-purple-600 to-indigo-500',
    'from-orange-500 to-amber-500',
];

export default function DraftBubble() {
    const { activeCompetition } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [draftData, setDraftData] = useState({
        success: true,
        is_live: false,
        live_draft: null,
        teams: [],
        total_players: 0,
        competition: null
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('ALL');

    // Only display if activeCompetition has show_draft_bubble enabled
    const isVisible = activeCompetition?.show_draft_bubble !== false;

    const fetchDraftData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await fetch('/api/teams-draft');
            const data = await response.json();
            if (data.success) {
                setDraftData(data);
            }
        } catch (error) {
            console.error('Failed to fetch teams draft data:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Auto-polling every 1.5 seconds when modal is open
    useEffect(() => {
        let interval = null;
        if (isOpen) {
            fetchDraftData();
            interval = setInterval(() => {
                fetchDraftData(true);
            }, 1500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen]);

    if (!isVisible) return null;

    const live = draftData.live_draft;
    const isLiveSpinning = draftData.is_live && live && (live.stage === 'spinning' || live.stage === 'setup');
    const isLiveFinished = draftData.is_live && live && live.stage === 'finished';

    // Teams to display: if live, use live.teams, else use database draftData.teams
    const displayTeams = (draftData.is_live && live?.teams) ? live.teams : (draftData.teams || []);

    // Filter players based on search and position
    const filteredTeams = displayTeams.map((team) => {
        const filteredPlayers = (team.players || []).filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPos = selectedPosition === 'ALL' || p.position === selectedPosition;
            return matchesSearch && matchesPos;
        });

        return {
            ...team,
            filteredPlayers,
        };
    }).filter((team) => {
        return searchQuery ? team.filteredPlayers.length > 0 : true;
    });

    const totalAssignedPlayers = displayTeams.reduce((sum, t) => sum + (t.players?.length || 0), 0);

    return (
        <>
            {/* 🎲 Floating Action Bubble Button */}
            <div className="fixed bottom-20 right-3.5 z-40">
                <motion.button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="group relative flex items-center space-x-2 pl-3 pr-3.5 py-2.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white shadow-xl shadow-brand-500/35 border-2 border-white/80 active:shadow-sm"
                >
                    {/* Glowing pulse ring */}
                    <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 opacity-60 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

                    <div className="relative flex items-center space-x-1.5 font-black text-xs">
                        <span className="text-base animate-bounce" style={{ animationDuration: '2.5s' }}>🎲</span>
                        <span className="tracking-tight drop-shadow-sm">Pembagian Tim</span>
                        {isLiveSpinning ? (
                            <span className="px-1.5 py-0.2 text-[9px] font-black bg-red-500 text-white rounded-full animate-pulse">
                                LIVE
                            </span>
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                        )}
                    </div>
                </motion.button>
            </div>

            {/* 📱 Fullscreen / Bottom Sheet Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-[#F8F9FD] border-t sm:border border-gray-100 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between border-b border-slate-700/50 shrink-0">
                                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
                                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center space-x-1.5 flex-wrap">
                                            <h3 className="text-xs sm:text-sm font-black tracking-tight text-white leading-tight">
                                                ROULETTE DRAFT TIM
                                            </h3>
                                            {isLiveSpinning ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded-full flex items-center gap-1 animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                    LIVE BERLANGSUNG
                                                </span>
                                            ) : isLiveFinished ? (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                                                    DRAFT SELESAI
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-brand-500 text-white rounded-full">
                                                    ROSTER RESMI
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                                            {activeCompetition?.name || 'RS Livasya Futsal Cup'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => fetchDraftData(false)}
                                        disabled={loading}
                                        title="Muat Ulang Data"
                                        className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* ======================================================== */}
                            {/* 🔴 LIVE ROULETTE ARENA (When Admin is actively spinning) */}
                            {/* ======================================================== */}
                            {isLiveSpinning && live && (
                                <div className="p-3 bg-white border-b border-gray-200/80 shadow-xs space-y-3 shrink-0">
                                    {/* Live Progress */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5 text-brand-600 font-black">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                Pemain {(live.current_draft_index || 0) + 1} dari {live.total_players || 0}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-gray-400">
                                                {Math.round(((live.current_draft_index || 0) / (live.total_players || 1)) * 100)}% Selesai
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-300 rounded-full"
                                                style={{ width: `${((live.current_draft_index || 0) / (live.total_players || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Center Player Being Spun */}
                                    {live.current_player && (
                                        <div className="bg-gradient-to-br from-gray-50 via-white to-amber-50/40 p-3 rounded-2xl border border-brand-200/60 shadow-xs text-center space-y-2 relative overflow-hidden">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 inline-block">
                                                🎲 Sedang Diundi Oleh Panitia
                                            </span>

                                            <div className="flex items-center justify-center space-x-2.5">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                                    {live.current_player.name?.charAt(0).toUpperCase() || 'P'}
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <h4 className="text-sm font-black text-gray-900 truncate">
                                                        {live.current_player.name}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                                                        <span>Posisi:</span>
                                                        <span className="font-bold text-brand-600">
                                                            {positionConfig[live.current_player.position]?.icon} {live.current_player.position}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Team Target Candidates Carousel */}
                                            <div className="pt-1 flex items-center justify-center gap-1.5 flex-wrap">
                                                {displayTeams.map((t, idx) => {
                                                    const isActive = live.active_team_index === idx;
                                                    return (
                                                        <div
                                                            key={t.id || idx}
                                                            className={`px-2.5 py-1 rounded-xl border text-[10px] font-black transition-all flex items-center space-x-1 ${
                                                                isActive
                                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-md scale-105 ring-2 ring-brand-400/40'
                                                                    : 'bg-white text-gray-600 border-gray-200 opacity-60'
                                                            }`}
                                                        >
                                                            <Trophy className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{t.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Last Assigned Banner */}
                                            {live.last_drafted && (
                                                <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1 px-3 rounded-xl inline-flex items-center gap-1 max-w-full">
                                                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                                    <span className="truncate">
                                                        <strong>{live.last_drafted.player?.name}</strong> ➔ <strong>{live.last_drafted.team?.name}</strong>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Search & Filter Bar (Only show if not live spinning or if user wants to filter roster) */}
                            <div className="p-3 bg-white border-b border-gray-100 space-y-2 shrink-0">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama pemain di dalam tim..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPosition('ALL')}
                                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 ${
                                            selectedPosition === 'ALL'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white text-gray-600 border border-gray-200'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {Object.entries(positionConfig).map(([pos, conf]) => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setSelectedPosition(pos)}
                                            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 flex items-center space-x-1 ${
                                                selectedPosition === pos
                                                    ? 'bg-brand-500 text-white shadow-xs'
                                                    : 'bg-white text-gray-600 border border-gray-200'
                                            }`}
                                        >
                                            <span>{conf.icon}</span>
                                            <span>{pos}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Content - Teams & Temporary Buckets List */}
                            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                                {loading && displayTeams.length === 0 ? (
                                    <div className="py-12 text-center space-y-2">
                                        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                                        <p className="text-xs font-bold text-gray-500">Menghubungkan ke live roulette panitia...</p>
                                    </div>
                                ) : displayTeams.length === 0 ? (
                                    <div className="py-12 text-center space-y-3 bg-white rounded-3xl p-6 border border-gray-100">
                                        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto text-3xl">
                                            🎲
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-gray-900">
                                                Undian Tim Belum Dimulai
                                            </h4>
                                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                                Panitia akan segera memulai undian roulette pembagian tim. Tampilan ini otomatis terupdate secara realtime.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between px-1">
                                            <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                                                {isLiveSpinning ? 'Hasil Pembagian Tim Sementara:' : 'Daftar Skuad Resmi Tim:'}
                                            </h5>
                                            <span className="text-[10px] font-extrabold text-brand-600">
                                                {displayTeams.length} Tim • {totalAssignedPlayers} Pemain
                                            </span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {filteredTeams.map((team, idx) => {
                                                const gradient = TEAM_GRADIENTS[idx % TEAM_GRADIENTS.length];
                                                const players = team.filteredPlayers || [];

                                                return (
                                                    <div
                                                        key={team.id || idx}
                                                        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
                                                    >
                                                        {/* Team Header Bar */}
                                                        <div className="p-2.5 sm:p-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center space-x-2 min-w-0">
                                                                <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${gradient} shrink-0`} />
                                                                <h4 className="text-xs font-black text-gray-900 truncate">
                                                                    {team.name}
                                                                </h4>
                                                            </div>

                                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200 shrink-0">
                                                                {team.players?.length || 0} Pemain
                                                            </span>
                                                        </div>

                                                        {/* Player List In Team */}
                                                        <div className="p-2 space-y-1 max-h-36 overflow-y-auto">
                                                            {players.length > 0 ? (
                                                                players.map((player, pIdx) => {
                                                                    const pos = positionConfig[player.position] || { icon: '⚽', bg: 'bg-gray-100 text-gray-700' };

                                                                    return (
                                                                        <div
                                                                            key={player.id || pIdx}
                                                                            className="p-1.5 rounded-xl bg-gray-50/80 flex items-center justify-between transition-colors text-xs font-semibold"
                                                                        >
                                                                            <div className="flex items-center space-x-2 min-w-0 pr-2">
                                                                                <span className="text-[10px] font-black text-gray-400 w-3 text-center shrink-0">
                                                                                    #{pIdx + 1}
                                                                                </span>
                                                                                <span className="font-bold text-gray-900 truncate text-[11px]">
                                                                                    {player.name}
                                                                                </span>
                                                                            </div>

                                                                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 border ${pos.bg}`}>
                                                                                {player.position}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="py-2.5 text-center text-[10px] text-gray-400 italic">
                                                                    {searchQuery ? 'Tidak ada pemain yang cocok' : 'Menunggu pemain...'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
                                <span className="font-semibold text-[10px] sm:text-[11px] flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Real-time Live Sync</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
