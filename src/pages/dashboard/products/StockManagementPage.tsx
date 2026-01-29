import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Plus, Search, Package, TrendingUp,
    Settings2, Save, X, Loader2, Store, AlertCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';

type Product = {
    id: number;
    name: string;
    stock_quantity: number;
    unit: string;
    purchase_price: number;
    selling_price: number;
    sku: string;
    category_id: number;
    categories: { name: string };
};

export default function StockManagementPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Support deep link from alerts
    const searchParams = new URLSearchParams(location.search);
    const initialSearch = searchParams.get('search') || '';

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [logoUrl, setLogoUrl] = useState('');

    // Modals
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form States
    const [formQty, setFormQty] = useState('1');
    const [formPrice, setFormPrice] = useState('');
    const [formNotes, setFormNotes] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
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

            const { data } = await supabase
                .from('products')
                .select('*, categories(name)')
                .eq('business_id', business.id)
                .is('is_active', true)
                .order('name');

            setProducts(data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestock = async () => {
        if (!selectedProduct || !formQty || !formPrice || saving) return;
        setSaving(true);
        try {
            const qty = parseFloat(formQty);
            const newPrice = parseFloat(formPrice);
            const currentStock = selectedProduct.stock_quantity || 0;
            const currentPrice = selectedProduct.purchase_price || 0;

            // Moving Average Cost Formula
            // Final Average = ((Old Stock * Old Price) + (New Qty * New Price)) / (Old Stock + New Qty)
            // If current stock is negative, we simplify by treating it as 0 for price weighting
            const weightedStock = Math.max(0, currentStock);
            const calculatedAvgPrice = ((weightedStock * currentPrice) + (qty * newPrice)) / (weightedStock + qty);

            // 1. Record Movement
            await supabase.from('stock_movements').insert({
                business_id: (await supabase.from('products').select('business_id').eq('id', selectedProduct.id).single()).data?.business_id,
                product_id: selectedProduct.id,
                movement_type: 'purchase',
                quantity: qty,
                purchase_price_per_unit: newPrice,
                stock_before: currentStock,
                stock_after: currentStock + qty,
                notes: formNotes || 'Restock Barang',
                created_by: (await supabase.auth.getUser()).data.user?.id
            });

            // 2. Update Product
            await supabase.from('products').update({
                stock_quantity: currentStock + qty,
                purchase_price: calculatedAvgPrice,
                updated_at: new Date().toISOString()
            }).eq('id', selectedProduct.id);

            setShowRestockModal(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAdjust = async () => {
        if (!selectedProduct || !formQty || saving) return;
        setSaving(true);
        try {
            const adjustmentQty = parseFloat(formQty); // can be negative for loss/shrinkage
            const currentStock = selectedProduct.stock_quantity || 0;

            // 1. Record Movement
            await supabase.from('stock_movements').insert({
                business_id: (await supabase.from('products').select('business_id').eq('id', selectedProduct.id).single()).data?.business_id,
                product_id: selectedProduct.id,
                movement_type: 'adjustment',
                quantity: adjustmentQty,
                stock_before: currentStock,
                stock_after: currentStock + adjustmentQty,
                notes: formNotes || 'Penyesuaian Stok Manual',
                created_by: (await supabase.auth.getUser()).data.user?.id
            });

            // 2. Update Product
            await supabase.from('products').update({
                stock_quantity: currentStock + adjustmentQty,
                updated_at: new Date().toISOString()
            }).eq('id', selectedProduct.id);

            setShowAdjustModal(false);
            resetForm();
            fetchProducts();
        } catch (error: any) {
            alert("Gagal: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setFormQty('1');
        setFormPrice('');
        setFormNotes('');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 px-6 py-3 border-b border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                <div className="text-right">
                    <h1 className="text-sm font-black text-slate-900 uppercase">Manajemen Stok</h1>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Inventory Control</p>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama barang atau SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm shadow-sm transition-all"
                    />
                </div>

                {/* Info Card */}
                <div className="bg-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-600/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Info Harga Rata-Rata</p>
                            <p className="text-xs leading-tight opacity-90 mt-0.5">Sistem otomatis menghitung Modal Rata-Rata setiap kali stok baru dibeli.</p>
                        </div>
                    </div>
                </div>

                {/* Product List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">Barang tidak ditemukan</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                                            <Package className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 text-sm leading-tight">{product.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                                {product.categories?.name || 'Umum'} • {product.sku || 'No SKU'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-black uppercase inline-block",
                                            product.stock_quantity <= 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            Stok: {product.stock_quantity}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modal Rata-Rata</p>
                                        <p className="text-xs font-black text-slate-700">Rp {product.purchase_price?.toLocaleString()}</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Harga Jual</p>
                                        <p className="text-xs font-black text-emerald-600">Rp {product.selling_price?.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedProduct(product); setShowRestockModal(true); setFormPrice(product.purchase_price.toString()); }}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Stok Masuk
                                    </button>
                                    <button
                                        onClick={() => { setSelectedProduct(product); setShowAdjustModal(true); setFormQty('0'); }}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Settings2 className="w-3.5 h-3.5" /> Sesuaikan
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Restock Modal */}
            {showRestockModal && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">Beli Stok</h3>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Tambah & Hitung Modal</p>
                            </div>
                            <button onClick={resetForm} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Produk Selected</p>
                                <p className="text-sm font-black text-slate-700">{selectedProduct.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Beli</label>
                                    <input
                                        type="number"
                                        value={formQty}
                                        onChange={(e) => setFormQty(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-black text-slate-700 shadow-sm"
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase text-center mt-1">{selectedProduct.unit}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Beli</label>
                                    <input
                                        type="number"
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-black text-slate-700 shadow-sm"
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase text-center mt-1">Per {selectedProduct.unit}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Belanja di Agen ABC"
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm text-slate-600 shadow-sm"
                                />
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl text-white">
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="text-[9px] font-bold uppercase">Total Bayar</span>
                                    <span className="text-[9px] font-bold uppercase">Modal Baru (Est)</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-base font-black">Rp {(parseFloat(formQty || '0') * parseFloat(formPrice || '0')).toLocaleString()}</span>
                                    <span className="text-base font-black text-emerald-400">
                                        Rp {(
                                            ((Math.max(0, selectedProduct.stock_quantity) * selectedProduct.purchase_price) + (parseFloat(formQty || '0') * parseFloat(formPrice || '0'))) /
                                            (Math.max(0, selectedProduct.stock_quantity) + parseFloat(formQty || '0')) || 0
                                        ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleRestock}
                                disabled={saving || !formQty || !formPrice}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                SIMPAN & UPDATE STOK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Adjustment Modal */}
            {showAdjustModal && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">Penyesuaian</h3>
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Koreksi Stok Manual</p>
                            </div>
                            <button onClick={resetForm} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                <p className="text-[10px] font-bold text-amber-700 leading-tight">Input angka negatif (pake tanda minus "-") kalo mau buang stok karena rusak/hilang.</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Perubahan</label>
                                <input
                                    type="number"
                                    value={formQty}
                                    onChange={(e) => setFormQty(e.target.value)}
                                    placeholder="0"
                                    className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none font-black text-2xl text-slate-700 text-center shadow-sm"
                                />
                                <p className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">Stok Awal: {selectedProduct.stock_quantity} {selectedProduct.unit}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Penyesuaian</label>
                                <input
                                    type="text"
                                    placeholder="Misal: Barang rusak dimakan tikus"
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-amber-500 outline-none font-bold text-sm text-slate-600 shadow-sm"
                                />
                            </div>

                            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
                                <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase">
                                    <span>Estimasi Stok Akhir</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xl font-black text-slate-800">{selectedProduct.stock_quantity + parseFloat(formQty || '0')}</span>
                                    <span className="text-sm font-bold text-slate-400">{selectedProduct.unit}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAdjust}
                                disabled={saving || !formQty || formQty === '0'}
                                className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                UPDATE JUMLAH STOK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
