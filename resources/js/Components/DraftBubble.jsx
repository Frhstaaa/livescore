import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, RefreshCw, Search, Shield, Trophy, Sparkles, ChevronRight, Check, Play, CheckCircle } from 'lucide-react';

const positionConfig = {
    GK: { label: 'Goalkeeper', icon: '🧤', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    Kiper: { label: 'Goalkeeper', icon: '🧤', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    Anchor: { label: 'Anchor', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
    DEF: { label: 'Defender', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
    Flank: { label: 'Flank', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    MID: { label: 'Midfielder', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    Pivot: { label: 'Pivot', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
    FWD: { label: 'Forward', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
};

const positionFilterTabs = [
    { code: 'ALL', label: 'Semua' },
    { code: 'GK', label: 'GK', icon: '🧤', match: ['GK', 'Kiper'] },
    { code: 'DEF', label: 'DEF / Anchor', icon: '🛡️', match: ['DEF', 'Anchor'] },
    { code: 'MID', label: 'MID / Flank', icon: '⚡', match: ['MID', 'Flank'] },
    { code: 'FWD', label: 'FWD / Pivot', icon: '🎯', match: ['FWD', 'Pivot'] },
];

const TEAM_THEMES = [
    {
        name: 'Tim Garuda',
        short: 'GAR',
        bg: 'bg-red-500',
        gradient: 'from-red-600 to-rose-500',
        activeBg: 'bg-gradient-to-r from-red-600 to-rose-500',
        border: 'border-red-500',
        cardBorder: 'border-red-200',
        cardBg: 'bg-red-50/30',
        text: 'text-red-600',
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        ring: 'ring-red-400',
        dot: 'bg-red-500',
        shadow: 'shadow-red-500/40',
    },
    {
        name: 'Tim Elang',
        short: 'ELG',
        bg: 'bg-blue-500',
        gradient: 'from-blue-600 to-cyan-500',
        activeBg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
        border: 'border-blue-500',
        cardBorder: 'border-blue-200',
        cardBg: 'bg-blue-50/30',
        text: 'text-blue-600',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        ring: 'ring-blue-400',
        dot: 'bg-blue-500',
        shadow: 'shadow-blue-500/40',
    },
    {
        name: 'Tim Rajawali',
        short: 'RJW',
        bg: 'bg-emerald-500',
        gradient: 'from-emerald-600 to-teal-500',
        activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
        border: 'border-emerald-500',
        cardBorder: 'border-emerald-200',
        cardBg: 'bg-emerald-50/30',
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        ring: 'ring-emerald-400',
        dot: 'bg-emerald-500',
        shadow: 'shadow-emerald-500/40',
    },
    {
        name: 'Tim Harimau',
        short: 'HRM',
        bg: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        activeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        border: 'border-amber-500',
        cardBorder: 'border-amber-200',
        cardBg: 'bg-amber-50/30',
        text: 'text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        ring: 'ring-amber-400',
        dot: 'bg-amber-500',
        shadow: 'shadow-amber-500/40',
    },
    {
        name: 'Tim Singa',
        short: 'SNG',
        bg: 'bg-purple-500',
        gradient: 'from-purple-600 to-indigo-500',
        activeBg: 'bg-gradient-to-r from-purple-600 to-indigo-500',
        border: 'border-purple-500',
        cardBorder: 'border-purple-200',
        cardBg: 'bg-purple-50/30',
        text: 'text-purple-600',
        badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
        ring: 'ring-purple-400',
        dot: 'bg-purple-500',
        shadow: 'shadow-purple-500/40',
    },
    {
        name: 'Tim Komodo',
        short: 'KMD',
        bg: 'bg-teal-500',
        gradient: 'from-teal-500 to-cyan-600',
        activeBg: 'bg-gradient-to-r from-teal-500 to-cyan-600',
        border: 'border-teal-500',
        cardBorder: 'border-teal-200',
        cardBg: 'bg-teal-50/30',
        text: 'text-teal-600',
        badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
        ring: 'ring-teal-400',
        dot: 'bg-teal-500',
        shadow: 'shadow-teal-500/40',
    },
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

    // Visual animated active index for slot-machine roulette feel
    const [visualActiveTeamIdx, setVisualActiveTeamIdx] = useState(0);
    const [isCycling, setIsCycling] = useState(false);
    const lastPlayerIdRef = useRef(null);

    // Only display if activeCompetition has show_draft_bubble explicitly enabled
    const isVisible = Boolean(
        activeCompetition && 
        (activeCompetition.show_draft_bubble === true || 
         activeCompetition.show_draft_bubble === 1 || 
         activeCompetition.show_draft_bubble === '1' ||
         activeCompetition.show_draft_bubble === 'true')
    );

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

    const live = draftData.live_draft;
    const isLiveSpinning = draftData.is_live && live && (live.stage === 'spinning' || live.stage === 'setup');
    const isLiveFinished = draftData.is_live && live && live.stage === 'finished';

    // Teams to display: if live, use live.teams, else use database draftData.teams
    const displayTeams = (draftData.is_live && live?.teams) ? live.teams : (draftData.teams || []);

    // Interactive spin simulation on new player or spin state change
    useEffect(() => {
        const currentPId = live?.current_player?.id;
        const totalT = displayTeams.length || 1;

        if (isLiveSpinning && currentPId && currentPId !== lastPlayerIdRef.current) {
            lastPlayerIdRef.current = currentPId;
            setIsCycling(true);

            // Run a rapid 1.2s decelerating wheel animation cycle
            let step = 0;
            const target = typeof live.active_team_index === 'number' ? live.active_team_index : 0;
            const totalSteps = 12 + (target % totalT);
            let speed = 55;

            const cycle = () => {
                step++;
                setVisualActiveTeamIdx((prev) => (prev + 1) % totalT);
                if (step < totalSteps) {
                    speed += 12;
                    setTimeout(cycle, speed);
                } else {
                    setVisualActiveTeamIdx(target);
                    setIsCycling(false);
                }
            };

            cycle();
        } else if (live && typeof live.active_team_index === 'number' && !isCycling) {
            setVisualActiveTeamIdx(live.active_team_index);
        }
    }, [live?.current_player?.id, live?.active_team_index, isLiveSpinning, displayTeams.length]);

    if (!isVisible) return null;

    // Filter players based on search and position
    const filteredTeams = displayTeams.map((team, idx) => {
        const theme = team.theme || TEAM_THEMES[idx % TEAM_THEMES.length];
        const filteredPlayers = (team.players || []).filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesPos = true;
            if (selectedPosition !== 'ALL') {
                const tab = positionFilterTabs.find(t => t.code === selectedPosition);
                if (tab && tab.match) {
                    matchesPos = tab.match.includes(p.position);
                } else {
                    matchesPos = p.position === selectedPosition;
                }
            }
            return matchesSearch && matchesPos;
        });

        return {
            ...team,
            theme,
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
                    className="group relative flex items-center space-x-2 pl-3 pr-3.5 py-2.5 rounded-full bg-gradient-to-r from-brand-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-brand-500/35 border-2 border-white/80 active:shadow-sm"
                >
                    {/* Glowing pulse ring */}
                    <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-brand-500 to-amber-400 opacity-60 blur-sm group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

                    <div className="relative flex items-center space-x-1.5 font-black text-xs">
                        <span className="text-base animate-bounce" style={{ animationDuration: '2.5s' }}>🎲</span>
                        <span className="tracking-tight drop-shadow-sm">Pembagian Tim</span>
                        {isLiveSpinning ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-600 text-white rounded-full animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
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
                            {/* 🔴 LIVE INTERACTIVE ROULETTE ARENA (Live Spin UI)        */}
                            {/* ======================================================== */}
                            {isLiveSpinning && live && (
                                <div className="p-3.5 bg-white border-b border-gray-200/80 shadow-xs space-y-3 shrink-0">
                                    {/* Live Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5 text-brand-600 font-black">
                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                                Pemain <strong className="text-gray-900">{(live.current_draft_index || 0) + 1}</strong> dari <strong className="text-gray-900">{live.total_players || 0}</strong>
                                            </span>
                                            <span className="text-[10px] font-extrabold text-gray-500">
                                                {Math.round(((live.current_draft_index || 0) / (live.total_players || 1)) * 100)}% Selesai
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-500 via-amber-400 to-orange-500 transition-all duration-500 rounded-full shadow-xs"
                                                style={{ width: `${((live.current_draft_index || 0) / (live.total_players || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Roulette Center Arena */}
                                    <div className="bg-gradient-to-b from-gray-50/80 via-white to-amber-50/30 p-3.5 rounded-3xl border border-gray-200/70 shadow-xs text-center space-y-3 relative overflow-hidden">
                                        {/* Glowing ray backdrop */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

                                        {/* Status Header Badge */}
                                        <div className="flex items-center justify-center">
                                            <span className="text-[9px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-0.5 rounded-full border border-brand-200 inline-flex items-center gap-1.5 shadow-2xs">
                                                <Sparkles className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                                <span>Sedang Diundi Oleh Panitia</span>
                                            </span>
                                        </div>

                                        {/* Current Player Card with Pop Animation */}
                                        {live.current_player ? (
                                            <div className="flex justify-center">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={live.current_player?.id || live.current_draft_index}
                                                        initial={{ scale: 0.85, y: 10, opacity: 0 }}
                                                        animate={{ scale: 1, y: 0, opacity: 1 }}
                                                        exit={{ scale: 0.85, y: -10, opacity: 0 }}
                                                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                                                        className="inline-flex items-center space-x-3 bg-white p-3 rounded-2xl border-2 border-brand-400/50 shadow-md max-w-full"
                                                    >
                                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-amber-500 to-orange-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-brand-500/25 shrink-0">
                                                            {live.current_player.name?.charAt(0).toUpperCase() || 'P'}
                                                        </div>
                                                        <div className="text-left min-w-0 pr-2">
                                                            <h4 className="text-sm sm:text-base font-black text-gray-900 truncate">
                                                                {live.current_player.name}
                                                            </h4>
                                                            <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                <span>Posisi:</span>
                                                                <span className="font-bold text-brand-600 flex items-center gap-1">
                                                                    {positionConfig[live.current_player.position]?.icon} {live.current_player.position}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <div className="py-2 text-xs font-bold text-gray-400">
                                                Persiapan undian pemain...
                                            </div>
                                        )}

                                        {/* Spinning Roulette Teams Carousel */}
                                        <div className="pt-1">
                                            <span className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wide">
                                                Memilih Tim Tujuan:
                                            </span>
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                                                {displayTeams.map((t, idx) => {
                                                    const theme = t.theme || TEAM_THEMES[idx % TEAM_THEMES.length];
                                                    const isActive = visualActiveTeamIdx === idx;

                                                    return (
                                                        <motion.div
                                                            key={t.id || idx}
                                                            animate={{
                                                                scale: isActive ? 1.08 : 0.95,
                                                                y: isActive ? -2 : 0,
                                                            }}
                                                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border font-black text-[11px] sm:text-xs transition-all flex items-center space-x-1.5 ${
                                                                isActive
                                                                    ? `${theme.activeBg} border-transparent text-white shadow-lg ${theme.shadow} ring-3 ${theme.ring}`
                                                                    : 'bg-white text-gray-700 border-gray-200 opacity-60'
                                                            }`}
                                                        >
                                                            {isActive ? (
                                                                <Sparkles className="w-3 h-3 text-white animate-spin" style={{ animationDuration: '4s' }} />
                                                            ) : (
                                                                <Trophy className="w-3 h-3 text-gray-400" />
                                                            )}
                                                            <span className="truncate">{t.name}</span>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Last Assigned Player Celebration Banner */}
                                        {live.last_drafted && (
                                            <motion.div
                                                initial={{ scale: 0.92, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 py-1.5 px-3.5 rounded-2xl inline-flex items-center gap-1.5 max-w-full shadow-2xs"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="truncate">
                                                    <strong>{live.last_drafted.player?.name}</strong> ➔ <strong>{live.last_drafted.team?.name}</strong>
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Search & Filter Bar */}
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
                                    {positionFilterTabs.map((tab) => (
                                        <button
                                            key={tab.code}
                                            type="button"
                                            onClick={() => setSelectedPosition(tab.code)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 flex items-center space-x-1 ${
                                                selectedPosition === tab.code
                                                    ? 'bg-brand-500 text-white shadow-xs'
                                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {tab.icon && <span>{tab.icon}</span>}
                                            <span>{tab.label}</span>
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
                                                const theme = team.theme || TEAM_THEMES[idx % TEAM_THEMES.length];
                                                const players = team.filteredPlayers || [];

                                                return (
                                                    <div
                                                        key={team.id || idx}
                                                        className={`bg-white rounded-2xl border ${theme.cardBorder || 'border-gray-200'} shadow-xs overflow-hidden`}
                                                    >
                                                        {/* Team Header Bar */}
                                                        <div className={`p-2.5 sm:p-3 ${theme.cardBg || 'bg-gray-50/80'} border-b ${theme.cardBorder || 'border-gray-100'} flex items-center justify-between`}>
                                                            <div className="flex items-center space-x-2 min-w-0">
                                                                <div className={`w-3 h-3 rounded-full ${theme.dot || 'bg-brand-500'} shrink-0`} />
                                                                <h4 className="text-xs font-black text-gray-900 truncate">
                                                                    {team.name}
                                                                </h4>
                                                            </div>

                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${theme.badgeBg || 'bg-white text-gray-700 border border-gray-200'} shrink-0`}>
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
