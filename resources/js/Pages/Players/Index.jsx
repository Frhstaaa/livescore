import React, { useState, useRef, useMemo } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import { router } from '@inertiajs/react';
import { 
    Award, Zap, ShieldAlert, Users, ChevronLeft, ChevronRight, 
    User, Search, Trophy, Star, Flame, Shield, Filter, ArrowUpDown, 
    X, CheckCircle2, ChevronDown, ChevronUp, Activity, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayersIndex({ 
    topScorers = [], 
    topAssists = [], 
    topCards = [], 
    competitions = [], 
    selectedCompetitionId, 
    teams = [], 
    selectedTeam = null,
    initialTab = 'scorers'
}) {
    const [statTab, setStatTab] = useState(initialTab || 'scorers'); // 'scorers' | 'assists' | 'cards' | 'squad'
    const [positionFilter, setPositionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('jersey'); // 'jersey' | 'goals' | 'assists' | 'cards' | 'motm'
    const [searchQuery, setSearchQuery] = useState('');
    const [inspectPlayer, setInspectPlayer] = useState(null);
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);

    const teamScrollRef = useRef(null);

    const scrollTeam = (direction) => {
        if (teamScrollRef.current) {
            const amount = direction === 'left' ? -180 : 180;
            teamScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    const positionBadges = {
        GK: { label: 'Goalkeeper', icon: '🧤', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        Kiper: { label: 'Goalkeeper', icon: '🧤', color: 'bg-amber-100 text-amber-800 border-amber-200' },
        Anchor: { label: 'Anchor (DEF)', icon: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        DEF: { label: 'Defender', icon: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        Defender: { label: 'Defender', icon: '🛡️', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        Flank: { label: 'Flank (MID)', icon: '⚡', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        MID: { label: 'Midfielder', icon: '⚡', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        Midfielder: { label: 'Midfielder', icon: '⚡', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
        Pivot: { label: 'Pivot (FWD)', icon: '⚽', color: 'bg-rose-100 text-rose-800 border-rose-200' },
        FWD: { label: 'Forward', icon: '⚽', color: 'bg-rose-100 text-rose-800 border-rose-200' },
        Forward: { label: 'Forward', icon: '⚽', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    };

    // Filter and Sort squad players
    const filteredSquad = useMemo(() => {
        if (!selectedTeam?.players) return [];
        let list = [...selectedTeam.players];

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p => 
                p.name?.toLowerCase().includes(q) || 
                String(p.jersey_number).includes(q)
            );
        }

        // Position filter
        if (positionFilter !== 'all') {
            list = list.filter(p => {
                const pos = (p.position || '').toUpperCase();
                if (positionFilter === 'GK') return pos.includes('GK') || pos.includes('KIPER');
                if (positionFilter === 'DEF') return pos.includes('DEF') || pos.includes('ANCHOR');
                if (positionFilter === 'MID') return pos.includes('MID') || pos.includes('FLANK');
                if (positionFilter === 'FWD') return pos.includes('FWD') || pos.includes('PIVOT');
                return true;
            });
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'goals') return (b.goals || 0) - (a.goals || 0);
            if (sortBy === 'assists') return (b.assists || 0) - (a.assists || 0);
            if (sortBy === 'cards') return ((b.yellow_cards || 0) + (b.red_cards || 0) * 2) - ((a.yellow_cards || 0) + (a.red_cards || 0) * 2);
            if (sortBy === 'motm') return (b.motm_count || 0) - (a.motm_count || 0);
            return (a.jersey_number || 0) - (b.jersey_number || 0);
        });

        return list;
    }, [selectedTeam, positionFilter, sortBy, searchQuery]);

    const activeCompetition = competitions.find(c => c.id === selectedCompetitionId) || competitions[0];

    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                        <Activity className="w-5 h-5 text-brand-500" />
                        <span>Statistik & Skuad Pemain</span>
                    </h2>
                    <p className="text-[11px] font-semibold text-gray-400">
                        {activeCompetition?.name || 'Turnamen Futsal'} • Musim {activeCompetition?.season || '2026'}
                    </p>
                </div>
            </div>

            {/* Competition Chips */}
            <CategoryChips competitions={competitions} selectedId={selectedCompetitionId} />

            {/* Stat Category Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/70 my-3 shadow-inner">
                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setStatTab('scorers')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'scorers'
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-black'
                            : 'text-gray-500 hover:text-gray-900 font-semibold'
                    }`}
                >
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Scorer</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setStatTab('assists')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'assists'
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-black'
                            : 'text-gray-500 hover:text-gray-900 font-semibold'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Assist</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setStatTab('cards')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'cards'
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-black'
                            : 'text-gray-500 hover:text-gray-900 font-semibold'
                    }`}
                >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Kartu</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setStatTab('squad')}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'squad'
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-black'
                            : 'text-gray-500 hover:text-gray-900 font-semibold'
                    }`}
                >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Skuad Tim</span>
                </motion.button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: TOP SCORER                                        */}
            {/* ======================================================== */}
            <AnimatePresence mode="wait">
                {statTab === 'scorers' && (
                    <motion.div
                        key="scorers"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {/* Table Header */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span className="w-6 text-center">POS</span>
                                <span>PEMAIN & TIM</span>
                            </div>
                            <span className="text-right pr-1">TOTAL GOL</span>
                        </div>

                        {topScorers && topScorers.length > 0 ? (
                            topScorers.map((player, idx) => (
                                <motion.div
                                    key={player.id || idx}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => setInspectPlayer(player)}
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                            idx === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200 shadow-sm' :
                                            idx === 1 ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' :
                                            idx === 2 ? 'bg-amber-700 text-white ring-2 ring-amber-600/30' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {idx + 1}
                                        </div>

                                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 overflow-hidden shrink-0 shadow-inner">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                    {player.name || 'Pemain'}
                                                </h4>
                                                {idx === 0 && <span className="text-xs">👑</span>}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'} • Pos: {player.position || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0 shadow-xs">
                                        <span className="text-xs">⚽</span>
                                        <span className="text-xs font-black">{player.goals || player.total_goals || 0}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                <Award className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-medium">Belum ada gol tercatat di turnamen ini.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: TOP ASSIST                                        */}
                {/* ======================================================== */}
                {statTab === 'assists' && (
                    <motion.div
                        key="assists"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span className="w-6 text-center">POS</span>
                                <span>PEMAIN & TIM</span>
                            </div>
                            <span className="text-right pr-1">TOTAL ASSIST</span>
                        </div>

                        {topAssists && topAssists.length > 0 ? (
                            topAssists.map((player, idx) => (
                                <motion.div
                                    key={player.id || idx}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => setInspectPlayer(player)}
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                            idx === 0 ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-200 shadow-sm' :
                                            idx === 1 ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' :
                                            idx === 2 ? 'bg-amber-700 text-white ring-2 ring-amber-600/30' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {idx + 1}
                                        </div>

                                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 overflow-hidden shrink-0 shadow-inner">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                {player.name || 'Pemain'}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl shrink-0 shadow-xs">
                                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-xs font-black">{player.assists || 0}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                <Zap className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-medium">Belum ada assist tercatat di turnamen ini.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: KARTU & DISIPLIN                                   */}
                {/* ======================================================== */}
                {statTab === 'cards' && (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span className="w-6 text-center">POS</span>
                                <span>PEMAIN & TIM</span>
                            </div>
                            <div className="flex items-center space-x-3 text-right pr-1">
                                <span>🟨 KUNING</span>
                                <span>🟥 MERAH</span>
                            </div>
                        </div>

                        {topCards && topCards.length > 0 ? (
                            topCards.map((player, idx) => (
                                <motion.div
                                    key={player.id || idx}
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => setInspectPlayer(player)}
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer active:scale-[0.99]"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-600 shrink-0">
                                            {idx + 1}
                                        </div>

                                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 overflow-hidden shrink-0 shadow-inner">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                {player.name || 'Pemain'}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0">
                                        <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg text-xs font-black">
                                            <span>🟨</span>
                                            <span>{player.yellow_cards || 0}</span>
                                        </span>
                                        <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-lg text-xs font-black">
                                            <span>🟥</span>
                                            <span>{player.red_cards || 0}</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-medium">Tidak ada pelanggaran kartu tercatat.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ======================================================== */}
                {/* TAB 4: SKUAD TIM & STATISTIK DETAIL                      */}
                {/* ======================================================== */}
                {statTab === 'squad' && (
                    <motion.div
                        key="squad"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Horizontal Team Selector Carousel */}
                        <div className="relative flex items-center group">
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('left')}
                                className="hidden group-hover:flex absolute left-0 z-10 w-7 h-7 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </motion.button>
                            
                            <div ref={teamScrollRef} className="flex items-center space-x-2 overflow-x-auto scroll-smooth no-scrollbar py-1 w-full">
                                {teams?.map((t) => {
                                    const isSelected = selectedTeam?.id === t.id;
                                    return (
                                        <motion.button
                                            key={t.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.get('/players', { 
                                                team_id: t.id, 
                                                competition_id: selectedCompetitionId,
                                                tab: 'squad'
                                            }, { preserveState: true, preserveScroll: true })}
                                            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-2 shrink-0 ${
                                                isSelected
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-400/50'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {t.logo_url ? (
                                                <img src={t.logo_url} alt="" className="w-4 h-4 object-contain shrink-0" />
                                            ) : (
                                                <span className="text-[10px] font-black">{t.short_name}</span>
                                            )}
                                            <span>{t.name}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('right')}
                                className="hidden group-hover:flex absolute right-0 z-10 w-7 h-7 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-700"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {selectedTeam ? (
                            <div className="space-y-4">
                                {/* ========================================== */}
                                {/* 🏆 TEAM OVERVIEW & TOURNAMENT STATS CARD    */}
                                {/* ========================================== */}
                                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-slate-800">
                                    {/* Background decorative glow */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                                    {/* Team Header Top */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
                                        <div className="flex items-center space-x-3.5">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-lg">
                                                {selectedTeam.logo_url ? (
                                                    <img src={selectedTeam.logo_url} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="font-black text-lg text-white">{selectedTeam.short_name}</span>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-white tracking-tight">{selectedTeam.name}</h3>
                                                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-brand-300 text-[10px] font-black border border-white/10">
                                                        {selectedTeam.short_name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    Pelatih: <span className="text-white font-bold">{selectedTeam.coach_name || 'Official Tim'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Standing Position Badge */}
                                        <div className="text-right">
                                            {selectedTeam.standing ? (
                                                <div className="px-3 py-1 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-right">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block">Klasemen</span>
                                                    <span className="text-sm font-black">Posisi #{selectedTeam.standing.position}</span>
                                                </div>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-slate-400">
                                                    {selectedTeam.players?.length || 0} Pemain
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Standings Details Table Row */}
                                    {selectedTeam.standing && (
                                        <div className="py-3 border-b border-slate-800/80 grid grid-cols-7 text-center text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-bold">MAIN</span>
                                                <span className="font-black text-white">{selectedTeam.standing.played}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-emerald-400 block font-bold">MENANG</span>
                                                <span className="font-black text-white">{selectedTeam.standing.won}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-amber-400 block font-bold">SERI</span>
                                                <span className="font-black text-white">{selectedTeam.standing.drawn}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-rose-400 block font-bold">KALAH</span>
                                                <span className="font-black text-white">{selectedTeam.standing.lost}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-bold">GOL</span>
                                                <span className="font-black text-white">{selectedTeam.standing.goals_for}:{selectedTeam.standing.goals_against}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 block font-bold">SELISIH</span>
                                                <span className="font-black text-white">{selectedTeam.standing.goal_difference > 0 ? `+${selectedTeam.standing.goal_difference}` : selectedTeam.standing.goal_difference}</span>
                                            </div>
                                            <div className="bg-brand-500/20 rounded-xl py-0.5 border border-brand-500/30">
                                                <span className="text-[10px] text-brand-300 block font-black">POIN</span>
                                                <span className="font-black text-brand-400 text-sm">{selectedTeam.standing.points}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Highlights & Recent Form Row */}
                                    <div className="pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-slate-300 text-[11px] font-semibold">
                                                <span>⚽ Total Gol Tim:</span>
                                                <strong className="text-white font-black text-xs">{selectedTeam.summary?.total_goals || 0}</strong>
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-300 text-[11px] font-semibold">
                                                <span>⚡ Total Assist:</span>
                                                <strong className="text-white font-black text-xs">{selectedTeam.summary?.total_assists || 0}</strong>
                                            </span>
                                        </div>

                                        {/* Recent Form (W, D, L) */}
                                        {selectedTeam.recent_form && selectedTeam.recent_form.length > 0 && (
                                            <div className="flex items-center space-x-1">
                                                <span className="text-[10px] text-slate-400 font-bold mr-1">Tren:</span>
                                                {selectedTeam.recent_form.map((form, fIdx) => (
                                                    <span
                                                        key={fIdx}
                                                        title={`${form.opponent} (${form.score})`}
                                                        className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                                                            form.result === 'W' ? 'bg-emerald-500 text-white' :
                                                            form.result === 'D' ? 'bg-amber-500 text-white' :
                                                            'bg-rose-500 text-white'
                                                        }`}
                                                    >
                                                        {form.result}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ========================================== */}
                                {/* 🔍 FILTER, SEARCH & SORT CONTROLS          */}
                                {/* ========================================== */}
                                <div className="space-y-2">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari nama atau nomor punggung pemain..."
                                            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Position Filter Chips & Sort Dropdown */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        {/* Position Filter */}
                                        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                                            {[
                                                { id: 'all', label: 'Semua Posisi' },
                                                { id: 'GK', label: '🧤 GK' },
                                                { id: 'DEF', label: '🛡️ Anchor' },
                                                { id: 'MID', label: '⚡ Flank' },
                                                { id: 'FWD', label: '⚽ Pivot' },
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setPositionFilter(tab.id)}
                                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                                                        positionFilter === tab.id
                                                            ? 'bg-brand-500 text-white font-black shadow-xs'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Sort By Dropdown */}
                                        <div className="flex items-center space-x-1 shrink-0">
                                            <ArrowUpDown className="w-3 h-3 text-gray-400" />
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 py-1 px-2 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                            >
                                                <option value="jersey">No. Punggung</option>
                                                <option value="goals">⚽ Top Scorer Tim</option>
                                                <option value="assists">⚡ Top Assist Tim</option>
                                                <option value="motm">🌟 Man of the Match</option>
                                                <option value="cards">🟨 Disiplin (Kartu)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================== */}
                                {/* 👥 SQUAD PLAYERS DETAILED STAT CARDS       */}
                                {/* ========================================== */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                        <span>DAFTAR SKUAD & STATISTIK TURNAMEN ({filteredSquad.length})</span>
                                        <span>GOL / AST / KARTU</span>
                                    </div>

                                    {filteredSquad.length > 0 ? (
                                        filteredSquad.map((player) => {
                                            const pos = positionBadges[player.position] || { label: player.position, icon: '⚽', color: 'bg-gray-100 text-gray-700 border-gray-200' };
                                            const isTopScorer = selectedTeam.summary?.top_scorer && selectedTeam.summary.top_scorer.id === player.id && player.goals > 0;
                                            const isExpanded = expandedPlayerId === player.id;

                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`rounded-2xl border transition-all duration-200 bg-white ${
                                                        isTopScorer 
                                                            ? 'border-amber-200 shadow-sm ring-1 ring-amber-300/50' 
                                                            : 'border-gray-100 hover:border-gray-200 shadow-xs'
                                                    }`}
                                                >
                                                    {/* Main Row */}
                                                    <div 
                                                        onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                                                        className="p-3 flex items-center justify-between cursor-pointer select-none"
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                            {/* Jersey Badge */}
                                                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                                                #{player.jersey_number || '0'}
                                                            </div>

                                                            {/* Player Details */}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <h4 className="text-xs font-black text-gray-900 truncate">
                                                                        {player.name}
                                                                    </h4>
                                                                    {isTopScorer && (
                                                                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 font-black rounded-md flex items-center gap-0.5 shrink-0">
                                                                            <span>👑</span>
                                                                            <span>Top Scorer</span>
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${pos.color}`}>
                                                                        {pos.icon} {pos.label}
                                                                    </span>

                                                                    {player.motm_count > 0 && (
                                                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                                                                            <span>🌟</span>
                                                                            <span>{player.motm_count}x MOTM</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Stats Badges Right */}
                                                        <div className="flex items-center space-x-1.5 shrink-0">
                                                            {/* Goals Badge */}
                                                            <span className={`px-2 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                                                                player.goals > 0 
                                                                    ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-300 shadow-xs' 
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <span>⚽</span>
                                                                <span>{player.goals || 0}</span>
                                                            </span>

                                                            {/* Assists Badge */}
                                                            <span className={`px-2 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                                                                player.assists > 0 
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <Zap className="w-3 h-3" />
                                                                <span>{player.assists || 0}</span>
                                                            </span>

                                                            {/* Cards Badges (if any) */}
                                                            {(player.yellow_cards > 0 || player.red_cards > 0) && (
                                                                <div className="flex items-center space-x-1 pl-1">
                                                                    {player.yellow_cards > 0 && (
                                                                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black">
                                                                            🟨 {player.yellow_cards}
                                                                        </span>
                                                                    )}
                                                                    {player.red_cards > 0 && (
                                                                        <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-black">
                                                                            🟥 {player.red_cards}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="text-gray-400 pl-1">
                                                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Breakdown */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="px-3.5 pb-3.5 pt-1 border-t border-gray-100 text-xs space-y-2 bg-gray-50/50 rounded-b-2xl"
                                                            >
                                                                <div className="grid grid-cols-4 gap-2 text-center pt-2">
                                                                    <div className="p-2 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                                                                        <span className="text-[10px] text-gray-400 block font-bold">Total Gol</span>
                                                                        <span className="font-black text-amber-600 text-sm">⚽ {player.goals || 0}</span>
                                                                    </div>
                                                                    <div className="p-2 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                                                                        <span className="text-[10px] text-gray-400 block font-bold">Assist</span>
                                                                        <span className="font-black text-emerald-600 text-sm">⚡ {player.assists || 0}</span>
                                                                    </div>
                                                                    <div className="p-2 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                                                                        <span className="text-[10px] text-gray-400 block font-bold">K. Kuning</span>
                                                                        <span className="font-black text-amber-700 text-sm">🟨 {player.yellow_cards || 0}</span>
                                                                    </div>
                                                                    <div className="p-2 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                                                                        <span className="text-[10px] text-gray-400 block font-bold">K. Merah</span>
                                                                        <span className="font-black text-red-600 text-sm">🟥 {player.red_cards || 0}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Goal breakdown details */}
                                                                {player.goal_events && player.goal_events.length > 0 ? (
                                                                    <div className="pt-1">
                                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">
                                                                            Riwayat Gol Turnamen:
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {player.goal_events.map((ev, evIdx) => (
                                                                                <span
                                                                                    key={evIdx}
                                                                                    className="px-2 py-1 bg-amber-100/70 text-amber-900 border border-amber-200 text-[10px] font-black rounded-lg flex items-center gap-1"
                                                                                >
                                                                                    <span>⚽ Menit {ev.minute}'</span>
                                                                                    <span className="text-amber-700 font-semibold">vs {ev.opponent}</span>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-gray-400 italic text-center pt-1">
                                                                        Belum mencetak gol di turnamen ini.
                                                                    </p>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                            <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                            <p className="text-xs text-gray-400 font-medium">Tidak ada pemain yang cocok dengan filter pencarian.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                <p className="text-xs text-gray-400 font-medium">Pilih salah satu tim di atas untuk melihat detail skuad dan statistik pemain.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* 👤 PLAYER INSPECTION MODAL                                */}
            {/* ======================================================== */}
            <AnimatePresence>
                {inspectPlayer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                                        #{inspectPlayer.jersey_number || '0'}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">{inspectPlayer.name}</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold">{inspectPlayer.team?.name || 'Tim Futsal'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setInspectPlayer(null)}
                                    className="p-1.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                                    <span className="text-[10px] text-amber-800 font-bold block">Total Gol</span>
                                    <span className="text-lg font-black text-amber-950">⚽ {inspectPlayer.goals || inspectPlayer.total_goals || 0}</span>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                                    <span className="text-[10px] text-emerald-800 font-bold block">Total Assist</span>
                                    <span className="text-lg font-black text-emerald-950">⚡ {inspectPlayer.assists || 0}</span>
                                </div>
                                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                                    <span className="text-[10px] text-amber-800 font-bold block">Kartu Kuning</span>
                                    <span className="text-lg font-black text-amber-900">🟨 {inspectPlayer.yellow_cards || 0}</span>
                                </div>
                                <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                                    <span className="text-[10px] text-red-700 font-bold block">Kartu Merah</span>
                                    <span className="text-lg font-black text-red-900">🟥 {inspectPlayer.red_cards || 0}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setInspectPlayer(null)}
                                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
