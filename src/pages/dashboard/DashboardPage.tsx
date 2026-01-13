import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    ShoppingCart, Package, Users, BarChart3, Plus, History,
    AlertTriangle, ChevronRight, TrendingUp, Receipt, Wallet
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [businessName, setBusinessName] = useState('');
    const [todaySales, setTodaySales] = useState(0);
    const [todayTransactions, setTodayTransactions] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        fetchData();

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setBusinessName(business.business_name);

                // Today's transactions
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('total_amount')
                    .eq('business_id', business.id)
                    .eq('payment_status', 'paid')
                    .gte('created_at', today.toISOString());

                setTodaySales(transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0);
                setTodayTransactions(transactions?.length || 0);

                // Low stock products
                const { data: lowStock } = await supabase
                    .from('products')
                    .select('id')
                    .eq('business_id', business.id)
                    .eq('is_active', true)
                    .lte('stock_quantity', 5);

                setLowStockCount(lowStock?.length || 0);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const quickActions = [
        { icon: ShoppingCart, label: 'Kasir', path: '/dashboard/pos', color: 'bg-emerald-500', shadowColor: 'shadow-emerald-500/30' },
        { icon: Package, label: 'Produk', path: '/dashboard/products', color: 'bg-blue-500', shadowColor: 'shadow-blue-500/30' },
        { icon: Users, label: 'Member', path: '/dashboard/members', color: 'bg-purple-500', shadowColor: 'shadow-purple-500/30' },
        { icon: BarChart3, label: 'Laporan', path: '/dashboard/reports', color: 'bg-amber-500', shadowColor: 'shadow-amber-500/30' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">

            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 pb-14">
                <p className="text-emerald-100 text-sm font-medium">{greeting} 👋</p>
                <h1 className="text-2xl font-bold text-white mt-1">{businessName}</h1>
            </div>

            {/* Sales Card */}
            <div className="px-6 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <span className="text-slate-500 font-medium text-sm">Penjualan Hari Ini</span>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold uppercase">Live</span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-800 mb-3">
                        Rp {todaySales.toLocaleString()}
                    </h2>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">{todayTransactions} transaksi</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-5">

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-3">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                action.color, action.shadowColor
                            )}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{action.label}</span>
                        </button>
                    ))}
                </div>

                {/* Stock Alert */}
                {lowStockCount > 0 && (
                    <button
                        onClick={() => navigate('/dashboard/products/alerts')}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-2xl flex items-center justify-between shadow-lg text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">{lowStockCount} Barang Stok Menipis</p>
                                <p className="text-red-100 text-xs">Segera restock sebelum kehabisan</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Menu Grid */}
                <div className="space-y-3">
                    <h3 className="font-bold text-slate-700 text-sm">Menu Lainnya</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <MenuCard
                            icon={Plus}
                            label="Tambah Produk"
                            sub="Daftarkan barang baru"
                            onClick={() => navigate('/dashboard/products/new')}
                        />
                        <MenuCard
                            icon={History}
                            label="Riwayat"
                            sub="Transaksi terbaru"
                            onClick={() => navigate('/dashboard/pos/history')}
                        />
                        <MenuCard
                            icon={Wallet}
                            label="Pengeluaran"
                            sub="Catat biaya operasional"
                            onClick={() => navigate('/dashboard/expenses')}
                            accent
                        />
                        <MenuCard
                            icon={Package}
                            label="Kategori"
                            sub="Kelola kategori"
                            onClick={() => navigate('/dashboard/products/categories')}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function MenuCard({ icon: Icon, label, sub, onClick, accent }: { icon: any, label: string, sub: string, onClick: () => void, accent?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "bg-white p-4 rounded-2xl border text-center flex flex-col items-center gap-2 shadow-sm active:scale-[0.98] transition-all",
                accent ? "border-red-100 bg-red-50" : "border-slate-100"
            )}
        >
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                accent ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-500"
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className={cn("font-bold text-sm", accent ? "text-red-700" : "text-slate-700")}>{label}</h4>
                <p className={cn("text-[10px] leading-tight", accent ? "text-red-400" : "text-slate-400")}>{sub}</p>
            </div>
        </button>
    );
}
