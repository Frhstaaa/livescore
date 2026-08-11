import React from 'react';
import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import LiveTimer from '@/Components/LiveTimer';
import { motion } from 'framer-motion';

export default function MatchCard({ match }) {
    const isLive = match.status === 'live' || match.status === 'half_time';
    const isFullTime = match.status === 'full_time';
    const isUpcoming = match.status === 'scheduled';

    // Format time if scheduled
    const kickoffTime = new Date(match.match_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
        >
            <Link
                href={`/match/${match.id}`}
                className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-card hover:shadow-md transition-all duration-200 mb-3 relative overflow-hidden group"
            >
                {/* Live Indicator Accent Bar */}
                {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-live via-brand-500 to-live animate-pulse" />
                )}

                <div className="flex items-center justify-between">
                    
                    {/* Teams & Scores */}
                    <div className="flex-1 pr-4 space-y-3">
                        
                        {/* Home Team */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-700 shadow-inner border border-gray-200 overflow-hidden shrink-0">
                                    {match.home_team?.logo_url ? (
                                        <img src={match.home_team.logo_url} alt={match.home_team.name} className="w-full h-full object-contain p-0.5" />
                                    ) : (
                                        match.home_team?.short_name || 'HOME'
                                    )}
                                </div>
                                <span className="text-sm font-bold text-gray-900 group-hover:text-brand-500 transition-colors">
                                    {match.home_team?.name}
                                </span>
                            </div>
                            <span className="text-base font-black text-gray-900">
                                {isUpcoming ? '-' : match.home_score}
                            </span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center font-bold text-xs text-slate-700 shadow-inner border border-gray-200 overflow-hidden shrink-0">
                                    {match.away_team?.logo_url ? (
                                        <img src={match.away_team.logo_url} alt={match.away_team.name} className="w-full h-full object-contain p-0.5" />
                                    ) : (
                                        match.away_team?.short_name || 'AWAY'
                                    )}
                                </div>
                                <span className="text-sm font-bold text-gray-900 group-hover:text-brand-500 transition-colors">
                                    {match.away_team?.name}
                                </span>
                            </div>
                            <span className="text-base font-black text-gray-900">
                                {isUpcoming ? '-' : match.away_score}
                            </span>
                        </div>

                    </div>

                    {/* Right Side: Status / Live Clock */}
                    <div className="flex flex-col items-end justify-center pl-3 border-l border-gray-100 min-w-[75px]">
                        {isLive && (
                            <div className="flex flex-col items-center">
                                <LiveTimer
                                    status={match.status}
                                    startedAt={match.started_at}
                                    pausedSeconds={match.paused_seconds}
                                    baseMinute={match.current_minute}
                                    showSeconds={true}
                                />
                                <span className="text-[10px] font-bold text-live uppercase tracking-wider mt-1">
                                    {match.status === 'half_time' ? 'HT' : 'LIVE'}
                                </span>
                            </div>
                        )}

                        {isFullTime && (
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-black text-gray-400 mb-1">FT</span>
                                <button className="text-gray-300 hover:text-brand-500 transition-colors p-1">
                                    <Bell className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {isUpcoming && (
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-900 mb-1">{kickoffTime}</span>
                                <button className="text-gray-400 hover:text-brand-500 transition-colors p-1">
                                    <Bell className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </Link>
        </motion.div>
    );
}
