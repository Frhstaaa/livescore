import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Shuffle, Users, CheckCircle, Clock, Plus, Trash2, Filter,
    Sparkles, UserCheck, Shield, Award, Phone, ArrowRight,
    Play, FastForward, RotateCcw, Trophy, Check, Zap, X, Search,
    CheckSquare, Square, ArrowUpRight, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAM_THEMES = [
    { name: 'Tim Garuda', short: 'GAR', color: 'from-red-500 to-rose-600', border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    { name: 'Tim Elang', short: 'ELG', color: 'from-blue-500 to-cyan-600', border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    { name: 'Tim Rajawali', short: 'RJW', color: 'from-emerald-500 to-teal-600', border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
    { name: 'Tim Harimau', short: 'HRM', color: 'from-amber-500 to-orange-600', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    { name: 'Tim Singa', short: 'SNG', color: 'from-purple-500 to-indigo-600', border: 'border-purple-300', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    { name: 'Tim Badak', short: 'BDK', color: 'from-zinc-600 to-slate-700', border: 'border-zinc-300', bg: 'bg-zinc-50', text: 'text-zinc-700', badge: 'bg-zinc-100 text-zinc-800' },
];

export default function Index({ registrants = [], competitions = [], teams = [], filters = {} }) {
    const { flash } = usePage().props;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

    // FILTER & SEARCH STATE
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'assigned'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosFilter, setSelectedPosFilter] = useState('ALL');

    // MANUAL ASSIGN SINGLE PLAYER MODAL
    const [assignModalPlayer, setAssignModalPlayer] = useState(null);
    const [singleAssignForm, setSingleAssignForm] = useState({
        team_id: '',
        jersey_number: '',
        position: 'Flank',
    });
    const [assignProcessing, setAssignProcessing] = useState(false);

    // BULK ASSIGN STATE
    const [selectedRegistrantIds, setSelectedRegistrantIds] = useState([]);
    const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
    const [selectedBulkTeamId, setSelectedBulkTeamId] = useState('');

    // ROULETTE / DRAFT STATE
    const [showRouletteModal, setShowRouletteModal] = useState(false);
    const [rouletteStage, setRouletteStage] = useState('setup'); // 'setup' | 'spinning' | 'finished'
    const [teamCount, setTeamCount] = useState(2);
    const [customTeamNames, setCustomTeamNames] = useState(['', '', '', '']);
    const [draftQueue, setDraftQueue] = useState([]);
    const [draftedTeams, setDraftedTeams] = useState([]);
    const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rouletteActiveTeamIndex, setRouletteActiveTeamIndex] = useState(0);
    const [autoSpin, setAutoSpin] = useState(false);
    const [lastDraftedPlayer, setLastDraftedPlayer] = useState(null);

    const spinTimerRef = useRef(null);
    const autoSpinTimeoutRef = useRef(null);

    const selectedCompId = filters.competition_id || (competitions.length > 0 ? competitions[0].id : '');

    // Form for Creating Manual Registrant
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        competition_id: selectedCompId,
        name: '',
        phone: '',
        position: 'Flank',
    });

    const handleFilterChange = (e) => {
        const compId = e.target.value;
        router.get('/admin/registrants', compId ? { competition_id: compId } : {}, { preserveState: true });
        setCreateData('competition_id', compId);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        postCreate('/admin/registrants', {
            onSuccess: () => {
                resetCreate('name', 'phone');
                setShowCreateModal(false);
            },
        });
    };

    const handleDelete = (id, name) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const confirmDeleteRegistrant = () => {
        if (!deleteModal.id) return;
        router.delete(`/admin/registrants/${deleteModal.id}`, {
            onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' })
        });
    };

    const handleToggleStatus = (registrant) => {
        const nextStatus = registrant.status === 'pending' ? 'assigned' : 'pending';
        router.put(`/admin/registrants/${registrant.id}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    // Open Single Assign Modal
    const openSingleAssignModal = (registrant) => {
        setAssignModalPlayer(registrant);
        setSingleAssignForm({
            team_id: teams[0]?.id || '',
            jersey_number: '',
            position: registrant.position || 'Flank',
        });
    };

    // Submit Single Assign Form
    const handleSingleAssignSubmit = (e) => {
        e.preventDefault();
        if (!singleAssignForm.team_id || !assignModalPlayer) return;

        setAssignProcessing(true);
        router.post(`/admin/registrants/${assignModalPlayer.id}/assign`, singleAssignForm, {
            preserveScroll: true,
            onSuccess: () => {
                setAssignModalPlayer(null);
                setAssignProcessing(false);
            },
            onError: () => {
                setAssignProcessing(false);
            }
        });
    };

    // Submit Bulk Assign Form
    const handleBulkAssignSubmit = (e) => {
        e.preventDefault();
        if (!selectedBulkTeamId || selectedRegistrantIds.length === 0) return;

        setAssignProcessing(true);
        router.post('/admin/registrants/bulk-assign', {
            registrant_ids: selectedRegistrantIds,
            team_id: selectedBulkTeamId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedRegistrantIds([]);
                setShowBulkAssignModal(false);
                setAssignProcessing(false);
            },
            onError: () => {
                setAssignProcessing(false);
            }
        });
    };

    const pendingRegistrants = registrants.filter(r => r.status === 'pending');
    const assignedRegistrants = registrants.filter(r => r.status === 'assigned');
    const pendingCount = pendingRegistrants.length;
    const assignedCount = assignedRegistrants.length;

    const posCounts = {
        GK: registrants.filter(r => ['GK', 'Kiper'].includes(r.position)).length,
        DEF: registrants.filter(r => ['DEF', 'Anchor', 'Defender'].includes(r.position)).length,
        MID: registrants.filter(r => ['MID', 'Flank', 'Midfielder'].includes(r.position)).length,
        FWD: registrants.filter(r => ['FWD', 'Pivot', 'Forward'].includes(r.position)).length,
    };

    const positionBadges = {
        GK: { label: 'Goalkeeper', icon: '🧤', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
        Kiper: { label: 'Goalkeeper', icon: '🧤', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
        Anchor: { label: 'Anchor', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
        DEF: { label: 'Defender', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
        Defender: { label: 'Defender', icon: '🛡️', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
        Flank: { label: 'Flank', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        MID: { label: 'Midfielder', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        Midfielder: { label: 'Midfielder', icon: '⚡', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        Pivot: { label: 'Pivot', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
        FWD: { label: 'Forward', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
        Forward: { label: 'Forward', icon: '🎯', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
    };

    // Filter registrants for table
    const filteredRegistrants = registrants.filter(r => {
        // Status filter
        if (statusFilter === 'pending' && r.status !== 'pending') return false;
        if (statusFilter === 'assigned' && r.status !== 'assigned') return false;

        // Position filter
        if (selectedPosFilter === 'GK' && !['GK', 'Kiper'].includes(r.position)) return false;
        if (selectedPosFilter === 'DEF' && !['DEF', 'Anchor', 'Defender'].includes(r.position)) return false;
        if (selectedPosFilter === 'MID' && !['MID', 'Flank', 'Midfielder'].includes(r.position)) return false;
        if (selectedPosFilter === 'FWD' && !['FWD', 'Pivot', 'Forward'].includes(r.position)) return false;

        // Search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchesName = r.name?.toLowerCase().includes(q);
            const matchesPhone = r.phone?.toLowerCase().includes(q);
            const matchesPos = r.position?.toLowerCase().includes(q);
            return matchesName || matchesPhone || matchesPos;
        }

        return true;
    });

    // Toggle select all
    const handleToggleSelectAll = () => {
        if (selectedRegistrantIds.length === filteredRegistrants.length) {
            setSelectedRegistrantIds([]);
        } else {
            setSelectedRegistrantIds(filteredRegistrants.map(r => r.id));
        }
    };

    // Toggle select row
    const handleToggleSelectRow = (id) => {
        setSelectedRegistrantIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // ==========================================
    // 🔴 LIVE SYNC TO PUBLIC BUBBLE
    // ==========================================
    const syncLiveDraftState = (stage, player, currentTeams, activeIdx, lastDrafted = null, total = draftQueue.length, currentIdx = currentDraftIndex) => {
        const payload = {
            stage: stage,
            competition_id: selectedCompId,
            total_players: total,
            current_draft_index: currentIdx,
            current_player: player ? { id: player.id, name: player.name, position: player.position } : null,
            active_team_index: activeIdx,
            last_drafted: lastDrafted,
            teams: currentTeams.map(t => ({
                id: t.id,
                name: t.name,
                theme: t.theme,
                players: t.players || []
            }))
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        fetch('/admin/live-draft/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Failed to sync live draft state:', err));
    };

    const clearLiveDraftState = () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch('/admin/live-draft/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken || '',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ competition_id: selectedCompId })
        }).catch(err => console.error('Failed to clear live draft state:', err));
    };

    // ROULETTE LOGIC
    const openRoulette = () => {
        const eligible = pendingRegistrants.length > 0 ? pendingRegistrants : registrants;
        const shuffled = [...eligible].sort(() => Math.random() - 0.5);
        const gks = shuffled.filter(p => ['GK', 'Kiper'].includes(p.position));
        const nonGks = shuffled.filter(p => !['GK', 'Kiper'].includes(p.position));
        const prioritizedQueue = [...gks, ...nonGks];

        setDraftQueue(prioritizedQueue);
        setCurrentDraftIndex(0);
        setRouletteStage('setup');
        setShowRouletteModal(true);
        setAutoSpin(false);
        setIsSpinning(false);
        setLastDraftedPlayer(null);

        const initialCount = 4;
        setTeamCount(initialCount);
        const initialTeams = Array.from({ length: initialCount }, (_, i) => ({
            id: `team-${i + 1}`,
            name: customTeamNames[i] || TEAM_THEMES[i % TEAM_THEMES.length].name,
            theme: TEAM_THEMES[i % TEAM_THEMES.length],
            players: []
        }));
        setDraftedTeams(initialTeams);

        syncLiveDraftState('setup', null, initialTeams, 0, null, prioritizedQueue.length, 0);
    };

    const startRouletteDraft = () => {
        const teamsInit = Array.from({ length: teamCount }, (_, i) => ({
            id: `team-${i + 1}`,
            name: customTeamNames[i] || TEAM_THEMES[i % TEAM_THEMES.length].name,
            theme: TEAM_THEMES[i % TEAM_THEMES.length],
            players: []
        }));

        setDraftedTeams(teamsInit);
        setRouletteStage('spinning');
        setCurrentDraftIndex(0);

        if (draftQueue.length > 0) {
            syncLiveDraftState('spinning', draftQueue[0], teamsInit, 0, null, draftQueue.length, 0);
        }
    };

    const executeSpin = () => {
        if (isSpinning || currentDraftIndex >= draftQueue.length) return;

        setIsSpinning(true);
        const player = draftQueue[currentDraftIndex];
        const currentTeams = [...draftedTeams];

        let candidateTeamIndices = [];
        if (['GK', 'Kiper'].includes(player.position)) {
            const gkCounts = currentTeams.map(t => t.players.filter(p => ['GK', 'Kiper'].includes(p.position)).length);
            const minGk = Math.min(...gkCounts);
            candidateTeamIndices = gkCounts
                .map((count, idx) => (count === minGk ? idx : null))
                .filter(idx => idx !== null);
        } else {
            const totalCounts = currentTeams.map(t => t.players.length);
            const minPlayers = Math.min(...totalCounts);
            candidateTeamIndices = totalCounts
                .map((count, idx) => (count === minPlayers ? idx : null))
                .filter(idx => idx !== null);
        }

        const winningTeamIndex = candidateTeamIndices[Math.floor(Math.random() * candidateTeamIndices.length)];

        let step = 0;
        const totalSteps = 15 + (winningTeamIndex % teamCount);
        let speed = 50;

        const cycle = () => {
            step++;
            const currentIdx = step % teamCount;
            setRouletteActiveTeamIndex(currentIdx);

            if (step < totalSteps) {
                speed += 12;
                spinTimerRef.current = setTimeout(cycle, speed);
            } else {
                setRouletteActiveTeamIndex(winningTeamIndex);
                currentTeams[winningTeamIndex].players.push(player);
                setDraftedTeams([...currentTeams]);
                setIsSpinning(false);

                const lastDrafted = { player, team: currentTeams[winningTeamIndex] };
                setLastDraftedPlayer(lastDrafted);

                const nextIndex = currentDraftIndex + 1;
                setCurrentDraftIndex(nextIndex);

                if (nextIndex >= draftQueue.length) {
                    setRouletteStage('finished');
                    setAutoSpin(false);
                    syncLiveDraftState('finished', null, currentTeams, winningTeamIndex, lastDrafted, draftQueue.length, nextIndex);
                } else {
                    const nextPlayer = draftQueue[nextIndex];
                    syncLiveDraftState('spinning', nextPlayer, currentTeams, winningTeamIndex, lastDrafted, draftQueue.length, nextIndex);
                }
            }
        };

        cycle();
    };

    useEffect(() => {
        if (autoSpin && !isSpinning && rouletteStage === 'spinning' && currentDraftIndex < draftQueue.length) {
            autoSpinTimeoutRef.current = setTimeout(() => {
                executeSpin();
            }, 600);
        }
        return () => {
            if (autoSpinTimeoutRef.current) clearTimeout(autoSpinTimeoutRef.current);
            if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
        };
    }, [autoSpin, isSpinning, rouletteStage, currentDraftIndex]);

    const handleInstantFinish = () => {
        if (rouletteStage !== 'spinning') return;
        setAutoSpin(false);
        if (spinTimerRef.current) clearTimeout(spinTimerRef.current);

        const teamsCopy = draftedTeams.map(t => ({ ...t, players: [...t.players] }));
        for (let i = currentDraftIndex; i < draftQueue.length; i++) {
            const player = draftQueue[i];
            let candidateTeamIndices = [];

            if (['GK', 'Kiper'].includes(player.position)) {
                const gkCounts = teamsCopy.map(t => t.players.filter(p => ['GK', 'Kiper'].includes(p.position)).length);
                const minGk = Math.min(...gkCounts);
                candidateTeamIndices = gkCounts
                    .map((count, idx) => (count === minGk ? idx : null))
                    .filter(idx => idx !== null);
            } else {
                const totalCounts = teamsCopy.map(t => t.players.length);
                const minPlayers = Math.min(...totalCounts);
                candidateTeamIndices = totalCounts
                    .map((count, idx) => (count === minPlayers ? idx : null))
                    .filter(idx => idx !== null);
            }

            const winningTeamIndex = candidateTeamIndices[Math.floor(Math.random() * candidateTeamIndices.length)];
            teamsCopy[winningTeamIndex].players.push(player);
        }

        setDraftedTeams(teamsCopy);
        setCurrentDraftIndex(draftQueue.length);
        setRouletteStage('finished');
        setIsSpinning(false);

        syncLiveDraftState('finished', null, teamsCopy, 0, null, draftQueue.length, draftQueue.length);
    };

    const saveRouletteResult = () => {
        const payload = {
            competition_id: selectedCompId,
            teams_count: draftedTeams.length,
            custom_teams: draftedTeams.map(t => ({
                name: t.name,
                players: t.players.map(p => ({ id: p.id, name: p.name, position: p.position }))
            }))
        };

        router.post('/admin/registrants/randomize', payload, {
            onSuccess: () => {
                setShowRouletteModal(false);
                clearLiveDraftState();
            }
        });
    };

    const currentCompetition = competitions.find(c => c.id === parseInt(selectedCompId)) || competitions[0];
    const isBubbleActive = Boolean(
        currentCompetition && 
        (currentCompetition.show_draft_bubble === true || 
         currentCompetition.show_draft_bubble === 1 || 
         currentCompetition.show_draft_bubble === '1' ||
         currentCompetition.show_draft_bubble === 'true')
    );

    const handleTogglePublicBubble = () => {
        if (!currentCompetition) return;
        const nextValue = !isBubbleActive;
        router.post(`/admin/competitions/${currentCompetition.id}/toggle-draft-bubble`, {
            show_draft_bubble: nextValue
        }, {
            preserveScroll: true
        });
    };

    const currentPlayer = draftQueue[currentDraftIndex];

    return (
        <AdminLayout title="Pendaftar Individu & Pembagian Tim">
            <Head title="Pendaftar Individu & Undian Tim" />

            {/* Flash Success/Error Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2 shadow-sm">
                    <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span>{flash.error}</span>
                </div>
            )}

            {/* Header Title & Top Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pendaftar Individu</h1>
                    <p className="text-gray-500 text-xs font-medium mt-1">
                        Kelola data pendaftar, masukkan pemain ke tim secara manual, atau acak undian otomatis.
                    </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
                    {/* Add Manual Registrant Button */}
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-brand-500" />
                        Tambah Pendaftar
                    </button>

                    {/* Interactive Roulette Draft Button */}
                    <button
                        type="button"
                        onClick={openRoulette}
                        disabled={registrants.length < 2}
                        className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-amber-500 to-orange-500 hover:from-brand-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        🎰 Putar Roulette Undian ({pendingCount > 0 ? pendingCount : registrants.length})
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div 
                    onClick={() => setStatusFilter('all')}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
                        statusFilter === 'all' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Pendaftar</span>
                            <span className="text-2xl font-black text-gray-900 mt-1 block">{registrants.length}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setStatusFilter('pending')}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
                        statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Belum Masuk Tim (Pending)</span>
                            <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setStatusFilter('assigned')}
                    className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
                        statusFilter === 'assigned' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Sudah Masuk Tim (Assigned)</span>
                            <span className="text-2xl font-black text-emerald-600 mt-1 block">{assignedCount}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Sebaran Posisi</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">GK: {posCounts.GK}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-800 border border-blue-200">DEF: {posCounts.DEF}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">MID: {posCounts.MID}</span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-50 text-rose-800 border border-rose-200">FWD: {posCounts.FWD}</span>
                    </div>
                </div>
            </div>

            {/* Filter Card & Public Bubble Visibility Switch */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-bold text-gray-700">Pilih Turnamen:</span>
                    </div>
                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white px-3 py-2 outline-none w-full sm:w-64 transition-all cursor-pointer"
                        value={selectedCompId}
                        onChange={handleFilterChange}
                    >
                        {competitions.map(comp => (
                            <option key={comp.id} value={comp.id}>
                                🏆 {comp.name} ({comp.season || '2026'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Admin Toggle for Public Floating Draft Bubble */}
                {currentCompetition && (
                    <div className="flex items-center justify-between w-full md:w-auto gap-3.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="text-left md:text-right">
                            <span className="text-[11px] font-black text-gray-800 flex items-center gap-1.5">
                                <span>🎲 Bubble Pembagian Tim di Publik:</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                    isBubbleActive
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}>
                                    {isBubbleActive ? 'AKTIF' : 'HIDDEN'}
                                </span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block">
                                {isBubbleActive 
                                    ? 'Pengunjung dapat melihat hasil undian tim secara realtime' 
                                    : 'Ikon bubble disembunyikan dari halaman publik'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleTogglePublicBubble}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isBubbleActive ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                            title="Klik untuk menampilkan / menyembunyikan bubble di publik"
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isBubbleActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {/* Status Tabs, Search, & Bulk Action Toolbar */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm mb-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                                statusFilter === 'all'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                            }`}
                        >
                            Semua ({registrants.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                                statusFilter === 'pending'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Belum Masuk Tim ({pendingCount})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('assigned')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                                statusFilter === 'assigned'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Sudah Masuk Tim ({assignedCount})</span>
                        </button>
                    </div>

                    {/* Search & Position Filters */}
                    <div className="flex items-center space-x-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama pemain, no HP..."
                                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <select
                            value={selectedPosFilter}
                            onChange={(e) => setSelectedPosFilter(e.target.value)}
                            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="ALL">Semua Posisi</option>
                            <option value="GK">🧤 GK / Kiper</option>
                            <option value="DEF">🛡️ DEF / Anchor</option>
                            <option value="MID">⚡ MID / Flank</option>
                            <option value="FWD">🎯 FWD / Pivot</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Selection Bar */}
                {selectedRegistrantIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-gradient-to-r from-brand-50 via-amber-50 to-orange-50 border border-brand-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-black text-xs flex items-center justify-center">
                                {selectedRegistrantIds.length}
                            </span>
                            <span className="text-xs font-black text-brand-900">
                                {selectedRegistrantIds.length} pemain dipilih untuk dimasukkan ke tim
                            </span>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedRegistrantIds([])}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowBulkAssignModal(true)}
                                className="px-4 py-1.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Masukkan {selectedRegistrantIds.length} Pemain ke Tim</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Light Mode Data Table */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                        <thead className="text-[11px] font-black uppercase tracking-wider bg-gray-50/80 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={filteredRegistrants.length > 0 && selectedRegistrantIds.length === filteredRegistrants.length}
                                        onChange={handleToggleSelectAll}
                                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-4">Nama Pendaftar</th>
                                <th className="px-4 py-4">No. WhatsApp / HP</th>
                                <th className="px-4 py-4">Posisi</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Tanggal Daftar</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                            {filteredRegistrants.length > 0 ? (
                                filteredRegistrants.map((registrant) => {
                                    const badge = positionBadges[registrant.position] || positionBadges.MID;
                                    const isAssigned = registrant.status === 'assigned';
                                    const isSelected = selectedRegistrantIds.includes(registrant.id);

                                    return (
                                        <tr 
                                            key={registrant.id} 
                                            className={`transition-colors ${isSelected ? 'bg-brand-50/40' : 'hover:bg-gray-50/60'}`}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-4 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectRow(registrant.id)}
                                                    className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                                                />
                                            </td>

                                            {/* Name with Avatar */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                                                        {registrant.name ? registrant.name.charAt(0).toUpperCase() : 'P'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block leading-tight">
                                                            {registrant.name}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-semibold">
                                                            ID: #{registrant.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-4 py-4">
                                                {registrant.phone ? (
                                                    <a
                                                        href={`https://wa.me/${registrant.phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        <Phone className="w-3 h-3 text-emerald-500" />
                                                        {registrant.phone}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>

                                            {/* Position */}
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border ${badge.bg}`}>
                                                    <span>{badge.icon}</span>
                                                    <span>{registrant.position}</span>
                                                </span>
                                            </td>

                                            {/* Status with clickable toggle */}
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(registrant)}
                                                    title="Klik untuk mengubah status"
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                                                        isAssigned
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    {isAssigned ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Assigned</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                            <span>Pending</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-4 text-gray-500 text-[11px]">
                                                {new Date(registrant.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {/* Primary Action: Masukkan ke Tim */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openSingleAssignModal(registrant)}
                                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 ${
                                                            isAssigned
                                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-sm hover:from-brand-700 shadow-brand-500/20 active:scale-95'
                                                        }`}
                                                        title={isAssigned ? 'Pindahkan / Masukkan lagi ke tim' : 'Masukkan pemain ini ke dalam tim'}
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5" />
                                                        <span>{isAssigned ? 'Pindah Tim' : 'Masukkan ke Tim'}</span>
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(registrant.id, registrant.name)}
                                                        className="p-1.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Hapus pendaftar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-1" />
                                        <p className="font-bold text-gray-600 text-sm">Tidak ada pendaftar yang sesuai filter.</p>
                                        <p className="text-xs text-gray-400 mt-1">Gunakan tombol di atas untuk menambah pendaftar baru atau ubah kata kunci pencarian.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 👤 MODAL: MASUKKAN PEMAIN MANUAL KE TIM (SINGLE ASSIGN)    */}
            {/* ======================================================== */}
            <AnimatePresence>
                {assignModalPlayer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-md">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">Masukkan Pemain ke Tim</h3>
                                        <p className="text-[10px] text-slate-300 font-medium">
                                            Tetapkan tim dan nomor punggung pemain secara manual.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAssignModalPlayer(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSingleAssignSubmit} className="p-4 sm:p-5 space-y-4">
                                {/* Player Info Banner */}
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 text-white font-black text-sm flex items-center justify-center shadow-xs">
                                        {assignModalPlayer.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-black text-gray-900 truncate">
                                            {assignModalPlayer.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-medium">
                                            <span>Posisi Terdaftar: <strong className="text-brand-600">{assignModalPlayer.position}</strong></span>
                                            {assignModalPlayer.phone && <span>• {assignModalPlayer.phone}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Select Target Team */}
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                                        Pilih Tim Tujuan: <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {teams.map((t) => {
                                            const isSelected = String(singleAssignForm.team_id) === String(t.id);
                                            return (
                                                <div
                                                    key={t.id}
                                                    onClick={() => setSingleAssignForm({ ...singleAssignForm, team_id: t.id })}
                                                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                                        isSelected
                                                            ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-2 ring-brand-500/20'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0">
                                                        <div className="w-7 h-7 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                            {t.logo_url ? (
                                                                <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain p-0.5" />
                                                            ) : (
                                                                <Shield className="w-3.5 h-3.5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900 truncate">
                                                            {t.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-md shrink-0">
                                                        {t.players_count || 0} Pemain
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Jersey Number & Position */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                                            No. Punggung
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="99"
                                            placeholder="Otomatis"
                                            value={singleAssignForm.jersey_number}
                                            onChange={(e) => setSingleAssignForm({ ...singleAssignForm, jersey_number: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-center text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                        />
                                        <span className="text-[9px] text-gray-400 mt-0.5 block">Kosongkan untuk auto</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-700 mb-1">
                                            Posisi di Tim
                                        </label>
                                        <select
                                            value={singleAssignForm.position}
                                            onChange={(e) => setSingleAssignForm({ ...singleAssignForm, position: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                        >
                                            <option value="GK">🧤 Goalkeeper (GK)</option>
                                            <option value="Anchor">🛡️ Anchor (Bertahan)</option>
                                            <option value="Flank">⚡ Flank (Sayap)</option>
                                            <option value="Pivot">⚽ Pivot (Penyerang)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setAssignModalPlayer(null)}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={assignProcessing || !singleAssignForm.team_id}
                                        className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white rounded-xl text-xs font-black shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{assignProcessing ? 'Memasukkan...' : 'Simpan Pemain ke Tim'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* 👥 MODAL: BULK ASSIGN (MULTI-SELECT PLAYERS TO TEAM)       */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showBulkAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-md">
                                        <UserPlus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tracking-tight">Masukkan {selectedRegistrantIds.length} Pemain Sekaligus</h3>
                                        <p className="text-[10px] text-slate-300 font-medium">
                                            Pemain terpilih akan otomatis didistribusikan ke tim yang dipilih.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowBulkAssignModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleBulkAssignSubmit} className="p-4 sm:p-5 space-y-4">
                                {/* Selected Players Summary */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-black uppercase text-gray-700">
                                        Daftar Pemain Terpilih ({selectedRegistrantIds.length}):
                                    </label>
                                    <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 max-h-32 overflow-y-auto space-y-1">
                                        {registrants.filter(r => selectedRegistrantIds.includes(r.id)).map((p, idx) => (
                                            <div key={p.id} className="flex items-center justify-between text-xs font-semibold py-0.5">
                                                <span className="truncate text-gray-900">#{idx + 1} {p.name}</span>
                                                <span className="text-[10px] font-black text-brand-600 px-1.5 py-0.2 bg-brand-50 rounded">
                                                    {p.position}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Select Target Team */}
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                                        Pilih Tim Tujuan: <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                        {teams.map((t) => {
                                            const isSelected = String(selectedBulkTeamId) === String(t.id);
                                            return (
                                                <div
                                                    key={t.id}
                                                    onClick={() => setSelectedBulkTeamId(t.id)}
                                                    className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                                        isSelected
                                                            ? 'border-brand-500 bg-brand-50/50 shadow-xs ring-2 ring-brand-500/20'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2 min-w-0">
                                                        <div className="w-7 h-7 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                            {t.logo_url ? (
                                                                <img src={t.logo_url} alt={t.name} className="w-full h-full object-contain p-0.5" />
                                                            ) : (
                                                                <Shield className="w-3.5 h-3.5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900 truncate">
                                                            {t.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-md shrink-0">
                                                        {t.players_count || 0} Pemain
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkAssignModal(false)}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={assignProcessing || !selectedBulkTeamId}
                                        className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white rounded-xl text-xs font-black shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        <span>{assignProcessing ? 'Memproses...' : `Masukkan ${selectedRegistrantIds.length} Pemain`}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* 🎰 FULL INTERACTIVE ROULETTE DRAFT LOTTERY MODAL */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showRouletteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
                        >
                            {/* Modal Header */}
                            <div className="p-3.5 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex items-center justify-between border-b border-slate-700/50 shrink-0">
                                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 shrink-0">
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '6s' }} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xs sm:text-base font-black tracking-tight flex items-center flex-wrap gap-1.5 leading-tight">
                                            <span>ROULETTE DRAFT</span>
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 bg-brand-500 text-white rounded-full">
                                                PRO
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-amber-950 rounded-full">
                                                Interactive
                                            </span>
                                        </h3>
                                        <p className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 truncate">
                                            Undian acak pemain ke dalam tim secara transparan dan visual.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowRouletteModal(false)}
                                    className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 bg-[#F8F9FD] space-y-4 sm:space-y-6">

                                {/* STAGE 1: SETUP */}
                                {rouletteStage === 'setup' && (
                                    <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto py-1 sm:py-2">
                                        <div className="text-center space-y-1">
                                            <span className="text-3xl sm:text-4xl">🎲</span>
                                            <h4 className="text-base sm:text-lg font-black text-gray-900">Persiapan Undian Tim</h4>
                                            <p className="text-xs text-gray-500">
                                                Tentukan jumlah tim untuk menampung <strong>{draftQueue.length} pemain</strong>.
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3 sm:space-y-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                                                    Pilih Jumlah Tim:
                                                </label>
                                                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                                                    {[2, 3, 4, 5, 6].map(num => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setTeamCount(num)}
                                                            className={`py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black border-2 transition-all ${
                                                                teamCount === num
                                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-105'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {num} Tim
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase text-gray-700 mb-2">
                                                    Nama Tim (Opsi Kustom):
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {Array.from({ length: teamCount }).map((_, i) => {
                                                        const defaultName = TEAM_THEMES[i % TEAM_THEMES.length].name;
                                                        return (
                                                            <input
                                                                key={i}
                                                                type="text"
                                                                placeholder={`Nama Tim ${i + 1} (${defaultName})`}
                                                                value={customTeamNames[i] || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...customTeamNames];
                                                                    updated[i] = e.target.value;
                                                                    setCustomTeamNames(updated);
                                                                }}
                                                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowRouletteModal(false)}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={startRouletteDraft}
                                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <Play className="w-4 h-4 fill-white shrink-0" />
                                                Mulai Roulette Draft
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 2: LIVE SPINNING / DRAFTING */}
                                {rouletteStage === 'spinning' && (
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Progress Bar & Header */}
                                        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-gray-500 pb-1">
                                            <span>
                                                Pemain <strong className="text-brand-600">{currentDraftIndex + 1}</strong> dari <strong>{draftQueue.length}</strong>
                                            </span>
                                            <span>
                                                {Math.round((currentDraftIndex / draftQueue.length) * 100)}% Selesai
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-300 rounded-full"
                                                style={{ width: `${(currentDraftIndex / draftQueue.length) * 100}%` }}
                                            />
                                        </div>

                                        {/* Roulette Center Arena */}
                                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-md text-center relative overflow-hidden">
                                            {/* Glow backdrop */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

                                            {currentPlayer ? (
                                                <div className="space-y-3.5 sm:space-y-4 relative z-10">
                                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block">
                                                        Pemain Sedang Diundi
                                                    </span>

                                                    {/* Player Card */}
                                                    <div>
                                                        <motion.div
                                                            key={currentPlayer.id}
                                                            initial={{ scale: 0.85, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-3 sm:p-4 rounded-2xl border-2 border-brand-500/40 shadow-md max-w-full"
                                                        >
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 text-white font-black text-base sm:text-lg flex items-center justify-center shadow-md shrink-0">
                                                                {currentPlayer.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="text-left min-w-0">
                                                                <h4 className="text-sm sm:text-base font-black text-gray-900 truncate">{currentPlayer.name}</h4>
                                                                <p className="text-[11px] sm:text-xs text-gray-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                                    <span>Posisi:</span>
                                                                    <span className="font-bold text-brand-600">
                                                                        {positionBadges[currentPlayer.position]?.icon} {currentPlayer.position}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    {/* Spinning Team Roulette Carousel */}
                                                    <div className="pt-2">
                                                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 block mb-2">
                                                            Memilih Tim Tujuan:
                                                        </span>
                                                        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
                                                            {draftedTeams.map((t, idx) => {
                                                                const isActive = rouletteActiveTeamIndex === idx;
                                                                return (
                                                                    <motion.div
                                                                        key={t.id}
                                                                        animate={{
                                                                            scale: isActive ? 1.08 : 0.95,
                                                                            y: isActive ? -3 : 0,
                                                                        }}
                                                                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                                        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border-2 font-black text-[11px] sm:text-xs transition-all flex items-center space-x-1.5 sm:space-x-2 ${
                                                                            isActive
                                                                                ? `${t.theme.bg} ${t.theme.border} text-white shadow-xl ${t.theme.shadow} ring-4 ring-white`
                                                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        <Trophy className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                                                        <span className="truncate">{t.name}</span>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Last Assigned Player Announcement */}
                                                    {lastDraftedPlayer && (
                                                        <motion.div
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl inline-flex items-center gap-1.5 max-w-full"
                                                        >
                                                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span className="truncate">
                                                                <strong>{lastDraftedPlayer.player.name}</strong> resmi masuk ke <strong>{lastDraftedPlayer.team.name}</strong>!
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-xs font-bold py-6">Semua pemain telah diundi!</p>
                                            )}
                                        </div>

                                        {/* Action Controls */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={handleInstantFinish}
                                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
                                            >
                                                <FastForward className="w-3.5 h-3.5 text-brand-600" />
                                                <span>Selesaikan Instan (Skip)</span>
                                            </button>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAutoSpin(!autoSpin)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                                        autoSpin
                                                            ? 'bg-amber-500 text-white border-amber-500 shadow-md animate-pulse'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Zap className="w-3.5 h-3.5" />
                                                    <span>{autoSpin ? 'Stop Auto-Spin' : 'Auto-Spin'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={executeSpin}
                                                    disabled={isSpinning || currentDraftIndex >= draftQueue.length}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white text-xs font-black rounded-xl shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                                                >
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>{isSpinning ? 'Mengundi...' : 'Putar Roulette'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Live Preview of Teams Being Filled */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                                            {draftedTeams.map((team, idx) => (
                                                <div key={team.id} className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs flex flex-col">
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                                        <div className="flex items-center space-x-1.5 min-w-0">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${team.theme.bg || 'bg-brand-500'} shrink-0`} />
                                                            <h5 className="font-black text-xs text-gray-900 truncate">{team.name}</h5>
                                                        </div>
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                                            {team.players.length} Pemain
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 space-y-1 max-h-32 overflow-y-auto text-[11px] font-semibold text-gray-700 pr-1 no-scrollbar">
                                                        {team.players.length > 0 ? (
                                                            team.players.map((p, pIdx) => (
                                                                <div key={p.id} className="p-1 rounded-lg bg-gray-50 flex items-center justify-between">
                                                                    <span className="truncate pr-1">#{pIdx + 1} {p.name}</span>
                                                                    <span className="text-[9px] font-black uppercase text-brand-600 shrink-0">
                                                                        {p.position}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] text-gray-400 italic block text-center py-2">
                                                                Belum ada pemain
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* STAGE 3: FINISHED / REVIEW */}
                                {rouletteStage === 'finished' && (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="text-center space-y-1">
                                            <span className="text-3xl sm:text-4xl">🎉</span>
                                            <h4 className="text-base sm:text-lg font-black text-gray-900">Undian Roulette Selesai!</h4>
                                            <p className="text-xs text-gray-500">
                                                Seluruh pemain telah berhasil diundi secara merata ke dalam tim. Silakan periksa hasil undian di bawah:
                                            </p>
                                        </div>

                                        {/* Result Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {draftedTeams.map((team) => (
                                                <div key={team.id} className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                                        <div className="flex items-center space-x-2 min-w-0">
                                                            <div className={`w-3 h-3 rounded-full ${team.theme.bg || 'bg-brand-500'} shrink-0`} />
                                                            <h5 className="font-black text-sm text-gray-900 truncate">{team.name}</h5>
                                                        </div>
                                                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                                                            {team.players.length} Pemain
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                        {team.players.map((p, pIdx) => {
                                                            const badge = positionBadges[p.position] || positionBadges.MID;
                                                            return (
                                                                <div key={p.id} className="p-1.5 rounded-xl bg-gray-50 flex items-center justify-between text-xs font-semibold">
                                                                    <div className="flex items-center space-x-2 min-w-0 pr-1">
                                                                        <span className="text-[10px] font-black text-gray-400 w-4 text-center">#{pIdx + 1}</span>
                                                                        <span className="truncate text-gray-800">{p.name}</span>
                                                                    </div>
                                                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${badge.bg}`}>
                                                                        {p.position}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={openRoulette}
                                                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span>Ulangi Undian</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={saveRouletteResult}
                                                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white rounded-xl text-xs font-black shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span>Simpan & Masukkan ke Skuad Tim</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* ➕ MODAL: TAMBAH PENDAFTAR BARU MANUAL                     */}
            {/* ======================================================== */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-brand-500" />
                                    Tambah Pendaftar Individu
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Turnamen
                                    </label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                        value={createData.competition_id}
                                        onChange={e => setCreateData('competition_id', e.target.value)}
                                        required
                                    >
                                        {competitions.map(comp => (
                                            <option key={comp.id} value={comp.id}>
                                                {comp.name} ({comp.season || '2026'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Ardiansyah Runtuboy"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                        value={createData.name}
                                        onChange={e => setCreateData('name', e.target.value)}
                                        required
                                    />
                                    {createErrors.name && (
                                        <p className="text-red-500 text-[11px] font-bold mt-1">{createErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        No. WhatsApp / HP
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Contoh: 081234567890"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none"
                                        value={createData.phone}
                                        onChange={e => setCreateData('phone', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Posisi Bermain <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { code: 'GK', label: '🧤 Goalkeeper (GK)' },
                                            { code: 'Anchor', label: '🛡️ Anchor (DEF)' },
                                            { code: 'Flank', label: '⚡ Flank (MID)' },
                                            { code: 'Pivot', label: '⚽ Pivot (FWD)' },
                                        ].map(pos => (
                                            <button
                                                key={pos.code}
                                                type="button"
                                                onClick={() => setCreateData('position', pos.code)}
                                                className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                                                    createData.position === pos.code
                                                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-2 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createProcessing}
                                        className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                                    >
                                        {createProcessing ? 'Menyimpan...' : 'Simpan Pendaftar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Data Pendaftar"
                message={`Apakah Anda yakin ingin menghapus pendaftar "${deleteModal.name}"? Data pemain ini akan dihapus permanen.`}
                confirmText="Ya, Hapus Pendaftar"
                onConfirm={confirmDeleteRegistrant}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
            />
        </AdminLayout>
    );
}
