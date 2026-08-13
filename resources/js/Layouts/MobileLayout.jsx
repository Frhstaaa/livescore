import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Trophy, Award, Star, Search, Activity, Info, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout({ children }) {
    const { url } = usePage();

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const navItems = [
        { label: 'Score', icon: Activity, href: '/', active: url === '/' || url.startsWith('/match') },
        { label: 'Pemain', icon: Award, href: '/players', active: url.startsWith('/players') },
        { label: 'Klasemen', icon: Trophy, href: '/standings', active: url.startsWith('/standings') },
        { label: 'Favorit', icon: Star, href: '/favorites', active: url.startsWith('/favorites') },
        { label: 'Event', icon: Newspaper, href: '/events', active: url.startsWith('/events') },
    ];

    return (
        <div className={`min-h-screen flex justify-center selection:bg-brand-500 selection:text-white transition-colors duration-300 ${
            darkMode ? 'bg-slate-950 dark' : 'bg-[#F5F6FA]'
        }`}>
            {/* Mobile Container wrapper */}
            <div className={`w-full max-w-md min-h-screen shadow-2xl flex flex-col relative pb-24 overflow-x-hidden transition-colors duration-300 ${
                darkMode ? 'bg-slate-900 text-slate-100 dark' : 'bg-white text-gray-900'
            }`}>
                
                {/* Top Header with RS LIVASYA Official Logo & About Info Link */}
                <header className={`sticky top-0 z-40 backdrop-blur-md px-4 py-3 border-b flex items-center justify-between transition-colors duration-300 ${
                    darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'
                }`}>
                    <div className="flex items-center space-x-2.5">
                        <motion.img
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            src="/images/logo-livasya.png"
                            alt="RS LIVASYA"
                            className="w-9 h-9 object-contain drop-shadow-sm cursor-pointer"
                        />
                        <div>
                            <h1 className={`text-base font-black tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                RS LIVASYA <span className="text-brand-500 text-[10px] font-bold uppercase tracking-wider block">Futsal Livescore</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className={`p-2 rounded-full transition-colors ${
                                darkMode ? 'text-slate-400 hover:text-brand-500 hover:bg-slate-800' : 'text-gray-500 hover:text-brand-500 hover:bg-brand-50'
                            }`}
                        >
                            <Search className="w-5 h-5" />
                        </motion.button>
                        
                        {/* Header Info (i) button linking to About page */}
                        <Link href="/about" title="Tentang Turnamen & Venue">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                                    url.startsWith('/about')
                                        ? 'bg-brand-500 text-white shadow-md'
                                        : darkMode 
                                            ? 'text-slate-400 hover:text-brand-400 hover:bg-slate-800' 
                                            : 'text-gray-500 hover:text-brand-500 hover:bg-brand-50'
                                }`}
                            >
                                <Info className="w-5 h-5" />
                            </motion.div>
                        </Link>
                    </div>
                </header>

                {/* Page Content with Framer Motion Animated Transition */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={url}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 px-4 py-3"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>

                {/* Bottom Navigation Bar */}
                <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur-md border-t px-3 py-2 z-50 flex justify-around items-center shadow-lg transition-colors duration-300 ${
                    darkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-gray-100'
                }`}>
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className="relative py-1 px-3 flex flex-col items-center"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    className={`flex flex-col items-center transition-colors duration-200 ${
                                        item.active
                                            ? 'text-brand-500 font-bold'
                                            : darkMode ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-gray-400 hover:text-gray-600 font-medium'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                    <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
                                </motion.div>

                                {/* Sliding Active Tab Pill Indicator */}
                                {item.active && (
                                    <motion.div
                                        layoutId="activeNavPill"
                                        className="absolute -bottom-1 w-6 h-1 bg-brand-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

            </div>
        </div>
    );
}
