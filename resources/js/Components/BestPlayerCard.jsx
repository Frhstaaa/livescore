import React from 'react';
import { Star, Award } from 'lucide-react';

export default function BestPlayerCard({ player, rating }) {
    if (!player) return null;

    return (
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg mb-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-black text-lg border-2 border-white/20 overflow-hidden">
                        {player.photo_url ? (
                            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            player.name[0]
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-0.5">
                        <Award className="w-3.5 h-3.5" />
                    </div>
                </div>

                <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        BEST PLAYER / MOTM
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">{player.name}</h4>
                    <p className="text-xs text-gray-300 font-medium">{player.team?.name}</p>
                </div>
            </div>

            <div className="bg-brand-500 text-white px-3 py-1.5 rounded-full font-black text-xs flex items-center space-x-1 shadow-md">
                <span>{rating ? rating : '8.5'}</span>
                <Star className="w-3.5 h-3.5 fill-white" />
            </div>
        </div>
    );
}
