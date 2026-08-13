import React, { useState } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Star, ShieldCheck, Trophy, X, Users, Award, ExternalLink, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';

export default function FavoritesIndex({ followingTeams, followingCompetitions }) {
    const [selectedTeamModal, setSelectedTeamModal] = useState(null);

    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Tim & Turnamen Favorit</h2>
                <div className="p-2 text-gray-400 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
            </div>

            {/* Following Teams */}
            <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                    TIM FAVORIT DIIKUTI (KLIK UNTUK DETAIL TIM)
                </h3>

                <div className="space-y-2">
                    {followingTeams && followingTeams.length > 0 ? (
                        followingTeams.map((team, idx) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.015 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTeamModal(team)}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-gray-100 dark:border-slate-700/60 shadow-card flex items-center justify-between cursor-pointer hover:border-brand-300 dark:hover:border-brand-500 transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
                                        {team.logo_url ? (
                                            <img src={team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            team.short_name
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">{team.name}</h4>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Pelatih: {team.coach_name || 'Coach Futsal'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full">
                                        {team.players?.length || 0} Pemain
                                    </span>
                                    <button className="text-amber-400 hover:scale-110 transition-transform p-1">
                                        <Star className="w-5 h-5 fill-amber-400" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 text-center py-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm">
                            Belum ada tim favorit yang diikuti.
                        </div>
                    )}
                </div>
            </div>

            {/* Following Competitions */}
            <div>
                <h3 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                    TURNAMEN FAVORIT DIIKUTI
                </h3>

                <div className="space-y-2">
                    {followingCompetitions && followingCompetitions.length > 0 ? (
                        followingCompetitions.map((comp, idx) => (
                            <motion.div
                                key={comp.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-gray-100 dark:border-slate-700/60 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-100 dark:border-slate-600">
                                        🏆
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{comp.name}</h4>
                                        <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Musim {comp.season}</p>
                                    </div>
                                </div>

                                <button className="text-amber-400 hover:scale-110 transition-transform p-1">
                                    <Star className="w-5 h-5 fill-amber-400" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 text-center py-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm">
                            Belum ada turnamen favorit yang diikuti.
                        </div>
                    )}
                </div>
            </div>

            {/* INTERACTIVE TEAM DETAIL & SQUAD MODAL */}
            <AnimatePresence>
                {selectedTeamModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 dark:border-slate-700"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedTeamModal(null)}
                                className="absolute top-4 right-4 p-2 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Team Header Info */}
                            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                                    {selectedTeamModal.logo_url ? (
                                        <img src={selectedTeamModal.logo_url} alt="" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span className="font-black text-sm text-slate-700 dark:text-slate-200">{selectedTeamModal.short_name}</span>
                                    )}
                                </div>
                                <div>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1 inline-block">
                                        KODE: {selectedTeamModal.short_name}
                                    </span>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{selectedTeamModal.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-0.5">Pelatih: {selectedTeamModal.coach_name || '-'}</p>
                                </div>
                            </div>

                            {/* Team Quick Stats Grid */}
                            {selectedTeamModal.standings && selectedTeamModal.standings.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl text-center text-xs border border-gray-100 dark:border-slate-700">
                                    <div>
                                        <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold block">MAIN</span>
                                        <span className="font-black text-gray-900 dark:text-white">{selectedTeamModal.standings[0].played}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">MENANG</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400">{selectedTeamModal.standings[0].win}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">SERI</span>
                                        <span className="font-black text-amber-600 dark:text-amber-400">{selectedTeamModal.standings[0].draw}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold block">POIN</span>
                                        <span className="font-black text-brand-600 dark:text-brand-400">{selectedTeamModal.standings[0].points}</span>
                                    </div>
                                </div>
                            )}

                            {/* Squad Player List Header */}
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider flex items-center">
                                    <Users className="w-3.5 h-3.5 text-brand-500 mr-1.5" />
                                    Daftar Skuad Pemain ({selectedTeamModal.players?.length || 0})
                                </h4>
                                <Link
                                    href={`/players?team_id=${selectedTeamModal.id}`}
                                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
                                >
                                    <span>Detail Skuad</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5" />
                                </Link>
                            </div>

                            {/* Scrollable Player Roster List */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar min-h-[160px]">
                                {selectedTeamModal.players && selectedTeamModal.players.length > 0 ? (
                                    selectedTeamModal.players.map((player) => (
                                        <div key={player.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-xs border border-gray-100 dark:border-slate-700 hover:bg-gray-100/80 dark:hover:bg-slate-700 transition-colors">
                                            <div className="flex items-center space-x-2.5">
                                                <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm shrink-0">
                                                    #{player.jersey_number}
                                                </span>
                                                <span className="font-bold text-gray-900 dark:text-slate-100">{player.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-300 uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-slate-600">
                                                {player.position}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 dark:text-slate-400 text-center py-6">Belum ada pemain terdaftar di skuad ini.</p>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedTeamModal(null)}
                                className="w-full mt-4 py-2.5 bg-slate-900 dark:bg-brand-500 hover:bg-black dark:hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                            >
                                Tutup Detail Tim
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MobileLayout>
    );
}
