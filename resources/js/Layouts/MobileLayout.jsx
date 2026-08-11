import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Trophy, Award, Star, Search, Bell, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout({ children }) {
    const { url } = usePage();

    const navItems = [
        { label: 'Score', icon: Activity, href: '/', active: url === '/' || url.startsWith('/match') },
        { label: 'Pemain', icon: Award, href: '/players', active: url.startsWith('/players') },
        { label: 'Klasemen', icon: Trophy, href: '/standings', active: url.startsWith('/standings') },
        { label: 'Favorit', icon: Star, href: '/favorites', active: url.startsWith('/favorites') },
        { label: 'About', icon: Info, href: '/about', active: url.startsWith('/about') },
    ];

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex justify-center selection:bg-brand-500 selection:text-white">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative pb-24 overflow-x-hidden">
                
                {/* Top Header with RS LIVASYA Official Logo */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <motion.img
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            src="/images/logo-livasya.png"
                            alt="RS LIVASYA"
                            className="w-9 h-9 object-contain drop-shadow-sm cursor-pointer"
                        />
                        <div>
                            <h1 className="text-base font-black tracking-tight text-gray-900 leading-tight">
                                RS LIVASYA <span className="text-brand-500 text-[10px] font-bold uppercase tracking-wider block">Futsal Livescore</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-live rounded-full animate-ping"></span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-live rounded-full"></span>
                        </motion.button>
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
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2 z-50 flex justify-around items-center shadow-lg">
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
                                            : 'text-gray-400 hover:text-gray-600 font-medium'
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
