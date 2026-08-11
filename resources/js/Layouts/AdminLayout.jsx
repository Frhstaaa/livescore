import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Radio, Trophy, Users, UserPlus, Calendar, HeartHandshake, LogOut } from 'lucide-react';

export default function AdminLayout({ children, title }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

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
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen">
                <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                    <img
                        src="/images/logo-livasya.png"
                        alt="RS LIVASYA"
                        className="w-10 h-10 object-contain bg-white/10 p-1.5 rounded-xl border border-white/10 shadow-sm"
                    />
                    <div>
                        <h2 className="font-bold text-white leading-tight">PANEL ADMIN</h2>
                        <p className="text-xs text-slate-400">RS LIVASYA FUTSAL</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navs.map((n, i) => {
                        const Icon = n.icon;
                        const active = url.startsWith(n.href);
                        return (
                            <Link
                                key={i}
                                href={n.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                                    active
                                        ? 'bg-brand-500 text-white font-semibold shadow-md shadow-brand-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{n.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 mb-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                            {user?.name ? user.name[0] : 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2 rounded-xl text-xs font-semibold transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Login</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                    <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            ● Server Ready
                        </span>
                        <Link href="/" target="_blank" className="text-xs font-semibold text-brand-500 hover:underline">
                            Lihat Halaman Publik ↗
                        </Link>
                    </div>
                </header>

                <main className="p-6 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
