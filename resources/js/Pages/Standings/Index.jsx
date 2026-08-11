import React from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';

export default function StandingsIndex({ standings, competitions, selectedCompetitionId }) {
    return (
        <MobileLayout>
            <h2 className="text-lg font-black text-gray-900 tracking-tight mb-2">Klasemen Futsal</h2>

            <CategoryChips competitions={competitions} selectedId={selectedCompetitionId} />

            {/* Standings Table Container - Compact & Fit for Mobile */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden my-3">
                <div className="w-full overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[340px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <th className="py-2.5 px-1 w-6 text-center">#</th>
                                <th className="py-2.5 px-1.5 min-w-[100px]">TIM</th>
                                <th className="py-2.5 px-0.5 w-7 text-center">M</th>
                                <th className="py-2.5 px-0.5 w-7 text-center text-emerald-600">MN</th>
                                <th className="py-2.5 px-0.5 w-7 text-center text-amber-600">S</th>
                                <th className="py-2.5 px-0.5 w-7 text-center text-red-500">K</th>
                                <th className="py-2.5 px-0.5 w-8 text-center">SG</th>
                                <th className="py-2.5 px-1 w-9 text-center font-black text-brand-600 bg-brand-50/50">POIN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                            {standings && standings.length > 0 ? (
                                standings.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-brand-50/40 transition-colors">
                                        <td className="py-2.5 px-1 text-center font-bold">
                                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                                                index === 0 ? 'bg-emerald-500 text-white font-black shadow-sm' :
                                                index === 1 ? 'bg-brand-500 text-white font-black shadow-sm' : 'text-gray-500 font-bold bg-gray-100'
                                            }`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-1.5 font-bold text-gray-900">
                                            <div className="flex items-center space-x-1.5 min-w-0">
                                                <div className="w-5 h-5 rounded-full bg-slate-100 font-black text-[9px] text-gray-700 flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden">
                                                    {item.team?.logo_url ? (
                                                        <img src={item.team.logo_url} alt={item.team.name} className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        item.team?.short_name || 'TIM'
                                                    )}
                                                </div>
                                                <span className="truncate max-w-[85px] sm:max-w-[140px] text-xs font-bold text-gray-900">
                                                    {item.team?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-0.5 text-center font-medium text-gray-600 text-xs">{item.played}</td>
                                        <td className="py-2.5 px-0.5 text-center font-bold text-emerald-600 text-xs">{item.win}</td>
                                        <td className="py-2.5 px-0.5 text-center font-medium text-amber-600 text-xs">{item.draw}</td>
                                        <td className="py-2.5 px-0.5 text-center font-medium text-red-500 text-xs">{item.lose}</td>
                                        <td className="py-2.5 px-0.5 text-center font-bold text-gray-700 text-xs">
                                            {item.goal_difference > 0 ? `+${item.goal_difference}` : item.goal_difference}
                                        </td>
                                        <td className="py-2.5 px-1 text-center font-black text-brand-600 text-xs bg-brand-50/50">
                                            {item.points}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-6 text-center text-gray-400 text-xs">
                                        Belum ada data klasemen untuk turnamen ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-around text-[10px] font-bold text-gray-400">
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Promosi Final</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                        <span>Play-off</span>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
