import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Save, Loader2, Calculator, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function EditProductPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form States
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [priceBuy, setPriceBuy] = useState<string>('');
    const [priceSell, setPriceSell] = useState<string>('');
    const [stock, setStock] = useState<string>('');
    const [unit, setUnit] = useState('pcs');
    const [isFavorite, setIsFavorite] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setFetching(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Product
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (product) {
                setName(product.name);
                setCategoryId(product.category_id);
                setPriceBuy(product.purchase_price.toString());
                setPriceSell(product.selling_price.toString());
                setStock(product.stock_quantity.toString());
                setUnit(product.unit);
                setIsFavorite(product.is_favorite);
                setBarcode(product.barcode || '');

                // 2. Get Categories
                const { data: catData } = await supabase
                    .from('categories')
                    .select('id, name')
                    .eq('business_id', product.business_id)
                    .eq('is_active', true);

                if (catData) setCategories(catData);
            }
        } catch (error: any) {
            alert("Gagal mengambil data: " + error.message);
            navigate(-1);
        } finally {
            setFetching(false);
        }
    };

    const numBuy = parseFloat(priceBuy) || 0;
    const numSell = parseFloat(priceSell) || 0;
    const profit = numSell - numBuy;
    const profitMargin = numSell > 0 ? ((profit / numSell) * 100).toFixed(1) : '0';

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name,
                    category_id: categoryId,
                    purchase_price: numBuy,
                    selling_price: numSell,
                    stock_quantity: parseFloat(stock) || 0,
                    unit,
                    barcode: barcode || null,
                    is_favorite: isFavorite,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
            navigate('/dashboard/products');
        } catch (error: any) {
            alert('Gagal update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Hapus produk ini secara permanen?")) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            navigate('/dashboard/products');
        } catch (error: any) {
            alert('Gagal hapus: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            <div className="bg-white sticky top-0 z-10 px-4 py-4 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">Edit Barang</h1>
                </div>
                <button onClick={handleDelete} className="p-2.5 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">
                {/* Name */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Nama Barang *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white shadow-sm"
                    />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Harga Beli</label>
                        <input
                            type="number"
                            value={priceBuy}
                            onChange={(e) => setPriceBuy(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Harga Jual *</label>
                        <input
                            type="number"
                            value={priceSell}
                            onChange={(e) => setPriceSell(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700 bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Profit Insight */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-blue-900 font-semibold text-sm">Untung: Rp {profit.toLocaleString()} ({profitMargin}%)</p>
                        <p className="text-blue-600 text-xs">Margin keuntungan per satuan</p>
                    </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Update Stok</label>
                        <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white shadow-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Satuan</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full p-4 h-[58px] rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 bg-white"
                        >
                            <option value="pcs">Pcs</option>
                            <option value="kg">Kg</option>
                            <option value="btl">Botol</option>
                            <option value="box">Box</option>
                        </select>
                    </div>
                </div>

                {/* Favorite */}
                <div
                    className="flex items-center gap-3 p-4 border rounded-xl bg-white cursor-pointer transition-all hover:border-emerald-300 shadow-sm"
                    onClick={() => setIsFavorite(!isFavorite)}
                >
                    <div className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                        isFavorite ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                    )}>
                        {isFavorite && <div className="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1"></div>}
                    </div>
                    <span className="font-semibold text-slate-700">Barang Favorit</span>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
