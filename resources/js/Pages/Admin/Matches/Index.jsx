import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm } from '@inertiajs/react';
import { Calendar, Plus, Trash2, Clock, MapPin, Radio } from 'lucide-react';

export default function AdminMatches({ matches, competitions, teams }) {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, desc: '' });

    const { data, setData, post, delete: destroy, reset, errors } = useForm({
        competition_id: competitions[0] ? competitions[0].id : '',
        home_team_id: teams[0] ? teams[0].id : '',
        away_team_id: teams[1] ? teams[1].id : '',
        round: 'Penyisihan Grup',
        venue: 'Rama Futsall Kadipaten',
        match_date: new Date().toISOString().slice(0, 16),
        status: 'scheduled',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/matches', {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (m) => {
        const desc = `${m.home_team?.name || 'Home'} vs ${m.away_team?.name || 'Away'}`;
        setDeleteModal({ isOpen: true, id: m.id, desc });
    };

    const confirmDeleteMatch = () => {
        if (!deleteModal.id) return;
        destroy(`/admin/matches/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, desc: '' })
        });
    };

    return (
        <AdminLayout title="Jadwal Match & Pertandingan">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Create Match */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 text-brand-500 mr-2" />
                        Buat Jadwal Match Baru
                    </h3>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Turnamen / Kompetisi</label>
                            <select
                                value={data.competition_id}
                                onChange={(e) => setData('competition_id', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            >
                                {competitions?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Tim Tuan Rumah (Home)</label>
                                <select
                                    value={data.home_team_id}
                                    onChange={(e) => setData('home_team_id', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    required
                                >
                                    {teams?.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Tim Tamu (Away)</label>
                                <select
                                    value={data.away_team_id}
                                    onChange={(e) => setData('away_team_id', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    required
                                >
                                    {teams?.map((t) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Babak / Round</label>
                            <input
                                type="text"
                                value={data.round}
                                onChange={(e) => setData('round', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                placeholder="Matchday 1 / Babak 8 Besar"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Tanggal & Waktu Kick-Off</label>
                            <input
                                type="datetime-local"
                                value={data.match_date}
                                onChange={(e) => setData('match_date', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Lokasi Venue</label>
                            <input
                                type="text"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                        >
                            + Jadwalkan Pertandingan
                        </button>
                    </form>
                </div>

                {/* Match List Table & Mobile Cards */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Pertandingan Futsal</h3>

                    {/* Mobile Cards (< md) */}
                    <div className="block md:hidden space-y-3">
                        {matches?.map((m) => (
                            <div key={m.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-2 text-xs">
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                    <span>{m.competition?.name}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full font-black ${
                                        m.status === 'live' ? 'bg-live-soft text-live animate-pulse' :
                                        m.status === 'full_time' ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600'
                                    }`}>
                                        {m.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between font-black text-sm text-gray-900 py-1">
                                    <span className="w-5/12 text-left truncate">{m.home_team?.name}</span>
                                    <span className="w-2/12 text-center text-brand-600">
                                        {m.status === 'scheduled' ? 'VS' : `${m.home_score} - ${m.away_score}`}
                                    </span>
                                    <span className="w-5/12 text-right truncate">{m.away_team?.name}</span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold pt-2 border-t border-gray-200/60">
                                    <span>⏱️ {new Date(m.match_date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    <button
                                        onClick={() => handleDelete(m)}
                                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Matchday & Tanggal</th>
                                    <th className="py-3 px-4 text-center">Pertandingan</th>
                                    <th className="py-3 px-3 text-center">Skor</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {matches?.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            <div>
                                                <span>{m.round}</span>
                                                <span className="text-[10px] text-gray-400 font-medium block">
                                                    {new Date(m.match_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                                            {m.home_team?.name} VS {m.away_team?.name}
                                        </td>
                                        <td className="py-3 px-3 text-center font-black text-brand-600">
                                            {m.status === 'scheduled' ? '-' : `${m.home_score} - ${m.away_score}`}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                m.status === 'live' ? 'bg-live-soft text-live animate-pulse' :
                                                m.status === 'full_time' ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600'
                                            }`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleDelete(m)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus Jadwal Match"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Jadwal Pertandingan"
                message={`Apakah Anda yakin ingin menghapus jadwal pertandingan "${deleteModal.desc}"? Seluruh data event dan live control match ini akan ikut terhapus.`}
                confirmText="Ya, Hapus Match"
                onConfirm={confirmDeleteMatch}
                onClose={() => setDeleteModal({ isOpen: false, id: null, desc: '' })}
            />
        </AdminLayout>
    );
}
