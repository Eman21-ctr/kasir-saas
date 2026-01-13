import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight, Phone } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    // Default isLogin true. Registration is now mainly handled via Onboarding (/activate).
    // But we keep the toggle just in case admin wants to register via email.
    const [isLogin] = useState(true);

    // We use a generic "identifier" state which can be Email OR Phone
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Determine if input is Phone or Email
            const isPhone = /^[0-9]+$/.test(identifier.replace(/[^0-9]/g, ''));

            // Format email
            let emailToUse = identifier;
            if (isPhone) {
                // Remove non-numeric chars
                const cleanPhone = identifier.replace(/[^0-9]/g, '');
                // 0812... -> 0812...@kasirku.local
                emailToUse = `${cleanPhone}@kasirku.local`;
            }

            if (isLogin) {
                // LOGIN FLOW
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: emailToUse,
                    password: password,
                });

                if (error) throw error;

                if (data.user) {
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('role')
                        .eq('auth_id', data.user.id)
                        .single();

                    // Ignore PGRST116 (No rows found) if new user hasn't been synced to public.users yet
                    if (userError && userError.code !== 'PGRST116') throw userError;

                    if (userData?.role === 'super_admin') {
                        navigate('/admin/dashboard');
                    } else {
                        // Shop Owner -> Dashboard
                        navigate('/dashboard');
                    }
                }
            } else {
                // ADMIN REGISTRATION ONLY (Since users register via Onboarding)
                // We restrict registration here strictly to Email for Admins if needed, 
                // or just redirect them to proper onboarding.
                alert("Untuk pendaftaran Toko Baru, silakan gunakan menu 'Aktivasi Toko' atau hubungi Sales.");
            }
        } catch (err: any) {
            console.error(err);
            if (err.message === "Invalid login credentials") {
                setError("No. HP atau PIN salah. Silakan cek kembali.");
            } else {
                setError(err.message || 'Terjadi kesalahan sistem.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm rotate-3 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">KasirKu</h2>
                        <p className="text-emerald-100 text-sm">Masuk untuk kelola tokomu</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">No. WhatsApp / Email</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    {/^[0-9]+$/.test(identifier) && identifier.length > 0 ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-800 placeholder:font-normal"
                                    placeholder="Contoh: 08123456789"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">PIN / Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-800 placeholder:font-normal"
                                    placeholder="Masukan 6 digit PIN"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        Masuk Sekarang
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm mb-3">Belum punya akun toko?</p>
                        <button
                            type="button"
                            onClick={() => navigate('/activate')}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors w-full"
                        >
                            Aktivasi Toko Baru
                        </button>
                    </div>
                </div>
            </div>

            <p className="fixed bottom-6 text-slate-400 text-xs font-medium">© 2026 KasirKu SaaS</p>
        </div>
    );
}
