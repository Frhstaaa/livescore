import React from 'react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Info, ShieldCheck, ExternalLink, MessageCircle, MapPin } from 'lucide-react';

export default function AboutIndex({ sponsors, competition }) {
    return (
        <MobileLayout>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Tentang & Sponsor</h2>
                <div className="p-2 text-brand-500 bg-brand-50 dark:bg-brand-500/10 rounded-full border border-brand-100 dark:border-brand-500/20 shadow-sm">
                    <Info className="w-5 h-5" />
                </div>
            </div>

            {/* About Tournament Hero Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-brand-700 to-brand-500 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                        <img src="/images/logo-livasya.png" alt="RS LIVASYA" className="w-8 h-8 object-contain bg-white/20 p-1 rounded-xl backdrop-blur-sm" />
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-widest">
                            OFFICIAL EVENT RS LIVASYA
                        </span>
                    </div>
                    <h3 className="text-xl font-black mb-2">{competition?.name || 'RS LIVASYA FUTSAL CUP 2026'}</h3>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                        {competition?.about_description ||
                            'Kompetisi Futsal Bergengsi yang diselenggarakan oleh Rumah Sakit LIVASYA untuk memajukan olahraga, kesehatan, dan solidaritas antar-tim futsal profesional & komunitas.'}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80 font-semibold">
                    <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Rama Futsall Kadipaten</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Official Partner</span>
                    </div>
                </div>
            </div>

            {/* Main Sponsor Highlight */}
            {sponsors?.main?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                        SPONSOR UTAMA (MAIN SPONSOR)
                    </h3>

                    <div className="space-y-3">
                        {sponsors.main.map((s) => (
                            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border-2 border-amber-300 dark:border-amber-500/50 shadow-md flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-slate-700 border border-amber-200 dark:border-slate-600 flex items-center justify-center font-black text-amber-700 dark:text-amber-400 text-lg shadow-inner">
                                        <img src={s.logo_url || '/images/logo-livasya.png'} alt={s.name} className="w-full h-full object-contain p-1 rounded-2xl" />
                                    </div>
                                    <div>
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 uppercase tracking-wider mb-1 inline-block">
                                            MAIN SPONSOR
                                        </span>
                                        <h4 className="text-base font-black text-gray-900 dark:text-white leading-tight">{s.name}</h4>
                                    </div>
                                </div>

                                {s.website_url && (
                                    <a
                                        href={s.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Gold & Silver Sponsors */}
            {sponsors?.gold?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                        GOLD SPONSORS
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {sponsors.gold.map((s) => (
                            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/60 shadow-card text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-slate-700 border border-brand-100 dark:border-slate-600 flex items-center justify-center font-black text-brand-600 dark:text-brand-400 mb-2">
                                    {s.logo_url ? (
                                        <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain p-1 rounded-xl" />
                                    ) : (
                                        s.name[0]
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 leading-tight">{s.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Official & Media Partners */}
            {(sponsors?.partner?.length > 0 || sponsors?.media?.length > 0) && (
                <div className="mb-6">
                    <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
                        OFFICIAL & MEDIA PARTNERS
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                        {[...(sponsors.partner || []), ...(sponsors.media || [])].map((s) => (
                            <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700/60 shadow-sm text-center">
                                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-slate-200 mx-auto mb-1">
                                    {s.name[0]}
                                </div>
                                <span className="text-[10px] font-semibold text-gray-800 dark:text-slate-200 block truncate">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sponsorship Contact Box */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-700/60 shadow-card text-center my-6">
                <img src="/images/logo-livasya.png" alt="RS LIVASYA" className="w-12 h-12 object-contain mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Ingin Menjadi Sponsor Kami?</h4>
                <p className="text-xs text-gray-400 dark:text-slate-400 mb-4 font-medium">Dapatkan eksposur brand Anda di seluruh pertandingan RS LIVASYA FUTSAL CUP 2026.</p>
                <a
                    href="https://wa.me/628386012467?text=Halo%20Panitia%20Sponsor,%20saya%20tertarik%20untuk%20menjadi%20sponsor%20RS%20LIVASYA%20FUTSAL%20CUP%202026."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hubungi via WhatsApp (08386012467)</span>
                </a>
            </div>
        </MobileLayout>
    );
}
