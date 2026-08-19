import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Printer, ArrowLeft, Shield, Check, Filter, Calendar, Users, Award, FileText } from 'lucide-react';

export default function Print({ teams = [], selectedTeamId = null, competition = null, competitions = [], allTeamsList = [] }) {
    const [currentTeamId, setCurrentTeamId] = useState(selectedTeamId ? String(selectedTeamId) : '');
    const [currentCompId, setCurrentCompId] = useState(competition?.id ? String(competition.id) : '');
    const [showSignatures, setShowSignatures] = useState(true);
    const [showCheckInCol, setShowCheckInCol] = useState(true);
    const [showNotesCol, setShowNotesCol] = useState(true);

    const handleTeamChange = (e) => {
        const val = e.target.value;
        setCurrentTeamId(val);
        router.get('/admin/teams/print', {
            team_id: val || undefined,
            competition_id: currentCompId || undefined,
        }, { preserveState: true });
    };

    const handleCompChange = (e) => {
        const val = e.target.value;
        setCurrentCompId(val);
        router.get('/admin/teams/print', {
            team_id: currentTeamId || undefined,
            competition_id: val || undefined,
        }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const positionBadges = {
        GK: { label: 'Goalkeeper', icon: '🧤', text: 'GK' },
        Kiper: { label: 'Goalkeeper', icon: '🧤', text: 'GK' },
        Anchor: { label: 'Anchor', icon: '🛡️', text: 'Anchor (DEF)' },
        DEF: { label: 'Defender', icon: '🛡️', text: 'Defender' },
        Defender: { label: 'Defender', icon: '🛡️', text: 'Defender' },
        Flank: { label: 'Flank', icon: '⚡', text: 'Flank (MID)' },
        MID: { label: 'Midfielder', icon: '⚡', text: 'Midfielder' },
        Midfielder: { label: 'Midfielder', icon: '⚡', text: 'Midfielder' },
        Pivot: { label: 'Pivot', icon: '🎯', text: 'Pivot (FWD)' },
        FWD: { label: 'Forward', icon: '🎯', text: 'Forward' },
        Forward: { label: 'Forward', icon: '🎯', text: 'Forward' },
    };

    const printDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:text-black">
            <Head title={`Cetak Laporan Skuad Tim - ${competition?.name || 'Turnamen'}`} />

            {/* ======================================================== */}
            {/* 🖨️ TOP CONTROL TOOLBAR (Hidden when Printing)            */}
            {/* ======================================================== */}
            <header className="no-print sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b border-slate-800 px-4 py-3">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Left: Back & Title */}
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-brand-400" />
                                <span>Cetak Laporan Skuad & Pemain</span>
                            </h1>
                            <p className="text-[10px] text-slate-400">
                                Pratinjau cetak resmi A4 untuk lembar pertandingan atau arsip laporan.
                            </p>
                        </div>
                    </div>

                    {/* Middle: Filters & Options */}
                    <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
                        {/* Team Filter */}
                        <div className="flex items-center space-x-1">
                            <span className="text-[11px] font-bold text-slate-400">Tim:</span>
                            <select
                                value={currentTeamId}
                                onChange={handleTeamChange}
                                className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                            >
                                <option value="">Semua Tim ({allTeamsList.length} Tim)</option>
                                {allTeamsList.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.short_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Competition Filter */}
                        {competitions.length > 1 && (
                            <div className="flex items-center space-x-1">
                                <span className="text-[11px] font-bold text-slate-400">Turnamen:</span>
                                <select
                                    value={currentCompId}
                                    onChange={handleCompChange}
                                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                >
                                    {competitions.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Checkbox Options */}
                        <div className="hidden lg:flex items-center space-x-3 pl-2 border-l border-slate-800 text-[11px] font-semibold text-slate-300">
                            <label className="flex items-center space-x-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showCheckInCol}
                                    onChange={(e) => setShowCheckInCol(e.target.checked)}
                                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                                />
                                <span>Kolom Ceklis</span>
                            </label>

                            <label className="flex items-center space-x-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={showSignatures}
                                    onChange={(e) => setShowSignatures(e.target.checked)}
                                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                                />
                                <span>Tanda Tangan</span>
                            </label>
                        </div>
                    </div>

                    {/* Right: Print Action Button */}
                    <div className="w-full md:w-auto flex justify-end">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full md:w-auto px-5 py-2 bg-gradient-to-r from-brand-500 to-amber-400 hover:from-brand-600 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak / Simpan PDF Sekarang</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ======================================================== */}
            {/* 📄 PRINTABLE DOCUMENT AREA (A4 Container)                */}
            {/* ======================================================== */}
            <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-none space-y-8 print:space-y-0">
                {teams.length > 0 ? (
                    teams.map((team, tIdx) => {
                        const players = team.players || [];
                        const isLastTeam = tIdx === teams.length - 1;

                        return (
                            <section
                                key={team.id}
                                className={`bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-gray-200 print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:w-full ${
                                    !isLastTeam ? 'print:break-after-page' : ''
                                }`}
                                style={{ pageBreakAfter: !isLastTeam ? 'always' : 'auto' }}
                            >
                                {/* Document Header */}
                                <div className="border-b-2 border-slate-900 pb-4 mb-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3.5">
                                            {team.logo_url ? (
                                                <div className="w-16 h-16 rounded-2xl border border-gray-200 p-1 flex items-center justify-center bg-white shrink-0">
                                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shrink-0">
                                                    {team.short_name || team.name?.substring(0, 3)?.toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                                                    {team.name}
                                                </h2>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-0.5 flex-wrap">
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-black">
                                                        KODE: {team.short_name || '-'}
                                                    </span>
                                                    {team.coach_name && (
                                                        <span>• Pelatih / Official: <strong>{team.coach_name}</strong></span>
                                                    )}
                                                    <span>• Total Skuad: <strong>{players.length} Pemain</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tournament Banner Right */}
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 inline-block">
                                                OFFICIAL TEAM ROSTER
                                            </span>
                                            <h3 className="text-sm font-black text-slate-900 mt-1">
                                                {competition?.name || 'Turnamen Futsal'}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-semibold">
                                                Musim {competition?.season || '2026'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Player Table */}
                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-900 font-black uppercase text-[11px] border-b-2 border-slate-400">
                                                <th className="py-2.5 px-3 border border-slate-300 w-10 text-center">No</th>
                                                <th className="py-2.5 px-3 border border-slate-300 w-16 text-center">No. Punggung</th>
                                                <th className="py-2.5 px-3 border border-slate-300">Nama Lengkap Pemain</th>
                                                <th className="py-2.5 px-3 border border-slate-300 w-32">Posisi</th>
                                                {showCheckInCol && (
                                                    <th className="py-2.5 px-3 border border-slate-300 w-24 text-center">
                                                        Check-In / Paraf
                                                    </th>
                                                )}
                                                {showNotesCol && (
                                                    <th className="py-2.5 px-3 border border-slate-300 w-36">
                                                        Keterangan (Starter/Sub)
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 font-medium">
                                            {players.length > 0 ? (
                                                players.map((player, pIdx) => {
                                                    const pos = positionBadges[player.position] || { label: player.position, icon: '⚽', text: player.position };

                                                    return (
                                                        <tr key={player.id || pIdx} className="hover:bg-slate-50">
                                                            <td className="py-2 px-3 border border-slate-300 text-center font-bold text-slate-600">
                                                                {pIdx + 1}
                                                            </td>
                                                            <td className="py-2 px-3 border border-slate-300 text-center">
                                                                <span className="inline-block font-black text-sm text-slate-950 px-2 py-0.5 bg-slate-100 rounded border border-slate-300 print:border-black">
                                                                    #{player.jersey_number}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3 border border-slate-300">
                                                                <span className="font-bold text-slate-900 text-sm block">
                                                                    {player.name}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-700">
                                                                <span className="flex items-center gap-1">
                                                                    <span>{pos.icon}</span>
                                                                    <span>{pos.text}</span>
                                                                </span>
                                                            </td>
                                                            {showCheckInCol && (
                                                                <td className="py-2 px-3 border border-slate-300 text-center">
                                                                    <div className="w-5 h-5 border border-slate-400 mx-auto rounded-xs" />
                                                                </td>
                                                            )}
                                                            {showNotesCol && (
                                                                <td className="py-2 px-3 border border-slate-300 text-[11px] text-slate-400 italic">
                                                                    [ &nbsp; ] Starter &nbsp; [ &nbsp; ] Sub
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                                                        Belum ada data pemain terdaftar di tim ini.
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Empty lines for manual add-ons (substitutes / additional roster) */}
                                            {Array.from({ length: Math.max(0, 3 - (players.length % 3)) }).map((_, extraIdx) => (
                                                <tr key={`extra-${extraIdx}`} className="text-slate-300 print:text-slate-400">
                                                    <td className="py-3 px-3 border border-slate-300 text-center">{players.length + extraIdx + 1}</td>
                                                    <td className="py-3 px-3 border border-slate-300 text-center">#___</td>
                                                    <td className="py-3 px-3 border border-slate-300"></td>
                                                    <td className="py-3 px-3 border border-slate-300"></td>
                                                    {showCheckInCol && <td className="py-3 px-3 border border-slate-300 text-center"><div className="w-5 h-5 border border-slate-300 mx-auto" /></td>}
                                                    {showNotesCol && <td className="py-3 px-3 border border-slate-300"></td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Official Signatures Box */}
                                {showSignatures && (
                                    <div className="mt-8 pt-4 border-t border-slate-300">
                                        <div className="grid grid-cols-3 gap-4 text-center text-xs">
                                            <div className="space-y-12">
                                                <span className="font-bold text-slate-700 block">
                                                    Kapten / Official Tim
                                                </span>
                                                <div className="pt-2">
                                                    <div className="w-36 border-b border-slate-800 mx-auto mb-1" />
                                                    <span className="text-[10px] text-slate-500 font-semibold">
                                                        ( {team.coach_name || 'Nama Lengkap & Ttd'} )
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-12">
                                                <span className="font-bold text-slate-700 block">
                                                    Wasit Pertandingan
                                                </span>
                                                <div className="pt-2">
                                                    <div className="w-36 border-b border-slate-800 mx-auto mb-1" />
                                                    <span className="text-[10px] text-slate-500 font-semibold">
                                                        ( Nama Wasit & Ttd )
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-12">
                                                <span className="font-bold text-slate-700 block">
                                                    Panitia Pelaksana (OC)
                                                </span>
                                                <div className="pt-2">
                                                    <div className="w-36 border-b border-slate-800 mx-auto mb-1" />
                                                    <span className="text-[10px] text-slate-500 font-semibold">
                                                        ( Panitia Pertandingan )
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-6 mt-4 border-t border-slate-100">
                                            <span>Dokumen Resmi Turnamen • {competition?.name || 'RS Livasya Futsal Cup'}</span>
                                            <span>Dicetak pada: {printDate}</span>
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm space-y-3">
                        <Users className="w-12 h-12 text-gray-300 mx-auto" />
                        <h3 className="text-base font-black text-gray-800">Tidak Ada Data Tim</h3>
                        <p className="text-xs text-gray-500">
                            Silakan tambahkan tim atau pilih turnamen lain dari filter di atas.
                        </p>
                    </div>
                )}
            </main>

            {/* Custom Print CSS */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body, html {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
                    }
                    .print\\:break-after-page {
                        page-break-after: always !important;
                        break-after: page !important;
                    }
                }
            `}</style>
        </div>
    );
}
