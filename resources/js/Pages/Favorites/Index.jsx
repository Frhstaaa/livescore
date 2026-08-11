import React from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Star, ShieldCheck, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FavoritesIndex({ followingTeams, followingCompetitions }) {
    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Tim & Turnamen Favorit</h2>
                <div className="p-2 text-gray-400 bg-white rounded-full border border-gray-100 shadow-sm">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
            </div>

            {/* Following Teams */}
            <div className="mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
                    TIM FAVORIT DIIKUTI
                </h3>

                <div className="space-y-2">
                    {followingTeams && followingTeams.length > 0 ? (
                        followingTeams.map((team, idx) => (
                            <motion.div
                                key={team.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden shrink-0">
                                        {team.logo_url ? (
                                            <img src={team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            team.short_name
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{team.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">Pelatih: {team.coach_name || 'RS Livasya'}</p>
                                    </div>
                                </div>

                                <button className="text-amber-400 hover:scale-110 transition-transform p-1">
                                    <Star className="w-5 h-5 fill-amber-400" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-4 bg-white rounded-2xl border border-gray-100">
                            Belum ada tim favorit yang diikuti.
                        </p>
                    )}
                </div>
            </div>

            {/* Following Competitions */}
            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
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
                                className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-100">
                                        🏆
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{comp.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">Musim {comp.season}</p>
                                    </div>
                                </div>

                                <button className="text-amber-400 hover:scale-110 transition-transform p-1">
                                    <Star className="w-5 h-5 fill-amber-400" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-4 bg-white rounded-2xl border border-gray-100">
                            Belum ada turnamen favorit yang diikuti.
                        </p>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
