import React, { useState, useRef } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import { router } from '@inertiajs/react';
import { Award, Zap, ShieldAlert, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
            <h2 className="text-lg font-black text-gray-900 tracking-tight mb-2">Statistik Pemain</h2>

            <CategoryChips competitions={competitions} selectedId={selectedCompetitionId} />

            {/* Neat & Equal 4-Column Stat Category Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/50 my-3">
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setStatTab('scorers')}
                    className={`relative py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'scorers' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Scorer</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setStatTab('assists')}
                    className={`relative py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'assists' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Assist</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setStatTab('cards')}
                    className={`relative py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'cards' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Kartu</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setStatTab('squad')}
                    className={`relative py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'squad' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Skuad Tim</span>
                </motion.button>
            </div>

            {/* Tab 1: Top Scorer List */}
            <AnimatePresence mode="wait">
                {statTab === 'scorers' && (
                    <motion.div
                        key="scorers"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {topScorers?.map((player, idx) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                                        idx === 0 ? 'bg-amber-400 text-white shadow-md' :
                                        idx === 1 ? 'bg-slate-300 text-slate-800' :
                                        idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                                        {player.team?.logo_url ? (
                                            <img src={player.team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            player.jersey_number
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900">{player.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-bold">{player.team?.name} • #{player.jersey_number}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-brand-600 block">{player.total_goals || 0} Gol</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Tab 2: Top Assist List */}
                {statTab === 'assists' && (
                    <motion.div
                        key="assists"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {topAssists?.map((player, idx) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900">{player.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-bold">{player.team?.name} • #{player.jersey_number}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-black text-emerald-600 block">{player.total_assists || 0} Assist</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Tab 3: Kartu List */}
                {statTab === 'cards' && (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        {topCards?.map((player, idx) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-gray-900">{player.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-bold">{player.team?.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 font-black text-xs">
                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg">🟨 {player.yellow_cards || 0}</span>
                                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-lg">🟥 {player.red_cards || 0}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Tab 4: Skuad Tim List */}
                {statTab === 'squad' && (
                    <motion.div
                        key="squad"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Horizontal Team Selector */}
                        <div className="relative flex items-center mb-3 group">
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('left')}
                                className="hidden group-hover:flex absolute left-0 z-10 w-6 h-6 bg-white shadow border rounded-full items-center justify-center text-gray-600"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </motion.button>
                            <div ref={teamScrollRef} className="flex items-center space-x-2 overflow-x-auto scroll-smooth no-scrollbar py-1 w-full">
                                {teams?.map((t) => (
                                    <motion.button
                                        key={t.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.get('/players', { team_id: t.id, competition_id: selectedCompetitionId }, { preserveState: true, preserveScroll: true })}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                            selectedTeam?.id === t.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {t.name}
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => scrollTeam('right')}
                                className="hidden group-hover:flex absolute right-0 z-10 w-6 h-6 bg-white shadow border rounded-full items-center justify-center text-gray-600"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>

                        {/* Roster List of Selected Team */}
                        {selectedTeam ? (
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
                                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                        {selectedTeam.logo_url ? (
                                            <img src={selectedTeam.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            <span className="font-black text-xs text-gray-700">{selectedTeam.short_name}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">{selectedTeam.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold">Pelatih: {selectedTeam.coach_name || '-'}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {selectedTeam.players?.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-black text-[10px] flex items-center justify-center">
                                                    #{p.jersey_number}
                                                </span>
                                                <span className="font-bold text-gray-900">{p.name}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase">{p.position}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-6">Pilih salah satu tim di atas untuk melihat skuad pemain.</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
