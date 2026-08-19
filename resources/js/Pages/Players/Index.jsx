import React, { useState, useRef, useMemo } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import { router } from '@inertiajs/react';
import { 
    Award, Zap, ShieldAlert, Users, ChevronLeft, ChevronRight, 
    User, Search, Trophy, Star, Flame, Shield, Filter, ArrowUpDown, 
    X, CheckCircle2, ChevronDown, ChevronUp, Activity, Sparkles,
    ArrowRight, ArrowLeft
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
    const [activeTeam, setActiveTeam] = useState(selectedTeam);
    const [teamSearchQuery, setTeamSearchQuery] = useState('');
    
    // Squad detail states
    const [positionFilter, setPositionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('jersey'); // 'jersey' | 'goals' | 'assists' | 'cards' | 'motm'
    const [playerSearchQuery, setPlayerSearchQuery] = useState('');
    const [inspectPlayer, setInspectPlayer] = useState(null);
    const [expandedPlayerId, setExpandedPlayerId] = useState(null);

    // Keep activeTeam synced with prop if prop changes
    React.useEffect(() => {
        setActiveTeam(selectedTeam);
    }, [selectedTeam]);

    const handleSelectTeam = (teamId) => {
        router.get('/players', {
            team_id: teamId,
            competition_id: selectedCompetitionId,
            tab: 'squad',
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setActiveTeam(page.props.selectedTeam);
            }
        });
    };

    const handleBackToTeamsList = () => {
        setActiveTeam(null);
        router.get('/players', {
            competition_id: selectedCompetitionId,
            tab: 'squad',
        }, {
            preserveState: true,
            preserveScroll: true,
        });
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

    // Filter list of all teams in squad overview
    const filteredTeams = useMemo(() => {
        if (!teams) return [];
        if (!teamSearchQuery.trim()) return teams;
        const q = teamSearchQuery.toLowerCase();
        return teams.filter(t => 
            t.name?.toLowerCase().includes(q) || 
            t.short_name?.toLowerCase().includes(q) ||
            t.coach_name?.toLowerCase().includes(q)
        );
    }, [teams, teamSearchQuery]);

    // Filter and Sort squad players inside active team
    const filteredSquad = useMemo(() => {
        if (!activeTeam?.players) return [];
        let list = [...activeTeam.players];

        // Search query
        if (playerSearchQuery.trim()) {
            const q = playerSearchQuery.toLowerCase();
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
    }, [activeTeam, positionFilter, sortBy, playerSearchQuery]);

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
                {/* TAB 4: SKUAD TIM                                         */}
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
                        {/* =================================================== */}
                        {/* 🌟 VIEW 1: DAFTAR SKUAD TIM (INITIAL LIST VIEW)     */}
                        {/* =================================================== */}
                        {!activeTeam ? (
                            <div className="space-y-3">
                                {/* Search Bar for Teams */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={teamSearchQuery}
                                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                                        placeholder="Cari nama tim, kode, atau nama pelatih..."
                                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                                    />
                                    {teamSearchQuery && (
                                        <button
                                            onClick={() => setTeamSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-gray-500">
                                    <span>Pilih Tim ({filteredTeams.length} Tim Terdaftar):</span>
                                    <span className="text-[10px] text-brand-600 font-semibold">Klik tim untuk melihat statistik</span>
                                </div>

                                {/* List of Teams Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredTeams.length > 0 ? (
                                        filteredTeams.map((t) => (
                                            <motion.div
                                                key={t.id}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSelectTeam(t.id)}
                                                className="bg-white rounded-3xl p-4 border border-gray-100 hover:border-brand-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
                                            >
                                                {/* Top Row: Logo, Name, Code */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center font-black text-sm text-brand-600 overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                                            {t.logo_url ? (
                                                                <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain p-1" />
                                                            ) : (
                                                                <span>{t.short_name}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                                                                    {t.name}
                                                                </h3>
                                                                <span className="px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600 text-[9px] font-black shrink-0">
                                                                    {t.short_name}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                                                                Pelatih: <strong className="text-gray-700">{t.coach_name || 'Official Tim'}</strong>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="w-8 h-8 rounded-full bg-orange-50 group-hover:bg-brand-500 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Stats Summary Chips */}
                                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-black text-gray-700">
                                                            👥 {t.players_count || 0} Pemain
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-black text-amber-900">
                                                            ⚽ {t.total_goals || 0} Gol
                                                        </span>
                                                    </div>

                                                    {t.position && (
                                                        <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                                                            Posisi #{t.position}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm space-y-2">
                                            <Users className="w-8 h-8 text-gray-300 mx-auto" />
                                            <p className="text-xs text-gray-400 font-medium">Tidak ada tim yang cocok dengan pencarian.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* =================================================== */
                            /* 🌟 VIEW 2: DETAIL STATISTIK SKUAD TIM AKTIF         */
                            /* =================================================== */
                            <div className="space-y-4">
                                {/* Back Navigation & Quick Team Switcher */}
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={handleBackToTeamsList}
                                        className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-brand-500" />
                                        <span>Daftar Tim</span>
                                    </button>

                                    {/* Team Switcher Carousel */}
                                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[65%] sm:max-w-none">
                                        {teams?.map((t) => {
                                            const isSelected = activeTeam?.id === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSelectTeam(t.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 shrink-0 ${
                                                        isSelected
                                                            ? 'bg-gradient-to-r from-brand-500 to-orange-600 text-white border-brand-500 shadow-md font-black'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>{t.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 🏆 TEAM OVERVIEW & TOURNAMENT STATS CARD */}
                                <div className="bg-gradient-to-br from-brand-600 via-orange-600 to-amber-600 rounded-3xl p-5 text-white shadow-xl shadow-brand-500/25 relative overflow-hidden border border-orange-400/40">
                                    {/* Background decorative glow */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                                    {/* Team Header Top */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/20 relative z-10">
                                        <div className="flex items-center space-x-3.5">
                                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-1 flex items-center justify-center shrink-0 shadow-lg">
                                                {activeTeam.logo_url ? (
                                                    <img src={activeTeam.logo_url} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="font-black text-lg text-white">{activeTeam.short_name}</span>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-black text-white tracking-tight">{activeTeam.name}</h3>
                                                    <span className="px-2 py-0.5 rounded-md bg-white/25 text-white text-[10px] font-black border border-white/30 backdrop-blur-xs">
                                                        {activeTeam.short_name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-orange-100 font-medium mt-0.5">
                                                    Pelatih: <span className="text-white font-bold">{activeTeam.coach_name || 'Official Tim'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Standing Position Badge */}
                                        <div className="text-right">
                                            {activeTeam.standing ? (
                                                <div className="px-3 py-1 rounded-xl bg-white/20 border border-white/30 text-white text-right backdrop-blur-xs shadow-xs">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block text-orange-100">Klasemen</span>
                                                    <span className="text-sm font-black text-white">Posisi #{activeTeam.standing.position}</span>
                                                </div>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold text-white backdrop-blur-xs">
                                                    {activeTeam.players?.length || 0} Pemain
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Standings Details Table Row */}
                                    {activeTeam.standing && (
                                        <div className="py-3 border-b border-white/20 grid grid-cols-7 text-center text-xs">
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">MAIN</span>
                                                <span className="font-black text-white">{activeTeam.standing.played}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">MENANG</span>
                                                <span className="font-black text-white">{activeTeam.standing.won}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">SERI</span>
                                                <span className="font-black text-white">{activeTeam.standing.drawn}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">KALAH</span>
                                                <span className="font-black text-white">{activeTeam.standing.lost}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">GOL</span>
                                                <span className="font-black text-white">{activeTeam.standing.goals_for}:{activeTeam.standing.goals_against}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-orange-100 block font-bold">SELISIH</span>
                                                <span className="font-black text-white">{activeTeam.standing.goal_difference > 0 ? `+${activeTeam.standing.goal_difference}` : activeTeam.standing.goal_difference}</span>
                                            </div>
                                            <div className="bg-white rounded-xl py-0.5 shadow-sm">
                                                <span className="text-[10px] text-brand-600 block font-black">POIN</span>
                                                <span className="font-black text-brand-600 text-sm">{activeTeam.standing.points}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Highlights & Recent Form Row */}
                                    <div className="pt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-orange-100 text-[11px] font-semibold">
                                                <span>⚽ Total Gol Tim:</span>
                                                <strong className="text-white font-black text-xs">{activeTeam.summary?.total_goals || 0}</strong>
                                            </span>
                                            <span className="flex items-center gap-1 text-orange-100 text-[11px] font-semibold">
                                                <span>⚡ Total Assist:</span>
                                                <strong className="text-white font-black text-xs">{activeTeam.summary?.total_assists || 0}</strong>
                                            </span>
                                        </div>

                                        {/* Recent Form (W, D, L) */}
                                        {activeTeam.recent_form && activeTeam.recent_form.length > 0 && (
                                            <div className="flex items-center space-x-1">
                                                <span className="text-[10px] text-orange-100 font-bold mr-1">Tren:</span>
                                                {activeTeam.recent_form.map((form, fIdx) => (
                                                    <span
                                                        key={fIdx}
                                                        title={`${form.opponent} (${form.score})`}
                                                        className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center border border-white/20 shadow-xs ${
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

                                {/* 🔍 FILTER, SEARCH & SORT CONTROLS */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={playerSearchQuery}
                                            onChange={(e) => setPlayerSearchQuery(e.target.value)}
                                            placeholder="Cari nama atau nomor punggung pemain..."
                                            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                                        />
                                        {playerSearchQuery && (
                                            <button
                                                onClick={() => setPlayerSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Position Filter Chips & Sort Dropdown */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
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
                                                            ? 'bg-gradient-to-r from-brand-500 to-orange-600 text-white font-black shadow-md shadow-brand-500/25'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-brand-600'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>

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

                                {/* 👥 SQUAD PLAYERS LIST */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                        <span>DAFTAR SKUAD & STATISTIK TURNAMEN ({filteredSquad.length})</span>
                                        <span>GOL / AST / KARTU</span>
                                    </div>

                                    {filteredSquad.length > 0 ? (
                                        filteredSquad.map((player) => {
                                            const pos = positionBadges[player.position] || { label: player.position, icon: '⚽', color: 'bg-gray-100 text-gray-700 border-gray-200' };
                                            const isTopScorer = activeTeam.summary?.top_scorer && activeTeam.summary.top_scorer.id === player.id && player.goals > 0;
                                            const isExpanded = expandedPlayerId === player.id;

                                            return (
                                                <div
                                                    key={player.id}
                                                    className={`rounded-2xl border transition-all duration-200 bg-white ${
                                                        isTopScorer 
                                                            ? 'border-amber-300 shadow-sm ring-1 ring-amber-300/50 bg-amber-50/20' 
                                                            : 'border-gray-100 hover:border-brand-200 shadow-xs'
                                                    }`}
                                                >
                                                    {/* Main Row */}
                                                    <div 
                                                        onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                                                        className="p-3 flex items-center justify-between cursor-pointer select-none"
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                            {/* Jersey Badge */}
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
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
                                                            <span className={`px-2 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                                                                player.goals > 0 
                                                                    ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-300 shadow-xs' 
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <span>⚽</span>
                                                                <span>{player.goals || 0}</span>
                                                            </span>

                                                            <span className={`px-2 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                                                                player.assists > 0 
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                                    : 'bg-gray-100 text-gray-400'
                                                            }`}>
                                                                <Zap className="w-3 h-3" />
                                                                <span>{player.assists || 0}</span>
                                                            </span>

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
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
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
                                className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 active:scale-95 transition-all"
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
