import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Calendar, Save, Loader2, Package, TrendingUp } from 'lucide-react';

export default function AddStockPage() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [product, setProduct] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [notes, setNotes] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
            setPurchasePrice(data.purchase_price.toString());
        } catch (error) {
            console.error("Error:", error);
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!product || qty <= 0) return;
        setSaving(true);
        try {
            const price = parseFloat(purchasePrice) || 0;
            const total = price * qty;

            // 1. Record stock movement
            await supabase.from('stock_movements').insert({
                business_id: product.business_id,
                product_id: product.id,
                movement_type: 'purchase',
                quantity: qty,
                unit: product.unit,
                purchase_price: price,
                total_cost: total,
                notes: notes || `Pembelian stok ${product.name}`,
                reference_date: purchaseDate,
                created_by: (await supabase.auth.getUser()).data.user?.id
            });

            // 2. Update product stock
            await supabase.from('products').update({
                stock_quantity: (product.stock_quantity || 0) + qty,
                purchase_price: price, // Update to latest purchase price
                updated_at: new Date().toISOString()
            }).eq('id', product.id);

            alert("Stok berhasil ditambahkan!");
            navigate(-1);
        } catch (error: any) {
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

    const numPrice = parseFloat(purchasePrice) || 0;
    const total = numPrice * qty;
    const priceDiff = numPrice - (product?.purchase_price || 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-slate-100 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Tambah Stok</h1>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* Product Info */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{product?.name}</h3>
                        <p className="text-sm text-slate-400">Stok saat ini: <span className="font-bold text-slate-600">{product?.stock_quantity} {product?.unit}</span></p>
                    </div>
                </div>

                {/* Purchase Date */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Tanggal Pembelian</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium text-slate-700 bg-white"
                        />
                    </div>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Jumlah Beli</label>
                    <div className="flex items-center justify-center gap-6 bg-white p-4 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 active:scale-90"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                                className="text-3xl font-bold text-slate-800 w-24 text-center outline-none bg-transparent"
                            />
                            <p className="text-sm text-slate-400 font-medium">{product?.unit}</p>
                        </div>
                        <button
                            onClick={() => setQty(qty + 1)}
                            className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white active:scale-90"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Purchase Price */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Harga Beli per {product?.unit}</label>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
                        <input
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white"
                        />
                    </div>
                    {priceDiff !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-bold ${priceDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            <TrendingUp className={`w-3 h-3 ${priceDiff < 0 ? 'rotate-180' : ''}`} />
                            {priceDiff > 0 ? 'Naik' : 'Turun'} Rp {Math.abs(priceDiff).toLocaleString()} dari harga sebelumnya
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <div className="flex justify-between items-center">
                        <span className="text-emerald-700 font-bold">Total Belanja</span>
                        <span className="text-2xl font-extrabold text-emerald-700">Rp {total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Catatan (Opsional)</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Beli di Toko Sinar Jaya"
                        className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-medium text-slate-700 bg-white"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSave}
                    disabled={saving || qty <= 0}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Simpan Pembelian Stok
                </button>
            </div>
        </div>
    );
}
