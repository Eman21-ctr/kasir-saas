import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, History, ChevronRight, Calendar, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Transaction = {
    id: number;
    transaction_number: string;
    total_amount: number;
    payment_method: string;
    created_at: string;
    subtotal: number;
    discount_amount: number;
    cash_received: number;
    cash_change: number;
    points_earned: number;
    members?: { name: string; member_level: string }[] | null;
    transaction_items: {
        product_name: string;
        quantity: number;
        selling_price: number;
        subtotal: number;
    }[];
};

type Period = 'today' | 'month' | 'year' | 'custom';

export default function TransactionHistoryPage() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [search, setSearch] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

    // Date Filters
    const [period, setPeriod] = useState<Period>('today');
    const [showPeriodPicker, setShowPeriodPicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTransactions();
    }, [period, startDate, endDate]);

    const getDateRange = () => {
        const now = new Date();
        let start: Date, end: Date;

        switch (period) {
            case 'today':
                start = new Date(now.setHours(0, 0, 0, 0));
                end = new Date();
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date();
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
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

    const fetchTransactions = async () => {
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

            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    id, 
                    transaction_number, 
                    total_amount, 
                    payment_method, 
                    created_at,
                    subtotal,
                    discount_amount,
                    cash_received,
                    cash_change,
                    points_earned,
                    members (name, member_level),
                    transaction_items (product_name, quantity, selling_price, subtotal)
                `)
                .eq('business_id', business.id)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (transactions.length === 0) return alert("Tidak ada data untuk diekspor");

        const headers = ["No. Transaksi", "Tanggal", "Metode", "Nama Produk", "Qty", "Harga Satuan", "Total Transaksi"];
        const rows: any[] = [];

        transactions.forEach(t => {
            t.transaction_items.forEach((item, index) => {
                rows.push([
                    index === 0 ? t.transaction_number : "", // Only show trans no on first line of transaction
                    index === 0 ? new Date(t.created_at).toLocaleString('id-ID') : "",
                    index === 0 ? t.payment_method.toUpperCase() : "",
                    item.product_name,
                    item.quantity,
                    item.selling_price,
                    index === 0 ? t.total_amount : ""
                ]);
            });
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Riwayat_Transaksi_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const periodLabel = () => {
        switch (period) {
            case 'today': return 'Hari Ini';
            case 'month': return 'Bulan Ini';
            case 'year': return 'Tahun Ini';
            case 'custom': return 'Kustom';
        }
    };

    const filtered = transactions.filter(t => t.transaction_number.toLowerCase().includes(search.toLowerCase()));



    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Modal Detail */}
            {selectedTrx && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedTrx.transaction_number}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {new Date(selectedTrx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {new Date(selectedTrx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={() => setSelectedTrx(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Modal */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 scrollbar-hide">
                            {/* Member Info */}
                            {(() => {
                                const member = Array.isArray(selectedTrx.members) ? selectedTrx.members[0] : selectedTrx.members;
                                if (!member) return null;
                                return (
                                    <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-black text-xs uppercase">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Member</p>
                                                <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-1 rounded-full uppercase">
                                            {member.member_level}
                                        </span>
                                    </div>
                                );
                            })()}

                            {/* Items */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Daftar Belanja</p>
                                <div className="space-y-2">
                                    {selectedTrx.transaction_items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-start text-sm">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                                                <p className="text-[11px] text-slate-400 font-bold">{item.quantity}x @ Rp {item.selling_price.toLocaleString()}</p>
                                            </div>
                                            <p className="font-black text-slate-900 flex-shrink-0">Rp {item.subtotal.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2.5">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Subtotal</span>
                                    <span>Rp {selectedTrx.subtotal.toLocaleString()}</span>
                                </div>
                                {selectedTrx.discount_amount > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-rose-500">
                                        <span>Potongan Member</span>
                                        <span>- Rp {selectedTrx.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-900">Total Akhir</span>
                                    <span className="text-lg font-black text-emerald-600">Rp {selectedTrx.total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Detailed */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Informasi Pembayaran</p>
                                <div className="bg-white border border-slate-100 rounded-xl p-3 divide-y divide-slate-50">
                                    <div className="pb-2.5 flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400 uppercase">Metode</span>
                                        <span className="text-slate-900 uppercase">{selectedTrx.payment_method}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-400 uppercase">Bayar</span>
                                        <span className="text-slate-900 uppercase">Rp {selectedTrx.cash_received.toLocaleString()}</span>
                                    </div>
                                    {selectedTrx.cash_change > 0 && (
                                        <div className="pt-2.5 flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-400 uppercase">Kembalian</span>
                                            <span className="text-emerald-600 uppercase">Rp {selectedTrx.cash_change.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setSelectedTrx(null)}
                                className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                Cetak Struk
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <History className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Riwayat Transaksi</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daftar Penjualan</p>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export (.csv)
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-1.5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari No. Ref..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                        className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm"
                    >
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        {periodLabel()}
                        <ChevronDown className={cn("w-3 h-3 transition-transform font-sans", showPeriodPicker && "rotate-180")} />
                    </button>
                </div>
                {showPeriodPicker && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {(['today', 'month', 'year', 'custom'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setPeriod(p); if (p !== 'custom') setShowPeriodPicker(false); }}
                                className={cn(
                                    "w-full p-3 text-left font-bold text-xs border-b border-slate-50 last:border-0",
                                    period === p ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {p === 'today' && 'Hari Ini'}
                                {p === 'month' && 'Bulan Ini'}
                                {p === 'year' && 'Tahun Ini'}
                                {p === 'custom' && 'Pilih Tanggal (Kustom)'}
                            </button>
                        ))}

                        {period === 'custom' && (
                            <div className="p-4 bg-slate-50 space-y-3">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Dari</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sampai</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-xs font-bold" />
                                    </div>
                                </div>
                                <button onClick={() => setShowPeriodPicker(false)} className="w-full bg-emerald-500 text-white py-2 rounded-lg font-bold text-xs">Terapkan</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-4 pb-4 space-y-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 text-xs font-bold">Memuat data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Data tidak ditemukan</p>
                    </div>
                ) : (
                    filtered.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => setSelectedTrx(t)}
                            className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div className="flex-1 min-w-0">
                                <h4 className="font-extrabold text-slate-800 text-[13px] leading-tight truncate">{t.transaction_number}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase">{t.payment_method}</span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-black text-slate-900 leading-tight">Rp {t.total_amount.toLocaleString()}</p>
                                <div className="text-emerald-600 text-[9px] font-extrabold mt-0.5 flex items-center gap-1 justify-end uppercase tracking-wider">
                                    Detail
                                    <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
