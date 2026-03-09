import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    Users, BarChart3, History,
    AlertTriangle, ChevronRight, TrendingUp, Receipt, Wallet, LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { business, role, permissions, loading: authLoading } = useAuth();

    const [businessName, setBusinessName] = useState('');
    const [todaySales, setTodaySales] = useState(0);
    const [todayTransactions, setTodayTransactions] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        if (!authLoading && business) {
            fetchData();
        }

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');
    }, [authLoading, business]);

    const fetchData = async () => {
        try {
            setBusinessName(business.business_name);

            // Fetch Sales Stats if has permission
            if (role === 'shop_owner' || permissions.reports) {
                const startDate = new Date();
                startDate.setHours(0, 0, 0, 0);

                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('total_amount, payment_status, created_at')
                    .eq('business_id', business.id)
                    .eq('payment_status', 'paid')
                    .gte('created_at', startDate.toISOString());

                setTodaySales(transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0);
                setTodayTransactions(transactions?.length || 0);
            }

            // Fetch Stock Info if has permission
            if (role === 'shop_owner' || permissions.stock) {
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
        {
            icon: Wallet, label: 'Pengeluaran', path: '/dashboard/expenses', color: 'bg-rose-500', shadowColor: 'shadow-rose-500/30',
            show: role === 'shop_owner' || permissions.reports
        },
        {
            icon: Users, label: 'Member', path: '/dashboard/members', color: 'bg-purple-500', shadowColor: 'shadow-purple-500/30',
            show: role === 'shop_owner' || permissions.pos
        },
        {
            icon: History, label: 'Riwayat', path: '/dashboard/pos/history', color: 'bg-blue-500', shadowColor: 'shadow-blue-500/30',
            show: role === 'shop_owner' || permissions.pos
        },
        {
            icon: BarChart3, label: 'Laporan', path: '/dashboard/reports', color: 'bg-amber-500', shadowColor: 'shadow-amber-500/30',
            show: role === 'shop_owner' || permissions.reports
        },
    ].filter(a => a.show);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">

            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 pb-24 flex justify-between items-start">
                <div>
                    <p className="text-emerald-100 text-sm font-medium">{greeting} 👋</p>
                    <h1 className="text-2xl font-bold text-white mt-1">{businessName}</h1>
                    <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {role === 'shop_owner' ? 'Pemilik Toko' : 'Staf Kasir'}
                    </p>
                </div>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/login');
                    }}
                    className="p-2.5 bg-white/10 text-white rounded-xl active:scale-95 transition-all flex items-center gap-2 backdrop-blur-md border border-white/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Keluar</span>
                </button>
            </div>

            {/* Sales Card */}
            <div className="px-6 -mt-14 relative z-10">
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

            <div className="p-6 pt-8 space-y-5">

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



            </div>
        </div>
    );
}


