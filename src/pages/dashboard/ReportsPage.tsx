import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, TrendingUp, TrendingDown, Apple as PiggyBank, ChevronDown, Share2, Download, Loader2, Package, Users, Wallet, Eye, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';
import { useAuth } from '../../hooks/useAuth';

type Period = 'today' | 'week' | 'month' | 'custom';
type ReportType = 'sales' | 'stock' | 'member' | 'expense';

export default function ReportsPage() {
    const { business, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('today');
    const [reportType, setReportType] = useState<ReportType>('sales');
    const [showPeriodPicker, setShowPeriodPicker] = useState(false);
    const [showReportPicker, setShowReportPicker] = useState(false);

    // Date range for custom
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Stats
    const [totalSales, setTotalSales] = useState(0);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [avgBasket, setAvgBasket] = useState(0);
    // Data for different reports
    const [transactions, setTransactions] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [expensesList, setExpensesList] = useState<any[]>([]);
    const [categoryExpenses, setCategoryExpenses] = useState<{ category: string, amount: number }[]>([]);

    const [dailyData, setDailyData] = useState<{ date: string, amount: number }[]>([]);

    // Expenses
    const [totalExpenses, setTotalExpenses] = useState(0);


    // Modal state
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [detailType, setDetailType] = useState<ReportType | null>(null);
    const [trxItems, setTrxItems] = useState<any[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        if (!authLoading && business) {
            fetchReports();
        }
    }, [period, reportType, startDate, endDate, authLoading, business]);

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
            if (!business) return; // Ensure business is available from useAuth


            const { start, end } = getDateRange();

            if (reportType === 'sales') {
                // Fetch transactions
                const { data: trx } = await supabase
                    .from('transactions')
                    .select('*, members(name)')
                    .eq('business_id', business.id)
                    .eq('payment_status', 'paid')
                    .gte('created_at', start.toISOString())
                    .lte('created_at', end.toISOString())
                    .order('created_at', { ascending: false });

                setTransactions(trx || []);

                // Fetch transaction items for profit
                const { data: items } = await supabase
                    .from('transaction_items')
                    .select('profit, transaction_id')
                    .in('transaction_id', trx?.map(t => t.id) || []);

                // Calculate stats
                const sales = trx?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
                const profit = items?.reduce((sum, i) => sum + (i.profit || 0), 0) || 0;
                const count = trx?.length || 0;

                setTotalSales(sales);
                setTotalTransactions(count);
                setTotalProfit(profit);
                setAvgBasket(count > 0 ? Math.round(sales / count) : 0);

                // Daily breakdown
                const daily: { [key: string]: number } = {};
                trx?.forEach(t => {
                    const day = new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    daily[day] = (daily[day] || 0) + t.total_amount;
                });
                setDailyData(Object.entries(daily).map(([date, amount]) => ({ date, amount })));

                // Also fetch expenses for net profit
                const { data: exp } = await supabase
                    .from('expenses')
                    .select('amount')
                    .eq('business_id', business.id)
                    .gte('expense_date', start.toISOString().split('T')[0])
                    .lte('expense_date', end.toISOString().split('T')[0]);

                setTotalExpenses(exp?.reduce((sum, e) => sum + e.amount, 0) || 0);

            } else if (reportType === 'stock') {
                // Fetch products with stock movement? No, current stock as requested
                const { data: prod } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('business_id', business.id)
                    .order('stock_quantity', { ascending: true });

                setProducts(prod || []);

                const totalVal = prod?.reduce((sum, p) => sum + (p.stock_quantity * p.purchase_price), 0) || 0;
                const lowStockCount = prod?.filter(p => p.stock_quantity <= p.min_stock).length || 0;

                setTotalSales(totalVal); // Reusing state for KPI
                setTotalTransactions(lowStockCount); // Reusing state for KPI

            } else if (reportType === 'member') {
                const { data: mem } = await supabase
                    .from('members')
                    .select('*')
                    .eq('business_id', business.id)
                    .order('total_spending', { ascending: false });

                setMembers(mem || []);

                const count = mem?.length || 0;
                const totalSpend = mem?.reduce((sum, m) => sum + (m.total_spending || 0), 0) || 0;

                setTotalTransactions(count);
                setAvgBasket(count > 0 ? Math.round(totalSpend / count) : 0);

            } else if (reportType === 'expense') {
                const { data: exp } = await supabase
                    .from('expenses')
                    .select('*, expense_categories(name)')
                    .eq('business_id', business.id)
                    .gte('expense_date', start.toISOString().split('T')[0])
                    .lte('expense_date', end.toISOString().split('T')[0])
                    .order('expense_date', { ascending: false });

                setExpensesList(exp || []);

                const total = exp?.reduce((sum, e) => sum + e.amount, 0) || 0;
                setTotalExpenses(total);

                // Group by category
                const catMap: { [key: string]: number } = {};
                exp?.forEach(e => {
                    const catName = e.expense_categories?.name || 'Lainnya';
                    catMap[catName] = (catMap[catName] || 0) + e.amount;
                });
                setCategoryExpenses(Object.entries(catMap).map(([category, amount]) => ({ category, amount })));
            }

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        if (!window.confirm("Hapus transaksi ini? Stok barang akan dikembalikan dan poin member akan dikurangi otomatis.")) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchReports();
            alert("Transaksi berhasil dihapus.");
        } catch (error: any) {
            alert("Gagal menghapus: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("Hapus produk ini? Perhatian: Menghapus produk juga akan menghapus riwayat transaksi produk ini.")) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            await fetchReports();
            alert("Produk berhasil dihapus.");
        } catch (error: any) {
            alert("Gagal menghapus: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (id: number) => {
        if (!window.confirm("Hapus member ini? Riwayat transaksi member akan tetap ada.")) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('members').delete().eq('id', id);
            if (error) throw error;
            await fetchReports();
            alert("Member berhasil dihapus.");
        } catch (error: any) {
            alert("Gagal menghapus: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (!window.confirm("Hapus pengeluaran ini?")) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('expenses').delete().eq('id', id);
            if (error) throw error;
            await fetchReports();
            alert("Pengeluaran berhasil dihapus.");
        } catch (error: any) {
            alert("Gagal menghapus: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (item: any, type: ReportType) => {
        setSelectedItem(item);
        setDetailType(type);
        if (type === 'sales') {
            try {
                setLoadingDetail(true);
                const { data } = await supabase
                    .from('transaction_items')
                    .select('*')
                    .eq('transaction_id', item.id);
                setTrxItems(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingDetail(false);
            }
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

    const reportLabel = () => {
        switch (reportType) {
            case 'sales': return 'Laporan Penjualan';
            case 'stock': return 'Laporan Stok Barang';
            case 'member': return 'Laporan Member';
            case 'expense': return 'Laporan Pengeluaran';
        }
    };

    const handleExport = () => {
        let exportData: any[] = [];
        let fileName = `Laporan_${reportType}_${new Date().toISOString().split('T')[0]}`;

        if (reportType === 'sales') {
            exportData = transactions.map(t => ({
                'Tanggal': new Date(t.created_at).toLocaleString('id-ID'),
                'No. Transaksi': t.transaction_number,
                'Member': t.members?.name || '-',
                'Metode': t.payment_method,
                'Total Bersih': t.total_amount
            }));
        } else if (reportType === 'stock') {
            exportData = products.map(p => ({
                'Produk': p.name,
                'SKU': p.sku || '-',
                'Kategori': p.categories?.name || '-',
                'Stok': p.stock_quantity,
                'Unit': p.unit,
                'Harga Beli': p.purchase_price,
                'Harga Jual': p.selling_price
            }));
        } else if (reportType === 'member') {
            exportData = members.map(m => ({
                'Nama': m.name,
                'Telepon': m.phone,
                'Level': m.member_level,
                'Poin': m.total_points,
                'Total Transaksi': m.total_transactions,
                'Total Belanja': m.total_spending,
                'Tgl Gabung': new Date(m.join_date).toLocaleDateString('id-ID')
            }));
        } else if (reportType === 'expense') {
            exportData = expensesList.map(e => ({
                'Tanggal': e.expense_date,
                'Kategori': e.expense_categories?.name || '-',
                'Nama': e.name,
                'Jumlah': e.amount,
                'Catatan': e.notes || '-'
            }));
        }

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
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

            <div className="p-6 space-y-6 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Laporan</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Performa Bisnis Anda</p>
                    </div>
                    <button
                        onClick={() => {
                            const text = `Laporan ${reportLabel()} - ${periodLabel()}\nTotal: Rp ${totalSales.toLocaleString()}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <Share2 className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Report Type Selector */}
                <div className="space-y-4">
                    <button
                        onClick={() => setShowReportPicker(!showReportPicker)}
                        className="w-full bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-slate-700">{reportLabel()}</span>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showReportPicker && "rotate-180")} />
                    </button>

                    {showReportPicker && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {(['sales', 'stock', 'member', 'expense'] as ReportType[]).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => { setReportType(r); setShowReportPicker(false); }}
                                    className={cn(
                                        "w-full p-4 text-left font-bold border-b border-slate-50 last:border-0 transition-colors",
                                        reportType === r ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {r === 'sales' && 'Laporan Penjualan'}
                                    {r === 'stock' && 'Laporan Stok Barang'}
                                    {r === 'member' && 'Laporan Member'}
                                    {r === 'expense' && 'Laporan Pengeluaran'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Period Selector */}
                    <button
                        onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                        className="w-full bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <span className="font-bold text-slate-700">{periodLabel()}</span>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", showPeriodPicker && "rotate-180")} />
                    </button>
                </div>

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

                {/* KPI Cards Moved Up */}
                <div className="space-y-4">
                    {reportType === 'sales' && (
                        <>
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
                        </>
                    )}

                    {reportType === 'stock' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Nilai Stok</span>
                                </div>
                                <p className="text-xl font-bold text-emerald-600">Rp {totalSales.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Berdasarkan Harga Beli</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Stok Rendah</span>
                                </div>
                                <p className="text-xl font-bold text-red-500">{totalTransactions} Items</p>
                                <p className="text-[10px] text-slate-400 font-medium">Perlu Segera Restok</p>
                            </div>
                        </div>
                    )}

                    {reportType === 'member' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Total Member</span>
                                </div>
                                <p className="text-xl font-bold text-blue-600">{totalTransactions}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Rata-rata Belanja</span>
                                </div>
                                <p className="text-lg font-bold text-amber-600">Rp {avgBasket.toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {reportType === 'expense' && (
                        <div className="space-y-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-50 rounded-lg">
                                        <Wallet className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Total Pengeluaran</p>
                                        <h3 className="text-2xl font-black text-slate-800">Rp {totalExpenses.toLocaleString()}</h3>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                    {categoryExpenses.map((ce, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600">{ce.category}</span>
                                            <span className="text-sm font-bold text-slate-800">Rp {ce.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Daily Chart Moved Down */}
                {reportType === 'sales' && dailyData.length > 0 && (
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

                {/* Main Content (Table) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-700">Detail {reportLabel()}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                                {reportType === 'sales' && (
                                    <tr>
                                        <th className="px-2 py-3 text-[9px]">Jam</th>
                                        <th className="px-2 py-3 text-[9px]">No Trx</th>
                                        <th className="px-2 py-3 text-[9px]">Member</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Total</th>
                                        <th className="px-2 py-3 text-[9px] text-center">Aksi</th>
                                    </tr>
                                )}
                                {reportType === 'stock' && (
                                    <tr>
                                        <th className="px-2 py-3 text-[9px]">Produk</th>
                                        <th className="px-2 py-3 text-[9px]">Kategori</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Stok</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Modal</th>
                                        <th className="px-2 py-3 text-[9px] text-center">Aksi</th>
                                    </tr>
                                )}
                                {reportType === 'member' && (
                                    <tr>
                                        <th className="px-2 py-3 text-[9px]">Nama</th>
                                        <th className="px-2 py-3 text-[9px]">Level</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Poin</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Total</th>
                                        <th className="px-2 py-3 text-[9px] text-center">Aksi</th>
                                    </tr>
                                )}
                                {reportType === 'expense' && (
                                    <tr>
                                        <th className="px-2 py-3 text-[9px]">Tgl</th>
                                        <th className="px-2 py-3 text-[9px]">Kategori</th>
                                        <th className="px-2 py-3 text-[9px]">Nama</th>
                                        <th className="px-2 py-3 text-[9px] text-right">Jumlah</th>
                                        <th className="px-2 py-3 text-[9px] text-center">Aksi</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportType === 'sales' && transactions.length > 0 ? transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-2.5 whitespace-nowrap text-[11px] font-medium text-slate-500">
                                            {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-2 py-2.5 font-bold uppercase text-[10px] text-emerald-700 tracking-tighter truncate max-w-[80px]">
                                            {t.transaction_number}
                                        </td>
                                        <td className="px-2 py-2.5 text-[11px] font-semibold text-slate-700 truncate max-w-[70px]">
                                            {t.members?.name || '-'}
                                        </td>
                                        <td className="px-2 py-2.5 text-right font-black text-slate-900 text-[11px]">
                                            {t.total_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openDetail(t, 'sales')}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : null}
                                {reportType === 'stock' && products.length > 0 ? products.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-2.5">
                                            <p className="font-bold text-[11px] text-slate-700 truncate max-w-[80px] leading-tight">{p.name}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{p.sku || '-'}</p>
                                        </td>
                                        <td className="px-2 py-2.5 text-[10px] font-medium text-slate-500 truncate max-w-[60px]">
                                            {p.categories?.name || '-'}
                                        </td>
                                        <td className={cn(
                                            "px-2 py-2.5 text-right font-black text-[11px]",
                                            (p.stock_quantity || 0) <= (p.min_stock || 0) ? "text-red-500" : "text-emerald-600"
                                        )}>
                                            {p.stock_quantity}
                                        </td>
                                        <td className="px-2 py-2.5 text-right text-[10px] font-bold text-slate-400">
                                            {p.purchase_price?.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openDetail(p, 'stock')}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : null}
                                {reportType === 'member' && members.length > 0 ? members.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-2.5">
                                            <p className="font-bold text-[11px] text-slate-700 truncate max-w-[80px] leading-tight">{m.name}</p>
                                            <p className="text-[9px] text-slate-400 font-medium">{m.phone}</p>
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                                m.member_level === 'platinum' ? "bg-purple-100 text-purple-700" :
                                                    m.member_level === 'gold' ? "bg-amber-100 text-amber-700" :
                                                        m.member_level === 'silver' ? "bg-slate-100 text-slate-700" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {m.member_level}
                                            </span>
                                        </td>
                                        <td className="px-2 py-2.5 text-right font-bold text-[11px] text-slate-600">{m.total_points}</td>
                                        <td className="px-2 py-2.5 text-right font-black text-slate-900 text-[11px]">
                                            {m.total_spending?.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openDetail(m, 'member')}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(m.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : null}
                                {reportType === 'expense' && expensesList.length > 0 ? expensesList.map((e) => (
                                    <tr key={e.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-2.5 whitespace-nowrap text-[10px] font-bold text-slate-400">
                                            {new Date(e.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                                        </td>
                                        <td className="px-2 py-2.5 text-[10px] font-medium text-slate-500 truncate max-w-[50px]">
                                            {e.expense_categories?.name || '-'}
                                        </td>
                                        <td className="px-2 py-2.5 font-bold text-[11px] text-slate-700 truncate max-w-[60px] leading-tight">
                                            {e.name}
                                        </td>
                                        <td className="px-2 py-2.5 text-right font-black text-red-600 text-[11px]">
                                            {e.amount?.toLocaleString()}
                                        </td>
                                        <td className="px-2 py-2.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openDetail(e, 'expense')}
                                                    className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteExpense(e.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : null}
                            </tbody>
                        </table>
                        {((reportType === 'sales' && !transactions.length) ||
                            (reportType === 'stock' && !products.length) ||
                            (reportType === 'member' && !members.length) ||
                            (reportType === 'expense' && !expensesList.length)) && (
                                <div className="p-8 text-center text-slate-400 font-medium">
                                    Tidak ada data untuk periode ini
                                </div>
                            )}
                    </div>
                </div>


                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 font-bold text-slate-600 text-sm shadow-sm active:scale-95 transition-transform"
                    >
                        <Download className="w-4 h-4" />
                        Download Excel
                    </button>
                    <button className="bg-emerald-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
                        <Share2 className="w-4 h-4" />
                        Kirim ke WA
                    </button>
                </div>

                {/* Detail Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">Detail {detailType === 'sales' ? 'Transaksi' : detailType === 'stock' ? 'Produk' : detailType === 'member' ? 'Member' : 'Pengeluaran'}</h3>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Informasi Lengkap</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedItem(null); setDetailType(null); }}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                                {detailType === 'sales' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">No. Transaksi</p>
                                                <p className="text-sm font-black text-slate-700">{selectedItem.transaction_number}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Waktu</p>
                                                <p className="text-sm font-bold text-slate-700">{new Date(selectedItem.created_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Item Terjual</p>
                                            {loadingDetail ? (
                                                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {trxItems.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                                            <div className="flex-1">
                                                                <p className="text-xs font-black text-slate-700">{item.product_name}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold">{item.quantity} {item.unit} x {item.selling_price?.toLocaleString()}</p>
                                                            </div>
                                                            <p className="text-xs font-black text-emerald-600">Rp {item.subtotal?.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-900">Total Transaksi</span>
                                            <span className="text-xl font-black text-emerald-600">Rp {selectedItem.total_amount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                {detailType === 'stock' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Stok Tersedia</p>
                                                <p className="text-3xl font-black text-emerald-700">{selectedItem.stock_quantity} <span className="text-sm text-emerald-500">{selectedItem.unit}</span></p>
                                            </div>
                                            <Package className="w-10 h-10 text-emerald-200" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { label: 'Nama Produk', value: selectedItem.name },
                                                { label: 'SKU / Barcode', value: selectedItem.sku || '-' },
                                                { label: 'Kategori', value: selectedItem.categories?.name || '-' },
                                                { label: 'Harga Beli (Modal)', value: `Rp ${selectedItem.purchase_price?.toLocaleString()}` },
                                                { label: 'Harga Jual', value: `Rp ${selectedItem.selling_price?.toLocaleString()}` },
                                                { label: 'Min. Stok Alert', value: `${selectedItem.min_stock} ${selectedItem.unit}` },
                                            ].map((info, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                                                    <span className="text-xs font-medium text-slate-500">{info.label}</span>
                                                    <span className="text-xs font-black text-slate-800">{info.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailType === 'member' && (
                                    <div className="space-y-4">
                                        <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
                                            <div className="flex justify-between items-start mb-4">
                                                <Users className="w-8 h-8 text-white/30" />
                                                <span className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase">{selectedItem.member_level}</span>
                                            </div>
                                            <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest">Total Poin</p>
                                            <h4 className="text-3xl font-black">{selectedItem.total_points}</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Transaksi</p>
                                                <p className="text-sm font-black text-slate-700">{selectedItem.total_transactions} Kali</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Belanja</p>
                                                <p className="text-sm font-black text-slate-700">Rp {selectedItem.total_spending?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'Nama Member', value: selectedItem.name },
                                                { label: 'No. Telepon', value: selectedItem.phone },
                                                { label: 'Tanggal Gabung', value: new Date(selectedItem.join_date).toLocaleDateString('id-ID') },
                                                { label: 'Status', value: selectedItem.is_active ? 'Aktif' : 'Non-Aktif' },
                                            ].map((info, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                                                    <span className="text-xs font-medium text-slate-500">{info.label}</span>
                                                    <span className="text-xs font-black text-slate-800">{info.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailType === 'expense' && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                            <p className="text-[10px] font-bold text-red-500 uppercase">Jumlah Pengeluaran</p>
                                            <p className="text-2xl font-black text-red-600">Rp {selectedItem.amount?.toLocaleString()}</p>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { label: 'Nama Pengeluaran', value: selectedItem.name },
                                                { label: 'Kategori', value: selectedItem.expense_categories?.name || 'Umum' },
                                                { label: 'Tanggal', value: new Date(selectedItem.expense_date).toLocaleDateString('id-ID') },
                                                { label: 'Catatan', value: selectedItem.notes || '-' },
                                            ].map((info, i) => (
                                                <div key={i} className="flex flex-col gap-1 py-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{info.label}</span>
                                                    <span className="text-sm font-bold text-slate-700">{info.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-slate-50 flex gap-3">
                                <button
                                    onClick={() => { setSelectedItem(null); setDetailType(null); }}
                                    className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-bold text-slate-600 text-sm active:scale-95 transition-all shadow-sm"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
