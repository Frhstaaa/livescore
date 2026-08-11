import React from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Star, Plus, ShieldCheck, Trophy } from 'lucide-react';

export default function FavoritesIndex({ followingTeams, followingCompetitions }) {
    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Favorites</h2>
                <div className="p-2 text-gray-400 bg-white rounded-full border border-gray-100 shadow-sm">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
            </div>

            {/* Following Teams */}
            <div className="mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Following Teams
                </h3>

                <div className="space-y-2">
                    {followingTeams?.map((team) => (
                        <div
                            key={team.id}
                            className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shadow-inner border border-gray-200">
                                    {team.short_name}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{team.name}</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">{team.coach_name || 'RS Livasya'}</p>
                                </div>
                            </div>

                            <button className="text-amber-400 hover:scale-110 transition-transform p-1">
                                <Star className="w-5 h-5 fill-amber-400" />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-3 py-3 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:text-brand-500 hover:border-brand-300 transition-colors flex items-center justify-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Add Teams</span>
                </button>
            </div>

            {/* Following Competitions */}
            <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Following Competitions
                </h3>

                <div className="space-y-2">
                    {followingCompetitions?.map((comp) => (
                        <div
                            key={comp.id}
                            className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-card flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center font-bold text-sm border border-brand-100">
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
                        </div>
                    ))}
                </div>

                <button className="w-full mt-3 py-3 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:text-brand-500 hover:border-brand-300 transition-colors flex items-center justify-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Add Competitions</span>
                </button>
            </div>
        </MobileLayout>
    );
}
