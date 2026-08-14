import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Trophy, Award, Star, Search, Activity, Info, Newspaper, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileLayout({ children }) {
    const { url } = usePage();

    useEffect(() => {
        // Enforce pure Light Mode
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, []);

    const navItems = [
        { label: 'Score', icon: Activity, href: '/', active: url === '/' || url.startsWith('/match') },
        { label: 'Pemain', icon: Award, href: '/players', active: url.startsWith('/players') },
        { label: 'Klasemen', icon: Trophy, href: '/standings', active: url.startsWith('/standings') },
        { label: 'Favorit', icon: Star, href: '/favorites', active: url.startsWith('/favorites') },
        { label: 'Event', icon: Newspaper, href: '/events', active: url.startsWith('/events') },
    ];

    return (
        <div className="min-h-screen flex justify-center bg-[#F5F6FA] selection:bg-brand-500 selection:text-white transition-colors duration-200">
            {/* Mobile Container wrapper */}
            <div className="w-full max-w-md min-h-screen bg-white text-gray-900 shadow-2xl flex flex-col relative pb-24 overflow-x-hidden">
                
                {/* Top Header with RS LIVASYA Official Logo & Action Links */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between transition-colors duration-200">
                    <div className="flex items-center space-x-2.5">
                        <motion.img
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            src="/images/logo-livasya.png"
                            alt="RS LIVASYA"
                            className="w-9 h-9 object-contain drop-shadow-sm cursor-pointer"
                        />
                        <div>
                            <h1 className="text-base font-black tracking-tight leading-tight text-gray-900">
                                RS LIVASYA <span className="text-brand-500 text-[10px] font-bold uppercase tracking-wider block">Futsal Livescore</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full transition-colors text-gray-500 hover:text-brand-500 hover:bg-brand-50"
                        >
                            <Search className="w-5 h-5" />
                        </motion.button>
                        
                        {/* Header Registration link button */}
                        <Link href="/register" title="Pendaftaran Pemain">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                                    url.startsWith('/register')
                                        ? 'bg-brand-500 text-white shadow-md'
                                        : 'text-gray-500 hover:text-brand-500 hover:bg-brand-50'
                                }`}
                            >
                                <UserPlus className="w-5 h-5" />
                            </motion.div>
                        </Link>

                        {/* Header Info (i) button linking to About page */}
                        <Link href="/about" title="Tentang Turnamen & Venue">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                                    url.startsWith('/about')
                                        ? 'bg-brand-500 text-white shadow-md'
                                        : 'text-gray-500 hover:text-brand-500 hover:bg-brand-50'
                                }`}
                            >
                                <Info className="w-5 h-5" />
                            </motion.div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-4 py-3">
                    {children}
                </main>

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-1.5 z-50 flex justify-around items-center shadow-lg">
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                preserveState={false}
                                className={`relative py-1.5 px-2 flex-1 flex flex-col items-center justify-center rounded-xl transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                                    item.active
                                        ? 'text-brand-500 font-black'
                                        : 'text-gray-400 hover:text-gray-600 font-medium hover:bg-gray-50'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>

                                {/* Active Tab Pill Indicator */}
                                {item.active && (
                                    <span className="absolute bottom-0 w-6 h-1 bg-brand-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

            </div>
        </div>
    );
}
