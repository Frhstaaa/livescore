import React, { useState, useRef } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import { router } from '@inertiajs/react';
import { Award, Zap, ShieldAlert, Users, ChevronLeft, ChevronRight } from 'lucide-react';

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
                <button
                    onClick={() => setStatTab('scorers')}
                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'scorers' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Scorer</span>
                </button>
                <button
                    onClick={() => setStatTab('assists')}
                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'assists' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Top Assist</span>
                </button>
                <button
                    onClick={() => setStatTab('cards')}
                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'cards' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Kartu</span>
                </button>
                <button
                    onClick={() => setStatTab('squad')}
                    className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1 ${
                        statTab === 'squad' ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-black' : 'text-gray-500 hover:text-gray-800 font-semibold'
                    }`}
                >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Skuad Tim</span>
                </button>
            </div>

            {/* TAB CONTENT 1: TOP SCORERS */}
            {statTab === 'scorers' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-3">
                    {topScorers && topScorers.length > 0 ? (
                        topScorers.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${
                                        index === 0 ? 'bg-amber-400 text-slate-900 shadow-md' :
                                        index === 1 ? 'bg-slate-300 text-slate-900' :
                                        index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.player?.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">{item.player?.team?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 font-black text-xs">
                                    <span>{item.goals} Gol</span>
                                    <span>⚽</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-6">Belum ada data pencetak gol.</p>
                    )}
                </div>
            )}

            {/* TAB CONTENT 2: TOP ASSISTS */}
            {statTab === 'assists' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-3">
                    {topAssists && topAssists.length > 0 ? (
                        topAssists.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-black text-xs flex items-center justify-center">
                                        {index + 1}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.player?.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">{item.player?.team?.name}</p>
                                    </div>
                                </div>

                                <div className="bg-brand-50 px-3 py-1 rounded-full text-brand-600 font-black text-xs">
                                    {item.assists} Assist
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-6">Belum ada data assist.</p>
                    )}
                </div>
            )}

            {/* TAB CONTENT 3: CARDS */}
            {statTab === 'cards' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-3">
                    {topCards && topCards.length > 0 ? (
                        topCards.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 font-bold text-xs text-gray-500 flex items-center justify-center">
                                        {index + 1}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.player?.name}</h4>
                                        <p className="text-[11px] text-gray-400 font-medium">{item.player?.team?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {item.yellow_cards > 0 && (
                                        <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-bold text-xs">
                                            {item.yellow_cards} 🟨
                                        </span>
                                    )}
                                    {item.red_cards > 0 && (
                                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-xs">
                                            {item.red_cards} 🟥
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-6">Belum ada catatan kartu pelanggaran.</p>
                    )}
                </div>
            )}

            {/* TAB CONTENT 4: SQUAD / PEMAIN PER TIM */}
            {statTab === 'squad' && (
                <div className="space-y-4">
                    {/* Team Selector Pills with Horizontal Scroll & Arrows */}
                    <div className="relative flex items-center group">
                        <button
                            onClick={() => scrollTeam('left')}
                            className="hidden group-hover:flex md:flex absolute left-0 z-10 w-6 h-6 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600 hover:text-brand-500 -ml-2"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div
                            ref={teamScrollRef}
                            className="flex space-x-2 overflow-x-auto scroll-smooth no-scrollbar touch-pan-x py-1 w-full"
                        >
                            {teams?.map((t) => {
                                const isSelected = selectedTeam?.id === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => router.get('/players', { competition_id: selectedCompetitionId, team_id: t.id }, { preserveState: true })}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                                            isSelected
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        {t.short_name} - {t.name}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => scrollTeam('right')}
                            className="hidden group-hover:flex md:flex absolute right-0 z-10 w-6 h-6 bg-white shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600 hover:text-brand-500 -mr-2"
                        >
                            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                    </div>

                    {/* Team Roster & Stats Table */}
                    {selectedTeam && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm">{selectedTeam.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium">Pelatih: {selectedTeam.coach_name || 'RS Livasya'}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold">
                                    {selectedTeam.players?.length || 0} Pemain
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                            <th className="py-3 px-3 w-8 text-center">#</th>
                                            <th className="py-3 px-3">Nama Pemain</th>
                                            <th className="py-3 px-2 text-center">Pos</th>
                                            <th className="py-3 px-2 text-center">Gol</th>
                                            <th className="py-3 px-2 text-center">Ast</th>
                                            <th className="py-3 px-2 text-center">🟨</th>
                                            <th className="py-3 px-2 text-center">🟥</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedTeam.players?.map((p) => {
                                            const stat = p.season_stats && p.season_stats.length > 0 ? p.season_stats[0] : null;
                                            return (
                                                <tr key={p.id} className="hover:bg-gray-50">
                                                    <td className="py-3 px-3 text-center font-black text-gray-500">
                                                        #{p.jersey_number}
                                                    </td>
                                                    <td className="py-3 px-3 font-bold text-gray-900">
                                                        {p.name}
                                                    </td>
                                                    <td className="py-3 px-2 text-center font-bold text-gray-400">
                                                        {p.position}
                                                    </td>
                                                    <td className="py-3 px-2 text-center font-black text-emerald-600">
                                                        {stat?.goals || 0}
                                                    </td>
                                                    <td className="py-3 px-2 text-center font-bold text-brand-600">
                                                        {stat?.assists || 0}
                                                    </td>
                                                    <td className="py-3 px-2 text-center font-bold text-amber-500">
                                                        {stat?.yellow_cards || 0}
                                                    </td>
                                                    <td className="py-3 px-2 text-center font-bold text-red-500">
                                                        {stat?.red_cards || 0}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </MobileLayout>
    );
}
