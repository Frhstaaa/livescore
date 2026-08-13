import React from 'react';
import { router } from '@inertiajs/react';

export default function DateSelector({ selectedDate }) {
    // Generate dates: 2 days before, today, 2 days after
    const dates = [];
    const today = new Date();

    for (let i = -2; i <= 2; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;

        let dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        if (i === 0) dayName = 'Hari Ini';

        const dayNum = d.getDate();
        const monthShort = d.toLocaleDateString('id-ID', { month: 'short' });

        dates.push({
            iso,
            dayName,
            formatted: `${dayNum} ${monthShort}`,
            isToday: i === 0,
        });
    }

    return (
        <div className="flex justify-between items-center py-2 px-1 border-b border-gray-100 dark:border-slate-800 mb-3">
            {dates.map((item, idx) => {
                const isActive = selectedDate === item.iso;
                return (
                    <button
                        key={idx}
                        onClick={() => router.get('/', { date: item.iso }, { preserveState: true })}
                        className={`flex flex-col items-center px-3 py-1.5 rounded-xl transition-all duration-200 ${
                            isActive
                                ? 'text-brand-500 font-bold bg-brand-50 dark:bg-brand-500/10'
                                : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'
                        }`}
                    >
                        <span className={`text-[11px] font-medium ${isActive ? 'text-brand-500 font-bold' : ''}`}>
                            {item.dayName}
                        </span>
                        <span className={`text-xs ${isActive ? 'font-black text-brand-600 dark:text-brand-400' : 'font-semibold text-gray-700 dark:text-slate-300'}`}>
                            {item.formatted}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
