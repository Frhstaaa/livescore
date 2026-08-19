import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, RefreshCw, Search, Shield, Trophy, Sparkles, ChevronRight, Check } from 'lucide-react';

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
    const [draftData, setDraftData] = useState({ teams: [], total_players: 0, competition: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('ALL');
    const [selectedTeamTab, setSelectedTeamTab] = useState('ALL');

    // Only display if activeCompetition has show_draft_bubble enabled
    const isVisible = activeCompetition?.show_draft_bubble !== false;

    const fetchDraftData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/teams-draft');
            const data = await response.json();
            if (data.success) {
                setDraftData(data);
            }
        } catch (error) {
            console.error('Failed to fetch teams draft data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchDraftData();
        }
    }, [isOpen]);

    if (!isVisible) return null;

    // Filter players based on search and position
    const filteredTeams = draftData.teams.map((team) => {
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
        if (selectedTeamTab !== 'ALL' && team.id.toString() !== selectedTeamTab.toString()) {
            return false;
        }
        return searchQuery ? team.filteredPlayers.length > 0 : true;
    });

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
                        <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    </div>
                </motion.button>
            </div>

            {/* 📱 Fullscreen / Bottom Sheet Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white dark:bg-slate-900 border-t sm:border border-gray-100 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between border-b border-slate-700/50 shrink-0">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-md">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                                                Hasil Pembagian Tim
                                            </h3>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-white rounded-full">
                                                Live Roster
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300 font-medium">
                                            {activeCompetition?.name || 'RS Livasya Futsal Cup'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={fetchDraftData}
                                        disabled={loading}
                                        title="Muat Ulang Data"
                                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar & Filters */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 space-y-2 shrink-0">
                                {/* Search input */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama pemain..."
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500"
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

                                {/* Position Filter Pills */}
                                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPosition('ALL')}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${
                                            selectedPosition === 'ALL'
                                                ? 'bg-slate-900 text-white'
                                                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                                        }`}
                                    >
                                        Semua Posisi
                                    </button>
                                    {Object.entries(positionConfig).map(([pos, conf]) => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setSelectedPosition(pos)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 flex items-center space-x-1 ${
                                                selectedPosition === pos
                                                    ? 'bg-brand-500 text-white shadow-sm'
                                                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700'
                                            }`}
                                        >
                                            <span>{conf.icon}</span>
                                            <span>{pos}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Content - Teams & Players List */}
                            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
                                {loading && draftData.teams.length === 0 ? (
                                    <div className="py-12 text-center space-y-2">
                                        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                                        <p className="text-xs font-bold text-gray-500">Memuat data pembagian tim...</p>
                                    </div>
                                ) : draftData.teams.length === 0 ? (
                                    <div className="py-12 text-center space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-500 flex items-center justify-center mx-auto text-2xl">
                                            🎲
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">
                                                Undian Tim Belum Selesai
                                            </h4>
                                            <p className="text-xs text-gray-500 max-w-xs mx-auto">
                                                Panitia sedang mempersiapkan pembagian tim. Silakan periksa kembali beberapa saat lagi.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    filteredTeams.map((team, idx) => {
                                        const gradient = TEAM_GRADIENTS[idx % TEAM_GRADIENTS.length];
                                        const players = team.filteredPlayers || [];

                                        return (
                                            <div
                                                key={team.id}
                                                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden"
                                            >
                                                {/* Team Header Bar */}
                                                <div className="p-3 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-800 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2.5 min-w-0">
                                                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0`}>
                                                            {team.short_name || team.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                                                                {team.name}
                                                            </h4>
                                                            <span className="text-[10px] text-gray-400 font-semibold block">
                                                                {team.coach_name ? `Pelatih: ${team.coach_name}` : 'Skuad Resmi'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shrink-0">
                                                        {players.length} Pemain
                                                    </span>
                                                </div>

                                                {/* Player List */}
                                                <div className="p-2 space-y-1.5">
                                                    {players.length > 0 ? (
                                                        players.map((player, pIdx) => {
                                                            const pos = positionConfig[player.position] || { icon: '⚽', bg: 'bg-gray-100 text-gray-700' };

                                                            return (
                                                                <div
                                                                    key={player.id || pIdx}
                                                                    className="p-2 rounded-xl bg-gray-50/80 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-900 flex items-center justify-between transition-colors text-xs"
                                                                >
                                                                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                                                        <span className="text-[10px] font-black text-gray-400 w-4 text-center shrink-0">
                                                                            #{player.jersey_number || pIdx + 1}
                                                                        </span>
                                                                        <span className="font-bold text-gray-900 dark:text-slate-100 truncate">
                                                                            {player.name}
                                                                        </span>
                                                                    </div>

                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center space-x-1 border ${pos.bg}`}>
                                                                        <span>{pos.icon}</span>
                                                                        <span>{player.position}</span>
                                                                    </span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="py-3 text-center text-xs text-gray-400 italic">
                                                            {searchQuery ? 'Tidak ada pemain yang cocok' : 'Belum ada pemain di tim ini'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 shrink-0">
                                <span className="font-semibold text-[11px]">
                                    Total: <strong>{draftData.total_teams || draftData.teams.length} Tim</strong> (<strong>{draftData.total_players || 0} Pemain</strong>)
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
