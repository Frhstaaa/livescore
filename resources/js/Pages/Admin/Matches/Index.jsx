import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Calendar, Trash2, Radio } from 'lucide-react';

export default function AdminMatches({ matches, competitions, teams }) {
    const { data, setData, post, delete: destroy, reset, errors } = useForm({
        competition_id: competitions && competitions.length > 0 ? competitions[0].id : '',
        home_team_id: teams && teams.length > 0 ? teams[0].id : '',
        away_team_id: teams && teams.length > 1 ? teams[1].id : '',
        match_date: new Date().toISOString().slice(0, 16),
        venue: 'GOR Futsal RS LIVASYA',
        round: 'Babak Penyisihan',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/matches', {
            onSuccess: () => reset()
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus jadwal pertandingan ini?')) {
            destroy(`/admin/matches/${id}`);
        }
    };

    return (
        <AdminLayout title="Kelola Jadwal Pertandingan">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Add Schedule */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Tambah Jadwal Pertandingan</h3>

                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Turnamen / Kompetisi</label>
                            <select
                                value={data.competition_id}
                                onChange={(e) => setData('competition_id', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                required
                            >
                                {competitions?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Tim Home (Tim A)</label>
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
                            <label className="block font-bold text-gray-700 mb-1">Tim Away (Tim B)</label>
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
                            {errors.home_team_id && <span className="text-red-500 text-[10px] mt-1 block">{errors.home_team_id}</span>}
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Tanggal & Waktu Kick-off</label>
                            <input
                                type="datetime-local"
                                value={data.match_date}
                                onChange={(e) => setData('match_date', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Venue / Lokasi</label>
                            <input
                                type="text"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-bold text-gray-700 mb-1">Babak / Fase / Round</label>
                            <input
                                type="text"
                                value={data.round}
                                onChange={(e) => setData('round', e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Grup A - Matchday 1"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs"
                        >
                            + Buat Jadwal Match
                        </button>
                    </form>
                </div>

                {/* Match Schedule Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Daftar Jadwal Match</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                                    <th className="py-3 px-4">Match</th>
                                    <th className="py-3 px-4">Waktu Kick-off</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {matches?.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            <div>
                                                <span>{m.home_team?.name} vs {m.away_team?.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium block">{m.round}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 font-medium">
                                            {new Date(m.match_date).toLocaleString('id-ID')}
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
                                                onClick={() => handleDelete(m.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
        </AdminLayout>
    );
}
