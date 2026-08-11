import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Award, ShieldAlert } from 'lucide-react';

export default function TimelineEvent({ event }) {
    const isGoal = event.event_type === 'goal' || event.event_type === 'own_goal';
    const isYellow = event.event_type === 'yellow_card';
    const isRed = event.event_type === 'red_card';
    const isSubIn = event.event_type === 'substitution_in';
    const isSubOut = event.event_type === 'substitution_out';

    return (
        <div className="flex items-start space-x-3 py-2.5 border-b border-gray-100 last:border-0 text-xs">
            
            {/* Minute */}
            <div className="w-8 text-right font-black text-gray-400 pt-0.5">
                {event.minute}'
            </div>

            {/* Event Icon Badge */}
            <div className="pt-0.5">
                {isGoal && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        ⚽
                    </div>
                )}
                {isYellow && (
                    <div className="w-5 h-6 rounded bg-amber-400 shadow-sm border border-amber-500" />
                )}
                {isRed && (
                    <div className="w-5 h-6 rounded bg-red-600 shadow-sm border border-red-700" />
                )}
                {isSubIn && (
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4" />
                    </div>
                )}
                {isSubOut && (
                    <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div className="flex-1">
                {isGoal && (
                    <div>
                        <span className="font-bold text-gray-900 block">{event.player?.name}</span>
                        <span className="text-[11px] text-gray-500 font-medium">
                            {event.event_type === 'own_goal' ? 'Gol Bunuh Diri' : `Gol (${event.team?.name})`}
                        </span>
                    </div>
                )}

                {isYellow && (
                    <div>
                        <span className="font-bold text-gray-900 block">{event.player?.name}</span>
                        <span className="text-[11px] text-amber-600 font-semibold">Kartu Kuning</span>
                    </div>
                )}

                {isRed && (
                    <div>
                        <span className="font-bold text-gray-900 block">{event.player?.name}</span>
                        <span className="text-[11px] text-red-600 font-bold">Kartu Merah</span>
                    </div>
                )}

                {(isSubIn || isSubOut) && (
                    <div>
                        <span className="font-bold text-gray-900 block">In: {event.player?.name}</span>
                        {event.related_player && (
                            <span className="text-[11px] text-gray-400 block font-medium">
                                Out: {event.related_player?.name}
                            </span>
                        )}
                    </div>
                )}

                {event.extra_info && (
                    <p className="text-[10px] text-gray-400 italic mt-0.5">{event.extra_info}</p>
                )}
            </div>

        </div>
    );
}
