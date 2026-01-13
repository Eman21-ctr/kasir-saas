import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, XCircle, Plus, Package, Clock } from 'lucide-react';
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

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single();
            if (!business) return;

            // Fetch all products
            const { data: products } = await supabase
                .from('products')
                .select('id, name, stock_quantity, min_stock, unit, updated_at')
                .eq('business_id', business.id)
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
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-slate-100 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Peringatan Stok</h1>
            </div>

            <div className="p-6 space-y-6">

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-6 h-6" />
                        <h2 className="font-bold text-lg">{outOfStock.length + lowStock.length} Barang Perlu Perhatian!</h2>
                    </div>
                    <p className="text-red-100 text-sm">Segera restock untuk menghindari kehilangan penjualan</p>
                </div>

                {/* Out of Stock */}
                {outOfStock.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-red-600 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Stok Habis ({outOfStock.length})
                        </h3>

                        {outOfStock.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white p-4 rounded-2xl border-2 border-red-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                            <Package className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{p.name}</h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Update: {formatTime(p.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/dashboard/products/${p.id}/add-stock`)}
                                    className="w-full mt-3 bg-red-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Stok
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Low Stock */}
                {lowStock.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Stok Menipis ({lowStock.length})
                        </h3>

                        {lowStock.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white p-4 rounded-2xl border-2 border-amber-100 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                            <Package className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{p.name}</h4>
                                            <p className="text-sm text-amber-600 font-bold">Sisa: {p.stock_quantity} {p.unit}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/dashboard/products/${p.id}/add-stock`)}
                                    className="w-full mt-3 bg-amber-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambah Stok
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* All Good */}
                {!loading && outOfStock.length === 0 && lowStock.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">Semua Stok Aman! ✅</h3>
                        <p className="text-slate-400 text-sm">Tidak ada barang yang perlu restock</p>
                    </div>
                )}

            </div>
        </div>
    );
}
