import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Store, LogOut, Printer, ChevronRight, HelpCircle, Shield, History, Sparkles } from 'lucide-react';

export default function SettingsPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: business } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', user.id)
                .single();
            setProfile(business);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {profile?.logo_url ? (
                        <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6 pt-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Pengaturan Toko</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Konfigurasi & Profil</p>
                </div>

                {/* Profile Card */}
                <div
                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.99] transition-all"
                    onClick={() => navigate('/dashboard/settings/profile')}
                >
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm rotate-1">
                        <Store className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-slate-800">{profile?.business_name || 'Memuat...'}</h2>
                        <p className="text-slate-400 text-sm">{profile?.phone || '-'}</p>
                        <div className="mt-2 inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-extrabold border border-green-100 uppercase">
                            Toko Aktif
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>

                {/* Menu Groups */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-xs ml-2 uppercase tracking-widest opacity-50">Manajemen</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <MenuParams
                            icon={Store}
                            label="Informasi Usaha"
                            onClick={() => navigate('/dashboard/settings/profile')}
                        />
                        <MenuParams
                            icon={History}
                            label="Riwayat Transaksi"
                            onClick={() => navigate('/dashboard/pos/history')}
                        />
                        <MenuParams
                            icon={Sparkles}
                            label="Loyalty & Diskon"
                            sub="Atur Poin & Potongan Member"
                            onClick={() => navigate('/dashboard/settings/loyalty')}
                        />
                        <MenuParams icon={Printer} label="Koneksi Printer Struk" sub="Bluetooth / USB" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-xs ml-2 uppercase tracking-widest opacity-50">Dukungan</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <MenuParams icon={HelpCircle} label="Pusat Bantuan & Tutorial" />
                        <MenuParams icon={Shield} label="Kebijakan Privasi" />
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-8 shadow-sm border border-rose-100"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar Aplikasi
                </button>

                <p className="text-center text-[10px] text-slate-300 font-bold uppercase mt-6 tracking-widest">KasirKu V1.0.2 • Made with ❤️</p>

            </div>
        </div>
    );
}

function MenuParams({ icon: Icon, label, sub, onClick }: { icon: any, label: string, sub?: string, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors active:scale-[0.99]"
        >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-700 text-sm">{label}</h4>
                {sub && <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{sub}</p>}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
    );
}
