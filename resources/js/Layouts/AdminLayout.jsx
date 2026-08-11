import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Radio, Trophy, Users, UserPlus, Calendar, HeartHandshake, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children, title }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navs = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { label: 'Pengaturan Turnamen', icon: Trophy, href: '/admin/competitions' },
        { label: 'Live Control', icon: Radio, href: '/admin/live' },
        { label: 'Kelola Tim', icon: Users, href: '/admin/teams' },
        { label: 'Kelola Pemain', icon: UserPlus, href: '/admin/players' },
        { label: 'Jadwal Match', icon: Calendar, href: '/admin/matches' },
        { label: 'Sponsor & About', icon: HeartHandshake, href: '/admin/sponsors' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans selection:bg-brand-500 selection:text-white">
            
            {/* Desktop Sidebar (Visible on md and larger) */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col min-h-screen shrink-0 sticky top-0 h-screen">
                <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                    <img
                        src="/images/logo-livasya.png"
                        alt="RS LIVASYA"
                        className="w-10 h-10 object-contain bg-white/10 p-1.5 rounded-xl border border-white/10 shadow-sm"
                    />
                    <div>
                        <h2 className="font-black text-white leading-tight tracking-tight">PANEL ADMIN</h2>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wider">RS LIVASYA FUTSAL</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                    {navs.map((n, i) => {
                        const Icon = n.icon;
                        const active = url.startsWith(n.href);
                        return (
                            <Link
                                key={i}
                                href={n.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs ${
                                    active
                                        ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{n.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {user?.name ? user.name[0] : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin Livasya'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Login</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Drawer Sidebar overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer Content */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-100 flex flex-col h-full z-10 shadow-2xl"
                        >
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src="/images/logo-livasya.png"
                                        alt="RS LIVASYA"
                                        className="w-9 h-9 object-contain bg-white/10 p-1 rounded-xl"
                                    />
                                    <div>
                                        <h2 className="font-black text-white text-sm">PANEL ADMIN</h2>
                                        <p className="text-[10px] text-slate-400 font-bold">RS LIVASYA FUTSAL</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                                {navs.map((n, i) => {
                                    const Icon = n.icon;
                                    const active = url.startsWith(n.href);
                                    return (
                                        <Link
                                            key={i}
                                            href={n.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-semibold text-xs ${
                                                active
                                                    ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{n.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-800">
                                <div className="flex items-center space-x-3 mb-3 px-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                                        {user?.name ? user.name[0] : 'A'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/admin/logout"
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2.5 rounded-xl text-xs font-bold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Keluar Login</span>
                                </Link>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Navbar */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-brand-500 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle Navigation Menu"
                        >
                            <Menu className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight leading-tight truncate">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            ● Server Ready
                        </span>
                        <Link
                            href="/"
                            target="_blank"
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl border border-brand-200 transition-all flex items-center space-x-1"
                        >
                            <span className="hidden xs:inline">Lihat Halaman Publik</span>
                            <span className="xs:hidden">Publik</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                    </div>
                </header>

                {/* Main Page Area */}
                <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

        </div>
    );
}
