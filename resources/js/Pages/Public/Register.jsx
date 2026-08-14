import React, { useState, useRef, useEffect } from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { User, Phone, Trophy, ArrowLeft, Share2, Check, CheckCircle2, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register({ competitions = [] }) {
    const { flash } = usePage().props;
    const [copied, setCopied] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const selectRef = useRef(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        position: 'MID',
        competition_id: competitions.length > 0 ? competitions[0].id : '',
    });

    // Close select dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/register', {
            preserveScroll: true,
            onSuccess: () => reset('name', 'phone'),
        });
    };

    const positionList = [
        { code: 'GK', label: 'Goalkeeper', desc: 'Kiper Penjaga Gawang', icon: '🧤' },
        { code: 'DEF', label: 'Defender', desc: 'Pemain Bertahan (Anchor)', icon: '🛡️' },
        { code: 'MID', label: 'Midfielder', desc: 'Pemain Sayap (Flank)', icon: '⚡' },
        { code: 'FWD', label: 'Forward', desc: 'Penyerang Depan (Pivot)', icon: '🎯' },
    ];

    const selectedCompetition = competitions.find(c => String(c.id) === String(data.competition_id)) || (competitions.length > 0 ? competitions[0] : null);

    return (
        <MobileLayout>
            <Head title="Formulir Pendaftaran Pemain - RS LIVASYA" />
            
            <div className="py-2 space-y-4">
                {/* Header Back & Action Row */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors p-1 -ml-1 rounded-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    {/* Share / Copy Link Button */}
                    <button
                        onClick={handleCopyLink}
                        type="button"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 dark:text-brand-400 border border-brand-200 dark:border-brand-500/30 transition-all shadow-sm"
                        title="Salin tautan formulir pendaftaran ini"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Salin Link Form</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Hero / Banner Header */}
                <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-2">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>Pendaftaran Pemain Baru</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight leading-snug">
                            Formulir Pendaftaran Individu
                        </h1>
                        <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">
                            Daftarkan diri Anda untuk berpartisipasi dalam turnamen futsal RS LIVASYA. Data Anda akan diverifikasi dan dikelompokkan oleh panitia.
                        </p>
                    </div>
                </div>

                {/* Success Notification Alert */}
                <AnimatePresence>
                    {flash.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start space-x-3 shadow-sm"
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Pendaftaran Berhasil!</h4>
                                <p className="mt-0.5 leading-relaxed">{flash.success}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700/60 shadow-card">
                    <form onSubmit={submit} className="space-y-4">
                        
                        {/* Custom Clean Competition Select Picker */}
                        <div className="relative" ref={selectRef}>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
                                Pilih Turnamen Futsal <span className="text-red-500">*</span>
                            </label>
                            
                            {/* Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setSelectOpen(!selectOpen)}
                                className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl text-left transition-all ${
                                    selectOpen
                                        ? 'border-brand-500 ring-2 ring-brand-500/20'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                    <div className="p-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex-shrink-0">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                        {selectedCompetition ? (
                                            <span>
                                                {selectedCompetition.name}{' '}
                                                {selectedCompetition.season && (
                                                    <span className="text-gray-500 dark:text-slate-400 font-normal">
                                                        ({selectedCompetition.season})
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Pilih Turnamen</span>
                                        )}
                                    </span>
                                </div>
                                <motion.div
                                    animate={{ rotate: selectOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-gray-400 dark:text-slate-400 flex-shrink-0"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.div>
                            </button>

                            {/* Dropdown Options Menu */}
                            <AnimatePresence>
                                {selectOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto p-1.5 space-y-1"
                                    >
                                        {competitions.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-gray-400">
                                                Tidak ada turnamen aktif
                                            </div>
                                        ) : (
                                            competitions.map((comp) => {
                                                const isSelected = String(data.competition_id) === String(comp.id);
                                                return (
                                                    <button
                                                        key={comp.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setData('competition_id', comp.id);
                                                            setSelectOpen(false);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-xs ${
                                                            isSelected
                                                                ? 'bg-brand-500 text-white font-bold shadow-sm'
                                                                : 'text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                                            <Trophy className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-brand-500'}`} />
                                                            <span className="truncate">
                                                                {comp.name}{' '}
                                                                {comp.season && (
                                                                    <span className={isSelected ? 'text-white/80' : 'text-gray-400 dark:text-slate-400'}>
                                                                        ({comp.season})
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <Check className="w-4 h-4 text-white flex-shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {errors.competition_id && (
                                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.competition_id}</p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    placeholder="Contoh: Budi Santoso"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.name}</p>
                            )}
                        </div>

                        {/* WhatsApp / Phone Number */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-1.5">
                                Nomor WhatsApp / HP <span className="text-gray-400 font-normal">(Opsional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Phone className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                                </div>
                                <input
                                    type="tel"
                                    className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                    placeholder="Contoh: 081234567890"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.phone}</p>
                            )}
                        </div>

                        {/* Position Radio / Selection Cards */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-slate-200 mb-2">
                                Posisi Bermain <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {positionList.map(pos => {
                                    const isSelected = data.position === pos.code;
                                    return (
                                        <button
                                            key={pos.code}
                                            type="button"
                                            onClick={() => setData('position', pos.code)}
                                            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                                isSelected
                                                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-500/10 ring-2 ring-brand-500/20'
                                                    : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-base">{pos.icon}</span>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                                    isSelected
                                                        ? 'bg-brand-500 text-white'
                                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                                                }`}>
                                                    {pos.code}
                                                </span>
                                            </div>
                                            <div>
                                                <div className={`text-xs font-bold ${
                                                    isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-slate-200'
                                                }`}>
                                                    {pos.label}
                                                </div>
                                                <div className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight mt-0.5">
                                                    {pos.desc}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.position && (
                                <p className="mt-1 text-[11px] text-red-500 font-medium">{errors.position}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing || competitions.length === 0}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl shadow-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>{processing ? 'Sedang Mengirim Data...' : 'Kirim Pendaftaran Sekarang'}</span>
                            </button>
                        </div>

                        {competitions.length === 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Saat ini tidak ada turnamen yang membuka pendaftaran pemain.</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Direct Link Share Helper Card */}
                <div className="bg-gray-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-200/70 dark:border-slate-700/50 text-center space-y-2">
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                        Tautan pendaftaran terpisah ini dapat dibagikan langsung ke grup WhatsApp atau sosial media:
                    </p>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-[11px] font-mono text-gray-600 dark:text-slate-300">
                        <span className="truncate mr-2">
                            {typeof window !== 'undefined' ? window.location.href : '/register'}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="text-brand-500 hover:text-brand-600 font-bold flex items-center space-x-1 flex-shrink-0 text-xs"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Tersalin' : 'Salin'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
