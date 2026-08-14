import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Shuffle, Users, CheckCircle, Clock } from 'lucide-react';

export default function Index({ registrants, competitions, filters }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        competition_id: filters.competition_id || (competitions.length > 0 ? competitions[0].id : ''),
        teams_count: 2,
    });

    const handleFilterChange = (e) => {
        router.get(route('admin.registrants.index'), { competition_id: e.target.value }, { preserveState: true });
        setData('competition_id', e.target.value);
    };

    const handleRandomize = (e) => {
        e.preventDefault();
        post(route('admin.registrants.randomize'), {
            onSuccess: () => setShowModal(false),
        });
    };

    const pendingCount = registrants.filter(r => r.status === 'pending').length;

    return (
        <AdminLayout>
            <Head title="Manajemen Pendaftar" />

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Pendaftar Individu</h1>
                    <p className="text-zinc-400 text-sm mt-1">Kelola pemain yang mendaftar dan bentuk tim otomatis.</p>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <select
                        className="bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 px-4 py-2"
                        value={filters.competition_id || ''}
                        onChange={handleFilterChange}
                    >
                        {competitions.map(comp => (
                            <option key={comp.id} value={comp.id}>
                                {comp.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowModal(true)}
                        disabled={pendingCount < 2}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Shuffle size={16} />
                        Acak ke Tim
                    </button>
                </div>
            </div>

            {flash.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {flash.error}
                </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="text-xs uppercase bg-zinc-800/50 text-zinc-300">
                            <tr>
                                <th className="px-6 py-4">Nama Pendaftar</th>
                                <th className="px-6 py-4">No. HP</th>
                                <th className="px-6 py-4">Posisi</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tanggal Daftar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrants.length > 0 ? (
                                registrants.map(registrant => (
                                    <tr key={registrant.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {registrant.name}
                                        </td>
                                        <td className="px-6 py-4">{registrant.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs border border-zinc-700">
                                                {registrant.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {registrant.status === 'assigned' ? (
                                                <span className="flex items-center gap-1 text-emerald-400">
                                                    <CheckCircle size={14} /> Assigned
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-400">
                                                    <Clock size={14} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(registrant.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                                        Belum ada pendaftar di turnamen ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Randomize */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">Acak Pendaftar ke Tim</h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                Saat ini ada <strong className="text-emerald-400">{pendingCount}</strong> pendaftar berstatus pending.
                            </p>

                            <form onSubmit={handleRandomize}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Jumlah Tim yang Akan Dibentuk
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        value={data.teams_count}
                                        onChange={e => setData('teams_count', e.target.value)}
                                        required
                                    />
                                    {errors.teams_count && (
                                        <p className="mt-1 text-sm text-red-500">{errors.teams_count}</p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : 'Mulai Acak'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
