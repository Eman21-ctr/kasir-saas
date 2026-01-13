import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, Save, Loader2, Calculator, Trash2, Store, ScanBarcode } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function EditProductPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [logoUrl, setLogoUrl] = useState('');

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
        fetchProductAndBusiness();
    }, [id]);

    const fetchProductAndBusiness = async () => {
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

                // 2. Get Business & Categories
                const { data: business } = await supabase
                    .from('businesses')
                    .select('id, logo_url')
                    .eq('id', product.business_id)
                    .single();

                if (business) setLogoUrl(business.logo_url || '');

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
        <div className="min-h-screen bg-slate-50 pb-10 font-sans text-slate-800">
            {/* Header with Logo and Action */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div className="flex items-center gap-4">
                    <button onClick={handleDelete} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl border border-emerald-100 overflow-hidden flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Store className="w-5 h-5 text-emerald-600" />
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 pt-2 max-w-md mx-auto">
                <div className="mb-4">
                    <h1 className="text-2xl font-extrabold text-slate-900">Edit Barang</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Perbarui Informasi Produk</p>
                </div>

                <div className="space-y-3.5">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Barang *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 bg-white shadow-sm text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        {/* Category */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                            <select
                                value={categoryId || ''}
                                onChange={(e) => setCategoryId(Number(e.target.value))}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 bg-white shadow-sm text-sm appearance-none"
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                                {categories.length === 0 && <option value="">Belum ada</option>}
                            </select>
                        </div>

                        {/* Barcode */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Scan..."
                                    className="w-full p-3.5 pr-10 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white shadow-sm text-sm"
                                />
                                <ScanBarcode className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-300" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Beli</label>
                            <input
                                type="number"
                                value={priceBuy}
                                onChange={(e) => setPriceBuy(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 bg-white shadow-sm text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Jual *</label>
                            <input
                                type="number"
                                value={priceSell}
                                onChange={(e) => setPriceSell(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-black text-emerald-600 bg-white shadow-sm text-sm"
                            />
                        </div>
                    </div>

                    {/* Profit Insight */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-blue-600" />
                            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">Laba Per Satuan</span>
                        </div>
                        <span className="text-xs font-black text-blue-700">Rp {profit.toLocaleString('id-ID')} ({profitMargin}%)</span>
                    </div>

                    {/* Stock & Unit */}
                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Stok</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white shadow-sm text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Satuan</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-700 bg-white shadow-sm text-sm"
                            >
                                <option value="pcs">Pcs</option>
                                <option value="kg">Kg</option>
                                <option value="btl">Botol</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                    </div>

                    {/* Favorite Option Checkbox Style */}
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={cn(
                            "w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between group",
                            isFavorite ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-white border-slate-100 text-slate-600"
                        )}
                    >
                        <span className="text-xs font-bold uppercase tracking-wide">Barang Favorit</span>
                        <div className={cn(
                            "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                            isFavorite ? "bg-rose-500 border-rose-500" : "border-slate-200 group-hover:border-rose-200"
                        )}>
                            {isFavorite && <div className="w-1.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 mb-0.5 ml-0.5" />}
                        </div>
                    </button>

                    {/* Submit */}
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="uppercase text-xs tracking-widest">Simpan Perubahan</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
