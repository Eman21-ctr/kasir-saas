import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Key, CheckCircle, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';

export default function ActivationPage() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!code || code.length < 6) {
            setError('Kode harus 6 karakter');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Check if code exists and is not used
            const { data, error: fetchError } = await supabase
                .from('activation_codes')
                .select('*')
                .eq('code', code.toUpperCase())
                .single();

            if (fetchError || !data) {
                throw new Error('Kode tidak ditemukan atau salah.');
            }

            if (data.is_used) {
                throw new Error('Kode sudah pernah digunakan.');
            }

            // 2. If valid, navigate to Onboarding Profile Setup
            // Passing the code via state to mark it used later
            navigate('/onboarding/setup', { state: { activationCode: data.code } });

        } catch (err: any) {
            setError(err.message || 'Gagal memverifikasi kode.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white p-4 flex items-center shadow-sm">
                <button onClick={() => navigate('/login')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">

                {/* Welcome Card */}
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <Key className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang! 👋</h1>
                    <p className="text-slate-600 leading-relaxed">
                        Masukkan kode aktivasi untuk mulai pakai app kasir pintar ini.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-800 text-sm">Kode salah atau tidak valid.</p>
                            <p className="text-red-600 text-xs mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Input Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Kode Aktivasi</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="A B C 1 2 3"
                            maxLength={6}
                            className={`w-full h-[60px] text-center text-2xl font-bold tracking-[0.5em] rounded-2xl border-2 outline-none transition-all uppercase placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300
                            ${error
                                    ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                    : 'border-slate-200 bg-white text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                                }`}
                        />
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memeriksa...
                                </>
                            ) : (
                                <>
                                    Verifikasi Kode
                                    <CheckCircle className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <button className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-emerald-600 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <MessageSquare className="w-5 h-5 text-emerald-500" />
                            Minta Kode Baru (WA)
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-slate-50 rounded-lg p-4 flex gap-3 border border-slate-100">
                    <div className="bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-500">i</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Kode ini diberikan oleh tim kami atau partner UMKM terdekatmu. Hubungi admin jika mengalami kendala.
                    </p>
                </div>

            </div>
        </div>
    );
}
