import React, { useState } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { ArrowLeft, Flame, Award, Clock, ShieldCheck, Activity, Users, FileText, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import LiveTimer from '@/Components/LiveTimer';

export default function MatchDetail({ match }) {
    const [activeTab, setActiveTab] = useState('matchday'); // 'matchday' | 'events' | 'stats' | 'lineups' | 'motm'

    const isLive = match.status === 'live' || match.status === 'half_time';
    const isFullTime = match.status === 'full_time';

    const tabs = [
        { id: 'matchday', label: 'Ringkasan' },
        { id: 'events', label: 'Kejadian' },
        { id: 'stats', label: 'Statistik' },
        { id: 'lineups', label: 'Susunan Pemain' },
        { id: 'motm', label: 'Best Player' },
    ];

    return (
        <MobileLayout>
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-3">
                <Link href="/" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-center">
                    <span className="text-[10px] font-extrabold text-brand-500 uppercase tracking-widest block">
                        {match.competition?.name || 'FUTSAL MATCH'}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{match.round}</span>
                </div>
                <div className="w-9"></div>
            </div>

            {/* Main Match Header Card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card mb-4 relative overflow-hidden">
                {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-live via-brand-500 to-live animate-pulse" />
                )}

                <div className="flex items-center justify-between">
                    
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center font-black text-sm text-slate-800 shadow-md border-2 border-gray-100 mb-2 overflow-hidden">
                            {match.home_team?.logo_url ? (
                                <img src={match.home_team.logo_url} alt={match.home_team.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                match.home_team?.short_name || 'HOME'
                            )}
                        </div>
                        <span className="text-xs font-black text-gray-900 text-center leading-tight">
                            {match.home_team?.name}
                        </span>
                    </div>

                    {/* Score & Status */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="flex items-center space-x-2 text-3xl font-black text-gray-900 mb-1">
                            <span>{match.home_score}</span>
                            <span className="text-gray-300 font-medium text-xl">VS</span>
                            <span>{match.away_score}</span>
                        </div>

                        {isLive && (
                            <div className="flex flex-col items-center">
                                <LiveTimer status={match.status} baseMinute={match.current_minute} showSeconds={true} />
                                <span className="text-[9px] font-bold text-live uppercase tracking-wider mt-0.5">
                                    {match.status === 'half_time' ? 'HT' : 'LIVE'}
                                </span>
                            </div>
                        )}

                        {isFullTime && (
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-500 uppercase">
                                Full Time
                            </span>
                        )}

                        {match.status === 'scheduled' && (
                            <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-600">
                                Upcoming
                            </span>
                        )}
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center font-black text-sm text-slate-800 shadow-md border-2 border-gray-100 mb-2 overflow-hidden">
                            {match.away_team?.logo_url ? (
                                <img src={match.away_team.logo_url} alt={match.away_team.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                match.away_team?.short_name || 'AWAY'
                            )}
                        </div>
                        <span className="text-xs font-black text-gray-900 text-center leading-tight">
                            {match.away_team?.name}
                        </span>
                    </div>

                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 mb-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 px-3 text-center text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                            activeTab === tab.id
                                ? 'border-brand-500 text-brand-600 font-extrabold'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab 1: Ringkasan Matchday */}
            {activeTab === 'matchday' && (
                <div className="space-y-3">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-xs space-y-2">
                        <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-semibold">Tanggal & Waktu</span>
                            <span className="font-bold text-gray-900">
                                {new Date(match.match_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-50">
                            <span className="text-gray-400 font-semibold">Lokasi Venue</span>
                            <span className="font-bold text-gray-900">{match.venue}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-400 font-semibold">Status Laga</span>
                            <span className="font-bold text-brand-600 uppercase">{match.status}</span>
                        </div>
                    </div>

                    {/* Best Player Card Preview */}
                    {match.best_player && (
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Award className="w-8 h-8 text-amber-200" />
                                <div>
                                    <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest block">MAN OF THE MATCH</span>
                                    <h4 className="text-sm font-black">{match.best_player.name} (#{match.best_player.jersey_number})</h4>
                                </div>
                            </div>
                            <span className="text-xl font-black bg-white/20 px-3 py-1 rounded-xl">★ {match.best_player_rating || 8.5}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Kejadian / Match Events */}
            {activeTab === 'events' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Timeline Kejadian Live</h3>
                    {match.events && match.events.length > 0 ? (
                        <div className="space-y-2">
                            {match.events.map((ev) => (
                                <div key={ev.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-black text-brand-600 w-6">{ev.minute}'</span>
                                        <span className="font-bold text-gray-900">
                                            {ev.event_type === 'goal' && '⚽ GOL'}
                                            {ev.event_type === 'yellow_card' && '🟨 Kartu Kuning'}
                                            {ev.event_type === 'red_card' && '🟥 Kartu Merah'}
                                            {ev.event_type === 'substitution_in' && '🔄 Substitusi'}
                                            {ev.event_type === 'own_goal' && '⚠️ Gol Bunuh Diri'}
                                        </span>
                                        <span className="text-gray-600">{ev.player?.name}</span>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase">{ev.team?.short_name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-4">Belum ada kejadian tercatat di pertandingan ini.</p>
                    )}
                </div>
            )}

            {/* Tab 3: Statistik Pertandingan */}
            {activeTab === 'stats' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3 text-xs">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Statistik Tim</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between font-bold mb-1">
                                <span>{match.home_score}</span>
                                <span className="text-gray-400">Total Gol</span>
                                <span>{match.away_score}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                                <div className="bg-brand-500 h-full" style={{ width: `${(match.home_score / Math.max(1, match.home_score + match.away_score)) * 100}%` }}></div>
                                <div className="bg-slate-400 h-full" style={{ width: `${(match.away_score / Math.max(1, match.home_score + match.away_score)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Lineups */}
            {activeTab === 'lineups' && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-xs">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Susunan Pemain</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-brand-600 mb-2 border-b pb-1">{match.home_team?.name}</h4>
                            <p className="text-gray-400 text-[11px]">Daftar Skuad Resmi</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-600 mb-2 border-b pb-1">{match.away_team?.name}</h4>
                            <p className="text-gray-400 text-[11px]">Daftar Skuad Resmi</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 5: MOTM */}
            {activeTab === 'motm' && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                    {match.best_player ? (
                        <div>
                            <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                            <h3 className="text-base font-black text-gray-900">{match.best_player.name}</h3>
                            <p className="text-xs font-bold text-brand-600 mb-2">#{match.best_player.jersey_number} - {match.best_player.position}</p>
                            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-black px-4 py-1 rounded-full">
                                RATING MATCH: ★ {match.best_player_rating || 8.5}
                            </span>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 py-6">Pemain Terbaik (MOTM) belum ditetapkan untuk pertandingan ini.</p>
                    )}
                </div>
            )}

        </MobileLayout>
    );
}
