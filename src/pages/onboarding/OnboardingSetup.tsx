import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Store, Coffee, Utensils, ShoppingBag, MoreHorizontal, Check, Loader2, Save, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';

type Step = 'profile' | 'pin' | 'success';
type BusinessType = 'warung_sembako' | 'kedai_kopi' | 'warteg' | 'toko_kelontong' | 'lainnya';

export default function OnboardingSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState<Step>('profile');
    const [loading, setLoading] = useState(false);
    const { activationCode } = location.state || {}; // Code passed from previous screen

    // Form States
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState<BusinessType | ''>('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    // Validation
    const canProceedProfile = businessName.length > 2 && businessType !== '' && phoneNumber.length > 9;
    const canProceedPin = pin.length === 6 && pin === confirmPin;

    // Security Check
    useEffect(() => {
        if (!activationCode) {
            navigate('/activate');
        }
    }, [activationCode, navigate]);

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. REGISTER USER (using fake email based on phone for now to avoid SMS setup complexity)
            // Format: [phone]@kasirku.local
            const email = `${phoneNumber}@kasirku.local`;
            const password = pin; // Using 6 digit PIN as password

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        role: 'shop_owner',
                        phone_number: phoneNumber,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Gagal membuat user.');

            const userId = authData.user.id;

            // 2. CRITICAL: Create Public User Record FIRST
            // This satisfies the Foreign Key constraint for the businesses table
            // We explicitly set the UUID to match the Auth UUID
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: userId, // Must match Auth ID
                    auth_id: userId,
                    email: email,
                    phone_number: phoneNumber,
                    role: 'shop_owner',
                    is_active: true,
                    activation_code: activationCode
                }, { onConflict: 'email' });

            if (userError) throw userError;

            // 3. Create Business
            // Now valid because user_id (FK) exists in public.users
            const { error: businessError } = await supabase
                .from('businesses')
                .insert([{
                    user_id: userId,
                    business_name: businessName,
                    business_type: businessType,
                    phone: phoneNumber,
                    is_active: true
                }]);

            if (businessError) throw businessError;

            // 4. Mark Code as Used
            const { error: codeError } = await supabase
                .from('activation_codes')
                .update({
                    is_used: true,
                    used_by_user_id: userId,
                    used_at: new Date().toISOString()
                })
                .eq('code', activationCode);

            if (codeError) console.error("Warning: Failed to mark code as used", codeError);

            // 5. Success
            setStep('success');

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error: any) {
            alert('Gagal setup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const businessTypes = [
        { id: 'warung_sembako', label: 'Warung Sembako', icon: ShoppingBag },
        { id: 'kedai_kopi', label: 'Kedai Kopi', icon: Coffee },
        { id: 'warteg', label: 'Warteg / Makan', icon: Utensils },
        { id: 'toko_kelontong', label: 'Toko Kelontong', icon: Store },
        { id: 'lainnya', label: 'Lainnya', icon: MoreHorizontal },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Header */}
            <div className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h1 className="ml-2 font-bold text-lg text-slate-800">Setup Usaha</h1>
            </div>

            {/* Stepper */}
            <div className="bg-slate-50 p-6 flex justify-center gap-4">
                <div className={cn("flex items-center gap-2", step === 'profile' ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm border-2", step === 'profile' || step === 'pin' || step === 'success' ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-300")}>1</div>
                    Profil
                </div>
                <div className="w-8 h-[2px] bg-slate-200 mt-4"></div>
                <div className={cn("flex items-center gap-2", step === 'pin' ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm border-2", step === 'pin' || step === 'success' ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-300")}>2</div>
                    PIN
                </div>
            </div>

            <div className="max-w-md mx-auto px-6">

                {/* STEP 1: PROFILE */}
                {step === 'profile' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Profil Usaha</h2>
                            <p className="text-slate-500 text-sm mt-1">Ceritakan sedikit tentang usahamu</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nama Usaha *</label>
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-medium"
                                    placeholder="Contoh: Warung Berkah"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">No. WhatsApp / HP *</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full p-4 pl-12 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all font-medium"
                                        placeholder="Contoh: 081234567890"
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Nomor ini akan digunakan untuk login.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Jenis Usaha *</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {businessTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setBusinessType(type.id as BusinessType)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:bg-slate-50",
                                                businessType === type.id
                                                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100 ring-offset-0"
                                                    : "border-slate-200 bg-white"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                businessType === type.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                <type.icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn("font-semibold", businessType === type.id ? "text-emerald-900" : "text-slate-600")}>
                                                {type.label}
                                            </span>
                                            {businessType === type.id && (
                                                <Check className="ml-auto w-5 h-5 text-emerald-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!canProceedProfile}
                            onClick={() => setStep('pin')}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-8"
                        >
                            Lanjut ke Setup PIN
                        </button>
                    </div>
                )}

                {/* STEP 2: PIN */}
                {step === 'pin' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <Save className="w-8 h-8 text-purple-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Buat PIN Keamanan</h2>
                            <p className="text-slate-500 text-sm mt-1">PIN 6 digit untuk akses sensitif</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Buat PIN Baru</label>
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full text-center text-3xl font-bold tracking-[1em] p-4 h-16 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-lg"
                                    placeholder="• • • • • •"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Konfirmasi PIN</label>
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                                    className={cn(
                                        "w-full text-center text-3xl font-bold tracking-[1em] p-4 h-16 rounded-xl border-2 outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-lg",
                                        confirmPin && pin !== confirmPin ? "border-red-300 bg-red-50 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                                    )}
                                    placeholder="• • • • • •"
                                />
                                {confirmPin && pin !== confirmPin && (
                                    <p className="text-red-500 text-xs text-center font-medium">PIN tidak cocok</p>
                                )}
                            </div>
                        </div>

                        <button
                            disabled={!canProceedPin || loading}
                            onClick={handleFinish}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-8 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Membuat Akun...
                                </>
                            ) : (
                                "Selesai & Masuk Aplikasi"
                            )}
                        </button>

                        <button onClick={() => setStep('profile')} className="w-full text-slate-500 py-3 font-medium hover:text-slate-800">
                            Kembali
                        </button>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center pt-20 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Setup Berhasil!</h2>
                        <p className="text-slate-500">Akun dan Toko Anda siap digunakan.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
