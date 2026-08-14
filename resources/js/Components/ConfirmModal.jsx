import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    title = 'Konfirmasi Hapus Data',
    message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
    confirmText = 'Ya, Hapus Sekarang',
    cancelText = 'Batal',
    type = 'danger', // 'danger' | 'warning' | 'info'
    onConfirm,
    onClose,
    processing = false,
}) {
    if (!isOpen) return null;

    const typeConfig = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-red-100 text-red-600 ring-8 ring-red-50',
            buttonBg: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/20',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-100 text-amber-600 ring-8 ring-amber-50',
            buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-amber-500/20',
        },
        info: {
            icon: Check,
            iconBg: 'bg-brand-100 text-brand-600 ring-8 ring-brand-50',
            buttonBg: 'bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 text-white shadow-md shadow-brand-500/20',
        },
    };

    const config = typeConfig[type] || typeConfig.danger;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="bg-white border border-gray-100 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 relative"
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Animated Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto shadow-inner`}>
                        <Icon className="w-7 h-7 animate-pulse" />
                    </div>

                    {/* Title & Message */}
                    <div className="space-y-1.5">
                        <h3 className="text-base font-black text-gray-900 leading-snug">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed px-2">
                            {message}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                            }}
                            disabled={processing}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-50 ${config.buttonBg}`}
                        >
                            {processing ? 'Memproses...' : confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
