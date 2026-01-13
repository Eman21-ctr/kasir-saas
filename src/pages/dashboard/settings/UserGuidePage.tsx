import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, LayoutGrid, ShoppingCart, Package, Users,
    BarChart3, Wallet, Printer, ChevronDown, BookOpen, Store
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function UserGuidePage() {
    const navigate = useNavigate();
    const [business, setBusiness] = useState<any>(null);
    const [openSection, setOpenSection] = useState<string | null>(null);

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

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    const sections = [
        {
            id: 'beranda',
            icon: LayoutGrid,
            title: 'Beranda (Dashboard)',
            desc: 'Pusat kendali harian toko Anda.',
            content: 'Di sini Anda dapat melihat ringkasan penjualan hari ini secara LIVE. Gunakan "Akses Cepat" untuk navigasi kilat ke menu utama, dan "Menu Lainnya" untuk fitur pendukung seperti tambah produk atau catat pengeluaran.'
        },
        {
            id: 'pos',
            icon: ShoppingCart,
            title: 'Kasir (POS)',
            desc: 'Ujung tombak penjualan Anda.',
            content: 'Cari produk berdasarkan nama atau kategori. Klik produk untuk masuk keranjang. Anda bisa memberikan diskon khusus jika pelanggan terdaftar sebagai member. Pastikan memilih metode pembayaran yang sesuai (Tunai, QRIS, atau Transfer).'
        },
        {
            id: 'produk',
            icon: Package,
            title: 'Produk & Inventaris',
            desc: 'Kelola barang dagangan Anda.',
            content: 'Tambahkan produk dengan rincian harga beli, harga jual, dan stok. Aktifkan "Peringatan Stok Low" agar sistem memberi tahu jika barang hampir habis. Gunakan fitur "Kategori" agar produk lebih rapi dikelompokkan.'
        },
        {
            id: 'member',
            icon: Users,
            title: 'Manajemen Member',
            desc: 'Kunci loyalitas pelanggan.',
            content: 'Daftarkan pelanggan Anda untuk mendapatkan poin dari setiap pembelian. Poin ini dapat ditukar dengan potongan harga otomatis sesuai tingkatan (Tier) yang sudah Anda atur di menu Loyalty.'
        },
        {
            id: 'laporan',
            icon: BarChart3,
            title: 'Laporan Penjualan',
            desc: 'Pantau pertumbuhan bisnis.',
            content: 'Lihat data transaksi secara mendalam, grafik tren penjualan mingguan/bulanan, rincian laba kotor, hingga daftar produk yang paling laris (Top Selling). Cocok untuk bahan evaluasi bisnis Anda.'
        },
        {
            id: 'pengeluaran',
            icon: Wallet,
            title: 'Catat Pengeluaran',
            desc: 'Jaga akurasi saldo toko.',
            content: 'Jangan lupa mencatat biaya-biaya operasional seperti listrik, air, atau belanja perlengkapan. Ini membantu Anda menghitung keuntungan bersih toko secara lebih akurat.'
        },
        {
            id: 'printer',
            icon: Printer,
            title: 'Printer Struk',
            desc: 'Gunakan nota untuk kepercayaan.',
            content: 'Hubungkan HP Anda dengan printer thermal via Bluetooth. Pastikan driver cetak sistem HP sudah aktif. Kami merekomendasikan teks polos (tanpa logo) agar proses cetak lebih cepat dan stabil.'
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
                    <h1 className="text-2xl font-extrabold text-slate-900">Panduan Penggunaan</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Edukasi & Tutorial Fitur</p>
                </div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={cn(
                                "bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300",
                                openSection === section.id ? "shadow-md ring-1 ring-emerald-100" : "shadow-sm"
                            )}
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full p-5 flex items-center gap-4 text-left active:bg-slate-50 transition-colors"
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    openSection === section.id ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                                )}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{section.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{section.desc}</p>
                                </div>
                                <ChevronDown className={cn(
                                    "w-5 h-5 text-slate-300 transition-transform duration-300",
                                    openSection === section.id && "rotate-180 text-emerald-500"
                                )} />
                            </button>

                            <div className={cn(
                                "overflow-hidden transition-all duration-300",
                                openSection === section.id ? "max-h-60" : "max-h-0"
                            )}>
                                <div className="p-5 pt-0 border-t border-slate-50 mt-1">
                                    <p className="text-xs text-slate-500 leading-relaxed pt-4 border-t border-slate-50">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-emerald-500 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-emerald-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-2">Butuh bantuan lain?</h4>
                        <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                            Jika Anda masih mengalami kendala atau ingin memberikan saran fitur, jangan ragu untuk menghubungi dukungan kami.
                        </p>
                        <button className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl transition-all border border-white/20 backdrop-blur-sm">
                            Hubungi Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
