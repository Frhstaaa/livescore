import React, { useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoryChips({ competitions, selectedId }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const scrollRef = useRef(null);

    const handleSelect = (compKey = null) => {
        const params = compKey ? { competition_id: compKey } : {};
        router.get(currentPath, params, { preserveState: true, preserveScroll: true });
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -180 : 180;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative flex items-center my-1 group">
            {/* Scroll Left Button */}
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => scroll('left')}
                className="hidden group-hover:flex md:flex absolute left-0 z-10 w-7 h-7 bg-white/90 shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600 hover:text-brand-500 hover:scale-110 transition-all -ml-2"
                title="Scroll Kiri"
            >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
            </motion.button>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex items-center space-x-2 overflow-x-auto scroll-smooth no-scrollbar touch-pan-x py-2 px-1 w-full select-none"
            >
                <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm shrink-0 active:scale-95 ${
                        !selectedId
                            ? 'bg-brand-500 text-white shadow-brand-500/30'
                            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                    }`}
                >
                    ⚽ Semua Futsal
                </button>

                {competitions?.map((comp) => {
                    const isActive = selectedId == comp.id;
                    return (
                        <button
                            key={comp.id}
                            type="button"
                            onClick={() => handleSelect(comp.id)}
                            className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm shrink-0 active:scale-95 ${
                                isActive
                                    ? 'bg-brand-500 text-white shadow-brand-500/30'
                                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            🏆 {comp.name}
                        </button>
                    );
                })}
            </div>

            {/* Scroll Right Button */}
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => scroll('right')}
                className="hidden group-hover:flex md:flex absolute right-0 z-10 w-7 h-7 bg-white/90 shadow-md border border-gray-200 rounded-full items-center justify-center text-gray-600 hover:text-brand-500 hover:scale-110 transition-all -mr-2"
                title="Scroll Kanan"
            >
                <ChevronRight className="w-4 h-4 stroke-[3]" />
            </motion.button>
        </div>
    );
}
