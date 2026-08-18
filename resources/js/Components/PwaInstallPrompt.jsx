import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            
            // Check if user has already dismissed it in this session/localStorage
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        } else {
            console.log('User dismissed the A2HS prompt');
        }
        
        // Clear the deferredPrompt so it can only be used once.
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Optional: save to local storage to not bother them again for some time
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative overflow-hidden"
                    >
                        {/* Decorative Background Blob */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                        <button 
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-5 shadow-inner border border-brand-100/50">
                                <img 
                                    src="/images/logo-livasya.png" 
                                    alt="RS Livasya App" 
                                    className="w-14 h-14 object-contain drop-shadow-md"
                                />
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                                Install Aplikasi Livasya
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                                Tambahkan aplikasi ke layar utama untuk akses lebih cepat, fitur offline, dan pengalaman yang optimal.
                            </p>

                            <div className="w-full flex flex-col space-y-3">
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleInstall}
                                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center space-x-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Install Sekarang</span>
                                </motion.button>
                                
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-3 px-4 text-gray-500 hover:text-gray-800 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
                                >
                                    Nanti Saja
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
