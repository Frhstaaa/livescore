import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, Link } from '@inertiajs/react';
import { Play, Pause, CheckCircle2, Flame, Award, Plus, Trash2, ShieldAlert, Clock, RefreshCw, Eye, ExternalLink, Smartphone, Timer } from 'lucide-react';
import LiveTimer from '@/Components/LiveTimer';

export default function LiveControl({ matches, selectedMatch }) {
    const [eventTeamId, setEventTeamId] = useState(selectedMatch?.home_team_id || '');
    const [eventType, setEventType] = useState('goal');
    const [playerId, setPlayerId] = useState('');
    const [relatedPlayerId, setRelatedPlayerId] = useState('');
    
    const [isTimerRunning, setIsTimerRunning] = useState(selectedMatch?.status === 'live');

    // Wall-clock persistent timer calculation (never resets on reload)
    const computeCurrentSeconds = () => {
        if (!selectedMatch) return 0;
        if (selectedMatch.status === 'live' && selectedMatch.started_at) {
            const startMs = new Date(selectedMatch.started_at).getTime();
            const nowMs = Date.now();
            const elapsedSec = Math.floor((nowMs - startMs) / 1000);
            return Math.max(0, (selectedMatch.paused_seconds || 0) + elapsedSec);
        }
        return (selectedMatch.paused_seconds || 0) || ((selectedMatch.current_minute || 0) * 60);
    };

    const [secondsElapsed, setSecondsElapsed] = useState(computeCurrentSeconds());
    const [motmPlayerId, setMotmPlayerId] = useState(selectedMatch?.best_player_id || '');
    const [motmRating, setMotmRating] = useState(selectedMatch?.best_player_rating || 8.5);

    // Sync state when selectedMatch changes or page reloads
    useEffect(() => {
        if (selectedMatch) {
            setEventTeamId(selectedMatch.home_team_id);
            setIsTimerRunning(selectedMatch.status === 'live');
            setMotmPlayerId(selectedMatch.best_player_id || '');
            setMotmRating(selectedMatch.best_player_rating || 8.5);
            setSecondsElapsed(computeCurrentSeconds());
        }
    }, [selectedMatch?.id, selectedMatch?.status, selectedMatch?.started_at, selectedMatch?.paused_seconds, selectedMatch?.current_minute]);

    // Realtime Wall-Clock Second-by-Second Timer Clock (MM:SS)
    useEffect(() => {
        let interval = null;
        if (isTimerRunning && selectedMatch?.status === 'live') {
            interval = setInterval(() => {
                setSecondsElapsed(computeCurrentSeconds());
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, selectedMatch?.id, selectedMatch?.status, selectedMatch?.started_at, selectedMatch?.paused_seconds]);

    const currentDisplayMin = Math.floor(secondsElapsed / 60);
    const currentDisplaySec = secondsElapsed % 60;
    const formattedMMSS = `${String(currentDisplayMin).padStart(2, '0')}:${String(currentDisplaySec).padStart(2, '0')}`;

    // Update status handler
    const handleStatusChange = (status, forcedMin = null) => {
        if (!selectedMatch) return;
        const targetMin = forcedMin !== null ? forcedMin : currentDisplayMin;
        
        setIsTimerRunning(status === 'live');

        router.post(`/admin/live/${selectedMatch.id}/status`, {
            status,
            minute: targetMin,
        }, { preserveScroll: true });
    };

    // Quick minute adjust
    const adjustMinute = (delta) => {
        const nextMin = Math.max(0, currentDisplayMin + delta);
        setSecondsElapsed(nextMin * 60);
        if (selectedMatch?.status === 'live') {
            handleStatusChange('live', nextMin);
        }
    };

    // Add Live Event
    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!selectedMatch || !eventTeamId) return;

        router.post(`/admin/live/${selectedMatch.id}/event`, {
            team_id: eventTeamId,
            player_id: playerId || null,
            related_player_id: relatedPlayerId || null,
            event_type: eventType,
            minute: currentDisplayMin,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setPlayerId('');
                setRelatedPlayerId('');
            }
        });
    };

    // Set MOTM
    const handleSetMotm = (e) => {
        e.preventDefault();
        if (!selectedMatch || !motmPlayerId) return;

        router.post(`/admin/live/${selectedMatch.id}/motm`, {
            player_id: motmPlayerId,
            rating: motmRating,
        }, { preserveScroll: true });
    };

    // Delete / Cancel Live Event & Auto Adjust Score
    const handleDeleteEvent = (eventId, eventDesc) => {
        if (confirm(`Apakah Anda yakin ingin membatalkan kejadian "${eventDesc}"? Skor pertandingan akan otomatis disesuaikan.`)) {
            router.delete(`/admin/live/event/${eventId}`, {
                preserveScroll: true,
            });
        }
    };

    const teamPlayers = eventTeamId == selectedMatch?.home_team_id
        ? selectedMatch?.home_team?.players
        : selectedMatch?.away_team?.players;

    const isLiveActive = selectedMatch?.status === 'live';
    const isHtActive = selectedMatch?.status === 'half_time';
    const isFtActive = selectedMatch?.status === 'full_time';
    const isSchedActive = selectedMatch?.status === 'scheduled';

    return (
        <AdminLayout title="Live Match Control Panel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Match Selector & Mobile Live Preview Widget */}
                <div className="space-y-6">
                    
                    {/* Match List Selector */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Pilih Pertandingan Live</h3>
                        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                            {matches?.map((m) => {
                                const isSelected = selectedMatch?.id === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => router.get('/admin/live', { match_id: m.id })}
                                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                                            isSelected
                                                ? 'border-brand-500 bg-brand-50/60 shadow-md ring-2 ring-brand-400'
                                                : 'border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-gray-800">{m.home_team?.short_name} vs {m.away_team?.short_name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                m.status === 'live' ? 'bg-live-soft text-live animate-pulse' :
                                                m.status === 'half_time' ? 'bg-amber-100 text-amber-800' :
                                                m.status === 'full_time' ? 'bg-slate-200 text-slate-800' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {m.status === 'live' ? 'LIVE' : m.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-brand-600">
                                            Skor: {m.home_score} - {m.away_score}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* LIVE PREVIEW TAMPILAN PUBLIK (MOBILE SIMULATION CARD WITH REALTIME TIMER & EVENTS) */}
                    {selectedMatch && (
                        <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl border border-slate-800 relative">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                                    <Smartphone className="w-4 h-4 text-brand-500" />
                                    <span>PREVIEW TAMPILAN PUBLIK</span>
                                </div>
                                <Link
                                    href={`/match/${selectedMatch.id}`}
                                    target="_blank"
                                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center space-x-1"
                                >
                                    <span>Buka Detail</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Simulated Public Match Card */}
                            <div className="bg-white rounded-2xl p-4 text-gray-900 shadow-lg border border-gray-100 relative overflow-hidden">
                                {isLiveActive && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-live via-brand-500 to-live animate-pulse" />
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 pr-2 space-y-2">
                                        {/* Home Team */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[9px] text-gray-700 border overflow-hidden shrink-0">
                                                    {selectedMatch.home_team?.logo_url ? (
                                                        <img src={selectedMatch.home_team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        selectedMatch.home_team?.short_name
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 truncate max-w-[100px]">
                                                    {selectedMatch.home_team?.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-gray-900">{selectedMatch.home_score}</span>
                                        </div>

                                        {/* Away Team */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[9px] text-gray-700 border overflow-hidden shrink-0">
                                                    {selectedMatch.away_team?.logo_url ? (
                                                        <img src={selectedMatch.away_team.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
                                                    ) : (
                                                        selectedMatch.away_team?.short_name
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 truncate max-w-[100px]">
                                                    {selectedMatch.away_team?.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-gray-900">{selectedMatch.away_score}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge with Live Second-by-Second Ticker */}
                                    <div className="pl-2 border-l border-gray-100 flex flex-col items-center justify-center min-w-[65px]">
                                        {isLiveActive && (
                                            <>
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-live-soft text-live border border-live/20 shadow-sm animate-pulse mb-0.5 font-mono">
                                                    {formattedMMSS}'
                                                </span>
                                                <span className="text-[9px] font-bold text-live">LIVE</span>
                                            </>
                                        )}
                                        {isHtActive && <span className="text-[10px] font-black text-amber-600">HT</span>}
                                        {isFtActive && <span className="text-[10px] font-black text-gray-400">FT</span>}
                                        {isSchedActive && <span className="text-[10px] font-bold text-gray-500">READY</span>}
                                    </div>
                                </div>

                                {/* MOTM Badge Preview */}
                                {selectedMatch.best_player && (
                                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] bg-amber-50/60 p-1.5 rounded-xl">
                                        <div className="flex items-center space-x-1 text-amber-800 font-bold">
                                            <Award className="w-3.5 h-3.5 text-amber-500" />
                                            <span>MOTM: {selectedMatch.best_player.name}</span>
                                        </div>
                                        <span className="font-black text-amber-600">★ {selectedMatch.best_player_rating || 8.5}</span>
                                    </div>
                                )}

                                {/* REALTIME LIVE TIMELINE EVENTS PREVIEW WITH INSTANT CANCEL BUTTON */}
                                {selectedMatch.events && selectedMatch.events.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                                ⚡ Kejadian Live ({selectedMatch.events.length})
                                            </span>
                                            <span className="text-[9px] font-bold text-brand-500 animate-pulse">Realtime Stream</span>
                                        </div>

                                        {selectedMatch.events.slice().reverse().map((ev) => {
                                            const evLabel = ev.event_type === 'goal' ? 'Gol' :
                                                            ev.event_type === 'yellow_card' ? 'Kartu Kuning' :
                                                            ev.event_type === 'red_card' ? 'Kartu Merah' :
                                                            ev.event_type === 'own_goal' ? 'Own Goal' : 'Substitusi';
                                            const playerOrTeam = ev.player?.name || ev.team?.short_name || 'Pemain';

                                            return (
                                                <div key={ev.id} className="flex items-center justify-between bg-gray-50/90 hover:bg-red-50/50 p-1.5 rounded-lg text-[10px] border border-gray-100 transition-colors group">
                                                    <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                                                        <span className="font-black text-brand-600 w-5">{ev.minute}'</span>
                                                        <span className="font-extrabold text-gray-900 shrink-0">
                                                            {ev.event_type === 'goal' && '⚽ GOL'}
                                                            {ev.event_type === 'yellow_card' && '🟨 Kartu'}
                                                            {ev.event_type === 'red_card' && '🟥 Kartu'}
                                                            {ev.event_type === 'substitution_in' && '🔄 Sub'}
                                                            {ev.event_type === 'own_goal' && '⚠️ OG'}
                                                        </span>
                                                        <span className="text-gray-600 font-semibold truncate max-w-[75px]">
                                                            {playerOrTeam}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-1 shrink-0">
                                                        <span className="font-bold text-[9px] text-gray-400 uppercase">
                                                            {ev.team?.short_name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEvent(ev.id, `${evLabel} ${playerOrTeam} (${ev.minute}')`)}
                                                            title="Batalkan kejadian ini (skor otomatis disesuaikan)"
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right 2 Columns: Control Dashboard */}
                {selectedMatch ? (
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Status Control Card & Digital Stopwatch */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                            
                            {/* Running Match Accent Banner */}
                            {isLiveActive && (
                                <div className="bg-live text-white text-[11px] font-black tracking-widest px-4 py-1.5 uppercase text-center flex items-center justify-center space-x-2 -mx-6 -mt-6 mb-4 animate-pulse">
                                    <Flame className="w-4 h-4 fill-white" />
                                    <span>PERTANDINGAN SEDANG BERJALAN (LIVE)</span>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                <div>
                                    <span className="text-xs font-bold text-brand-500 uppercase tracking-wider block">
                                        {selectedMatch.competition?.name} ({selectedMatch.round})
                                    </span>
                                    <h2 className="text-xl font-black text-gray-900">
                                        {selectedMatch.home_team?.name} ({selectedMatch.home_score}) VS ({selectedMatch.away_score}) {selectedMatch.away_team?.name}
                                    </h2>
                                </div>

                                {/* Realtime Digital Stopwatch (MM:SS) */}
                                <div className="mt-3 md:mt-0 flex items-center space-x-3 bg-slate-900 text-white p-2.5 rounded-2xl border border-slate-800 shadow-lg">
                                    <div className="flex items-center space-x-1.5 px-2">
                                        <Timer className={`w-5 h-5 ${isLiveActive ? 'text-live animate-spin' : 'text-slate-400'}`} />
                                        <span className="font-mono font-black text-xl text-emerald-400 tracking-wider">
                                            {formattedMMSS}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-1 border-l border-slate-700 pl-2">
                                        <button
                                            onClick={() => adjustMinute(-1)}
                                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-xs text-slate-300 transition-colors"
                                            title="Kurangi 1 Menit"
                                        >
                                            -1m
                                        </button>
                                        <button
                                            onClick={() => adjustMinute(1)}
                                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-black text-xs text-slate-300 transition-colors"
                                            title="Tambah 1 Menit"
                                        >
                                            +1m
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Status Buttons */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                
                                {/* START / LIVE BUTTON */}
                                <button
                                    onClick={() => handleStatusChange('live')}
                                    className={`py-3.5 px-3 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                                        isLiveActive
                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 shadow-xl shadow-emerald-500/30 scale-105 animate-pulse'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-200'
                                    }`}
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>LIVE</span>
                                </button>

                                {/* HALF TIME BUTTON */}
                                <button
                                    onClick={() => handleStatusChange('half_time')}
                                    className={`py-3.5 px-3 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                                        isHtActive
                                            ? 'bg-amber-500 text-white ring-4 ring-amber-300 shadow-xl shadow-amber-500/30 scale-105'
                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200'
                                    }`}
                                >
                                    <Pause className="w-4 h-4" />
                                    <span>HALF TIME</span>
                                </button>

                                {/* FULL TIME BUTTON */}
                                <button
                                    onClick={() => handleStatusChange('full_time')}
                                    className={`py-3.5 px-3 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                                        isFtActive
                                            ? 'bg-slate-900 text-white ring-4 ring-slate-400 shadow-xl shadow-slate-900/30 scale-105'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200'
                                    }`}
                                >
                                    <CheckCircle2 className={`w-4 h-4 ${isFtActive ? 'text-emerald-400' : ''}`} />
                                    <span>FULL TIME (FT)</span>
                                </button>

                                {/* RESET SCHEDULED BUTTON */}
                                <button
                                    onClick={() => handleStatusChange('scheduled', 0)}
                                    className={`py-3.5 px-3 rounded-2xl font-bold text-xs transition-all duration-200 ${
                                        isSchedActive
                                            ? 'bg-brand-500 text-white ring-2 ring-brand-300 font-black'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    RESET SCHEDULED
                                </button>

                            </div>
                        </div>

                        {/* Quick Event Logger Form */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                                <Plus className="w-5 h-5 text-brand-500 mr-2" />
                                Input Kejadian Live (Gol / Kartu / Substitusi)
                            </h3>

                            <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Pilih Tim</label>
                                    <select
                                        value={eventTeamId}
                                        onChange={(e) => setEventTeamId(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    >
                                        <option value={selectedMatch.home_team_id}>{selectedMatch.home_team?.name} (Home)</option>
                                        <option value={selectedMatch.away_team_id}>{selectedMatch.away_team?.name} (Away)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Jenis Kejadian</label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    >
                                        <option value="goal">⚽ GOL (+1 Skor)</option>
                                        <option value="yellow_card">🟨 Kartu Kuning</option>
                                        <option value="red_card">🟥 Kartu Merah</option>
                                        <option value="substitution_in">🔄 Substitusi (Pemain Masuk)</option>
                                        <option value="own_goal">⚠️ Gol Bunuh Diri</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Pemain Utama</label>
                                    <select
                                        value={playerId}
                                        onChange={(e) => setPlayerId(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                    >
                                        <option value="">-- Pilih Pemain --</option>
                                        {teamPlayers?.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                #{p.jersey_number} {p.name} ({p.position})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Pemain Sekunder / Assist (Opsional)</label>
                                    <select
                                        value={relatedPlayerId}
                                        onChange={(e) => setRelatedPlayerId(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                    >
                                        <option value="">-- Tanpa Assist / Related --</option>
                                        {teamPlayers?.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                #{p.jersey_number} {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 pt-2">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs transition-colors"
                                    >
                                        + Simpan Kejadian Live & Broadcast Realtime
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIWAYAT LENGKAP & PEMBATALAN KEJADIAN (AUTO RE-CALCULATE SCORE) */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-900 flex items-center">
                                    <Flame className="w-5 h-5 text-brand-500 mr-2" />
                                    Riwayat Kejadian & Batalkan Skor ({selectedMatch.events?.length || 0})
                                </h3>
                                <span className="text-[11px] font-semibold text-gray-400">
                                    Skor otomatis disesuaikan saat kejadian dibatalkan
                                </span>
                            </div>

                            {selectedMatch.events && selectedMatch.events.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedMatch.events.slice().reverse().map((ev) => {
                                        const isGoal = ev.event_type === 'goal';
                                        const isOwnGoal = ev.event_type === 'own_goal';
                                        const isYellow = ev.event_type === 'yellow_card';
                                        const isRed = ev.event_type === 'red_card';
                                        const isSub = ev.event_type === 'substitution_in';

                                        const evTitle = isGoal ? 'Gol (+1 Skor)' :
                                                        isOwnGoal ? 'Gol Bunuh Diri (Skor Lawan +1)' :
                                                        isYellow ? 'Kartu Kuning' :
                                                        isRed ? 'Kartu Merah' : 'Substitusi';
                                        const playerName = ev.player?.name || '-';
                                        const teamName = ev.team?.name || 'Tim';

                                        return (
                                            <div
                                                key={ev.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                                    isGoal ? 'bg-emerald-50/70 border-emerald-200/70' :
                                                    isOwnGoal ? 'bg-red-50/70 border-red-200/70' :
                                                    isYellow ? 'bg-amber-50/70 border-amber-200/70' :
                                                    isRed ? 'bg-red-50/70 border-red-200/70' :
                                                    'bg-gray-50 border-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3 min-w-0 pr-2">
                                                    <span className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 shadow-sm ${
                                                        isGoal ? 'bg-emerald-600 text-white' :
                                                        isOwnGoal ? 'bg-red-600 text-white' :
                                                        isYellow ? 'bg-amber-500 text-white' :
                                                        isRed ? 'bg-red-600 text-white' :
                                                        'bg-gray-700 text-white'
                                                    }`}>
                                                        {ev.minute}'
                                                    </span>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-black text-xs text-gray-900">
                                                                {isGoal && '⚽ '}
                                                                {isOwnGoal && '⚠️ '}
                                                                {isYellow && '🟨 '}
                                                                {isRed && '🟥 '}
                                                                {isSub && '🔄 '}
                                                                {evTitle}
                                                            </span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 border border-gray-200 text-gray-700 uppercase">
                                                                {teamName}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 font-semibold truncate mt-0.5">
                                                            Pemain: <strong className="text-gray-900">{playerName}</strong>
                                                            {ev.related_player && (
                                                                <span className="text-gray-500 ml-1">(Assist: {ev.related_player.name})</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteEvent(ev.id, `${evTitle} oleh ${playerName} di menit ${ev.minute}'`)}
                                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Batalkan</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50/60 rounded-xl border border-dashed border-gray-200 text-gray-400">
                                    <p className="text-xs font-semibold">Belum ada kejadian tercatat pada pertandingan ini.</p>
                                </div>
                            )}
                        </div>

                        {/* MOTM Rating Setter */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                                <Award className="w-5 h-5 text-amber-500 mr-2" />
                                Tetapkan Best Player / Man of the Match (MOTM)
                            </h3>

                            <form onSubmit={handleSetMotm} className="flex flex-col md:flex-row items-end gap-3 text-xs">
                                <div className="flex-1 w-full">
                                    <label className="block font-bold text-gray-700 mb-1">Pilih Pemain MOTM</label>
                                    <select
                                        value={motmPlayerId}
                                        onChange={(e) => setMotmPlayerId(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900"
                                    >
                                        <option value="">-- Pilih Pemain MOTM --</option>
                                        <optgroup label={selectedMatch.home_team?.name}>
                                            {selectedMatch.home_team?.players?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.jersey_number})</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label={selectedMatch.away_team?.name}>
                                            {selectedMatch.away_team?.players?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (#{p.jersey_number})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="w-full md:w-32">
                                    <label className="block font-bold text-gray-700 mb-1">Rating (1.0 - 10.0)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={motmRating}
                                        onChange={(e) => setMotmRating(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 text-center"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm text-xs whitespace-nowrap"
                                >
                                    Set MOTM
                                </button>
                            </form>
                        </div>

                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                        <Flame className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">Pilih Pertandingan Terlebih Dahulu</h3>
                        <p className="text-xs text-gray-400 mt-1">Klik salah satu pertandingan di sebelah kiri untuk mulai mengelola skor & live control.</p>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
