import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Users, UserCheck, Radio, Calendar, Flame, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard({ stats, recentMatches }) {
    return (
        <AdminLayout title="Dashboard Overview">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Tim</span>
                        <span className="text-2xl font-black text-gray-900">{stats.totalTeams}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Pemain</span>
                        <span className="text-2xl font-black text-gray-900">{stats.totalPlayers}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Match Live</span>
                        <span className="text-2xl font-black text-live">{stats.liveMatches}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-live-soft text-live animate-pulse flex items-center justify-center">
                        <Radio className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Jadwal Mendatang</span>
                        <span className="text-2xl font-black text-gray-900">{stats.upcomingMatches}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                    </div>
                </div>

            </div>

            {/* Live Control Quick Access Card */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-white/20 uppercase tracking-wider mb-2">
                        <Flame className="w-3.5 h-3.5 mr-1" /> Realtime Operator Mode
                    </span>
                    <h3 className="text-xl font-black">Live Match Control Panel</h3>
                    <p className="text-xs text-brand-100 mt-1">Input skor live, menit berjalan, gol, kartu, dan Man of the Match secara instan.</p>
                </div>
                <Link
                    href="/admin/live"
                    className="bg-white text-brand-600 hover:bg-brand-50 font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition-all flex items-center space-x-2"
                >
                    <span>Buka Control Panel Live</span>
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Recent Matches Table */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Pertandingan Terbaru</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Match</th>
                                <th className="py-3 px-4">Tanggal</th>
                                <th className="py-3 px-4 text-center">Skor</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentMatches?.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-bold text-gray-900">
                                        {m.home_team?.name} vs {m.away_team?.name}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">
                                        {new Date(m.match_date).toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-3 px-4 text-center font-black text-sm">
                                        {m.home_score} - {m.away_score}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                            m.status === 'live' ? 'bg-live-soft text-live animate-pulse' :
                                            m.status === 'full_time' ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={`/admin/live?match_id=${m.id}`}
                                            className="text-xs font-bold text-brand-500 hover:underline"
                                        >
                                            Kelola Live →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </AdminLayout>
    );
}
