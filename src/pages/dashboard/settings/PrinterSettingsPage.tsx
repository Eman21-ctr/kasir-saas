import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Printer, Bluetooth, Smartphone,
    CheckCircle2, AlertCircle, ChevronRight, Play, Info, Store
} from 'lucide-react';

export default function PrinterSettingsPage() {
    const navigate = useNavigate();
    const [business, setBusiness] = useState<any>(null);

    useEffect(() => {
        fetchBusinessInfo();
    }, []);

    const fetchBusinessInfo = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('businesses')
                    .select('*') // Using * to be safe against missing columns
                    .eq('user_id', user.id)
                    .single();
                setBusiness(data);
            }
        } catch (error) {
            console.error('Error fetching business info:', error);
        }
    };

    const handleTestPrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>Test Print</title>
                    <style>
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            width: 58mm; 
                            margin: 0; 
                            padding: 10px;
                            font-size: 12px;
                            line-height: 1.2;
                        }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .divider { border-top: 1px dashed #000; margin: 5px 0; }
                        @media print {
                            @page { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="text-center">
                        <div class="font-bold" style="font-size: 16px;">${business?.business_name || 'TOKO KASIR'}</div>
                        <div>${business?.address || 'Alamat Toko'}</div>
                    </div>
                    <div class="divider"></div>
                    <div class="text-center font-bold">TES CETAK STRUK</div>
                    <div class="text-center">STATUS: BERHASIL</div>
                    <div class="divider"></div>
                    <div style="font-size: 10px; margin-top: 10px;" class="text-center">
                        Terima Kasih atas Kunjungan Anda
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo Only */}
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

            <div className="p-6 space-y-6 pt-2">
                {/* Body Title */}
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Printer Struk</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Koneksi & Panduan</p>
                </div>

                {/* Status Card */}
                <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <Printer className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Koneksi Siap</span>
                        </div>
                        <h2 className="text-xl font-black">Mode Browser Print</h2>
                        <p className="text-emerald-100 text-xs mt-1 leading-relaxed">
                            Menggunakan driver pencetakan sistem (Android/iOS) untuk koneksi yang paling stabil dan universal.
                        </p>
                    </div>
                </div>

                {/* Setup Guide */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest opacity-50">Panduan Persiapan</h3>
                        <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                            <Info className="w-3 h-3" />
                            Bantuan
                        </div>
                    </div>

                    <div className="space-y-3">
                        <GuideStep
                            number="1"
                            icon={Bluetooth}
                            title="Sandingkan Bluetooth"
                            desc="Hubungkan printer thermal di setting Bluetooth HP Anda (MPT-II, RPP-02, dll)."
                        />
                        <GuideStep
                            number="2"
                            icon={Smartphone}
                            title="Aktifkan Service Cetak"
                            desc="Cari menu 'Cetak' di HP Anda dan pastikan Layanan Cetak (Print Service) AKTIF."
                        />
                        <GuideStep
                            number="3"
                            icon={Play}
                            title="Lakukan Tes Cetak"
                            desc="Klik tombol Tes Cetak di bawah untuk verifikasi printer sudah dikenali HP."
                        />
                    </div>
                </div>

                {/* Action Box */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">Cetak Tanpa Repot</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-bold">
                                Logo dan Nomor Telepon dihilangkan untuk memastikan cetakan lebih cepat dan tidak membebani baterai printer.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleTestPrint}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        Gaskan Tes Cetak
                    </button>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-bold text-blue-600 leading-tight uppercase tracking-wide">
                        Saran: Gunakan browser Chrome untuk hasil cetak Bluetooth yang paling stabil di HP Android.
                    </p>
                </div>
            </div>
        </div>
    );
}

function GuideStep({ number, icon: Icon, title, desc }: { number: string, icon: any, title: string, desc: string }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center relative flex-shrink-0">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {number}
                </span>
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-200 ml-auto" />
        </div>
    );
}
