import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, TrendingUp, TrendingDown, ShoppingCart, Apple as PiggyBank, ChevronDown, Share2, Download, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Period = 'today' | 'week' | 'month' | 'custom';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('today');
    const [showPeriodPicker, setShowPeriodPicker] = useState(false);

    // Date range for custom
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Stats
    const [totalSales, setTotalSales] = useState(0);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [avgBasket, setAvgBasket] = useState(0);
    const [dailyData, setDailyData] = useState<{ date: string, amount: number }[]>([]);

    // Expenses
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchReports();
    }, [period, startDate, endDate]);

    const getDateRange = () => {
        const now = new Date();
        let start: Date, end: Date;

        switch (period) {
            case 'today':
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date();
                break;
            case 'week':
                start = new Date(now.setDate(now.getDate() - 7));
                end = new Date();
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date();
                break;
            case 'custom':
                start = new Date(startDate);
                end = new Date(endDate);
                end.setHours(23, 59, 59);
                break;
            default:
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date();
        }
        return { start, end };
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, logo_url')
                .eq('user_id', user.id)
                .single();
            if (!business) return;
            setLogoUrl(business.logo_url || '');

            const { start, end } = getDateRange();

            // Fetch transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('id, total_amount, created_at')
                .eq('business_id', business.id)
                .eq('payment_status', 'paid')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            // Fetch transaction items for profit
            const { data: items } = await supabase
                .from('transaction_items')
                .select('profit, transaction_id')
                .in('transaction_id', transactions?.map(t => t.id) || []);

            // Fetch expenses
            const { data: expenses } = await supabase
                .from('expenses')
                .select('amount')
                .eq('business_id', business.id)
                .gte('expense_date', start.toISOString().split('T')[0])
                .lte('expense_date', end.toISOString().split('T')[0]);

            // Calculate stats
            const sales = transactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
            const profit = items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
            const expenseTotal = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
            const count = transactions?.length || 0;

            setTotalSales(sales);
            setTotalTransactions(count);
            setTotalProfit(profit);
            setTotalExpenses(expenseTotal);
            setAvgBasket(count > 0 ? Math.round(sales / count) : 0);

            // Daily breakdown
            const daily: { [key: string]: number } = {};
            transactions?.forEach(t => {
                const day = new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                daily[day] = (daily[day] || 0) + t.total_amount;
            });
            setDailyData(Object.entries(daily).map(([date, amount]) => ({ date, amount })));

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const periodLabel = () => {
        switch (period) {
            case 'today': return 'Hari Ini';
            case 'week': return '7 Hari Terakhir';
            case 'month': return 'Bulan Ini';
            case 'custom': return 'Kustom';
        }
    };

    const netProfit = totalProfit - totalExpenses;
    const maxDaily = Math.max(...dailyData.map(d => d.amount), 1);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memuat Laporan...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <ShoppingCart className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <Share2 className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="p-6 space-y-6 pt-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Laporan Keuangan</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performa Bisnis Anda</p>
                </div>

                {/* Period Selector */}
                <button
                    onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                    className="w-full bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-slate-700">{periodLabel()}</span>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showPeriodPicker && "rotate-180")} />
                </button>

                {showPeriodPicker && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                        {(['today', 'week', 'month', 'custom'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setPeriod(p); if (p !== 'custom') setShowPeriodPicker(false); }}
                                className={cn(
                                    "w-full p-4 text-left font-medium border-b border-slate-50 last:border-0",
                                    period === p ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {p === 'today' && 'Hari Ini'}
                                {p === 'week' && '7 Hari Terakhir'}
                                {p === 'month' && 'Bulan Ini'}
                                {p === 'custom' && 'Pilih Tanggal'}
                            </button>
                        ))}

                        {period === 'custom' && (
                            <div className="p-4 bg-slate-50 space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500">Dari</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-medium" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-bold text-slate-500">Sampai</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-medium" />
                                    </div>
                                </div>
                                <button onClick={() => setShowPeriodPicker(false)} className="w-full bg-emerald-500 text-white py-2 rounded-lg font-bold text-sm">Terapkan</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Stats */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-emerald-100 text-sm font-medium mb-1">Total Penjualan</p>
                    <h2 className="text-3xl font-extrabold mb-4">Rp {totalSales.toLocaleString()}</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase">Transaksi</p>
                            <p className="text-xl font-bold">{totalTransactions}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase">Rata-rata</p>
                            <p className="text-xl font-bold">Rp {avgBasket.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Profit & Expense */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Laba Kotor</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">Rp {totalProfit.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Pengeluaran</span>
                        </div>
                        <p className="text-xl font-bold text-red-500">Rp {totalExpenses.toLocaleString()}</p>
                    </div>
                </div>

                {/* Net Profit */}
                <div className={cn(
                    "p-4 rounded-xl border-2 flex items-center justify-between",
                    netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                )}>
                    <div className="flex items-center gap-3">
                        <PiggyBank className={cn("w-6 h-6", netProfit >= 0 ? "text-green-600" : "text-red-600")} />
                        <span className="font-bold text-slate-700">Laba Bersih</span>
                    </div>
                    <span className={cn("text-xl font-extrabold", netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                        Rp {netProfit.toLocaleString()}
                    </span>
                </div>

                {/* Daily Chart */}
                {dailyData.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-4">Grafik Penjualan</h3>
                        <div className="flex items-end gap-2 h-32">
                            {dailyData.slice(-7).map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-emerald-500 rounded-t-lg transition-all"
                                        style={{ height: `${(d.amount / maxDaily) * 100}%`, minHeight: '4px' }}
                                    />
                                    <span className="text-[10px] text-slate-400 mt-2 font-bold">{d.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 font-bold text-slate-600 text-sm shadow-sm">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button className="bg-emerald-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm shadow-lg shadow-emerald-500/20">
                        <Share2 className="w-4 h-4" />
                        Kirim via WA
                    </button>
                </div>

            </div>
        </div>
    );
}
