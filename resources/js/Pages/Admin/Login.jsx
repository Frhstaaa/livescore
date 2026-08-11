import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@livasya.com',
        password: 'password',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
                
                <div className="text-center mb-8">
                    <img
                        src="/images/logo-livasya.png"
                        alt="RS LIVASYA"
                        className="w-16 h-16 object-contain mx-auto mb-3 drop-shadow-md"
                    />
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">LOGIN ADMIN</h1>
                    <p className="text-xs text-gray-400 mt-1 font-medium">RS LIVASYA FUTSAL LIVESCORE</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Admin</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                                placeholder="admin@livasya.com"
                                required
                            />
                        </div>
                        {errors.email && <span className="text-xs text-red-500 font-semibold mt-1 block">{errors.email}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {errors.password && <span className="text-xs text-red-500 font-semibold mt-1 block">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                        <span>Masuk ke Panel Admin</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <Link href="/" className="text-xs font-semibold text-brand-500 hover:underline">
                        ← Kembali ke Halaman Utama Publik
                    </Link>
                </div>

            </div>
        </div>
    );
}
