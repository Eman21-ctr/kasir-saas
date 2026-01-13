import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, XCircle, Plus, Package, Clock, Store } from 'lucide-react';
import { cn } from '../../../lib/utils';

type Product = {
    id: number;
    name: string;
    stock_quantity: number;
    min_stock: number;
    unit: string;
    updated_at: string;
};

export default function StockAlertsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [outOfStock, setOutOfStock] = useState<Product[]>([]);
    const [lowStock, setLowStock] = useState<Product[]>([]);
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, logo_url')
                .eq('user_id', user.id)
                .single();

            if (business) {
                setLogoUrl(business.logo_url || '');
            }

            // Fetch all products
            const { data: products } = await supabase
                .from('products')
                .select('id, name, stock_quantity, min_stock, unit, updated_at')
                .eq('business_id', business?.id)
                .eq('is_active', true);

            if (products) {
                setOutOfStock(products.filter(p => p.stock_quantity <= 0));
                setLowStock(products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= (p.min_stock || 5)));
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Baru saja';
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return `${Math.floor(diffHours / 24)} hari lalu`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header with Logo Only */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-5 h-5 text-emerald-600" />
                    )}
                </div>
            </div>

            <div className="p-6 pt-2 max-w-md mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-900">Peringatan Stok</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stok Menipis & Habis</p>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-red-500/20 mb-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <AlertTriangle className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-100" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-100 italic">Perlu Perhatian</span>
                        </div>
                        <h2 className="text-xl font-black">{outOfStock.length + lowStock.length} Barang Bermasalah</h2>
                        <p className="text-red-100 text-xs mt-1 leading-relaxed">
                            Segera restock untuk menjaga ketersediaan barang bagi pelanggan Anda.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Out of Stock */}
                    {outOfStock.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <h3 className="font-black text-red-600 text-[10px] uppercase tracking-[0.2em]">
                                    Stok Habis ({outOfStock.length})
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {outOfStock.map((p) => (
                                    <div
                                        key={p.id}
                                        className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Package className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                                                <Clock className="w-3 h-3" />
                                                UPDATE {formatTime(p.updated_at).toUpperCase()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/dashboard/products/${p.id}/add-stock`)}
                                            className="p-3 bg-red-500 text-white rounded-xl shadow-md active:scale-90 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Low Stock */}
                    {lowStock.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <h3 className="font-black text-amber-600 text-[10px] uppercase tracking-[0.2em]">
                                    Stok Menipis ({lowStock.length})
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {lowStock.map((p) => (
                                    <div
                                        key={p.id}
                                        className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Package className="w-6 h-6 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                                            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Sisa {p.stock_quantity} {p.unit}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/dashboard/products/${p.id}/add-stock`)}
                                            className="p-3 bg-amber-500 text-white rounded-xl shadow-md active:scale-90 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* All Good */}
                {!loading && outOfStock.length === 0 && lowStock.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                            <Package className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="font-black text-slate-800 mb-1 uppercase text-sm tracking-widest">Semua Stok Aman</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gaskeun jualan terus!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
