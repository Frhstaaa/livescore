import React, { useState, useRef } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import { router } from '@inertiajs/react';
import { Award, Zap, ShieldAlert, Users, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayersIndex({ topScorers, topAssists, topCards, competitions, selectedCompetitionId, teams, selectedTeam }) {
    const [statTab, setStatTab] = useState('scorers'); // 'scorers' | 'assists' | 'cards' | 'squad'
    const teamScrollRef = useRef(null);

    const scrollTeam = (direction) => {
        if (teamScrollRef.current) {
            const amount = direction === 'left' ? -150 : 150;
            teamScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Statistik Pemain</h2>
                <span className="text-[11px] font-bold text-gray-400">Musim 2026</span>
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

            {/* TAB 1: TOP SCORER */}
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
                        {/* Professional Table Header */}
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
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        {/* Rank Badge */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                                            idx === 0 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200 shadow-sm' :
                                            idx === 1 ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200' :
                                            idx === 2 ? 'bg-amber-700 text-white ring-2 ring-amber-600/30' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {idx + 1}
                                        </div>

                                        {/* Team Logo / Jersey Badge */}
                                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-[11px] text-gray-700 overflow-hidden shrink-0">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        {/* Player & Team Details */}
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                {player.name || 'Pemain'}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'} • <span className="text-gray-500">#{player.jersey_number || 0}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stat Counter */}
                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/60 font-black text-xs">
                                            {player.total_goals ?? player.goals ?? 0} Gol
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
                                <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Belum ada data pencetak gol tercatat.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 2: TOP ASSIST */}
                {statTab === 'assists' && (
                    <motion.div
                        key="assists"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {/* Professional Table Header */}
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
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        {/* Rank Badge */}
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-600 shrink-0">
                                            {idx + 1}
                                        </div>

                                        {/* Team Logo / Jersey Badge */}
                                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-[11px] text-gray-700 overflow-hidden shrink-0">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        {/* Player & Team Details */}
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                {player.name || 'Pemain'}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'} • <span className="text-gray-500">#{player.jersey_number || 0}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stat Counter */}
                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-black text-xs">
                                            {player.total_assists ?? player.assists ?? 0} Assist
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
                                <Zap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Belum ada data assist tercatat.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 3: KARTU */}
                {statTab === 'cards' && (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {/* Professional Table Header */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span className="w-6 text-center">POS</span>
                                <span>PEMAIN & TIM</span>
                            </div>
                            <div className="flex items-center space-x-3 pr-1">
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
                                    className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                                        {/* Rank Badge */}
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-black text-xs text-gray-600 shrink-0">
                                            {idx + 1}
                                        </div>

                                        {/* Team Logo / Jersey Badge */}
                                        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-[11px] text-gray-700 overflow-hidden shrink-0">
                                            {player.team?.logo_url ? (
                                                <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <span>#{player.jersey_number || '0'}</span>
                                            )}
                                        </div>

                                        {/* Player & Team Details */}
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-black text-gray-900 truncate leading-tight">
                                                {player.name || 'Pemain'}
                                            </h4>
                                            <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                                                {player.team?.name || 'Tim Futsal'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stat Badges for Yellow & Red Cards */}
                                    <div className="flex items-center space-x-2 shrink-0">
                                        <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-xs font-black">
                                            <span>🟨</span>
                                            <span>{player.yellow_cards || 0}</span>
                                        </span>
                                        <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg text-xs font-black">
                                            <span>🟥</span>
                                            <span>{player.red_cards || 0}</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
                                <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Tidak ada pelanggaran kartu tercatat.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* TAB 4: SKUAD TIM */}
                {statTab === 'squad' && (
                    <motion.div
                        key="squad"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Horizontal Team Selector Pill Header */}
                        <div className="relative flex items-center mb-3 group">
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('left')}
                                className="hidden group-hover:flex absolute left-0 z-10 w-6 h-6 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </motion.button>
                            
                            <div ref={teamScrollRef} className="flex items-center space-x-1.5 overflow-x-auto scroll-smooth no-scrollbar py-1 w-full">
                                {teams?.map((t) => {
                                    const isSelected = selectedTeam?.id === t.id;
                                    return (
                                        <motion.button
                                            key={t.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => router.get('/players', { team_id: t.id, competition_id: selectedCompetitionId }, { preserveState: true, preserveScroll: true })}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                                                isSelected
                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{t.name}</span>
                                            {t.players_count !== undefined && (
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {t.players_count}
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('right')}
                                className="hidden group-hover:flex absolute right-0 z-10 w-6 h-6 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>

                        {/* Selected Team Header Card & Player Table */}
                        {selectedTeam ? (
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                                {/* Team Banner Info */}
                                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                                    <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                        {selectedTeam.logo_url ? (
                                            <img src={selectedTeam.logo_url} alt="" className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <span className="font-black text-xs text-brand-600">{selectedTeam.short_name}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-black text-gray-900 truncate">{selectedTeam.name}</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                                            Pelatih: <span className="text-gray-700 font-bold">{selectedTeam.coach_name || '-'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-50 text-brand-600 border border-brand-100">
                                            {selectedTeam.players?.length || 0} Pemain
                                        </span>
                                    </div>
                                </div>

                                {/* Table Column Header */}
                                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-100/70 border border-gray-200/60 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span className="w-7 text-center">NO</span>
                                        <span>NAMA PEMAIN</span>
                                    </div>
                                    <span className="text-right pr-1">POSISI</span>
                                </div>

                                {/* Player List */}
                                <div className="space-y-1.5">
                                    {selectedTeam.players && selectedTeam.players.length > 0 ? (
                                        selectedTeam.players.map((p) => (
                                            <div
                                                key={p.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100"
                                            >
                                                <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                    <span className="w-7 h-7 rounded-lg bg-brand-500 text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                                                        #{p.jersey_number || '0'}
                                                    </span>
                                                    <span className="font-bold text-xs text-gray-900 truncate">
                                                        {p.name}
                                                    </span>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase shrink-0 ${
                                                    p.position === 'GK' ? 'bg-amber-100 text-amber-800' :
                                                    p.position === 'DEF' ? 'bg-blue-100 text-blue-800' :
                                                    p.position === 'MID' ? 'bg-emerald-100 text-emerald-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {p.position || '-'}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center py-4">Belum ada pemain di skuad tim ini.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
                                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">Pilih salah satu tim di atas untuk melihat daftar skuad pemain.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
