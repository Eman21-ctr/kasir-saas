import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Shield, Lock, Eye, CheckCircle2,
    Smartphone, Database, Store
} from 'lucide-react';

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();
    const [business, setBusiness] = useState<any>(null);

    useEffect(() => {
        fetchBusinessInfo();
    }, []);

    const fetchBusinessInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('businesses')
                .select('logo_url')
                .eq('user_id', user.id)
                .single();
            setBusiness(data);
        }
    };

    const policies = [
        {
            icon: Lock,
            title: 'Keamanan Data Transaksi',
            content: 'Setiap data transaksi (penjualan, pengeluaran, laba) yang Anda masukkan disimpan dengan enkripsi standar industri. Kami tidak akan pernah membagikan data finansial toko Anda kepada pihak ketiga dengan alasan apapun.'
        },
        {
            icon: Eye,
            title: 'Privasi Informasi Bisnis',
            content: 'Informasi bisnis Anda (Nama Toko, Alamat, Logo) hanya digunakan untuk keperluan fungsional aplikasi seperti pencetakan struk dan identitas profil Anda di sistem.'
        },
        {
            icon: Database,
            title: 'Penyimpanan Database',
            content: 'Aplikasi menggunakan layanan database Supabase yang tersertifikasi keamanan tinggi. Kami melakukan pencadangan (backup) rutin untuk memastikan data Anda tidak hilang jika terjadi kendala teknis.'
        },
        {
            icon: Smartphone,
            title: 'Akses Perangkat (Printer)',
            content: 'Aplikasi meminta izin akses Bluetooth/USB hanya untuk berkomunikasi dengan printer thermal saat mencetak struk. Kami tidak mengakses data pribadi lain yang ada di perangkat HP Anda.'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {business?.logo_url ? (
                        <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-6 pt-2">
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-900">Kebijakan Privasi</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Keamanan & Perlindungan Data</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-6 h-6 text-emerald-600" />
                        <h3 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">Komitmen Kami</h3>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed font-medium">
                        Kemitraan kami dibangun di atas kepercayaan. Aplikasi Kasir-SaaS berkomitmen menjaga kerahasiaan data operasional Anda sepenuhnya.
                    </p>
                </div>

                <div className="space-y-6">
                    {policies.map((policy, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                <policy.icon className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{policy.title}</h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {policy.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Terakhir: Januari 2026</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed italic">
                        Dengan menggunakan aplikasi ini, Anda setuju dengan kebijakan di atas. Kami dapat memperbarui poin-poin ini sewaktu-waktu untuk meningkatkan standar keamanan.
                    </p>
                </div>
            </div>
        </div>
    );
}
