import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Trophy, Award, Star, Search, Bell, Activity, Info } from 'lucide-react';

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
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative pb-24">
                
                {/* Top Header with RS LIVASYA Official Logo */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                        <img
                            src="/images/logo-livasya.png"
                            alt="RS LIVASYA"
                            className="w-9 h-9 object-contain drop-shadow-sm"
                        />
                        <div>
                            <h1 className="text-base font-black tracking-tight text-gray-900 leading-tight">
                                RS LIVASYA <span className="text-brand-500 text-[10px] font-bold uppercase tracking-wider block">Futsal Livescore</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-live rounded-full animate-ping"></span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-live rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 px-4 py-3">
                    {children}
                </main>

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 py-2 z-50 flex justify-around items-center shadow-lg">
                    {navItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                                    item.active
                                        ? 'text-brand-500 font-bold scale-105'
                                        : 'text-gray-400 hover:text-gray-600 font-medium'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

            </div>
        </div>
    );
}
