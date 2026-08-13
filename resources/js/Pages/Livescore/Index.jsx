import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import CategoryChips from '@/Components/CategoryChips';
import DateSelector from '@/Components/DateSelector';
import MatchCard from '@/Components/MatchCard';
import { ChevronRight, CalendarX } from 'lucide-react';

export default function LivescoreIndex({ matches, selectedDate, competitions, selectedCompetitionId }) {

    // Auto refresh data every 5 seconds for live updates
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveScroll: true, preserveState: true });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Group matches by competition name
    const grouped = matches.reduce((acc, m) => {
        const compName = m.competition?.name || 'Turnamen Futsal';
        if (!acc[compName]) acc[compName] = [];
        acc[compName].push(m);
        return acc;
    }, {});

    return (
        <MobileLayout>
            {/* Category Chips Horizontal Slider */}
            <CategoryChips competitions={competitions} selectedId={selectedCompetitionId} />

            {/* Date Selector Slider */}
            <DateSelector selectedDate={selectedDate} />

            {/* Match List Grouped by Competition */}
            {Object.keys(grouped).length > 0 ? (
                Object.entries(grouped).map(([compName, matchGroup], idx) => (
                    <div key={idx} className="mb-5">
                        <div className="flex items-center justify-between py-2 mb-1 px-1">
                            <h3 className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase tracking-wider flex items-center">
                                <span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>
                                {compName}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>

                        {matchGroup.map((match) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                ))
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/60 text-center my-6 shadow-sm">
                    <CalendarX className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Tidak Ada Pertandingan</h4>
                    <p className="text-xs text-gray-400 dark:text-slate-400">Belum ada jadwal pertandingan pada tanggal ini.</p>
                </div>
            )}
        </MobileLayout>
    );
}
