import React, { useState, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { useForm, router, usePage } from '@inertiajs/react';
import {
    Calendar, Plus, Trash2, Clock, MapPin, Radio, Shuffle,
    Sparkles, Trophy, Shield, Users, RefreshCw, CheckCircle2,
    X, Filter, Play, ArrowRight, Zap, Check, AlertTriangle,
    Layers, ChevronDown, ChevronUp, Coffee, Hourglass, Timer,
    FastForward, Award, Flame, PlayCircle, PauseCircle, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMatches({ matches = [], competitions = [], teams = [], selectedCompetitionId = null }) {
    const { flash } = usePage().props;
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, desc: '' });
    const [clearModal, setClearModal] = useState({ isOpen: false, compId: null, compName: '' });

    // Single Match Form
    const { data, setData, post, reset, errors, processing } = useForm({
        competition_id: selectedCompetitionId || (competitions[0] ? competitions[0].id : ''),
        home_team_id: teams[0] ? teams[0].id : '',
        away_team_id: teams[1] ? teams[1].id : (teams[0] ? teams[0].id : ''),
        round: 'Pekan 1',
        venue: 'Rama Futsall Kadipaten',
        match_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        status: 'scheduled',
    });

    // GENERATOR MODAL STATE
    const [showGenModal, setShowGenModal] = useState(false);
    const [genCompId, setGenCompId] = useState(selectedCompetitionId || (competitions[0]?.id || ''));
    const [selectedGenTeamIds, setSelectedGenTeamIds] = useState([]);
    const [genFormat, setGenFormat] = useState('single'); // 'single' | 'double'
    const [genStartDate, setGenStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    });

    // Detailed Timing Settings
    const [genHalfDuration, setGenHalfDuration] = useState(20); // minutes per half
    const [genHalfTimeBreak, setGenHalfTimeBreak] = useState(5); // minutes HT break
    const [genPostMatchBreak, setGenPostMatchBreak] = useState(10); // minutes post-match interval/break
    const [genPekanIntervalMode, setGenPekanIntervalMode] = useState('same_day'); // 'same_day' | 'next_day' | 'weekly'
    const [genVenue, setGenVenue] = useState('Rama Futsall Kadipaten');
    const [genClearExisting, setGenClearExisting] = useState(true);
    const [generatedSchedule, setGeneratedSchedule] = useState(null);
    const [isSavingGenerated, setIsSavingGenerated] = useState(false);

    // ROULETTE / DRAW ANIMATION STATE
    const [drawMode, setDrawMode] = useState('step_by_step'); // 'step_by_step' | 'auto_play'
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [drawCurrentIndex, setDrawCurrentIndex] = useState(0);
    const [revealedMatches, setRevealedMatches] = useState([]);
    const [rouletteHomeTeam, setRouletteHomeTeam] = useState(null);
    const [rouletteAwayTeam, setRouletteAwayTeam] = useState(null);
    const [roulettePhase, setRoulettePhase] = useState('idle'); // 'spinning_home' | 'locked_home' | 'spinning_away' | 'locked_away' | 'match_ready' | 'finished'
    const [activeMatchInDraw, setActiveMatchInDraw] = useState(null);
    const animationTimerRef = useRef(null);
    const rouletteIntervalRef = useRef(null);

    // Auto-sync tournament settings when genCompId changes
    useEffect(() => {
        if (!genCompId) return;
        const comp = competitions.find(c => c.id === parseInt(genCompId));
        if (comp) {
            if (comp.half_duration_minutes) setGenHalfDuration(comp.half_duration_minutes);
            if (comp.half_time_duration_minutes) setGenHalfTimeBreak(comp.half_time_duration_minutes);
            if (comp.standings && comp.standings.length > 0) {
                const tIds = comp.standings.map(s => s.team_id).filter(Boolean);
                setSelectedGenTeamIds(tIds);
            } else {
                setSelectedGenTeamIds(teams.map(t => t.id));
            }
        }
        stopAnimation();
        setGeneratedSchedule(null);
        setRevealedMatches([]);
    }, [genCompId, competitions, teams]);

    // Single Match Submit
    const submitSingle = (e) => {
        e.preventDefault();
        post('/admin/matches', {
            onSuccess: () => reset()
        });
    };

    // Delete single match - using direct router.delete
    const handleDelete = (m) => {
        const desc = `${m.home_team?.name || 'Home'} vs ${m.away_team?.name || 'Away'} (${m.round})`;
        setDeleteModal({ isOpen: true, id: m.id, desc });
    };

    const confirmDeleteMatch = () => {
        if (!deleteModal.id) return;
        router.delete(`/admin/matches/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, desc: '' })
        });
    };

    // Clear all scheduled matches in competition
    const handleClearAllScheduled = (comp) => {
        setClearModal({ isOpen: true, compId: comp.id, compName: comp.name });
    };

    const confirmClearMatches = () => {
        if (!clearModal.compId) return;
        router.delete(`/admin/matches/competition/${clearModal.compId}/clear`, {
            onSuccess: () => setClearModal({ isOpen: false, compId: null, compName: '' })
        });
    };

    // Filter Competition in main page
    const handleFilterComp = (compId) => {
        router.get('/admin/matches', compId ? { competition_id: compId } : {}, { preserveState: true });
    };

    // Toggle Team Selection in Generator
    const handleToggleGenTeam = (teamId) => {
        stopAnimation();
        if (selectedGenTeamIds.includes(teamId)) {
            setSelectedGenTeamIds(selectedGenTeamIds.filter(id => id !== teamId));
        } else {
            setSelectedGenTeamIds([...selectedGenTeamIds, teamId]);
        }
        setGeneratedSchedule(null);
        setRevealedMatches([]);
    };

    const handleSelectAllGenTeams = () => {
        stopAnimation();
        if (selectedGenTeamIds.length === teams.length) {
            setSelectedGenTeamIds([]);
        } else {
            setSelectedGenTeamIds(teams.map(t => t.id));
        }
        setGeneratedSchedule(null);
        setRevealedMatches([]);
    };

    // Stop and clean up any ongoing animation timers
    const stopAnimation = () => {
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        if (rouletteIntervalRef.current) clearInterval(rouletteIntervalRef.current);
        setIsDrawing(false);
        setIsSpinning(false);
    };

    useEffect(() => {
        return () => stopAnimation();
    }, []);

    // Calculated timing metrics
    const totalMatchPlayMinutes = genHalfDuration * 2;
    const totalMatchSpanMinutes = totalMatchPlayMinutes + genHalfTimeBreak; // Play + HT
    const totalSlotAllocatedMinutes = totalMatchSpanMinutes + genPostMatchBreak; // Play + HT + Post-Match Break

    // Core Berger Circle Fair Round-Robin Calculation
    const calculateFullSchedule = () => {
        if (selectedGenTeamIds.length < 2) return [];

        let participatingTeams = selectedGenTeamIds
            .map(id => teams.find(t => t.id === id))
            .filter(Boolean);

        // Randomize initial seed order for 100% fairness
        participatingTeams = [...participatingTeams].sort(() => Math.random() - 0.5);

        let n = participatingTeams.length;
        if (n % 2 !== 0) {
            participatingTeams.push({ id: null, name: 'BYE / Istirahat', short_name: 'BYE' });
            n++;
        }

        const totalRounds = n - 1;
        const matchesPerRound = n / 2;
        const resultSchedule = [];

        const baseStartDate = new Date(genStartDate);
        let matchCounter = 1;
        const roundsToRun = genFormat === 'double' ? 2 : 1;

        let circle = [...participatingTeams];
        let runningPekanStartDate = new Date(baseStartDate.getTime());

        for (let cycle = 1; cycle <= roundsToRun; cycle++) {
            for (let round = 0; round < totalRounds; round++) {
                const pekanNum = (cycle - 1) * totalRounds + (round + 1);
                const roundTitle = `Pekan ${pekanNum}`;

                let matchStartTime = new Date(runningPekanStartDate.getTime());

                for (let i = 0; i < matchesPerRound; i++) {
                    const t1 = circle[i];
                    const t2 = circle[n - 1 - i];

                    if (!t1.id || !t2.id) continue;

                    let home = (round % 2 === 1 || i === 0) ? t1 : t2;
                    let away = (round % 2 === 1 || i === 0) ? t2 : t1;

                    if (cycle === 2) {
                        const temp = home;
                        home = away;
                        away = temp;
                    }

                    const localIso = new Date(matchStartTime.getTime() - matchStartTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    const matchEndTime = new Date(matchStartTime.getTime() + totalMatchSpanMinutes * 60 * 1000);
                    const nextMatchStartTime = new Date(matchStartTime.getTime() + totalSlotAllocatedMinutes * 60 * 1000);

                    resultSchedule.push({
                        tempId: matchCounter++,
                        competition_id: parseInt(genCompId),
                        home_team_id: home.id,
                        home_team: home,
                        away_team_id: away.id,
                        away_team: away,
                        round: roundTitle,
                        pekanNumber: pekanNum,
                        match_date: localIso,
                        kickOffStr: matchStartTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        endTimeStr: matchEndTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        nextMatchTimeStr: nextMatchStartTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        venue: genVenue || 'Rama Futsall Kadipaten',
                    });

                    matchStartTime = new Date(matchStartTime.getTime() + totalSlotAllocatedMinutes * 60 * 1000);
                }

                if (genPekanIntervalMode === 'same_day') {
                    runningPekanStartDate = new Date(matchStartTime.getTime());
                } else if (genPekanIntervalMode === 'next_day') {
                    runningPekanStartDate.setDate(runningPekanStartDate.getDate() + 1);
                    runningPekanStartDate.setHours(baseStartDate.getHours(), baseStartDate.getMinutes(), 0, 0);
                } else if (genPekanIntervalMode === 'weekly') {
                    runningPekanStartDate.setDate(runningPekanStartDate.getDate() + 7);
                    runningPekanStartDate.setHours(baseStartDate.getHours(), baseStartDate.getMinutes(), 0, 0);
                }

                const fixed = circle[0];
                const rest = circle.slice(1);
                const last = rest.pop();
                rest.unshift(last);
                circle = [fixed, ...rest];
            }
        }

        return resultSchedule;
    };

    // START ROULETTE DRAW (Starts from match 0)
    const handleStartRoulette = (mode = 'step_by_step') => {
        const fullList = calculateFullSchedule();
        if (fullList.length === 0) return;

        stopAnimation();
        setDrawMode(mode);
        setGeneratedSchedule(fullList);
        setRevealedMatches([]);
        setIsDrawing(true);
        setDrawCurrentIndex(0);

        // Spin the first match
        runSpinForMatch(fullList, 0, [], mode);
    };

    // Spin specific match index
    const runSpinForMatch = (fullList, matchIdx, currentRevealed, currentMode = drawMode) => {
        if (matchIdx >= fullList.length) {
            setIsDrawing(true);
            setIsSpinning(false);
            setRoulettePhase('finished');
            setRevealedMatches(fullList);
            return;
        }

        const match = fullList[matchIdx];
        setActiveMatchInDraw(match);
        setDrawCurrentIndex(matchIdx);
        setIsSpinning(true);
        setRoulettePhase('spinning_home');

        const poolTeams = selectedGenTeamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);

        // Stage 1: Spin Home Team (Smooth 80ms interval, 12 spins = ~1 sec)
        let spinCountHome = 0;
        const maxSpinsHome = 12;

        rouletteIntervalRef.current = setInterval(() => {
            const randomHome = poolTeams[Math.floor(Math.random() * poolTeams.length)];
            setRouletteHomeTeam(randomHome);
            spinCountHome++;

            if (spinCountHome >= maxSpinsHome) {
                clearInterval(rouletteIntervalRef.current);
                setRouletteHomeTeam(match.home_team);
                setRoulettePhase('locked_home');

                // Stage 2: Brief dramatic pause (400ms), then spin Away Team
                animationTimerRef.current = setTimeout(() => {
                    setRoulettePhase('spinning_away');
                    let spinCountAway = 0;
                    const maxSpinsAway = 12;

                    rouletteIntervalRef.current = setInterval(() => {
                        const randomAway = poolTeams[Math.floor(Math.random() * poolTeams.length)];
                        setRouletteAwayTeam(randomAway);
                        spinCountAway++;

                        if (spinCountAway >= maxSpinsAway) {
                            clearInterval(rouletteIntervalRef.current);
                            setRouletteAwayTeam(match.away_team);
                            setRoulettePhase('locked_away');

                            // Stage 3: Match Ready & Add to revealed list
                            animationTimerRef.current = setTimeout(() => {
                                setRoulettePhase('match_ready');
                                setIsSpinning(false);
                                const updatedRevealed = [...currentRevealed, match];
                                setRevealedMatches(updatedRevealed);

                                // If Auto-Play Mode, proceed after 2.2 seconds
                                if (currentMode === 'auto_play' && matchIdx + 1 < fullList.length) {
                                    animationTimerRef.current = setTimeout(() => {
                                        runSpinForMatch(fullList, matchIdx + 1, updatedRevealed, currentMode);
                                    }, 2200);
                                } else if (matchIdx + 1 >= fullList.length) {
                                    setRoulettePhase('finished');
                                }
                            }, 500);
                        }
                    }, 80);
                }, 400);
            }
        }, 80);
    };

    // User clicks "Undi Match Berikutnya" (Manual Next Step)
    const handleDrawNextMatch = () => {
        if (!generatedSchedule || isSpinning) return;
        const nextIdx = drawCurrentIndex + 1;
        if (nextIdx < generatedSchedule.length) {
            runSpinForMatch(generatedSchedule, nextIdx, revealedMatches, drawMode);
        } else {
            setRoulettePhase('finished');
        }
    };

    // Instant Fast-Forward / Skip Animation
    const handleSkipAnimation = () => {
        stopAnimation();
        if (generatedSchedule) {
            setRevealedMatches(generatedSchedule);
        } else {
            const fullList = calculateFullSchedule();
            setGeneratedSchedule(fullList);
            setRevealedMatches(fullList);
        }
        setRoulettePhase('finished');
        setIsDrawing(true);
        setIsSpinning(false);
    };

    // Save Generated Schedule to Database
    const handleSaveGeneratedSchedule = () => {
        if (!generatedSchedule || generatedSchedule.length === 0) return;

        setIsSavingGenerated(true);
        const payload = {
            competition_id: parseInt(genCompId),
            clear_existing: genClearExisting,
            matches: generatedSchedule.map(m => ({
                home_team_id: m.home_team_id,
                away_team_id: m.away_team_id,
                match_date: m.match_date,
                venue: m.venue,
                round: m.round,
            })),
        };

        router.post('/admin/matches/generate', payload, {
            onSuccess: () => {
                setIsSavingGenerated(false);
                setShowGenModal(false);
                setGeneratedSchedule(null);
                setRevealedMatches([]);
            },
            onError: () => {
                setIsSavingGenerated(false);
            }
        });
    };

    // Grouping revealed matches by Pekan
    const groupedRevealedPekans = useMemo(() => {
        if (!revealedMatches || revealedMatches.length === 0) return {};
        const groups = {};
        revealedMatches.forEach(m => {
            if (!groups[m.round]) groups[m.round] = [];
            groups[m.round].push(m);
        });
        return groups;
    }, [revealedMatches]);

    // Summary KPIs
    const totalMatchesCount = matches.length;
    const scheduledMatchesCount = matches.filter(m => m.status === 'scheduled').length;
    const liveMatchesCount = matches.filter(m => m.status === 'live').length;
    const finishedMatchesCount = matches.filter(m => m.status === 'full_time').length;

    const hasMoreMatchesToDraw = generatedSchedule && (drawCurrentIndex + 1 < generatedSchedule.length);
    const isLastMatchJustDrawn = generatedSchedule && (drawCurrentIndex + 1 === generatedSchedule.length) && (roulettePhase === 'match_ready' || roulettePhase === 'finished');

    return (
        <AdminLayout title="Jadwal Match & Generator Liga">
            <div className="space-y-6">

                {/* Header Actions & KPI Banner */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 flex items-center">
                                <Calendar className="w-5 h-5 text-brand-500 mr-2" />
                                Manajemen Jadwal Pertandingan
                            </h2>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                Atur jadwal match manual atau gunakan <strong>Roulette & Generator Liga Otomatis</strong> dengan sistem undian per pertandingan (*step-by-step next match*).
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Auto Generator Button */}
                            <button
                                type="button"
                                onClick={() => setShowGenModal(true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 hover:from-brand-700 hover:to-orange-600 text-white font-black rounded-2xl text-xs shadow-md shadow-brand-500/25 transition-all flex items-center space-x-2 active:scale-95"
                            >
                                <Zap className="w-4 h-4 fill-white" />
                                <span>⚡ Putar Roulette & Undi Jadwal Liga</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Quick Badges & Filter Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center space-x-1.5">
                                <span>Total Match:</span>
                                <strong className="font-black text-gray-900">{totalMatchesCount}</strong>
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center space-x-1.5">
                                <span>Terjadwal:</span>
                                <strong className="font-black text-blue-900">{scheduledMatchesCount}</strong>
                            </span>
                            {liveMatchesCount > 0 && (
                                <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold flex items-center space-x-1.5 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-red-600" />
                                    <span>Sedang Live:</span>
                                    <strong className="font-black text-red-900">{liveMatchesCount}</strong>
                                </span>
                            )}
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center space-x-1.5">
                                <span>Selesai (FT):</span>
                                <strong className="font-black text-emerald-900">{finishedMatchesCount}</strong>
                            </span>
                        </div>

                        {/* Competition Filter */}
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-brand-500 shrink-0" />
                            <select
                                value={selectedCompetitionId || ''}
                                onChange={(e) => handleFilterComp(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-xs text-gray-800 outline-none transition-all"
                            >
                                <option value="">Semua Turnamen ({competitions.length})</option>
                                {competitions.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.is_active ? '★ (Aktif)' : ''}
                                    </option>
                                ))}
                            </select>

                            {selectedCompetitionId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const comp = competitions.find(c => c.id === selectedCompetitionId);
                                        if (comp) handleClearAllScheduled(comp);
                                    }}
                                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
                                    title="Bersihkan semua jadwal match berstatus scheduled pada turnamen ini"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Bersihkan Jadwal</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Grid: Single Match Form + Matches List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Form Create Single Match (Manual) */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm h-fit">
                        <h3 className="text-sm font-black text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="flex items-center">
                                <Plus className="w-4 h-4 text-brand-500 mr-2" />
                                Tambah Match Manual
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">Single Entry</span>
                        </h3>

                        <form onSubmit={submitSingle} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 mb-1">Pilih Turnamen</label>
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
                                    <label className="block font-bold text-gray-700 mb-1">Tuan Rumah (Home)</label>
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
                                    <label className="block font-bold text-gray-700 mb-1">Tamu (Away)</label>
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
                                <label className="block font-bold text-gray-700 mb-1">Babak / Matchday</label>
                                <input
                                    type="text"
                                    value={data.round}
                                    onChange={(e) => setData('round', e.target.value)}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900"
                                    placeholder="Contoh: Pekan 1 / Semi Final"
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
                                disabled={processing}
                                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md text-xs transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{processing ? 'Menyimpan...' : 'Jadwalkan Pertandingan'}</span>
                            </button>
                        </form>
                    </div>

                    {/* Match List Table & Mobile Cards */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-black text-gray-900">
                                Daftar Pertandingan ({matches.length})
                            </h3>
                            <span className="text-[11px] font-bold text-gray-400">
                                Urutan berdasarkan kick-off
                            </span>
                        </div>

                        {matches.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="font-bold text-xs text-gray-600">Belum ada jadwal pertandingan.</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    Klik tombol <strong>"Putar Roulette & Undi Jadwal Liga"</strong> di atas untuk membuat jadwal otomatis.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards (< md) */}
                                <div className="block md:hidden space-y-3">
                                    {matches.map((m) => (
                                        <div key={m.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-2.5 text-xs">
                                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                                                <span className="px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-brand-600 font-black">
                                                    {m.round}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] ${
                                                    m.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                                                    m.status === 'full_time' ? 'bg-gray-200 text-gray-700' : 'bg-brand-100 text-brand-700'
                                                }`}>
                                                    {m.status === 'scheduled' ? 'TERJADWAL' : m.status === 'live' ? '● LIVE' : 'SELESAI'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between font-black text-sm text-gray-900 py-1">
                                                <div className="w-5/12 flex items-center space-x-2 min-w-0">
                                                    <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[9px] font-black shrink-0 overflow-hidden">
                                                        {m.home_team?.logo_url ? (
                                                            <img src={m.home_team.logo_url} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            m.home_team?.short_name || 'H'
                                                        )}
                                                    </div>
                                                    <span className="truncate">{m.home_team?.name}</span>
                                                </div>

                                                <span className="w-2/12 text-center text-xs font-black text-brand-600 px-1 py-0.5 rounded bg-white border border-brand-100">
                                                    {m.status === 'scheduled' ? 'VS' : `${m.home_score} - ${m.away_score}`}
                                                </span>

                                                <div className="w-5/12 flex items-center justify-end space-x-2 min-w-0 text-right">
                                                    <span className="truncate">{m.away_team?.name}</span>
                                                    <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[9px] font-black shrink-0 overflow-hidden">
                                                        {m.away_team?.logo_url ? (
                                                            <img src={m.away_team.logo_url} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            m.away_team?.short_name || 'A'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold pt-2 border-t border-gray-200/60">
                                                <span>⏱️ {new Date(m.match_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
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
                                                <th className="py-3 px-3">Pekan / Waktu</th>
                                                <th className="py-3 px-4 text-center">Pertandingan (Home vs Away)</th>
                                                <th className="py-3 px-3 text-center">Skor</th>
                                                <th className="py-3 px-3 text-center">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {matches.map((m) => (
                                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-3 font-bold text-gray-900">
                                                        <div>
                                                            <span className="font-black text-brand-600 block">{m.round}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {new Date(m.match_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-gray-900">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <span className="font-black text-gray-900">{m.home_team?.name}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold px-1.5 py-0.5 bg-gray-100 rounded">VS</span>
                                                            <span className="font-black text-gray-900">{m.away_team?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-black text-brand-600">
                                                        {m.status === 'scheduled' ? '-' : `${m.home_score} - ${m.away_score}`}
                                                    </td>
                                                    <td className="py-3 px-3 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                                            m.status === 'live' ? 'bg-red-500 text-white animate-pulse' :
                                                            m.status === 'full_time' ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600'
                                                        }`}>
                                                            {m.status === 'scheduled' ? 'Terjadwal' : m.status === 'live' ? 'Live' : 'Selesai'}
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
                            </>
                        )}
                    </div>
                </div>

            </div>

            {/* ========================================================================= */}
            {/* INTERACTIVE ROUND-ROBIN LEAGUE GENERATOR & ROULETTE DRAW MODAL            */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showGenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                            className="bg-white border border-gray-100 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto"
                        >
                            {/* Modal Header */}
                            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-between shrink-0 border-b border-white/10">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
                                        <Zap className="w-5 h-5 fill-slate-950" />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black text-white leading-tight flex items-center space-x-2">
                                            <span>Roulette & Undian Jadwal Liga</span>
                                            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-brand-500/30 text-brand-300 border border-brand-500/40">
                                                Step-by-Step Draw
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-300 font-medium">
                                            Undi pertandingan adil per pertandingan dengan tombol Next Match dan kalkulasi waktu istirahat.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { stopAnimation(); setShowGenModal(false); }}
                                    className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
                                
                                {/* Step 1: Configuration Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80 text-xs">
                                    {/* Turnamen Selection */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Turnamen / Kompetisi Target</label>
                                        <select
                                            value={genCompId}
                                            onChange={(e) => setGenCompId(e.target.value)}
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500"
                                        >
                                            {competitions.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.is_active ? '★ (Aktif)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Format Turnamen */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Format Pertemuan Tim</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setGenFormat('single'); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                className={`p-2 rounded-xl font-bold border transition-all text-center ${
                                                    genFormat === 'single'
                                                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                1 Putaran (1x Bertemu)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setGenFormat('double'); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                className={`p-2 rounded-xl font-bold border transition-all text-center ${
                                                    genFormat === 'double'
                                                        ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                2 Putaran (Home & Away)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Kick-off Time */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Tanggal & Jam Kick-off Pertama</label>
                                        <input
                                            type="datetime-local"
                                            value={genStartDate}
                                            onChange={(e) => { setGenStartDate(e.target.value); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900"
                                        />
                                    </div>

                                    {/* Pekan Interval Mode */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Pola Jadwal Antar Pekan</label>
                                        <select
                                            value={genPekanIntervalMode}
                                            onChange={(e) => { setGenPekanIntervalMode(e.target.value); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 outline-none"
                                        >
                                            <option value="same_day">⚡ Lanjut di Hari yang Sama (Turnamen 1 Hari Penuh)</option>
                                            <option value="next_day">📅 Ganti Hari Berikutnya (+1 Hari Setiap Pekan Baru)</option>
                                            <option value="weekly">🗓️ Mingguan / Weekend (+7 Hari Setiap Pekan Baru)</option>
                                        </select>
                                    </div>

                                    {/* Venue */}
                                    <div>
                                        <label className="block font-bold text-gray-700 mb-1">Lokasi / Venue Lapangan</label>
                                        <input
                                            type="text"
                                            value={genVenue}
                                            onChange={(e) => { setGenVenue(e.target.value); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-900"
                                            placeholder="Rama Futsall Kadipaten"
                                        />
                                    </div>

                                    {/* Clear Existing Checkbox */}
                                    <div className="flex items-center space-x-2 pt-4">
                                        <input
                                            type="checkbox"
                                            id="genClearExisting"
                                            checked={genClearExisting}
                                            onChange={(e) => setGenClearExisting(e.target.checked)}
                                            className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                                        />
                                        <label htmlFor="genClearExisting" className="font-bold text-gray-800 cursor-pointer">
                                            Hapus jadwal match lama pada turnamen ini sebelum simpan
                                        </label>
                                    </div>
                                </div>

                                {/* Step 2: Duration & Rest Calculation */}
                                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-amber-900 uppercase tracking-wider text-[11px] flex items-center">
                                            <Timer className="w-4 h-4 mr-1.5 text-amber-600" />
                                            Kalkulasi Waktu Bermain & Istirahat (Mulai 5 Menit)
                                        </h4>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                                            Total Slot: {totalSlotAllocatedMinutes} Menit / Match
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {/* Durasi Per Babak */}
                                        <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-xs">
                                            <label className="block font-bold text-gray-800 text-[11px] mb-1 flex items-center justify-between">
                                                <span>⏱️ Durasi Per Babak</span>
                                                <span className="text-brand-600 font-black">{genHalfDuration}' mnt</span>
                                            </label>
                                            <div className="relative mb-1.5">
                                                <input
                                                    type="number"
                                                    min={5}
                                                    max={90}
                                                    value={genHalfDuration}
                                                    onChange={(e) => { setGenHalfDuration(parseInt(e.target.value) || 5); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-black text-center text-gray-900 text-xs"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {[5, 10, 15, 20, 25, 30, 45].map(m => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => { setGenHalfDuration(m); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${genHalfDuration === m ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {m}'
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Istirahat Half Time */}
                                        <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-xs">
                                            <label className="block font-bold text-gray-800 text-[11px] mb-1 flex items-center justify-between">
                                                <span>☕ Istirahat Halftime (HT)</span>
                                                <span className="text-amber-600 font-black">{genHalfTimeBreak}' mnt</span>
                                            </label>
                                            <div className="relative mb-1.5">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={60}
                                                    value={genHalfTimeBreak}
                                                    onChange={(e) => { setGenHalfTimeBreak(parseInt(e.target.value) || 5); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-black text-center text-gray-900 text-xs"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {[2, 3, 5, 10, 15].map(m => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => { setGenHalfTimeBreak(m); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${genHalfTimeBreak === m ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {m}'
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Jeda Istirahat Antar Pertandingan */}
                                        <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-xs">
                                            <label className="block font-bold text-gray-800 text-[11px] mb-1 flex items-center justify-between">
                                                <span>🔄 Jeda Antar Match</span>
                                                <span className="text-teal-600 font-black">{genPostMatchBreak}' mnt</span>
                                            </label>
                                            <div className="relative mb-1.5">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={120}
                                                    value={genPostMatchBreak}
                                                    onChange={(e) => { setGenPostMatchBreak(parseInt(e.target.value) || 0); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg font-black text-center text-gray-900 text-xs"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {[0, 5, 10, 15, 20, 30].map(m => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => { setGenPostMatchBreak(m); setGeneratedSchedule(null); setRevealedMatches([]); }}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${genPostMatchBreak === m ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {m}'
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Breakdown Formula Summary */}
                                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                        <div className="flex flex-wrap items-center gap-1.5 text-gray-700 font-bold">
                                            <span>Rincian Waktu Match:</span>
                                            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700">Babak 1 ({genHalfDuration}')</span>
                                            <span>+</span>
                                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">Istirahat HT ({genHalfTimeBreak}')</span>
                                            <span>+</span>
                                            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700">Babak 2 ({genHalfDuration}')</span>
                                            <span>+</span>
                                            <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700">Jeda Antar Match ({genPostMatchBreak}')</span>
                                        </div>
                                        <div className="font-black text-amber-900">
                                            = {totalSlotAllocatedMinutes} Menit Per Match Slot
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: Select Participating Teams */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-gray-900 flex items-center">
                                            <Users className="w-4 h-4 text-brand-500 mr-1.5" />
                                            Pilih Tim Peserta ({selectedGenTeamIds.length} dari {teams.length} Tim Terpilih)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllGenTeams}
                                            className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                                        >
                                            {selectedGenTeamIds.length === teams.length ? 'Batal Pilih Semua' : 'Pilih Semua Tim'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {teams.map((t) => {
                                            const isSelected = selectedGenTeamIds.includes(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => handleToggleGenTeam(t.id)}
                                                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                                        isSelected
                                                            ? 'bg-brand-50 border-brand-300 text-brand-900 shadow-xs'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0">
                                                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden">
                                                            {t.logo_url ? (
                                                                <img src={t.logo_url} alt="" className="w-full h-full object-contain" />
                                                            ) : (
                                                                t.short_name
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold truncate">{t.name}</span>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                                                        isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'
                                                    }`}>
                                                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 4: Action Controls & Mode Selector */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {/* Step-by-Step Button */}
                                        <button
                                            type="button"
                                            disabled={selectedGenTeamIds.length < 2 || isSpinning}
                                            onClick={() => handleStartRoulette('step_by_step')}
                                            className="px-6 py-3.5 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 hover:from-brand-700 hover:to-orange-600 disabled:opacity-50 text-white font-black rounded-2xl shadow-xl shadow-brand-500/25 transition-all text-xs flex items-center space-x-2 active:scale-95"
                                        >
                                            <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                                            <span>
                                                {isSpinning ? 'Sedang Mengundi Match...' : revealedMatches.length > 0 ? '🎲 Undi Ulang dari Awal' : '🎲 Mulai Undian Match per Match (Next)'}
                                            </span>
                                        </button>

                                        {/* Auto-Play Button */}
                                        <button
                                            type="button"
                                            disabled={selectedGenTeamIds.length < 2 || isSpinning}
                                            onClick={() => handleStartRoulette('auto_play')}
                                            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition-colors shadow-md active:scale-95"
                                            title="Undi otomatis berjalan santai 2-3 detik per match"
                                        >
                                            <PlayCircle className="w-4 h-4 text-emerald-400" />
                                            <span>Putar Otomatis (Santai)</span>
                                        </button>

                                        {/* Skip Button */}
                                        {isDrawing && (
                                            <button
                                                type="button"
                                                onClick={handleSkipAnimation}
                                                className="px-4 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition-colors"
                                            >
                                                <FastForward className="w-4 h-4 text-amber-600" />
                                                <span>Buka Semua Sekaligus</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ========================================================= */}
                                {/* CINEMATIC ROULETTE STAGE ANIMATION CARD                   */}
                                {/* ========================================================= */}
                                {isDrawing && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-6 border border-amber-500/40 shadow-2xl text-white space-y-4 relative overflow-hidden"
                                    >
                                        {/* Background Pulse Glow */}
                                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
                                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

                                        {/* Draw Status Header & Progress Bar */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                                                    <span>LIVE DRAW ROULETTE</span>
                                                    <span>•</span>
                                                    <span className="text-white font-bold">{activeMatchInDraw?.round || 'Pekan 1'}</span>
                                                </span>
                                            </div>

                                            <div className="text-[11px] font-bold text-slate-300">
                                                Match <strong className="text-white font-black">{drawCurrentIndex + 1}</strong> dari <strong className="text-white font-black">{generatedSchedule?.length || 0}</strong> Pertandingan
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                className="bg-gradient-to-r from-brand-500 via-amber-400 to-emerald-400 h-full rounded-full"
                                                style={{
                                                    width: `${((revealedMatches.length) / (generatedSchedule?.length || 1)) * 100}%`
                                                }}
                                                transition={{ duration: 0.4 }}
                                            />
                                        </div>

                                        {/* 3D Roulette Duel Arena Box */}
                                        <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center py-2">
                                            {/* Home Team Reel */}
                                            <div className={`sm:col-span-5 p-4 rounded-2xl border transition-all flex items-center space-x-3 bg-slate-900/90 ${
                                                roulettePhase === 'spinning_home'
                                                    ? 'border-brand-400 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/20 animate-pulse'
                                                    : rouletteHomeTeam
                                                    ? 'border-emerald-500/50 bg-slate-900'
                                                    : 'border-slate-700'
                                            }`}>
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden shadow-inner">
                                                    {rouletteHomeTeam?.logo_url ? (
                                                        <img src={rouletteHomeTeam.logo_url} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-base font-black text-amber-400">{rouletteHomeTeam?.short_name || 'H'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                                        {roulettePhase === 'spinning_home' ? '🎲 MEMUTAR TUAN RUMAH...' : 'TUAN RUMAH (HOME)'}
                                                    </span>
                                                    <h4 className="text-sm font-black text-white truncate">
                                                        {rouletteHomeTeam?.name || 'Menunggu Undian...'}
                                                    </h4>
                                                </div>
                                                {roulettePhase !== 'spinning_home' && rouletteHomeTeam && (
                                                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            {/* Center VS Lightning Icon */}
                                            <div className="sm:col-span-1 text-center flex flex-col items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-lg shadow-amber-500/40 animate-bounce">
                                                    VS
                                                </div>
                                            </div>

                                            {/* Away Team Reel */}
                                            <div className={`sm:col-span-5 p-4 rounded-2xl border transition-all flex items-center space-x-3 bg-slate-900/90 ${
                                                roulettePhase === 'spinning_away'
                                                    ? 'border-brand-400 ring-2 ring-brand-400/50 shadow-lg shadow-brand-500/20 animate-pulse'
                                                    : (roulettePhase === 'locked_away' || roulettePhase === 'match_ready' || roulettePhase === 'finished')
                                                    ? 'border-emerald-500/50 bg-slate-900'
                                                    : 'border-slate-700'
                                            }`}>
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden shadow-inner">
                                                    {rouletteAwayTeam?.logo_url ? (
                                                        <img src={rouletteAwayTeam.logo_url} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-base font-black text-amber-400">{rouletteAwayTeam?.short_name || 'A'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                                        {roulettePhase === 'spinning_away' ? '🎲 MEMUTAR TIM TAMU...' : 'TIM TAMU (AWAY)'}
                                                    </span>
                                                    <h4 className="text-sm font-black text-white truncate">
                                                        {rouletteAwayTeam?.name || 'Menunggu Undian...'}
                                                    </h4>
                                                </div>
                                                {(roulettePhase === 'locked_away' || roulettePhase === 'match_ready' || roulettePhase === 'finished') && rouletteAwayTeam && (
                                                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Match Details Sub-bar */}
                                        <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                                            <span className="flex items-center space-x-1.5">
                                                <Clock className="w-4 h-4 text-amber-400" />
                                                <span>Kick-off: <strong className="text-white">{activeMatchInDraw?.kickOffStr} - {activeMatchInDraw?.endTimeStr} WIB</strong></span>
                                            </span>
                                            <span className="flex items-center space-x-1.5">
                                                <Coffee className="w-4 h-4 text-amber-400" />
                                                <span>HT: <strong className="text-white">{genHalfTimeBreak}'</strong> • Jeda: <strong className="text-white">{genPostMatchBreak}'</strong></span>
                                            </span>
                                            <span className="flex items-center space-x-1.5">
                                                <MapPin className="w-4 h-4 text-amber-400" />
                                                <span className="truncate">{activeMatchInDraw?.venue}</span>
                                            </span>
                                        </div>

                                        {/* NEXT MATCH MANUAL STEP BUTTON (Paling Nyaman & Dinikmati) */}
                                        {!isSpinning && (
                                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                                {hasMoreMatchesToDraw && (
                                                    <motion.button
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        type="button"
                                                        onClick={handleDrawNextMatch}
                                                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 text-xs flex items-center justify-center space-x-2"
                                                    >
                                                        <span>▶️ Undi Match Berikutnya (Match {drawCurrentIndex + 2} dari {generatedSchedule?.length})</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </motion.button>
                                                )}

                                                {isLastMatchJustDrawn && (
                                                    <div className="w-full sm:w-auto px-6 py-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black rounded-2xl text-xs text-center flex items-center justify-center space-x-2">
                                                        <Award className="w-4 h-4 text-emerald-400" />
                                                        <span>🎉 Seluruh Pertandingan Selesai Diundi!</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ========================================================= */}
                                {/* REVEALED MATCHES LIST (ANIMATED 1-BY-1 CARDS)             */}
                                {/* ========================================================= */}
                                {revealedMatches.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4 pt-4 border-t border-gray-100"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 text-xs">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                <div>
                                                    <p className="font-black">
                                                        {revealedMatches.length === (generatedSchedule?.length || 0)
                                                            ? `🎉 Seluruh Jadwal Berhasil Diundi! (${revealedMatches.length} Pertandingan Siap)`
                                                            : `Hasil Undian Berlangsung: (${revealedMatches.length} dari ${generatedSchedule?.length || 0} Pertandingan)`}
                                                    </p>
                                                    <p className="text-[11px] text-emerald-700">
                                                        Setiap match dialokasikan {totalSlotAllocatedMinutes} menit (Main: {totalMatchPlayMinutes}' • HT: {genHalfTimeBreak}' • Jeda: {genPostMatchBreak}').
                                                    </p>
                                                </div>
                                            </div>

                                            {revealedMatches.length === (generatedSchedule?.length || 0) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartRoulette('step_by_step')}
                                                    className="px-3 py-1.5 bg-white text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center space-x-1 shrink-0"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>Undi Ulang</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Pekan Grouping Accordions with Staggered Fade-in */}
                                        <div className="space-y-3">
                                            {Object.entries(groupedRevealedPekans).map(([pekanTitle, matchItems]) => (
                                                <div key={pekanTitle} className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-200/80 space-y-2.5">
                                                    <div className="flex items-center justify-between font-black text-xs text-gray-900">
                                                        <span className="flex items-center space-x-1.5 text-brand-600">
                                                            <Layers className="w-4 h-4" />
                                                            <span>{pekanTitle}</span>
                                                            <span className="text-gray-400 font-normal">({matchItems.length} Match)</span>
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-bold">
                                                            📅 {new Date(matchItems[0]?.match_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                        {matchItems.map((item, idx) => (
                                                            <motion.div
                                                                key={item.tempId || idx}
                                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                                className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-xs space-y-2 text-xs hover:border-brand-300 transition-colors"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2 min-w-0">
                                                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden border border-gray-200">
                                                                            {item.home_team?.logo_url ? (
                                                                                <img src={item.home_team.logo_url} alt="" className="w-full h-full object-contain" />
                                                                            ) : (
                                                                                item.home_team?.short_name
                                                                            )}
                                                                        </div>
                                                                        <span className="font-bold text-gray-900 truncate">{item.home_team?.name}</span>
                                                                    </div>

                                                                    <span className="text-[10px] font-black text-brand-600 px-2 py-0.5 bg-brand-50 rounded mx-2 shrink-0 border border-brand-100">
                                                                        VS
                                                                    </span>

                                                                    <div className="flex items-center justify-end space-x-2 min-w-0 text-right">
                                                                        <span className="font-bold text-gray-900 truncate">{item.away_team?.name}</span>
                                                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden border border-gray-200">
                                                                            {item.away_team?.logo_url ? (
                                                                                <img src={item.away_team.logo_url} alt="" className="w-full h-full object-contain" />
                                                                            ) : (
                                                                                item.away_team?.short_name
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Time details badge per match */}
                                                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                                                                    <span className="text-brand-600 font-black flex items-center space-x-1">
                                                                        <Clock className="w-3 h-3 text-brand-500" />
                                                                        <span>{item.kickOffStr} - {item.endTimeStr} WIB</span>
                                                                    </span>
                                                                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-bold">
                                                                        +Jeda {genPostMatchBreak}'
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { stopAnimation(); setShowGenModal(false); }}
                                    className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Tutup
                                </button>

                                {revealedMatches.length > 0 && !isSpinning && (
                                    <button
                                        type="button"
                                        disabled={isSavingGenerated}
                                        onClick={handleSaveGeneratedSchedule}
                                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4 stroke-[3]" />
                                        <span>
                                            {isSavingGenerated ? 'Menyimpan ke Database...' : `Simpan ${revealedMatches.length} Jadwal ke Database`}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Jadwal Pertandingan"
                message={`Apakah Anda yakin ingin menghapus jadwal pertandingan "${deleteModal.desc}"? Seluruh data event dan live control match ini akan ikut terhapus.`}
                confirmText="Ya, Hapus Match"
                onConfirm={confirmDeleteMatch}
                onClose={() => setDeleteModal({ isOpen: false, id: null, desc: '' })}
            />

            {/* Custom Styled Clear Competition Matches Modal */}
            <ConfirmModal
                isOpen={clearModal.isOpen}
                title="Bersihkan Semua Jadwal Terjadwal"
                message={`Apakah Anda yakin ingin menghapus SEMUA jadwal match yang berstatus "scheduled" pada turnamen "${clearModal.compName}"? Pertandingan yang sudah LIVE atau SELESAI tidak akan terhapus.`}
                confirmText="Ya, Bersihkan Jadwal"
                type="warning"
                onConfirm={confirmClearMatches}
                onClose={() => setClearModal({ isOpen: false, compId: null, compName: '' })}
            />
        </AdminLayout>
    );
}
