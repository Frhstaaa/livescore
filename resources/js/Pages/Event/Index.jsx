import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import MobileLayout from '@/Layouts/MobileLayout';
import { Heart, MessageCircle, Send, Sparkles, MoreHorizontal, Calendar, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ events }) {
    const [likedPosts, setLikedPosts] = useState({});

    const handleLike = (id) => {
        setLikedPosts((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        router.post(`/events/${id}/like`, {}, { preserveScroll: true });
    };

    return (
        <MobileLayout>
            {/* Header Title */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
                        <Sparkles className="w-5 h-5 text-brand-500 mr-2" />
                        Event & Berita Futsal
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                        Update postingan resmi seputar turnamen & kegiatan
                    </p>
                </div>
            </div>

            {/* Posts Feed List */}
            <div className="space-y-5 pb-6">
                {events && events.length > 0 ? (
                    events.map((event, idx) => {
                        const isLiked = likedPosts[event.id];
                        const currentLikes = (event.likes_count || 0) + (isLiked ? 1 : 0);

                        return (
                            <motion.article
                                key={event.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.3 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-100 dark:border-slate-700/60 shadow-card overflow-hidden"
                            >
                                {/* Author Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-amber-400 p-0.5 shadow-sm">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-brand-600 dark:text-brand-400 overflow-hidden">
                                                {event.author_avatar ? (
                                                    <img src={event.author_avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src="/images/logo-livasya.png" alt="" className="w-7 h-7 object-contain" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                                                {event.author_name || 'Panitia Turnamen'}
                                            </h3>
                                            <p className="text-[10px] font-medium text-gray-400 dark:text-slate-400 flex items-center mt-0.5">
                                                <Calendar className="w-3 h-3 mr-1 text-brand-500" />
                                                {new Date(event.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 p-1">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Post Title & Content */}
                                {event.title && (
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1.5 leading-snug">
                                        {event.title}
                                    </h4>
                                )}
                                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed mb-3 whitespace-pre-line">
                                    {event.content}
                                </p>

                                {/* Media Image Card */}
                                {event.image_url && (
                                    <div className="relative rounded-2xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 max-h-80">
                                        <img
                                            src={event.image_url}
                                            alt={event.title || 'Event Media'}
                                            className="w-full h-auto object-cover max-h-80 hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}

                                {/* Social Action Buttons */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                                    <div className="flex items-center space-x-4">
                                        {/* Like Button */}
                                        <button
                                            onClick={() => handleLike(event.id)}
                                            className={`flex items-center space-x-1.5 text-xs font-bold transition-colors ${
                                                isLiked
                                                    ? 'text-rose-500 dark:text-rose-400'
                                                    : 'text-gray-500 dark:text-slate-400 hover:text-rose-500'
                                            }`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
                                            <span>{currentLikes}</span>
                                        </button>

                                        {/* Comment Button */}
                                        <button className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-brand-500 transition-colors">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{event.comments_count || 0}</span>
                                        </button>

                                        {/* Share Button */}
                                        <button className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-brand-500 transition-colors">
                                            <Send className="w-4 h-4" />
                                            <span>{event.shares_count || 0}</span>
                                        </button>
                                    </div>

                                    <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        #EventOfficial
                                    </span>
                                </div>
                            </motion.article>
                        );
                    })
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <Sparkles className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 mb-1">Belum Ada Posting Event</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-400">Postingan terbaru seputar turnamen akan muncul di sini.</p>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}
